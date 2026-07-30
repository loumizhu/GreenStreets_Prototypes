/* ═══════════════════════════════════════════════════════════════════════════
   GreenStreets Retailer User — Getting Started  (ru-tour.js)
   ═══════════════════════════════════════════════════════════════════════════
   HUB-AND-SPOKE onboarding, mirrored from the Retailer Admin tour (ra-tour.js)
   but scoped to the Retailer User (Compliance Manager) role — a read / monitor
   role, so every step is an informational coach bubble (no data entry required).

   The Welcome screen (ru_welcome) is the hub that tracks progress across FOUR
   steps:

     1. Get to know your dashboard   (Dashboard — RAG tiles + left menu)
     2. Review your products         (Products — completeness / missing data)
     3. Monitor your suppliers       (Suppliers — chase overdue, send reminders)
     4. Request a Declaration of Conformity  (DoC request form)

   Clicking a step takes the user to that page and shows a single, non-blocking
   coach bubble that explains what they can do there. When they click
   "✓ Done — back to steps", the step is marked complete and they're returned to
   the Welcome hub, where the step gets an animated checkmark and the NEXT step
   becomes highlighted. When all four are done, the hub shows a finish state and
   they can head into the portal.

   State:
     • localStorage  ru_onb = { seen, always, done:{dash,products,suppliers,doc} }
     • sessionStorage ru_tour_active / ru_tour_step (resume a step across the
       page navigation) and ru_onb_just (which step to animate on the hub).
   Public: gsRuTourStart(which), gsRuOnbContinue(), gsRuWelcomeRender(),
           gsRuOnbReset(), gsRuOnbSetAlways(on), gsRuOnbIsAlways(),
           gsRuOnbStepClick(key)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A_KEY = 'ru_tour_active', S_KEY = 'ru_tour_step', JUST_KEY = 'ru_onb_just';
  var KEYS = ['dash', 'suppliers', 'products', 'doc'];

  var STEPS = [
    { key: 'dash', screen: 'ru1', icon: '🧭', title: 'Get to know your dashboard', stepNo: 1,
      body: 'The tiles up top show your live PPWR conformity — <strong>Declarations of Conformity</strong>, ' +
            '<strong>PFAS substance compliance</strong> and <strong>technical documentation</strong> — while the banner ' +
            'above tracks overall packaging data collection. Below them, the <strong>SKU conformity overview</strong> ' +
            'lists each product\'s status and any failing check, so you can jump straight to what needs attention. Use ' +
            'the <strong>left menu</strong> any time to reach Suppliers, Products, Packagings, Documents and your Audit trail.',
      sel: '#ru-tour-dash, #ru-tour-dash-list', position: 'below' },

    { key: 'suppliers', screen: 'ru3', icon: '🏭', title: 'Monitor your suppliers', stepNo: 2,
      body: 'Track who has submitted and who is <strong>overdue</strong>. You can <strong>send a reminder</strong> to ' +
            'chase a supplier and escalate the ones running late. Note: sending the original <em>invitation</em> is a ' +
            'Retailer Admin action — you keep them moving with reminders.',
      sel: '#ru-tour-supp', position: 'below' },

    { key: 'products', screen: 'ru6', icon: '📦', title: 'Review your products', stepNo: 3,
      body: 'Every product shows its packaging <strong>completeness</strong>. Red means mandatory data is missing; ' +
            'amber means a compliance target isn\'t met yet. For any product still missing input you can ' +
            '<strong>send the supplier a reminder</strong> right from the list. <em>Generating the DoC PDF itself is a ' +
            'Retailer Admin action.</em>',
      sel: '#ru-tour-prod', position: 'below' },

    { key: 'doc', screen: 'ru5', icon: '📄', title: 'Request a Declaration of Conformity', stepNo: 4,
      body: 'When a component is missing data, create a <strong>DoC data request</strong> here — pick the component, ' +
            'set a deadline, add an optional message, and send it straight to the supplier. That\'s the tour — ' +
            'you\'re all set!',
      sel: '#ru-tour-doc', position: 'left' }
  ];

  /* ── state helpers ─────────────────────────────────────────────────────── */
  function _ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (_) { return null; } }
  function _ssDel(k) { try { sessionStorage.removeItem(k); } catch (_) { } }
  function _active() { return _ss(A_KEY) === '1'; }
  function _stepIdx() { var n = parseInt(_ss(S_KEY), 10); return isNaN(n) ? 0 : n; }

  function _onbGet() { try { var o = JSON.parse(localStorage.getItem('ru_onb')) || {}; if (!o.done) o.done = {}; return o; } catch (_) { return { seen: false, always: false, done: {} }; } }
  function _onbSet(o) { try { localStorage.setItem('ru_onb', JSON.stringify(o)); } catch (_) { } }
  function _isDone(i) { return !!_onbGet().done[KEYS[i]]; }
  function _markDone(i) { var o = _onbGet(); o.done[KEYS[i]] = true; o.seen = true; _onbSet(o); }
  function _currentIndex() { for (var i = 0; i < KEYS.length; i++) if (!_isDone(i)) return i; return KEYS.length; }
  function _curScreen() { var s = document.querySelector('.screen'); return s ? s.id : null; }

  var _overlay = null, _running = false, _highlighted = [], _posT = null;

  var CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ══════════════════════════════════════════════════════════════════════
     COACH BUBBLE (single step)
     ══════════════════════════════════════════════════════════════════════ */
  function _buildOverlay() {
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var el = document.createElement('div');
    el.id = 'ru-tour-overlay'; el.className = 'gst-overlay';
    el.innerHTML =
      '<div class="gst-backdrop" id="rut-backdrop"></div>' +
      '<div class="gst-bubble" id="rut-bubble" role="dialog" aria-modal="true" aria-label="Getting started">' +
        '<div class="gst-bubble-inner">' +
          '<div class="gst-top">' +
            '<div class="gst-steplabel" id="rut-steplabel"></div>' +
            '<button class="gst-close" id="rut-close" title="Back to steps" aria-label="Back to steps">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="gst-icon" id="rut-icon"></div>' +
          '<div class="gst-title" id="rut-title"></div>' +
          '<div class="gst-body" id="rut-body"></div>' +
          '<div class="gst-foot">' +
            '<button class="gst-btn-skip" id="rut-skip">Skip for now</button>' +
            '<div class="gst-foot-right">' +
              '<button class="gst-btn-next" id="rut-done">✓ Done — back to steps</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gst-arrow" id="rut-arrow"></div>' +
      '</div>';
    document.body.appendChild(el);
    _overlay = el;
    document.getElementById('rut-close').addEventListener('click', _backNoMark);
    document.getElementById('rut-skip').addEventListener('click', _backNoMark);
    document.getElementById('rut-done').addEventListener('click', _finish);
    document.getElementById('rut-backdrop').addEventListener('click', _backNoMark);
    document.addEventListener('keydown', _key);
  }

  function _key(e) {
    if (!_running) return;
    if (e.key === 'Escape') { e.preventDefault(); _backNoMark(); }
    else if (e.key === 'Enter') { e.preventDefault(); _finish(); }
  }

  function _clearHL() { _highlighted.forEach(function (el) { try { el.classList.remove('gst-highlight', 'gst-pulse-target'); } catch (_) { } }); _highlighted = []; }

  function _showStep(idx) {
    if (!_overlay) return;
    idx = Math.max(0, Math.min(idx, STEPS.length - 1));
    _ss(S_KEY, String(idx));
    var step = STEPS[idx];
    _clearHL();
    /* informational steps — keep the page usable behind a light backdrop */
    _overlay.classList.add('gst-nonblock');

    var label = document.getElementById('rut-steplabel');
    if (label) label.textContent = 'Step ' + step.stepNo + ' of 4';
    var icon = document.getElementById('rut-icon'), title = document.getElementById('rut-title'),
        body = document.getElementById('rut-body'), done = document.getElementById('rut-done');
    if (icon) icon.textContent = step.icon || '';
    if (title) title.textContent = step.title;
    if (body) body.innerHTML = step.body;
    if (done) { done.textContent = (idx === STEPS.length - 1) ? '✓ Finish' : '✓ Done — back to steps'; }

    /* sel may be a comma-separated list — highlight every match, anchor the bubble to the first */
    var tgts = step.sel ? document.querySelectorAll(step.sel) : [];
    for (var t = 0; t < tgts.length; t++) { tgts[t].classList.add('gst-highlight'); _highlighted.push(tgts[t]); }
    var tgt = tgts.length ? tgts[0] : null;

    var bubble = document.getElementById('rut-bubble');
    if (bubble) bubble.classList.remove('gst-bubble-in');
    _position(step, tgt);
  }

  function _pop() { var b = document.getElementById('rut-bubble'); if (!b) return; b.classList.remove('gst-bubble-in'); void b.offsetWidth; b.classList.add('gst-bubble-in'); }

  function _position(step, target) {
    var bubble = document.getElementById('rut-bubble'), arrow = document.getElementById('rut-arrow');
    if (!bubble) return;
    var pos = step.position || 'below';
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
    _ssDel(A_KEY); _ssDel(S_KEY);
    _teardown();
    if (typeof go === 'function') go('ru_welcome');
  }
  /* leave the step without marking it done — just go back to the hub. */
  function _backNoMark() {
    _ssDel(A_KEY); _ssDel(S_KEY);
    _teardown();
    if (typeof go === 'function') go('ru_welcome');
  }

  /* ── launch a step from the hub ────────────────────────────────────────── */
  function start(which) {
    var map = { dash: 0, suppliers: 1, products: 2, doc: 3 };
    var idx = map[which] != null ? map[which] : 0;
    var o = _onbGet(); o.seen = true; _onbSet(o);
    _ss(A_KEY, '1'); _ss(S_KEY, String(idx));
    _running = false;
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var step = STEPS[idx];
    if (step.screen === _curScreen()) { _running = true; _buildOverlay(); _showStep(idx); }
    else if (typeof go === 'function') go(step.screen);
  }

  /* footer "Continue" — launch the current (first unfinished) step, or finish. */
  function cont() {
    var i = _currentIndex();
    if (i >= KEYS.length) { if (typeof go === 'function') go('ru1'); return; }
    start(KEYS[i]);
  }

  function reset() {
    var o = _onbGet(); o.seen = false; o.done = {}; _onbSet(o);
    _ssDel(A_KEY); _ssDel(S_KEY); _ssDel(JUST_KEY);
    if (document.querySelector('.onb-steps')) render();
    try { alert('Getting started has been reset — all steps are open again.'); } catch (_) { }
  }
  function setAlways(on) { var o = _onbGet(); o.always = !!on; _onbSet(o); }
  function isAlways() { return !!_onbGet().always; }

  /* ══════════════════════════════════════════════════════════════════════
     WELCOME HUB — render step states + checkmark animation
     ══════════════════════════════════════════════════════════════════════ */
  function render() {
    var host = document.querySelector('.onb-steps');
    if (!host) return;
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
      var lbl = btn.querySelector('.onb-start-label');
      if (lbl) lbl.textContent = allDone ? 'Go to dashboard' : (doneCount === 0 ? 'Start guided setup' : 'Continue setup');
    }
  }

  /* whole-card click on the hub — only the current or an already-done step
     launches; upcoming (locked) steps are ignored. */
  function stepClick(key) {
    var map = { dash: 0, suppliers: 1, products: 2, doc: 3 };
    var idx = map[key];
    if (idx == null) return;
    if (idx === _currentIndex() || _isDone(idx)) start(key);
  }

  window.gsRuTourStart = start;
  window.gsRuOnbStepClick = stepClick;
  window.gsRuOnbContinue = cont;
  window.gsRuWelcomeRender = render;
  window.gsRuOnbReset = reset;
  window.gsRuOnbSetAlways = setAlways;
  window.gsRuOnbIsAlways = isAlways;

  /* ── boot: resume a step after navigation, or render the hub ───────────── */
  function boot() {
    if (_active()) {
      var step = STEPS[_stepIdx()];
      if (step && step.screen === _curScreen()) { _running = true; _buildOverlay(); _showStep(_stepIdx()); }
      return;
    }
    if (document.querySelector('.onb-steps')) render();
  }
  if (document.readyState !== 'loading') setTimeout(boot, 300);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
})();
