/* ==========================================================================
   sa-catalogue.js - Super Admin CATALOGUE group (Products / Product detail /
   Packagings / product import) - behaviour that brings SA to parity with the
   Retailer Admin pages, kept out of the shared super-admin.js.

   Pages that load it: Products, Product-Detail, Packagings (+ -Light twins),
   and the three product-import pages.

   1. saOpenProduct(sku)   - Products row click: stash the SKU the way RA's
                             openProductRA() does, so Product-Detail opens THAT
                             product (it used to always open the first one).
   2. Product-Detail sync  - Product-Detail hosts RA's ra-product.js engine, which
                             reads RA's PRODUCTS_RA. The Super Admin catalogue
                             (PRODUCTS_S11) has its own status model (incl. the
                             "Incomplete, ready to approve" state), so PRODUCTS_RA
                             is re-seeded from the same rules - the list and the
                             detail then always agree on status / coverage / retailer.
                             Must load AFTER retailer-admin.js and BEFORE ra-product.js.
   3. Category taxonomy    - window.SA_CATEGORIES (platform list) + window.raCats so
                             the engine's Category dropdown offers the same list as
                             Add product.
   4. Packagings actions   - RA's per-row Approve / DoC / Cancel-approval (with the
                             same confirm modal) on the static Packagings table.
   5. Product import       - SA retailer picker + helpers shared by the 3 import pages.
   ========================================================================== */
(function () {
  'use strict';

  function toast(msg) {
    if (typeof window.saProdMiniToast === 'function') return window.saProdMiniToast(msg);
    if (typeof window.gsToast === 'function') return window.gsToast(msg);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- 3. category taxonomy -------------------------------------------------- */
  if (!window.SA_CATEGORIES || !window.SA_CATEGORIES.length) {
    window.SA_CATEGORIES = [
      'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories',
      'Knitwear', 'Denim', 'Activewear', 'Swimwear', 'Nightwear', 'Underwear & Socks',
      'Babywear', 'Kidswear', 'Menswear', 'Womenswear', 'Bags & Luggage', 'Jewellery',
      'Watches', 'Hair Accessories', 'Beauty & Cosmetics', 'Fragrance', 'Skincare',
      'Homeware', 'Bedding & Linen', 'Kitchenware', 'Furniture', 'Toys & Games',
      'Stationery', 'Seasonal & Gifting'
    ];
  }
  if (typeof window.raCats !== 'function') window.raCats = function () { return window.SA_CATEGORIES; };

  /* ---- 1. open a product from the listing ------------------------------------ */
  window.saOpenProduct = function (sku) {
    try { sessionStorage.setItem('ra_pi', sku); } catch (e) {}
    go('s12');
  };

  /* ---- 2. Product-Detail: align PRODUCTS_RA with the SA catalogue ------------- */
  (function syncDetail() {
    var list = window.PRODUCTS_RA;
    if (!list || !list.length || window.PRODUCTS_S11) return;   /* only on the engine-hosting detail page */
    var retailers = ['Primark Stores Ltd', 'H&M Group', 'Next plc', 'Zara / Inditex', 'M&S Group', 'Dunnes Stores', 'New Look'];
    var statuses = ['Complete', 'Incomplete', 'Incomplete:ready', 'Incomplete', 'Pending', 'Incomplete:ready'];
    var pills = { Complete: 'pill-green', Incomplete: 'pill-grey', Pending: 'pill-amber' };
    list.forEach(function (p, i) {
      var s0 = statuses[i % statuses.length], ready = s0 === 'Incomplete:ready', status = ready ? 'Incomplete' : s0;
      var comps = 2 + (i % 4), allDone = status === 'Complete' || ready;
      var done = allDone ? comps : (status === 'Incomplete' ? Math.max(0, comps - 1 - (i % comps)) : 0);
      p.status = status; p.pill = pills[status]; p.ready = ready;
      p.pkg = allDone ? (ready ? (comps + ' components · ready to approve') : (comps + ' components')) : (status === 'Pending' ? 'Not started' : (done + ' of ' + comps + ' done'));
      p.retailer = retailers[i % retailers.length];
    });
  })();

  /* ---- 4. Packagings: Approve / DoC / Cancel approval per row ------------------ */
  var CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="margin-right:4px;vertical-align:-2px"><polyline points="20 6 9 17 4 12"/></svg>';
  var DOCIC = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:-2px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  var BTN_STYLE = 'height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;font-size:11px;padding:0 10px;margin-right:6px';

  /* the Status pill is the cell immediately before the Actions cell */
  function pkgStatus(tr) { var a = tr.querySelector('td.act-cell'); var p = a && a.previousElementSibling; return p ? p.querySelector('.pill') : null; }
  function pkgType(tr) { var c = tr.querySelector('.tbl-name'); return c ? c.textContent.trim() : 'component'; }

  function pkgDecorate(tr) {
    var cell = tr.querySelector('td.act-cell');
    var pill = pkgStatus(tr);
    if (!cell || !pill) return;
    cell.querySelectorAll('[data-sa-appr]').forEach(function (b) { b.remove(); });
    var st = pill.textContent.trim();
    var html = '';
    if (st === 'Review Needed') {
      html = '<button class="btn-p" data-sa-appr="1" title="Approve component" onclick="event.stopPropagation();saPkgApprove(this)" style="' + BTN_STYLE + '">' + CHECK + 'Approve</button>';
    } else if (st === 'Complete') {
      html = '<button class="btn-p" data-sa-appr="1" title="Download Declaration of Conformity" onclick="event.stopPropagation();saPkgDoc(this)" style="' + BTN_STYLE + '">' + DOCIC + 'DoC</button>' +
             '<button class="btn-g-sm" data-sa-appr="1" title="Cancel approval" onclick="event.stopPropagation();saPkgCancel(this)" style="height:24px;margin-right:6px">Cancel approval</button>';
    }
    if (!html) return;
    var remove = cell.querySelector('.act-remove');
    var tmp = document.createElement('span'); tmp.innerHTML = html;
    while (tmp.firstChild) { if (remove) cell.insertBefore(tmp.firstChild, remove); else cell.appendChild(tmp.firstChild); }
  }

  function pkgSetStatus(tr, label, cls, ord, key) {
    var pill = pkgStatus(tr); if (!pill) return;
    pill.textContent = label; pill.className = 'pill ' + cls;
    tr.setAttribute('data-status', key); tr.setAttribute('data-status-ord', ord);
    pkgDecorate(tr);
    if (typeof window.suPkgFilter === 'function') { try { window.suPkgFilter(); } catch (e) {} }
  }

  window.saPkgApprove = function (btn) {
    var tr = btn.closest('tr'); if (!tr) return;
    pkgSetStatus(tr, 'Complete', 'pill-green', 0, 'approved');
    toast(pkgType(tr) + ' approved — DoC now available');
  };
  window.saPkgDoc = function () { toast('Declaration of Conformity downloaded'); };
  window.saPkgCancel = function (btn) {
    var tr = btn.closest('tr'); if (!tr) return;
    var m = document.createElement('div'); m.className = 'modal-overlay open';
    m.innerHTML = '<div class="modal-box"><div style="font-size:15px;font-weight:600;margin-bottom:8px">Cancel approval?</div>' +
      '<div style="font-size:12.5px;color:var(--tw2);margin-bottom:18px;line-height:1.5">The approval of this ' + esc(pkgType(tr)) + ' will be withdrawn and its Declaration of Conformity will be unavailable until you approve it again.</div>' +
      '<div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn-g" data-a="keep">Keep approved</button><button class="btn-p" data-a="ok">Cancel approval</button></div></div>';
    m.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-a]');
      if (!a && e.target !== m) return;
      m.remove();
      if (a && a.getAttribute('data-a') === 'ok') {
        pkgSetStatus(tr, 'Review Needed', 'pill-amber', 2, 'pending');
        toast('Approval cancelled');
      }
    });
    document.body.appendChild(m);
  };

  function initPackagings() {
    var tb = document.getElementById('su-pkg-tbody');
    if (!tb) return;
    tb.querySelectorAll('tr').forEach(pkgDecorate);
  }

  /* ---- 5. product import: the retailer the file is imported FOR --------------- */
  window.SA_IMPORT_RETAILERS = ['Primark Stores Ltd', 'H&M Group', 'Next plc', 'Zara / Inditex', 'M&S Group', 'Dunnes Stores', 'New Look'];
  window.saImportRetailer = function (v) {
    if (v !== undefined) { try { sessionStorage.setItem('sa_imp_retailer', v); } catch (e) {} return v; }
    try { return sessionStorage.getItem('sa_imp_retailer') || ''; } catch (e) { return ''; }
  };

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(initPackagings);
})();
