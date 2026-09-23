/* ==========================================================================
   ra-categories.js — the retailer's product-category list.

   READ-ONLY. Category MANAGEMENT (the Categories page, "Manage categories…",
   the mid-form "+ New category…") was removed for now — the full version is
   kept as js/ra-categories_backup.js, next to the two backed-up page files
   02-Greenstreets_retailer_admin_Categories{,-Light}_backup.html.

   What is left is the part worth keeping: ONE list, in one place. The portal
   used to carry three copies that had drifted apart — the seeded catalogue and
   the Products filter bar had Tops/Bottoms/Dresses/…, while the Add-product and
   Product-detail dropdowns had an unrelated Apparel/Homeware/Electronics list,
   so a product got one taxonomy when it was created and a different one when it
   was filtered. All four now read window.raCats().

   Consumers: js/ra-add-product.js, js/ra-product.js (Category dropdowns) and
   the Products page's category filter, which this file fills.
   ========================================================================== */
(function () {
  'use strict';

  /* The catalogue's categories — PRODUCTS_RA in js/retailer-admin.js is seeded
     with these same names, so the filter bar and the dropdowns always agree. */
  var LIST = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];

  window.raCats = function () { return LIST; };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* The Products page's category filter is filled from the list rather than
     hardcoded in the page (that copy was one of the three that drifted).
     Runs at parse time — the script sits at the end of <body>, so the select is
     already there, and the theme's select enhancer runs after this. */
  var sel = document.getElementById('ra-cat-filter');
  if (sel) {
    sel.innerHTML = '<option value="all">All categories</option>' +
      LIST.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  }
})();
