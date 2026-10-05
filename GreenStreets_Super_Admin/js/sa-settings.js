/* ═══════════════════════════════════════════════════════════════════════════
   SA · Settings actions  (sa-settings.js)
   Save / Discard per card, change-password validation, SSO connect toggle,
   the Getting-started controls (wired to sa-tour.js) and the Danger-zone
   confirmations (via saShowConfirm from sa-users.js).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }
  window.saSettingsToast = toast;

  /* remember each card's loaded values so "Discard" can restore them */
  function snapshot(card) {
    card._saSnap = $$('input,select', card).filter(function (el) { return el.tagName === 'SELECT' || !el.closest('.cs-wrap'); }).map(function (el) { return [el, el.value]; });
  }
  function cardOf(btn) { return btn.closest('[data-sa-card]'); }
  window.saSettingsSave = function (btn, msg) {
    var c = cardOf(btn); if (c) snapshot(c);
    toast(msg || 'Changes saved');
  };
  window.saSettingsDiscard = function (btn) {
    var c = cardOf(btn); if (!c || !c._saSnap) { toast('Nothing to discard'); return; }
    c._saSnap.forEach(function (p) {
      p[0].value = p[1];
      p[0].dispatchEvent(new Event('change', { bubbles: true }));   /* re-syncs the themed select label */
    });
    toast('Changes discarded');
  };

  window.saChangePassword = function () {
    var cur = document.getElementById('sa-pw-cur'), nw = document.getElementById('sa-pw-new');
    if (!cur || !nw) return;
    if (!cur.value) { if (window.gsShake) gsShake(cur); toast('Enter your current password'); cur.focus(); return; }
    if (nw.value.length < 8) { if (window.gsShake) gsShake(nw); toast('New password must be at least 8 characters'); nw.focus(); return; }
    if (nw.value === cur.value) { if (window.gsShake) gsShake(nw); toast('Choose a password you haven\'t used before'); nw.focus(); return; }
    cur.value = ''; nw.value = '';
    toast('Password updated');
  };

  window.saSsoToggle = function (pill) {
    var on = pill.classList.toggle('pill-green');
    pill.classList.toggle('pill-grey', !on);
    pill.textContent = on ? 'Microsoft · Connected' : 'Connect Microsoft';
    var note = document.getElementById('sa-sso-note');
    if (note) note.textContent = 'Google Workspace connected · Microsoft ' + (on ? 'connected' : 'not connected');
    toast(on ? 'Microsoft sign-in connected' : 'Microsoft sign-in disconnected');
  };

  /* Getting started */
  function syncOnb() {
    var t = document.getElementById('sa-onb-always');
    if (t && window.saTourIsAlways && saTourIsAlways()) t.classList.add('on');
    var p = document.getElementById('sa-onb-progress');
    if (p && window.saTourProgress) { var g = saTourProgress(); p.textContent = g.done + ' of ' + g.total + ' steps complete.'; }
  }
  window.saSettingsResetTour = function () {
    if (window.saTourReset) saTourReset();
    syncOnb();
  };

  /* Danger zone — same confirm dialog as the rest of the portal */
  window.saSettingsDanger = function (kind) {
    if (typeof window.saShowConfirm !== 'function') return;
    if (kind === 'deactivate') {
      saShowConfirm('Deactivate organisation?', 'Every user on every retailer account will be signed out and blocked from signing in. <b>Data is retained</b> and access can be restored at any time.', 'Deactivate', function () {
        toast('Organisation deactivated — access suspended');
      }, { danger: true });
    } else {
      saShowConfirm('Delete organisation and all data?', 'This permanently removes the organisation, all retailers, suppliers, products and documents. <b>This cannot be undone.</b>', 'Delete everything', function () {
        toast('Deletion scheduled — a confirmation email has been sent');
      }, { danger: true });
    }
  };

  window.addEventListener('load', function () {
    $$('[data-sa-card]').forEach(snapshot);
    setTimeout(syncOnb, 350);
  });
})();
