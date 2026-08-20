/* ==========================================================================
   ra-documents-list.js — Retailer Admin Documents listing (row-level status
   actions). Each row's Status column + the primary action button next to
   Download stay in sync: Pending Approval/Not Approved -> Approve, Approved
   -> Cancel approval, Expired -> Send reminder. Not Approved requires a
   confirmation dialog since the document was previously rejected.
   Depends on the .doc-status-cell / .doc-action-slot markup baked into each
   row and the shared #ra-confirm-modal on this page.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.querySelector('.doc-action-slot, .doc-status-cell')) return;

  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  function statusPillHtml(status) {
    var map = { 'Approved': 'pill-green', 'Pending Approval': 'pill-blue', 'Not Approved': 'pill-red', 'Expired': 'pill-red', 'Superseded': 'pill-grey' };
    return '<span class="pill ' + (map[status] || 'pill-grey') + '">' + status + '</span>';
  }

  function actionSlotHtml(status) {
    if (status === 'Pending Approval' || status === 'Not Approved') {
      var handler = status === 'Not Approved' ? 'raRowApproveConfirm' : 'raRowApprove';
      return '<button class="btn-p" style="height:26px;padding:0 10px;font-size:11px" onclick="event.stopPropagation();' + handler + '(this)">Approve</button>';
    }
    if (status === 'Approved') {
      return '<button class="btn-reminder" onclick="event.stopPropagation();raRowCancelApproval(this)">Cancel approval</button>';
    }
    return '';
  }

  function setRowStatus(tr, status) {
    var statCell = tr.querySelector('.doc-status-cell');
    if (statCell) statCell.innerHTML = statusPillHtml(status);
    var slot = tr.querySelector('.doc-action-slot');
    if (slot) slot.innerHTML = actionSlotHtml(status);
  }

  /* ---- confirm dialog (reuses the page's #ra-confirm-modal / .modal-overlay) ---- */
  var confirmCb = null;
  window.raShowConfirm = function (title, body, okLabel, cb) {
    document.getElementById('ra-confirm-title').textContent = title;
    document.getElementById('ra-confirm-body').textContent = body;
    document.getElementById('ra-confirm-ok').textContent = okLabel;
    confirmCb = cb;
    document.getElementById('ra-confirm-modal').classList.add('open');
  };
  window.raConfirmOk = function () {
    document.getElementById('ra-confirm-modal').classList.remove('open');
    var cb = confirmCb; confirmCb = null;
    if (cb) cb();
  };
  window.raConfirmCancel = function () {
    document.getElementById('ra-confirm-modal').classList.remove('open');
    confirmCb = null;
  };

  window.raRowApprove = function (btn) {
    var tr = btn.closest('tr');
    setRowStatus(tr, 'Approved');
    toast('Document approved');
  };
  window.raRowApproveConfirm = function (btn) {
    var tr = btn.closest('tr');
    var name = tr.querySelector('.tbl-name');
    var label = name ? name.textContent.trim() : 'this document';
    raShowConfirm(
      'Approve this document?',
      label + ' was previously marked Not Approved. Approving it now will mark it as compliant.',
      'Approve',
      function () { setRowStatus(tr, 'Approved'); toast('Document approved'); }
    );
  };
  window.raRowCancelApproval = function (btn) {
    var tr = btn.closest('tr');
    setRowStatus(tr, 'Pending Approval');
    toast('Approval cancelled — back to pending review');
  };
  window.raRowSendReminder = function (btn) {
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
