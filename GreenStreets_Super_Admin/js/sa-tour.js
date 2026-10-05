/* ═══════════════════════════════════════════════════════════════════════════
   GreenStreets Super Admin — Getting Started  (sa-tour.js)
   ═══════════════════════════════════════════════════════════════════════════
   Port of the Retailer Admin cross-page coach-bubble tour (ra-tour.js) for the
   platform operator. The RA flow is hub-and-spoke (a Welcome hub); the Super
   Admin prototype has no Welcome page, so the same four steps run as a straight
   walkthrough instead — finishing a step takes you to the next one:

     1. Invite your colleagues   (Users)
     2. Add suppliers            (Import suppliers)
     3. Import products          (Import products)
     4. Find your way around     (Dashboard — the left nav)

   Each step shows one non-blocking coach bubble. State:
     • localStorage  sa_onb = { seen, always, done:{users,suppliers,products,nav} }
     • sessionStorage sa_tour_active / sa_tour_step  (resume across page loads)
   Public: saTourStart(which), saTourReset(), saTourSetAlways(on), saTourIsAlways(),
           saTourProgress()
   Pages that host a step must load this file (Users, Import-Suppliers,
   Import-Products, Dashboard, Settings do).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A_KEY = 'sa_tour_active', S_KEY = 'sa_tour_step', SHOWN_KEY = 'sa_tour_autoshown';
  var KEYS = ['users', 'suppliers', 'products', 'nav'];

  var STEPS = [
    { key: 'users', screen: 's7', icon: '👥', title: 'Invite your colleagues', stepNo: 1,
      body: 'Enter a colleague\'s email, pick their <strong>retailer</strong> and a role — <strong>Retailer Admin</strong> or ' +
            '<strong>Retailer User</strong> — then click <strong>Send invite</strong>. Add one or two, then continue.',
      sel: ['#sa-tour-invite'], interactive: true, position: 'below',
      waitSel: ['#sa-tour-invite .btn-p'],
      waitHint: 'Add a colleague below — then continue.',
      doneHint: 'Nice — invitation sent! Continue to the next step.' },

    { key: 'suppliers', screen: 'sa_importsuppliers', icon: '🏭', title: 'Add suppliers', stepNo: 2,
      body: 'Import a supplier list straight from a <strong>CSV / XLSX</strong> — drop a file or browse. ' +
            'Prefer one at a time? Use <strong>Add a supplier manually</strong>. Then continue.',
      sel: ['#sa-tour-suppimport', '#ra-tour-suppimport', '.main .grp'], interactive: true, position: 'right',
      waitSel: ['#sa-supp-browse', '#ra-supp-browse'],
      waitHint: 'Import a file, or add a supplier manually — then continue.',
      doneHint: 'Great — those suppliers are on their way in.' },

    { key: 'products', screen: 'sa_importproducts', icon: '📦', title: 'Import products', stepNo: 3,
      body: 'Bulk-import a retailer\'s product catalogue from a <strong>CSV / XLSX</strong> — drop a file or browse. ' +
            'Prefer one at a time? Use <strong>Add a product manually</strong>. Then continue.',
      sel: ['#sa-tour-prodimport', '#ra-tour-prodimport', '.main .grp'], interactive: true, position: 'right',
      waitSel: ['#sa-prod-browse', '#ra-prod-browse'],
      waitHint: 'Import a file, or add a product manually — then continue.',
      doneHint: 'Nice — the catalogue is on its way in.' },

    { key: 'nav', screen: 'sa_dash', icon: '🧭', title: 'Find your way around', stepNo: 4,
      body: 'This is the <strong>left menu</strong> — use it any time to reach the Dashboard, Retailers, Users, Suppliers, ' +
            'Products, Packagings and Documents. Click <strong>your name at the bottom-left</strong> ' +
            'for Settings. That\'s the tour!',
      sel: ['.sidebar'], position: 'right' }
  ];

  /* ── state helpers ─────────────────────────────────────────────────────── */
  function _ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (_) { return null; } }
  function _ssDel(k) { try { sessionStorage.removeItem(k); } catch (_) { } }
  function _active() { return _ss(A_KEY) === '1'; }
  function _stepIdx() { var n = parseInt(_ss(S_KEY), 10); return isNaN(n) ? 0 : n; }
  function _sat(i) { return _ss('sa_tour_sat_' + i) === '1'; }
  function _setSat(i) { _ss('sa_tour_sat_' + i, '1'); }
  function _clearSat() { STEPS.forEach(function (_, i) { _ssDel('sa_tour_sat_' + i); }); }

  function _onbGet() { try { var o = JSON.parse(localStorage.getItem('sa_onb')) || {}; if (!o.done) o.done = {}; return o; } catch (_) { return { seen: false, always: false, done: {} }; } }
  function _onbSet(o) { try { localStorage.setItem('sa_onb', JSON.stringify(o)); } catch (_) { } }
  function _isDone(i) { return !!_onbGet().done[KEYS[i]]; }
  function _markDone(i) { var o = _onbGet(); o.done[KEYS[i]] = true; o.seen = true; _onbSet(o); }
  function _currentIndex() { for (var i = 0; i < KEYS.length; i++) if (!_isDone(i)) return i; return KEYS.length; }

  /* is the browser currently on the page that hosts this step? (light twins count as the same page) */
  function _base(p) { return String(p || '').split('/').pop().split('?')[0].split('#')[0].replace(/-Light\.html$/, '.html'); }
  function _onPage(step) {
    var map = (typeof GS_PAGES !== 'undefined') ? GS_PAGES : {};
    var f = map[step.screen]; if (!f) return false;
    return _base(location.pathname) === _base(f);
  }
  function _first(list) {
    for (var i = 0; i < list.length; i++) { var el = document.querySelector(list[i]); if (el) return el; }
    return null;
  }
  function _toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }

  var _overlay = null, _running = false, _highlighted = [], _posT = null, _waitBound = null;

  /* ══════════════════════════════════════════════════════════════════════
     COACH BUBBLE (single step)
     ══════════════════════════════════════════════════════════════════════ */
  function _buildOverlay() {
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var el = document.createElement('div');
    el.id = 'sa-tour-overlay'; el.className = 'gst-overlay';
    el.innerHTML =
      '<div class="gst-backdrop" id="sat-backdrop"></div>' +
      '<div class="gst-bubble" id="sat-bubble" role="dialog" aria-modal="true" aria-label="Getting started">' +
        '<div class="gst-bubble-inner">' +
          '<div class="gst-top">' +
            '<div class="gst-steplabel" id="sat-steplabel"></div>' +
            '<button class="gst-close" id="sat-close" title="Close the walkthrough" aria-label="Close the walkthrough">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="gst-icon" id="sat-icon"></div>' +
          '<div class="gst-title" id="sat-title"></div>' +
          '<div class="gst-body" id="sat-body"></div>' +
          '<div class="gst-hint" id="sat-hint" style="display:none"></div>' +
          '<div class="gst-foot">' +
            '<button class="gst-btn-skip" id="sat-skip">Skip for now</button>' +
            '<div class="gst-foot-right">' +
              '<button class="gst-btn-next" id="sat-done">Next step →</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gst-arrow" id="sat-arrow"></div>' +
      '</div>';
    document.body.appendChild(el);
    _overlay = el;
    document.getElementById('sat-close').addEventListener('click', _end);
    document.getElementById('sat-skip').addEventListener('click', _end);
    document.getElementById('sat-done').addEventListener('click', _finish);
    document.getElementById('sat-backdrop').addEventListener('click', _end);
    document.addEventListener('keydown', _key);
  }

  function _key(e) {
    if (!_running) return;
    if (e.key === 'Escape') { e.preventDefault(); _end(); }
  }

  function _clearHL() { _highlighted.forEach(function (el) { try { el.classList.remove('gst-highlight', 'gst-pulse-target'); } catch (_) { } }); _highlighted = []; }

  function _bindWait(step, idx) {
    if (_waitBound) { try { _waitBound.el.removeEventListener('click', _waitBound.fn); } catch (_) { } _waitBound = null; }
    if (!step.waitSel) return;
    var el = _first(step.waitSel);
    if (!el) return;
    var fn = function () { _setSat(idx); _renderHint(step, idx); var d = document.getElementById('sat-done'); if (d) d.classList.add('gst-pulse-btn'); };
    el.addEventListener('click', fn);
    _waitBound = { el: el, fn: fn };
  }

  function _renderHint(step, idx) {
    var hint = document.getElementById('sat-hint');
    if (!hint) return;
    if (!step.interactive) { hint.style.display = 'none'; return; }
    hint.style.display = '';
    if (_sat(idx)) {
      hint.className = 'gst-hint gst-done-hint';
      hint.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' + (step.doneHint || 'Done — continue when ready.');
    } else {
      hint.className = 'gst-hint gst-wait-hint';
      hint.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>' + (step.waitHint || 'Take this step, then continue.');
    }
  }

  function _showStep(idx) {
    if (!_overlay) return;
    idx = Math.max(0, Math.min(idx, STEPS.length - 1));
    _ss(S_KEY, String(idx));
    var step = STEPS[idx];
    _clearHL();
    _overlay.classList.toggle('gst-nonblock', !!step.interactive);

    var label = document.getElementById('sat-steplabel');
    if (label) label.textContent = 'Step ' + step.stepNo + ' of ' + STEPS.length;
    var icon = document.getElementById('sat-icon'), title = document.getElementById('sat-title'),
        body = document.getElementById('sat-body'), done = document.getElementById('sat-done');
    if (icon) icon.textContent = step.icon || '';
    if (title) title.textContent = step.title;
    if (body) body.innerHTML = step.body;
    if (done) { done.textContent = (idx === STEPS.length - 1) ? '✓ Finish' : 'Next step →'; done.classList.remove('gst-pulse-btn'); }

    var tgt = _first(step.sel || []);
    if (tgt) { tgt.classList.add('gst-highlight'); if (step.interactive) tgt.classList.add('gst-pulse-target'); _highlighted.push(tgt); }

    _renderHint(step, idx);
    _bindWait(step, idx);

    var bubble = document.getElementById('sat-bubble');
    if (bubble) bubble.classList.remove('gst-bubble-in');
    _position(step, tgt);
  }

  function _pop() { var b = document.getElementById('sat-bubble'); if (!b) return; b.classList.remove('gst-bubble-in'); void b.offsetWidth; b.classList.add('gst-bubble-in'); }

  function _position(step, target) {
    var bubble = document.getElementById('sat-bubble'), arrow = document.getElementById('sat-arrow');
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
    if (_waitBound) { try { _waitBound.el.removeEventListener('click', _waitBound.fn); } catch (_) { } _waitBound = null; }
    document.removeEventListener('keydown', _key);
    _clearHL();
    if (_overlay) { var ov = _overlay; ov.classList.add('gst-overlay-out'); setTimeout(function () { try { ov.remove(); } catch (_) { } }, 300); _overlay = null; }
  }

  /* leave the walkthrough without marking the current step. */
  function _end() {
    _ssDel(A_KEY); _ssDel(S_KEY); _clearSat();
    _teardown();
  }

  /* mark the current step done and move to the next one (or finish). */
  function _finish() {
    var i = _stepIdx();
    _markDone(i);
    _ssDel(S_KEY); _clearSat();
    _teardown();
    var next = i + 1;
    if (next >= STEPS.length) {
      _ssDel(A_KEY);
      _toast('You\'re all set — walkthrough complete');
      return;
    }
    _ss(A_KEY, '1'); _ss(S_KEY, String(next));
    var st = STEPS[next];
    if (_onPage(st)) { _running = true; _buildOverlay(); _showStep(next); }
    else if (typeof go === 'function') go(st.screen);
  }

  /* ── launch a step ─────────────────────────────────────────────────────── */
  function start(which) {
    var map = { users: 0, suppliers: 1, products: 2, nav: 3 };
    var idx = (typeof which === 'number') ? which : (map[which] != null ? map[which] : _currentIndex());
    if (idx >= STEPS.length) idx = 0;
    var o = _onbGet(); o.seen = true; _onbSet(o);
    _ss(A_KEY, '1'); _ss(S_KEY, String(idx)); _clearSat();
    _running = false;
    if (_overlay) { try { _overlay.remove(); } catch (_) { } _overlay = null; }
    var step = STEPS[idx];
    if (_onPage(step)) { _running = true; _buildOverlay(); _showStep(idx); }
    else if (typeof go === 'function') go(step.screen);
  }

  function reset() {
    var o = _onbGet(); o.seen = false; o.done = {}; _onbSet(o);
    _ssDel(A_KEY); _ssDel(S_KEY); _ssDel(SHOWN_KEY); _clearSat();
    _toast('Getting started has been reset — all steps are open again');
  }
  function setAlways(on) { var o = _onbGet(); o.always = !!on; _onbSet(o); }
  function isAlways() { return !!_onbGet().always; }
  function progress() { var n = 0; for (var i = 0; i < KEYS.length; i++) if (_isDone(i)) n++; return { done: n, total: KEYS.length }; }

  window.saTourStart = start;
  window.saTourReset = reset;
  window.saTourSetAlways = setAlways;
  window.saTourIsAlways = isAlways;
  window.saTourProgress = progress;

  /* ── boot: resume a step after navigation, or auto-open on the Dashboard ── */
  function boot() {
    if (_active()) {
      var step = STEPS[_stepIdx()];
      if (step && _onPage(step)) { _running = true; _buildOverlay(); _showStep(_stepIdx()); }
      return;     /* mid-flow on some other page (e.g. a wizard step) — stay armed, silent */
    }
    /* "Always show when I sign in": open the walkthrough once per browser session on the Dashboard */
    if (isAlways() && _onPage(STEPS[3]) && !_ss(SHOWN_KEY)) {
      _ss(SHOWN_KEY, '1');
      var i = _currentIndex(); start(i >= KEYS.length ? 0 : i);
    }
  }
  if (document.readyState !== 'loading') setTimeout(boot, 300);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
})();
