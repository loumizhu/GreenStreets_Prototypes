/* ═══════════════════════════════════════════════════════════════════════════
   SA · Users, user-import wizard & shared confirm dialog  (sa-users.js)
   ───────────────────────────────────────────────────────────────────────────
   • saShowConfirm(title, bodyHtml, okLabel, cb, opts) — the SAME confirmation dialog the Retailer
     Admin portal uses (.modal-overlay / .modal-box, Cancel + primary button). Also used by Settings.
   • Users page: invite form, per-row Change role / Deactivate / Reactivate / Resend / Revoke /
     Send invite / Delete (each behind a confirm dialog), precise role+status+retailer filters.
   • Import-users wizard (Import-Users / Validate-Users-Import / Import-Users-Done).
   All globals are prefixed `sa` so nothing collides with super-admin.js / supplier-portal.js.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }

  /* ══════════════════════════════════════════════════════════════════════
     Confirm dialog (same markup + classes as the RA #ra-confirm-modal)
     ══════════════════════════════════════════════════════════════════════ */
  var confirmCb = null;
  function ensureConfirm() {
    var m = document.getElementById('sa-confirm-modal');
    if (m) return m;
    m = document.createElement('div');
    m.className = 'modal-overlay'; m.id = 'sa-confirm-modal';
    m.innerHTML =
      '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="sa-confirm-title">' +
        '<div class="sa-confirm-title" id="sa-confirm-title">Confirm</div>' +
        '<div class="sa-confirm-body" id="sa-confirm-body">Are you sure?</div>' +
        '<div class="sa-confirm-extra" id="sa-confirm-extra" style="display:none"></div>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px">' +
          '<button class="btn-g" id="sa-confirm-cancel" onclick="saConfirmCancel()">Cancel</button>' +
          '<button class="btn-p" id="sa-confirm-ok" onclick="saConfirmOk()">Confirm</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('mousedown', function (e) { if (e.target === m) saConfirmCancel(); });
    document.addEventListener('keydown', function (e) {
      if (!m.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); saConfirmCancel(); }
    });
    return m;
  }
  /* opts: {danger:true, extraHtml:'<select…>', onOpen:fn(modal)}; cb receives the modal element. */
  window.saShowConfirm = function (title, bodyHtml, okLabel, cb, opts) {
    opts = opts || {};
    var m = ensureConfirm();
    $('#sa-confirm-title', m).textContent = title;
    $('#sa-confirm-body', m).innerHTML = bodyHtml;
    var ok = $('#sa-confirm-ok', m);
    ok.textContent = okLabel || 'Confirm';
    ok.classList.toggle('sa-danger-ok', !!opts.danger);
    var ex = $('#sa-confirm-extra', m);
    if (opts.extraHtml) { ex.innerHTML = opts.extraHtml; ex.style.display = ''; if (window.GSEnhanceSelects) { try { window.GSEnhanceSelects(ex); } catch (e) {} } }
    else { ex.innerHTML = ''; ex.style.display = 'none'; }
    confirmCb = cb || null;
    m.classList.add('open');
    setTimeout(function () { try { ok.focus(); } catch (e) {} }, 30);
  };
  window.saConfirmOk = function () {
    var m = document.getElementById('sa-confirm-modal');
    var cb = confirmCb; confirmCb = null;
    if (m) { var sel = m.querySelector('#sa-confirm-extra select'); var val = sel ? sel.value : null; m.classList.remove('open'); if (cb) cb(val); }
  };
  window.saConfirmCancel = function () {
    var m = document.getElementById('sa-confirm-modal');
    if (m) m.classList.remove('open');
    confirmCb = null;
  };

  /* ══════════════════════════════════════════════════════════════════════
     USERS page
     ══════════════════════════════════════════════════════════════════════ */
  var PILL = { active: 'pill-green', invited: 'pill-blue', draft: 'pill-grey', expired: 'pill-red', resend: 'pill-blue', deactivated: 'pill-red' };
  var LABEL = { active: 'Active', invited: 'Invited', draft: 'Draft', expired: 'Expired', resend: 'Resend', deactivated: 'Deactivated' };
  var ACTIONS = {
    active: [['role', 'Change role'], ['imp', 'Impersonate'], ['deactivate', 'Deactivate']],
    invited: [['resend', 'Resend'], ['revoke', 'Revoke']],
    draft: [['send', 'Send invite'], ['delete', 'Delete']],
    expired: [['resend', 'Resend'], ['revoke', 'Revoke']],
    resend: [['resend', 'Resend']],
    deactivated: [['reactivate', 'Reactivate']]
  };
  var ROLES = [{ v: 'Admin', lbl: 'Admin', cls: 'pill-blue', key: 'admin' }, { v: 'Retailer user', lbl: 'Retailer user', cls: 'pill-grey', key: 'user' }];

  function actionsHtml(status) {
    return ACTIONS[status].map(function (a) {
      return '<button class="btn-g-sm" data-ua="' + a[0] + '"' + (a[0] === 'imp' ? ' onclick="go(\'s6\')"' : '') + '>' + a[1] + '</button>';
    }).join('');
  }
  function setCell(tr, key, html) { var td = tr.querySelector('[data-c="' + key + '"]'); if (td) td.innerHTML = html; }
  function setStatus(tr, status, last) {
    var prev = tr.getAttribute('data-status');
    tr.setAttribute('data-status', status);
    setCell(tr, 'status', '<span class="pill ' + PILL[status] + '">' + LABEL[status] + '</span>');
    if (last != null) setCell(tr, 'last', esc(last));
    setCell(tr, 'actions', actionsHtml(status));
    adjStats(prev, status);
    saUsersFilter();
  }
  function counted(s) { return s === 'active' ? 'active' : (s === 'invited' || s === 'resend') ? 'invited' : null; }
  function bump(id, d) { var el = document.getElementById(id); if (!el) return; var n = parseInt(String(el.textContent).replace(/[^\d-]/g, ''), 10) || 0; el.textContent = Math.max(0, n + d); }
  function adjStats(prev, next) {
    if (prev == null) bump('sa-u-total', 1);
    if (next == null) bump('sa-u-total', -1);
    var p = counted(prev), n = counted(next);
    if (p === n) return;
    if (p) bump(p === 'active' ? 'sa-u-active' : 'sa-u-invited', -1);
    if (n) bump(n === 'active' ? 'sa-u-active' : 'sa-u-invited', 1);
  }
  function userLabel(tr) { return tr.getAttribute('data-name') || tr.getAttribute('data-email'); }
  function removeRow(tr) {
    adjStats(tr.getAttribute('data-status'), null);
    tr.style.transition = 'opacity .25s'; tr.style.opacity = '0';
    setTimeout(function () { tr.remove(); saUsersFilter(); }, 250);
  }

  function rowAction(btn) {
    var ua = btn.getAttribute('data-ua');
    if (ua === 'imp') return;
    var tr = btn.closest('tr'); if (!tr) return;
    var who = esc(userLabel(tr)), email = esc(tr.getAttribute('data-email')), ret = esc(tr.getAttribute('data-retailer'));
    switch (ua) {
      case 'role':
        var curKey = tr.getAttribute('data-role');
        var opts = ROLES.map(function (r) { return '<option value="' + r.key + '"' + (r.key === curKey ? ' selected' : '') + '>' + (r.key === 'admin' ? 'Retailer Admin — full access' : 'Retailer User — read &amp; monitor') + '</option>'; }).join('');
        saShowConfirm('Change role', 'Choose the new role for <b>' + who + '</b> at ' + ret + '. The change applies the next time they open the app.', 'Change role', function (val) {
          var r = ROLES.filter(function (x) { return x.key === val; })[0] || ROLES[1];
          tr.setAttribute('data-role', r.key);
          setCell(tr, 'role', '<span class="pill ' + r.cls + '">' + r.lbl + '</span>');
          saUsersFilter();
          toast(userLabel(tr) + ' is now ' + (r.key === 'admin' ? 'a Retailer Admin' : 'a Retailer User'));
        }, { extraHtml: '<label class="flbl">New role</label><select class="fi fi-select">' + opts + '</select>' });
        break;
      case 'deactivate':
        saShowConfirm('Deactivate user?', '<b>' + who + '</b> will lose access to ' + ret + ' immediately. Their data is kept and you can reactivate them at any time.', 'Deactivate', function () {
          setStatus(tr, 'deactivated', 'Just now'); toast(userLabel(tr) + ' deactivated');
        }, { danger: true });
        break;
      case 'reactivate':
        saShowConfirm('Reactivate user?', '<b>' + who + '</b> will regain access to ' + ret + ' with their previous role.', 'Reactivate', function () {
          setStatus(tr, 'active', 'Just now'); toast(userLabel(tr) + ' reactivated');
        });
        break;
      case 'resend':
        saShowConfirm('Resend invitation?', 'A fresh invitation link will be emailed to <b>' + email + '</b>. Any earlier link stops working.', 'Resend invite', function () {
          setStatus(tr, 'invited', 'Sent just now'); toast('Invitation resent to ' + tr.getAttribute('data-email'));
        });
        break;
      case 'send':
        saShowConfirm('Send invitation?', 'Email an invitation to <b>' + email + '</b> to join ' + ret + '. They will appear as Invited until they accept.', 'Send invite', function () {
          setStatus(tr, 'invited', 'Sent just now'); toast('Invitation sent to ' + tr.getAttribute('data-email'));
        });
        break;
      case 'revoke':
        saShowConfirm('Revoke invitation?', 'The invitation sent to <b>' + email + '</b> will stop working and the pending user will be removed from the list.', 'Revoke invite', function () {
          removeRow(tr); toast('Invitation to ' + tr.getAttribute('data-email') + ' revoked');
        }, { danger: true });
        break;
      case 'delete':
        saShowConfirm('Delete draft?', 'Delete the draft invite for <b>' + email + '</b>? Nothing has been sent to them yet.', 'Delete draft', function () {
          removeRow(tr); toast('Draft for ' + tr.getAttribute('data-email') + ' deleted');
        }, { danger: true });
        break;
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#sa-users-tbl [data-ua]');
    if (!b) return;
    e.stopPropagation();
    rowAction(b);
  });

  /* invite form → adds an Invited row at the top of the list */
  window.saUsersInvite = function () {
    var em = document.getElementById('sa-inv-email'), ret = document.getElementById('adduser-retailer'), role = document.getElementById('sa-inv-role');
    if (!em || !ret) return;
    var email = (em.value || '').trim();
    var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!okEmail) { if (window.gsShake) gsShake(em); toast('Enter a valid email address'); em.focus(); return; }
    if (!(ret.value || '').trim()) { if (window.gsShake) gsShake(ret); toast('Select a retailer first'); return; }
    var r = ROLES.filter(function (x) { return role && x.key === (role.value === 'Admin' ? 'admin' : 'user'); })[0] || ROLES[1];
    var tbody = $('#sa-users-tbl tbody'); if (!tbody) return;
    var tr = document.createElement('tr');
    tr.setAttribute('data-status', 'invited'); tr.setAttribute('data-role', r.key);
    tr.setAttribute('data-retailer', ret.value.trim()); tr.setAttribute('data-email', email); tr.setAttribute('data-name', '');
    tr.style.background = 'rgba(78,187,129,.08)';
    tr.innerHTML = '<td data-c="name" class="tbl-muted" style="font-style:italic">Pending</td><td class="tbl-muted" data-c="email">' + esc(email) + '</td>' +
      '<td class="tbl-muted" data-c="retailer">' + esc(ret.value.trim()) + '</td><td data-c="role"><span class="pill ' + r.cls + '">' + r.lbl + '</span></td>' +
      '<td data-c="status"><span class="pill pill-blue">Invited</span></td><td class="tbl-muted" data-c="last">Sent just now</td>' +
      '<td data-c="actions" style="display:flex;gap:4px;white-space:nowrap">' + actionsHtml('invited') + '</td>';
    tbody.insertBefore(tr, tbody.firstChild);
    adjStats(null, 'invited');
    em.value = ''; ret.value = '';
    saUsersFilter();
    toast('Invitation sent to ' + email);
  };

  /* role / status / retailer / search — precise (per-column data attrs, not whole-row text) */
  window.saUsersFilter = function () {
    var tbl = document.getElementById('sa-users-tbl'); if (!tbl || !tbl.tBodies[0]) return;
    var q = ((document.getElementById('sa-u-search') || {}).value || '').toLowerCase().trim();
    var fr = (document.getElementById('sa-u-f-ret') || {}).value || 'all';
    var fo = (document.getElementById('sa-u-f-role') || {}).value || 'all';
    var fs = (document.getElementById('sa-u-f-status') || {}).value || 'all';
    Array.prototype.forEach.call(tbl.tBodies[0].rows, function (tr) {
      if (tr.classList.contains('gs-empty-row')) return;
      var hay = ((tr.getAttribute('data-name') || '') + ' ' + (tr.getAttribute('data-email') || '') + ' ' + (tr.getAttribute('data-retailer') || '')).toLowerCase();
      var ok = (!q || hay.indexOf(q) >= 0) &&
        (fr === 'all' || tr.getAttribute('data-retailer') === fr) &&
        (fo === 'all' || tr.getAttribute('data-role') === fo) &&
        (fs === 'all' || tr.getAttribute('data-status') === fs);
      tr.classList.toggle('gs-filtered', !ok);
    });
    tbl._gsSearchTerm = q;
    if (tbl._gsPage !== undefined) tbl._gsPage = 0;
    if (typeof window.gsAfterFilter === 'function') window.gsAfterFilter(tbl, q);
  };

  /* ══════════════════════════════════════════════════════════════════════
     IMPORT USERS wizard
     ══════════════════════════════════════════════════════════════════════ */
  var IMP_KEY = 'sa_imp_users_ret';
  function impRetailer() { try { return sessionStorage.getItem(IMP_KEY) || ''; } catch (e) { return ''; } }

  /* upload step: "Browse files" validates the retailer choice, remembers it, moves on */
  window.saImportUsersBrowse = function () {
    var sel = document.getElementById('sa-imp-retailer');
    if (sel && sel.value === '') { if (window.gsShake) gsShake(sel.closest('.cs-wrap') ? sel.closest('.cs-wrap').querySelector('.cs-trigger') || sel : sel); toast('Choose the retailer these users belong to'); return; }
    try { sessionStorage.setItem(IMP_KEY, sel ? sel.value : ''); } catch (e) {}
    go('sa_validate_users');
  };
  window.saImportUsersTemplate = function () { toast('Template downloaded — users_import_template.xlsx'); };
  window.saImportUsersErrorReport = function () { toast('Error report downloaded — 2 rows with errors'); };

  /* validation step: live re-validation as rows are edited */
  var EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function revalidate() {
    var tbl = document.getElementById('sa-vu-tbl'); if (!tbl) return;
    var BASE_VALID = 24, BASE_ERR = 2, SHOWN_ERR = 2;
    var bad = 0;
    $$('tbody tr', tbl).forEach(function (tr) {
      var ins = $$('input,select', tr);
      var nm = ins[0], em = ins[1], ro = ins[2];
      var okN = !!(nm.value || '').trim(), okE = EMAIL_RX.test((em.value || '').trim()), okR = !!ro.value;
      nm.classList.toggle('vu-bad', !okN); em.classList.toggle('vu-bad', !okE); ro.classList.toggle('vu-bad', !okR);
      var good = okN && okE && okR;
      tr.classList.toggle('vu-err', !good);
      var pill = tr.querySelector('.pill');
      if (pill) { pill.className = 'pill ' + (good ? 'pill-green' : 'pill-red'); pill.textContent = good ? 'Valid' : (!okE ? 'Invalid email' : 'Needs details'); }
      if (!good) bad++;
    });
    var errs = BASE_ERR - SHOWN_ERR + bad, valid = BASE_VALID + (SHOWN_ERR - bad);
    var s = document.getElementById('sa-vu-summary');
    if (s) s.innerHTML = '<strong>' + valid + (valid === 1 ? ' row valid' : ' rows valid') + '</strong> · <span style="color:#ff9c96">' + errs + (errs === 1 ? ' row' : ' rows') + ' with errors</span>';
    var b = document.getElementById('sa-vu-import');
    if (b) { var lbl = b.querySelector('.btn-c') || b; lbl.lastChild.textContent = 'Import ' + valid + ' valid users'; }
    try { sessionStorage.setItem('sa_imp_users_valid', String(valid)); sessionStorage.setItem('sa_imp_users_skipped', String(errs)); } catch (e) {}
  }
  document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('#sa-vu-tbl')) revalidate(); });
  document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('#sa-vu-tbl')) revalidate(); });

  /* contextual retailer chips + counts on the validate / done pages */
  function fillContext() {
    var r = impRetailer();
    $$('[data-sa-imp-ret]').forEach(function (el) { el.textContent = r || 'the selected retailer'; });
    var v = null, sk = null;
    try { v = sessionStorage.getItem('sa_imp_users_valid'); sk = sessionStorage.getItem('sa_imp_users_skipped'); } catch (e) {}
    $$('[data-sa-imp-valid]').forEach(function (el) { el.textContent = v || '24'; });
    $$('[data-sa-imp-skipped]').forEach(function (el) { el.textContent = sk || '2'; });
  }
  window.addEventListener('load', function () {
    try { fillContext(); } catch (e) {}
    try { revalidate(); } catch (e) {}
    try { var m = document.getElementById('sa-confirm-modal'); } catch (e) {}
  });
})();
