/* ═══════════════════════════════════════════════════════════════════════════
   GreenStreets Retailer Admin — Getting Started  (ra-tour.js)
   ═══════════════════════════════════════════════════════════════════════════
   HUB-AND-SPOKE onboarding. The Welcome screen (ra_welcome) is the hub that
   tracks progress across FOUR steps:

     1. Add your colleagues      (Users)
     2. Add your suppliers       (Suppliers)
     3. Import your products     (Products)
     4. Find your way around     (Dashboard — the left nav)

   Clicking a step takes the user to that page and shows a single, non-blocking
   coach bubble. When they finish that step ("✓ Done — back to steps"), the step
   is marked complete and they're returned to the Welcome hub, where the step
   gets an animated checkmark and the NEXT step becomes highlighted. Repeat
   until all four are done, then the hub shows a "You're all set" finish.

   State:
     • localStorage  ra_onb = { seen, always, done:{users,suppliers,products,nav} }
     • sessionStorage ra_tour_active / ra_tour_step (resume a step across the
       page navigation) and ra_onb_just (which step to animate on the hub).
   Public: gsRaTourStart(which), gsRaOnbContinue(), gsRaWelcomeRender(),
           gsRaOnbReset(), gsRaOnbSetAlways(on), gsRaOnbIsAlways()
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A_KEY = 'ra_tour_active', S_KEY = 'ra_tour_step', JUST_KEY = 'ra_onb_just';
  var KEYS = ['users', 'suppliers', 'products', 'nav'];

  var STEPS = [
    { key: 'users', screen: 'ra7', icon: '👥', title: 'Add your colleagues', stepNo: 1,
      body: 'Enter a colleague\'s email, choose a role — <strong>Retailer Admin</strong> or <strong>Retailer User</strong> — ' +
            'and click <strong>Send invite</strong>. Add one or two. When you\'re done, head back to your steps.',
      sel: '#ra-tour-invite', interactive: true, position: 'below',
      waitSel: '#ra-tour-invite .btn-p',
      waitHint: 'Add a colleague below — then mark this step done.',
      doneHint: 'Nice — invitation sent! Head back to your steps.' },

    { key: 'suppliers', screen: 'ra_importsuppliers', icon: '🏭', title: 'Add your suppliers', stepNo: 2,
      body: 'Import your supplier list straight from a <strong>CSV / XLSX</strong> — drop a file or browse. ' +
            'Prefer one at a time? Use <strong>Add a supplier manually</strong>. When you\'re done, head back to your steps.',
      sel: '#ra-tour-suppimport', interactive: true, position: 'right',
      waitSel: '#ra-supp-browse',
      waitHint: 'Import a file, or add a supplier manually — then mark this step done.',
      doneHint: 'Great — your suppliers are on their way in.' },

    { key: 'products', screen: 'ra_importproducts', icon: '📦', title: 'Import your products', stepNo: 3,
      body: 'Bulk-import your product catalogue from a <strong>CSV / XLSX</strong> — drop a file or browse. ' +
            'Prefer one at a time? Use <strong>Add a product manually</strong>. When you\'re done, head back to your steps.',
      sel: '#ra-tour-prodimport', interactive: true, position: 'right',
      waitSel: '#ra-prod-browse',
      waitHint: 'Import a file, or add a product manually — then mark this step done.',
      doneHint: 'Nice — your catalogue is on its way in.' },

    { key: 'nav', screen: 'ra1', icon: '🧭', title: 'Find your way around', stepNo: 4,
      body: 'This is the <strong>left menu</strong> — use it any time to reach your Dashboard, Users, Suppliers, ' +
            'Products, Packagings and Documents. Click <strong>your name at the bottom-left</strong> ' +
            'for Settings. That\'s the tour!',
      sel: '.sidebar', position: 'right' }
  ];

  /* ── state helpers ─────────────────────────────────────────────────────── */
  function _ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (_) { return null; } }
  function _ssDel(k) { try { sessionStorage.removeItem(k); } catch (_) { } }
  function _active() { return _ss(A_KEY) === '1'; }
  function _stepIdx() { var n = parseInt(_ss(S_KEY), 10); return isNaN(n) ? 0 : n; }
  function _sat(i) { return _ss('ra_tour_sat_' + i) === '1'; }
  function _setSat(i) { _ss('ra_tour_sat_' + i, '1'); }
  function _clearSat() { STEPS.forEach(function (_, i) { _ssDel('ra_tour_sat_' + i); }); }

  function _onbGet() { try { var o = JSON.parse(localStorage.getItem('ra_onb')) || {}; if (!o.done) o.done = {}; return o; } catch (_) { return { seen: false, always: false, done: {} }; } }
  function _onbSet(o) { try { localStorage.setItem('ra_onb', JSON.stringify(o)); } catch (_) { } }
  function _isDone(i) { return !!_onbGet().done[KEYS[i]]; }
  function _markDone(i) { var o = _onbGet(); o.done[KEYS[i]] = true; o.seen = true; _onbSet(o); }
  function _currentIndex() { for (var i = 0; i < KEYS.length; i++) if (!_isDone(i)) return i; return KEYS.length; }
  function _curScreen() { var s = document.querySelector('.screen'); return s ? s.id : null; }

  var _overlay = null, _running = false, _highlighted = [], _posT = null, _waitBound = null;

  var CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ══════════════════════════════════════════════════════════════════════
     COACH BUBBLE (single step)
     ══════════════════════════════════════════════════════════════════════ */
  function _buildOverlay() {
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var el = document.createElement('div');
    el.id = 'ra-tour-overlay'; el.className = 'gst-overlay';
    el.innerHTML =
      '<div class="gst-backdrop" id="rat-backdrop"></div>' +
      '<div class="gst-bubble" id="rat-bubble" role="dialog" aria-modal="true" aria-label="Getting started">' +
        '<div class="gst-bubble-inner">' +
          '<div class="gst-top">' +
            '<div class="gst-steplabel" id="rat-steplabel"></div>' +
            '<button class="gst-close" id="rat-close" title="Back to steps" aria-label="Back to steps">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="gst-icon" id="rat-icon"></div>' +
          '<div class="gst-title" id="rat-title"></div>' +
          '<div class="gst-body" id="rat-body"></div>' +
          '<div class="gst-hint" id="rat-hint" style="display:none"></div>' +
          '<div class="gst-foot">' +
            '<button class="gst-btn-skip" id="rat-skip">Skip for now</button>' +
            '<div class="gst-foot-right">' +
              '<button class="gst-btn-next" id="rat-done">✓ Done — back to steps</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gst-arrow" id="rat-arrow"></div>' +
      '</div>';
    document.body.appendChild(el);
    _overlay = el;
    document.getElementById('rat-close').addEventListener('click', _backNoMark);
    document.getElementById('rat-skip').addEventListener('click', _backNoMark);
    document.getElementById('rat-done').addEventListener('click', _finish);
    document.getElementById('rat-backdrop').addEventListener('click', _backNoMark);
    document.addEventListener('keydown', _key);
  }

  function _key(e) {
    if (!_running) return;
    if (e.key === 'Escape') { e.preventDefault(); _backNoMark(); }
    else if (e.key === 'Enter') { e.preventDefault(); _finish(); }
  }

  function _clearHL() { _highlighted.forEach(function (el) { try { el.classList.remove('gst-highlight', 'gst-pulse-target'); } catch (_) { } }); _highlighted = []; }

  function _bindWait(step, idx) {
    if (_waitBound) { try { _waitBound.el.removeEventListener('click', _waitBound.fn); } catch (_) { } _waitBound = null; }
    if (!step.waitSel) return;
    var el = document.querySelector(step.waitSel);
    if (!el) return;
    var fn = function () { _setSat(idx); _renderHint(step, idx); var d = document.getElementById('rat-done'); if (d) d.classList.add('gst-pulse-btn'); };
    el.addEventListener('click', fn);
    _waitBound = { el: el, fn: fn };
  }

  function _renderHint(step, idx) {
    var hint = document.getElementById('rat-hint');
    if (!hint) return;
    if (!step.interactive) { hint.style.display = 'none'; return; }
    hint.style.display = '';
    if (_sat(idx)) {
      hint.className = 'gst-hint gst-done-hint';
      hint.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' + (step.doneHint || 'Done — head back when ready.');
    } else {
      hint.className = 'gst-hint gst-wait-hint';
      hint.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>' + (step.waitHint || 'Take this step, then head back.');
    }
  }

  function _showStep(idx) {
    if (!_overlay) return;
    idx = Math.max(0, Math.min(idx, STEPS.length - 1));
    _ss(S_KEY, String(idx));
    var step = STEPS[idx];
    _clearHL();
    _overlay.classList.toggle('gst-nonblock', !!step.interactive);

    var label = document.getElementById('rat-steplabel');
    if (label) label.textContent = 'Step ' + step.stepNo + ' of 4';
    var icon = document.getElementById('rat-icon'), title = document.getElementById('rat-title'),
        body = document.getElementById('rat-body'), done = document.getElementById('rat-done');
    if (icon) icon.textContent = step.icon || '';
    if (title) title.textContent = step.title;
    if (body) body.innerHTML = step.body;
    if (done) { done.textContent = (idx === STEPS.length - 1) ? '✓ Finish' : '✓ Done — back to steps'; done.classList.remove('gst-pulse-btn'); }

    var tgt = step.sel ? document.querySelector(step.sel) : null;
    if (tgt) { tgt.classList.add('gst-highlight'); if (step.interactive) tgt.classList.add('gst-pulse-target'); _highlighted.push(tgt); }

    _renderHint(step, idx);
    _bindWait(step, idx);

    var bubble = document.getElementById('rat-bubble');
    if (bubble) bubble.classList.remove('gst-bubble-in');
    _position(step, tgt);
  }

  function _pop() { var b = document.getElementById('rat-bubble'); if (!b) return; b.classList.remove('gst-bubble-in'); void b.offsetWidth; b.classList.add('gst-bubble-in'); }

  function _position(step, target) {
    var bubble = document.getElementById('rat-bubble'), arrow = document.getElementById('rat-arrow');
    if (!bubble) return;
    var pos = step.position || 'below';
    if (pos === 'corner') {
      bubble.style.position = 'fixed'; bubble.style.left = 'auto'; bubble.style.top = 'auto';
      bubble.style.right = '24px'; bubble.style.bottom = '24px';
      if (arrow) arrow.style.display = 'none';
      if (target) { try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { } }
      _pop(); return;
    }
    if (!target) {
      var fbw = bubble.offsetWidth || 320, fbh = bubble.offsetHeight || 230;
      bubble.style.position = 'fixed';
      bubble.style.left = Math.max(14, (window.innerWidth - fbw) / 2) + 'px';
      bubble.style.top = Math.max(14, (window.innerHeight - fbh) / 2) + 'px';
      bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
      if (arrow) arrow.style.display = 'none';
      _pop(); return;
    }
    try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { }
    clearTimeout(_posT);
    _posT = setTimeout(function () {
      var tr = target.getBoundingClientRect();
      var bw = bubble.offsetWidth || 320, bh = bubble.offsetHeight || 230;
      var vw = window.innerWidth, vh = window.innerHeight, pad = 14, left, top, ac;
      bubble.style.position = 'fixed';
      if (pos === 'below') { top = Math.min(tr.bottom + 12, vh - bh - pad); left = Math.max(pad, Math.min(tr.left + tr.width / 2 - bw / 2, vw - bw - pad)); ac = 'gst-arrow-top'; }
      else if (pos === 'above') { top = Math.max(pad, tr.top - bh - 12); left = Math.max(pad, Math.min(tr.left + tr.width / 2 - bw / 2, vw - bw - pad)); ac = 'gst-arrow-bottom'; }
      else if (pos === 'right') { left = Math.min(tr.right + 12, vw - bw - pad); top = Math.max(pad, Math.min(tr.top + tr.height / 2 - bh / 2, vh - bh - pad)); ac = 'gst-arrow-left'; }
      else { left = Math.max(pad, tr.left - bw - 12); top = Math.max(pad, Math.min(tr.top + tr.height / 2 - bh / 2, vh - bh - pad)); ac = 'gst-arrow-right'; }
      bubble.style.left = left + 'px'; bubble.style.top = top + 'px'; bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
      if (arrow) {
        arrow.style.display = ''; arrow.className = 'gst-arrow ' + ac;
        if (pos === 'below' || pos === 'above') { var al = Math.max(20, Math.min((tr.left + tr.width / 2) - left, bw - 20)); arrow.style.left = al + 'px'; arrow.style.top = ''; }
        else { var at = Math.max(20, Math.min((tr.top + tr.height / 2) - top, bh - 20)); arrow.style.top = at + 'px'; arrow.style.left = ''; }
      }
      _pop();
    }, 300);
  }

  function _teardown() {
    _running = false;
    if (_waitBound) { try { _waitBound.el.removeEventListener('click', _waitBound.fn); } catch (_) { } _waitBound = null; }
    document.removeEventListener('keydown', _key);
    _clearHL();
    if (_overlay) { var ov = _overlay; ov.classList.add('gst-overlay-out'); setTimeout(function () { try { ov.remove(); } catch (_) { } }, 300); _overlay = null; }
  }

  /* finish the current step → mark done, flag it for the checkmark animation,
     and return to the Welcome hub. */
  function _finish() {
    var i = _stepIdx();
    _markDone(i);
    _ss(JUST_KEY, String(i));
    _ssDel(A_KEY); _ssDel(S_KEY); _clearSat();
    _teardown();
    if (typeof go === 'function') go('ra_welcome');
  }
  /* leave the step without marking it done — just go back to the hub. */
  function _backNoMark() {
    _ssDel(A_KEY); _ssDel(S_KEY); _clearSat();
    _teardown();
    if (typeof go === 'function') go('ra_welcome');
  }

  /* ── launch a step from the hub ────────────────────────────────────────── */
  function start(which) {
    var map = { users: 0, suppliers: 1, products: 2, nav: 3 };
    var idx = map[which] != null ? map[which] : 0;
    var o = _onbGet(); o.seen = true; _onbSet(o);
    _ss(A_KEY, '1'); _ss(S_KEY, String(idx)); _clearSat();
    _running = false;
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var step = STEPS[idx];
    if (step.screen === _curScreen()) { _running = true; _buildOverlay(); _showStep(idx); }
    else if (typeof go === 'function') go(step.screen);
  }

  /* footer "Continue" — launch the current (first unfinished) step, or finish. */
  function cont() {
    var i = _currentIndex();
    if (i >= KEYS.length) { if (typeof go === 'function') go('ra1'); return; }
    start(KEYS[i]);
  }

  function reset() {
    var o = _onbGet(); o.seen = false; o.done = {}; _onbSet(o);
    _ssDel(A_KEY); _ssDel(S_KEY); _ssDel(JUST_KEY); _clearSat();
    if (document.querySelector('.onb-steps')) render();
    try { alert('Getting started has been reset — all steps are open again.'); } catch (_) { }
  }
  function setAlways(on) { var o = _onbGet(); o.always = !!on; _onbSet(o); }
  function isAlways() { return !!_onbGet().always; }
  function isSeen() { return !!_onbGet().seen; }
  /* where sign-in should land: the Welcome hub only if the user has never seen
     onboarding, or has opted to always show it; otherwise straight to dashboard. */
  function signInTarget() { return (isAlways() || !isSeen()) ? 'ra_welcome' : 'ra1'; }

  /* ══════════════════════════════════════════════════════════════════════
     WELCOME HUB — render step states + checkmark animation
     ══════════════════════════════════════════════════════════════════════ */
  function render() {
    var host = document.querySelector('.onb-steps');
    if (!host) return;
    /* viewing the hub counts as "seen" so the "Always show" toggle can govern
       sign-in from here on (when off, we won't force the hub open again). */
    if (!isSeen()) { var _o = _onbGet(); _o.seen = true; _onbSet(_o); }
    var cur = _currentIndex();
    var just = parseInt(_ss(JUST_KEY), 10); if (isNaN(just)) just = -1; _ssDel(JUST_KEY);
    var cards = host.querySelectorAll('.onb-step');

    for (var c = 0; c < cards.length; c++) {
      var card = cards[c];
      var i = (parseInt(card.getAttribute('data-step'), 10) || (c + 1)) - 1;
      var done = _isDone(i), active = (i === cur);
      card.classList.remove('done', 'active', 'todo');
      card.classList.add(done ? 'done' : (active ? 'active' : 'todo'));

      var num = card.querySelector('.onb-num');
      if (num) {
        if (done) { num.innerHTML = CHECK_SVG; num.classList.add('done'); if (i === just) { num.classList.remove('just-done'); void num.offsetWidth; num.classList.add('just-done'); } }
        else { num.innerHTML = String(i + 1); num.classList.remove('done', 'just-done'); }
      }
      var tag = card.querySelector('.onb-state');
      if (tag) tag.textContent = done ? 'Done' : (active ? 'Current' : 'Step ' + (i + 1));
      var cta = card.querySelector('.onb-cta');
      if (cta) { cta.disabled = (!done && !active); }

      /* Bob the newly-current step (3×) only when we just returned from
         finishing a step — signalled by `just` being set. */
      card.classList.remove('bob');
      if (active && just >= 0) { void card.offsetWidth; card.classList.add('bob'); }
    }

    var prog = document.getElementById('onb-progress');
    var doneCount = 0; for (var k = 0; k < KEYS.length; k++) if (_isDone(k)) doneCount++;
    if (prog) prog.innerHTML = (doneCount >= KEYS.length)
      ? '<b>All done</b> — nice work! 🎉'
      : '<b>' + doneCount + '</b> of ' + KEYS.length + ' steps complete';

    var btn = document.getElementById('onb-start-btn');
    if (btn) {
      var allDone = doneCount >= KEYS.length;
      btn.querySelector('.onb-start-label').textContent = allDone ? 'Go to dashboard' : (doneCount === 0 ? 'Start guided setup' : 'Continue setup');
    }
  }

  /* whole-card click on the hub — only the current or an already-done step
     launches; upcoming (locked) steps are ignored. */
  function stepClick(key) {
    var map = { users: 0, suppliers: 1, products: 2, nav: 3 };
    var idx = map[key];
    if (idx == null) return;
    if (idx === _currentIndex() || _isDone(idx)) start(key);
  }

  window.gsRaTourStart = start;
  window.gsRaOnbStepClick = stepClick;
  window.gsRaOnbContinue = cont;
  window.gsRaWelcomeRender = render;
  window.gsRaOnbReset = reset;
  window.gsRaOnbSetAlways = setAlways;
  window.gsRaOnbIsAlways = isAlways;
  window.gsRaOnbSeen = isSeen;
  window.gsRaSignIn = function () { if (typeof go === 'function') go(signInTarget()); };

  /* ── boot: resume a step after navigation, or render the hub ───────────── */
  function boot() {
    if (_active()) {
      var step = STEPS[_stepIdx()];
      if (step && step.screen === _curScreen()) { _running = true; _buildOverlay(); _showStep(_stepIdx()); }
      /* on a non-step page mid-flow (e.g. the Add-Supplier form) → stay armed,
         silent; resumes when the user returns to the step's page. */
      return;
    }
    if (document.querySelector('.onb-steps')) render();
  }
  if (document.readyState !== 'loading') setTimeout(boot, 300);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
})();
