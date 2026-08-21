/* ==========================================================================
   sa-documents-list.js — Super Admin Documents listing (row-level status
   actions), ported from Retailer Admin's ra-documents-list.js. Each row's
   Status column + the primary action button next to Download stay in sync:
   Pending Approval/Not Approved -> Approve, Approved -> Cancel approval,
   Expired -> Send reminder. Not Approved requires a confirmation dialog
   since the document was previously rejected; Cancel approval also confirms
   since it reverts an Approved document back to Pending Approval. Approving
   a Pending Approval document is a single click with no confirmation.
   Depends on the .doc-status-cell / .doc-action-slot markup baked into each
   row and the shared #sa-confirm-modal on this page.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.querySelector('.doc-action-slot, .doc-status-cell')) return;

  function toast(msg) {
    var t = document.getElementById('sa-toast');
    if (!t) { t = document.createElement('div'); t.id = 'sa-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  function statusPillHtml(status) {
    var map = { 'Approved': 'pill-green', 'Pending Approval': 'pill-blue', 'Not Approved': 'pill-red', 'Expired': 'pill-red pill-expired', 'Superseded': 'pill-grey' };
    return '<span class="pill ' + (map[status] || 'pill-grey') + '">' + status + '</span>';
  }

  function actionSlotHtml(status) {
    if (status === 'Pending Approval' || status === 'Not Approved') {
      var handler = status === 'Not Approved' ? 'saRowApproveConfirm' : 'saRowApprove';
      return '<button class="btn-p" style="height:26px;padding:0 10px;font-size:11px" onclick="event.stopPropagation();' + handler + '(this)">Approve</button>';
    }
    if (status === 'Approved') {
      return '<button class="btn-reminder" onclick="event.stopPropagation();saRowCancelApproval(this)">Cancel approval</button>';
    }
    return '';
  }

  function setRowStatus(tr, status) {
    var statCell = tr.querySelector('.doc-status-cell');
    if (statCell) statCell.innerHTML = statusPillHtml(status);
    var slot = tr.querySelector('.doc-action-slot');
    if (slot) slot.innerHTML = actionSlotHtml(status);
  }

  /* ---- confirm dialog (reuses the page's #sa-confirm-modal / .modal-overlay) ---- */
  var confirmCb = null;
  window.saShowConfirm = function (title, body, okLabel, cb) {
    document.getElementById('sa-confirm-title').textContent = title;
    document.getElementById('sa-confirm-body').textContent = body;
    document.getElementById('sa-confirm-ok').textContent = okLabel;
    confirmCb = cb;
    document.getElementById('sa-confirm-modal').classList.add('open');
  };
  window.saConfirmOk = function () {
    document.getElementById('sa-confirm-modal').classList.remove('open');
    var cb = confirmCb; confirmCb = null;
    if (cb) cb();
  };
  window.saConfirmCancel = function () {
    document.getElementById('sa-confirm-modal').classList.remove('open');
    confirmCb = null;
  };

  window.saRowApprove = function (btn) {
    var tr = btn.closest('tr');
    setRowStatus(tr, 'Approved');
    toast('Document approved');
  };
  window.saRowApproveConfirm = function (btn) {
    var tr = btn.closest('tr');
    var name = tr.querySelector('.tbl-name');
    var label = name ? name.textContent.trim() : 'this document';
    saShowConfirm(
      'Approve this document?',
      label + ' was previously marked Not Approved. Approving it now will mark it as compliant.',
      'Approve',
      function () { setRowStatus(tr, 'Approved'); toast('Document approved'); }
    );
  };
  window.saRowCancelApproval = function (btn) {
    var tr = btn.closest('tr');
    var name = tr.querySelector('.tbl-name');
    var label = name ? name.textContent.trim() : 'this document';
    saShowConfirm(
      'Cancel approval?',
      label + ' will be sent back to Pending Approval and will need to be re-approved.',
      'Cancel approval',
      function () { setRowStatus(tr, 'Pending Approval'); toast('Approval cancelled — back to pending review'); }
    );
  };
  window.saRowSendReminder = function (btn) {
    btn.innerHTML = '✓ Reminder sent';
    btn.disabled = true;
    btn.style.opacity = '.85';
    btn.style.pointerEvents = 'none';
    toast('Reminder sent');
  };

  /* ---- default sort: attention-needed statuses first ----
     Runs once, synchronously, before greenstreets-theme.js's data-grid toolkit reads each
     table's row order on window load — so the toolkit's pager/sort-reset also treats this
     as the "original" order. */
  function sortTablesByStatusPriority() {
    var PRIORITY = { 'Expired': 0, 'Not Approved': 1, 'Pending Approval': 2, 'Approved': 3, 'Superseded': 4 };
    var tables = document.querySelectorAll('table.tbl');
    for (var t = 0; t < tables.length; t++) {
      var tbody = tables[t].querySelector('tbody');
      if (!tbody) continue;
      var rows = Array.prototype.filter.call(tbody.children, function (r) { return r.tagName === 'TR'; });
      var hasStatusCol = rows.some(function (r) { return r.querySelector('.doc-status-cell'); });
      if (!hasStatusCol) continue;
      rows.sort(function (a, b) {
        var sa = a.querySelector('.doc-status-cell'), sb = b.querySelector('.doc-status-cell');
        var pa = sa && PRIORITY.hasOwnProperty(sa.textContent.trim()) ? PRIORITY[sa.textContent.trim()] : 5;
        var pb = sb && PRIORITY.hasOwnProperty(sb.textContent.trim()) ? PRIORITY[sb.textContent.trim()] : 5;
        return pa - pb;
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
    }
  }
  sortTablesByStatusPriority();
})();
