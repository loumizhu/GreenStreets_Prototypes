/* ═══════════════════════════════════════════════════════════════════════════
   SA · Compliance dashboard  (sa-dashboard.js)
   Port of the Retailer Admin dashboard (ra1) behaviour, made cross-retailer:
   an "All retailers" scope select re-scopes the metric tiles, weekly chart,
   expiring documents, product-conformity rows and supplier-invitation rows.
   Everything is prefixed `sa` so it can't collide with super-admin.js.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }

  /* ── per-retailer figures (sample data; "All" is the sum) ────────────── */
  var R = {
    'Primark Stores Ltd': { n: 20, doc: 15, wait: 3, pfas: 18, tech: 14, cat: 380, red: 5, amber: 8, sent: 380, resp: 68, share: .26, trend: 22 },
    'H&M Group':          { n: 16, doc: 11, wait: 3, pfas: 14, tech: 10, cat: 312, red: 6, amber: 11, sent: 296, resp: 71, share: .19, trend: 14 },
    'Next plc':           { n: 12, doc: 9,  wait: 2, pfas: 11, tech: 8,  cat: 224, red: 3, amber: 6,  sent: 210, resp: 74, share: .14, trend: 9 },
    'Zara / Inditex':     { n: 18, doc: 12, wait: 4, pfas: 15, tech: 11, cat: 351, red: 7, amber: 12, sent: 340, resp: 63, share: .17, trend: 18 },
    'M&S Group':          { n: 14, doc: 12, wait: 1, pfas: 13, tech: 10, cat: 268, red: 2, amber: 4,  sent: 250, resp: 81, share: .11, trend: 6 },
    'Dunnes Stores':      { n: 8,  doc: 5,  wait: 2, pfas: 7,  tech: 4,  cat: 140, red: 3, amber: 5,  sent: 128, resp: 58, share: .06, trend: -4 },
    'New Look':           { n: 10, doc: 6,  wait: 2, pfas: 8,  tech: 5,  cat: 190, red: 4, amber: 7,  sent: 176, resp: 55, share: .07, trend: 11 }
  };
  var ALL = (function () {
    var a = { n: 0, doc: 0, wait: 0, pfas: 0, tech: 0, cat: 0, red: 0, amber: 0, sent: 0, resp: 0, share: 1, trend: 22 }, k, c = 0, w = 0;
    for (k in R) { ['n', 'doc', 'wait', 'pfas', 'tech', 'cat', 'red', 'amber', 'sent'].forEach(function (f) { a[f] += R[k][f]; }); w += R[k].resp * R[k].sent; c += R[k].sent; }
    a.resp = Math.round(w / c); return a;
  })();

  /* ── notifications menu ──────────────────────────────────────────────── */
  window.saToggleNotif = function (e) { if (e) e.stopPropagation(); var m = document.getElementById('sa-notif-menu'); if (m) m.classList.toggle('open'); };
  document.addEventListener('click', function (e) {
    var m = document.getElementById('sa-notif-menu');
    if (m && m.classList.contains('open') && !e.target.closest('#sa-notif-menu') && !e.target.closest('[onclick*="saToggleNotif"]')) m.classList.remove('open');
  });

  /* ── weekly chart: legend toggle + click-through to a filtered listing ── */
  window.saWkToggle = function (btn) {
    var s = btn.getAttribute('data-series');
    btn.classList.toggle('off');
    var hide = btn.classList.contains('off');
    $$('.wk-bar[data-series="' + s + '"]').forEach(function (b) { b.style.display = hide ? 'none' : ''; });
  };
  document.addEventListener('click', function (e) {
    var bar = e.target.closest && e.target.closest('.wk-bar'); if (!bar) return;
    var series = bar.getAttribute('data-series');
    var map = { approved: 'Complete', submitted: 'Incomplete', inprog: 'Needs Changing' };
    var status = map[series];
    if (status) saGoFilter(series === 'inprog' ? 's8' : 's11', { selectValue: status });
  });

  /* ── deep-link to a listing with a filter pre-applied (consumed on the target page) ── */
  window.saGoFilter = function (pageId, intent) {
    try { sessionStorage.setItem('sa_filter', JSON.stringify(intent || {})); } catch (e) {}
    go(pageId);
  };
  window.saOpenProduct = function (sku) { try { sessionStorage.setItem('sa_pi', sku); } catch (e) {} go('s12'); };

  /* ── expiring documents: remind, quick-preview modal ─────────────────── */
  window.saRemindDoc = function (ev, btn) {
    if (ev) ev.stopPropagation();
    if (!btn || btn.dataset.sent) return;
    btn.dataset.sent = '1'; btn.disabled = true; btn.classList.add('exp-remind-sent');
    btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><use href="#gsi-10"/></svg>Reminder sent';
    var row = btn.closest('.exp-row');
    toast('Reminder sent to the supplier');
    if (row) {
      var list = row.parentNode, footer = document.getElementById('sa-exp-footer');
      row.style.transition = 'opacity .25s ease, transform .25s ease';
      row.style.opacity = '0'; row.style.transform = 'translateY(-6px)';
      setTimeout(function () {
        if (footer && footer.parentNode === list) list.insertBefore(row, footer); else list.appendChild(row);
        row.style.transform = 'translateY(6px)';
        requestAnimationFrame(function () { requestAnimationFrame(function () { row.style.opacity = '1'; row.style.transform = 'translateY(0)'; }); });
      }, 260);
    }
  };
  var prevRow = null;
  window.saPreviewDoc = function (ev, row) {
    if (ev) ev.stopPropagation();
    prevRow = row;
    var nameEl = row.querySelector('.tbl-name'), metaEl = nameEl && nameEl.nextElementSibling, pillEl = row.querySelector('.pill');
    document.getElementById('sa-prev-name').textContent = nameEl ? nameEl.textContent : '';
    document.getElementById('sa-prev-meta').textContent = metaEl ? metaEl.textContent : '';
    document.getElementById('sa-prev-expiry').textContent = pillEl ? pillEl.textContent : '';
    var rowBtn = row.querySelector('.exp-remind'), pv = document.getElementById('sa-prev-remind-btn');
    if (rowBtn && rowBtn.dataset.sent) {
      pv.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><use href="#gsi-10"/></svg>Reminder sent'; pv.disabled = true; pv.classList.add('exp-remind-sent');
    } else {
      pv.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-11"/></svg>Remind'; pv.disabled = false; pv.classList.remove('exp-remind-sent');
    }
    document.getElementById('sa-doc-preview-modal').classList.add('open');
  };
  window.saClosePreview = function () { document.getElementById('sa-doc-preview-modal').classList.remove('open'); prevRow = null; };
  window.saClosePreviewOverlay = function (ev) { if (ev.target.id === 'sa-doc-preview-modal') saClosePreview(); };
  window.saOpenPreviewInDocuments = function () {
    var id = prevRow && prevRow.getAttribute('data-doc-id');
    saClosePreview();
    if (id && typeof window.openDocumentSA === 'function') openDocumentSA(id); else go('s9');
  };
  window.saRemindFromPreview = function () {
    if (!prevRow) return;
    saRemindDoc(null, prevRow.querySelector('.exp-remind'));
    var pv = document.getElementById('sa-prev-remind-btn');
    pv.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><use href="#gsi-10"/></svg>Reminder sent'; pv.disabled = true; pv.classList.add('exp-remind-sent');
  };

  /* ── "Send reminder" split button (dropdown is re-parented to <body> by toggleDropdown) ── */
  function triggerOf(el) {
    var dd = el.closest('.reminder-dropdown'); if (!dd) return el;
    var all = $$('.btn-reminder');
    for (var i = 0; i < all.length; i++) if (all[i]._gsDropdown === dd) return all[i];
    return el;
  }
  window.saDashRemind = function (el) {
    var btn = triggerOf(el), dd = el.closest('.reminder-dropdown');
    if (dd) dd.classList.remove('open');
    var row = btn.closest('tr'), nm = row && row.querySelector('.tbl-name');
    var orig = btn.innerHTML;
    btn.textContent = '✓ Sent';
    btn.style.background = 'rgba(78,187,129,.15)'; btn.style.borderColor = 'rgba(78,187,129,.3)'; btn.style.color = '#4ebb81';
    setTimeout(function () { btn.innerHTML = orig; btn.style.background = btn.style.borderColor = btn.style.color = ''; }, 2000);
    toast('Reminder sent' + (nm ? ' to ' + nm.textContent.trim() : ''));
  };

  /* ── scope select ────────────────────────────────────────────────────── */
  function setTile(el, n, tot) {
    if (!el) return;
    var txt = el.firstChild; if (txt && txt.nodeType === 3) txt.nodeValue = String(n); else el.textContent = n;
    el._gsTarget = n;
    var sp = el.querySelector('span'); if (sp && tot != null) sp.textContent = '/' + tot;
  }
  window.saDashScope = function (sel) {
    var key = sel.value, D = key === 'all' ? ALL : R[key]; if (!D) return;
    var scope = key === 'all' ? 'All retailers' : key;
    var sub = document.getElementById('sa-dash-sub');
    if (sub) sub.textContent = (key === 'all' ? 'All retailers · platform overview (' + Object.keys(R).length + ' accounts)' : key + ' · Retailer / Importer');

    var vals = $$('#sa-tour-metrics .stat-val');
    setTile(vals[0], D.doc, D.n); setTile(vals[1], D.pfas, D.n); setTile(vals[2], D.tech, D.n);
    var pct = Math.round(D.doc / D.n * 100);
    if (vals[3]) { var t3 = vals[3].firstChild; if (t3 && t3.nodeType === 3) t3.nodeValue = pct + '%'; vals[3]._gsTarget = pct; }
    var pf = $('#sa-tour-metrics .prog-f'); if (pf) { pf.style.width = pct + '%'; pf._gsW = pct + '%'; }
    var sm = $$('#sa-tour-metrics .stat-sub');
    if (sm[0]) sm[0].textContent = 'Review ' + (D.n - D.doc) + ' outstanding →';
    if (sm[1]) sm[1].textContent = (D.n - D.pfas) + ' to review →';
    if (sm[2]) sm[2].textContent = (D.n - D.tech) + ' docs outstanding · open →';
    if (sm[3]) sm[3].textContent = D.doc + ' of ' + D.n + ' DoCs ready · view outstanding →';
    var pie = $('#sa-tour-metrics [role="img"][aria-label="DoC status breakdown"]');
    if (pie) {
      var a = D.doc / D.n * 100, b = a + D.wait / D.n * 100;
      pie.style.background = 'conic-gradient(var(--status-ok) 0 ' + a.toFixed(1) + '%,var(--status-info-strong) ' + a.toFixed(1) + '% ' + b.toFixed(1) + '%,var(--status-danger) ' + b.toFixed(1) + '% 100%)';
      pie.setAttribute('data-gs-tip', 'Declaration of Conformity across ' + D.n + ' products — ' + D.doc + ' approved & DoC generated (green), ' + D.wait + ' awaiting supplier data (blue), ' + (D.n - D.doc - D.wait) + ' missing mandatory fields (red).');
    }

    /* weekly chart: counts scale with the retailer's share; y-axis re-fits */
    var bars = $$('.wk-bar'), total = 0, mx = 0, k = D.share;
    bars.forEach(function (b) {
      if (b._n0 == null) { b._n0 = parseInt((b.getAttribute('title') || '').replace(/.*?(\d+)$/, '$1'), 10) || 1; b._tt = (b.getAttribute('title') || '').replace(/\s*\d+$/, ''); }
      b._n = Math.max(1, Math.round(b._n0 * k)); total += b._n; if (b._n > mx) mx = b._n;
    });
    var axis = Math.max(3, Math.ceil(mx / 3) * 3);
    bars.forEach(function (b) { b.style.height = (b._n / axis * 100).toFixed(1) + '%'; b.setAttribute('title', b._tt + ' ' + b._n); });
    var ys = $$('.wk-yaxis span'); if (ys.length === 4) { ys[0].textContent = axis; ys[1].textContent = axis * 2 / 3; ys[2].textContent = axis / 3; ys[3].textContent = 0; }
    var st = document.getElementById('sa-wk-total'); if (st) st.innerHTML = '<b style="color:var(--tw)">' + total + '</b> supplier submissions this week';
    var tr = document.getElementById('sa-wk-trend'); if (tr) { tr.textContent = (D.trend >= 0 ? '▲ ' : '▼ ') + Math.abs(D.trend) + '% vs. previous week'; tr.style.color = D.trend >= 0 ? 'var(--status-ok)' : 'var(--status-danger)'; }

    /* row filters */
    ['#sa-exp-card .exp-row', '#sa-tour-conformity tbody tr', '#sa-inv-card tbody tr'].forEach(function (s) {
      $$(s).forEach(function (r) { r.classList.toggle('gs-filtered', key !== 'all' && r.getAttribute('data-retailer') !== key); });
    });
    var vis = $$('#sa-exp-card .exp-row:not(.gs-filtered)').length;
    var ec = document.getElementById('sa-exp-count'); if (ec) ec.firstChild.nodeValue = vis + ' ';
    var emp = document.getElementById('sa-exp-empty'); if (emp) emp.style.display = vis ? 'none' : '';
    var cv = $$('#sa-tour-conformity tbody tr:not(.gs-filtered)').length;
    var cf = document.getElementById('sa-conf-footer');
    if (cf) cf.innerHTML = 'Showing ' + cv + ' of ' + D.cat.toLocaleString('en-GB') + ' products · <span style="color:var(--status-danger)">' + D.red + ' red</span> · <span style="color:var(--status-warn)">' + D.amber + ' amber</span> · <span style="color:var(--status-ok-strong)">' + (D.cat - D.red - D.amber).toLocaleString('en-GB') + ' green</span>';
    var iv = $$('#sa-inv-card tbody tr:not(.gs-filtered)').length;
    var ih = document.getElementById('sa-inv-sum'); if (ih) ih.textContent = D.sent + ' sent · ' + D.resp + '% responded';
    var ifoot = document.getElementById('sa-inv-footer');
    if (ifoot) ifoot.firstChild.nodeValue = 'Showing ' + iv + ' of ' + D.sent + ' invitations · ';
  };

  /* ── notifications bell label etc. run once on load ──────────────────── */
  window.addEventListener('load', function () {
    var s = document.getElementById('sa-dash-scope');
    if (s) { try { saDashScope(s); } catch (e) {} }
  });
})();
