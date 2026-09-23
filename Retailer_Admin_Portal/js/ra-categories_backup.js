/* ==========================================================================
   ra-categories.js — the retailer's OWN product-category list.

   The categories belong to the retailer's catalogue (not to the platform), so
   this portal owns the list outright: add, rename, reorder, remove.

   Three jobs, all guarded so the one file is safe to load on any page:
     1. THE STORE — window.raCats() is the single source of the category list
        for every page in this portal. It replaces the copies that had drifted
        apart (the Products filter bar and the seeded catalogue carried
        Tops/Bottoms/…, while the Add-product dropdown carried an unrelated
        Apparel/Homeware/Electronics list). Kept in sessionStorage so an edit
        survives the page loads that navigation is made of here.
     2. THE PAGE — renders the Categories screen into #ra-cats-root
        (02-Greenstreets_retailer_admin_Categories.html). This is the only
        place the list can be renamed, reordered or removed from.
     3. THE HOOKS — fills the Products filter bar's category select, and
        applies a category deep-link arriving from this page.

   Renaming a category re-labels every product carrying it; removing one leaves
   those products without a category, and says how many before it happens.
   Because PRODUCTS_RA is regenerated from a seed on every page load, those two
   edits are also written to a small seeded→current remap that
   retailer-admin.js replays when it builds the catalogue — otherwise a rename
   would be undone by the next click.

   Deliberately NOT here: managing the list mid-form. The Add-product page
   carries a "+ New category…" entry (js/ra-add-product.js) which calls
   window.raCatCreate() — adding is the only category action whose trigger is
   genuinely "I am part-way through a product". Rename and remove are
   catalogue-wide, so they live on the page, reached from the Products list.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'ra_cats';          /* the list itself */
  var RKEY = 'ra_cat_remap';    /* seeded name → current name ('' = removed) */
  var JUMP = 'ra_prod_cat';     /* deep-link: filter Products by this category */

  /* The seeded catalogue's categories — also the starting list, and the keys
     of the remap (PRODUCTS_RA is always generated with these names). */
  var SEED = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];

  /* ---- store ------------------------------------------------------------- */
  function load() {
    try { var r = JSON.parse(sessionStorage.getItem(KEY)); if (r && r.length) return r; } catch (e) {}
    return SEED.slice();
  }
  var LIST = load();
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(LIST)); } catch (e) {} }
  window.raCats = function () { return LIST; };

  function remap() { try { return JSON.parse(sessionStorage.getItem(RKEY)) || {}; } catch (e) { return {}; } }
  function setRemap(m) { try { sessionStorage.setItem(RKEY, JSON.stringify(m)); } catch (e) {} }
  /* Point every seeded name that currently resolves to `was` at `now`
     ('' removes it), so the next page load rebuilds the catalogue the same way. */
  function remapTo(was, now) {
    var m = remap();
    SEED.forEach(function (o) {
      var cur = (m[o] === undefined ? o : m[o]);
      if (cur === was) m[o] = now;
    });
    setRemap(m);
  }

  function products() { return window.PRODUCTS_RA || []; }
  function usage(name) {
    var n = 0;
    products().forEach(function (p) { if (p.cat === name) n++; });
    return n;
  }
  function dupe(name, skip) {
    var n = name.trim().toLowerCase();
    return LIST.some(function (x, i) { return i !== skip && x.trim().toLowerCase() === n; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Add — shared by the page's add field and the Add-product page's dropdown.
     Returns the name on success, '' when rejected (empty or a duplicate). */
  window.raCatCreate = function (name) {
    name = (name || '').trim();
    if (!name || dupe(name, -1)) return '';
    LIST.push(name); save();
    return name;
  };

  /* ---- toast ------------------------------------------------------------- */
  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  /* ---- the inline "+ New category…" control -------------------------------
     Its ✓ / ✕ buttons are shown by the Add-product and Product-detail pages, so
     the rules live here — the one file both of them already load for the store. */
  (function injectSharedCss() {
    if (document.getElementById('gs-cat-ic-css')) return;
    var st = document.createElement('style'); st.id = 'gs-cat-ic-css';
    st.textContent =
      '.gs-cat-ic{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--tw2);cursor:pointer;padding:7px 8px;border-radius:7px;display:flex;flex-shrink:0}' +
      '.gs-cat-ic:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.gs-cat-ic.ok{background:rgba(78,187,129,.16);border-color:rgba(78,187,129,.45);color:var(--gs-l,#8fe3b6)}' +
      '.gs-cat-ic.ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}' +
      'body.lt .gs-cat-ic{background:#eef1f6;border-color:var(--lt-line,#e6ebf3);color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .gs-cat-ic:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .gs-cat-ic.ok{background:rgba(78,187,129,.14);border-color:rgba(78,187,129,.4);color:#2f9c62}' +
      'body.lt .gs-cat-ic.ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}';
    document.head.appendChild(st);
  })();

  /* The markup for that control, shared by both product pages. `handler` is the
     page's prefix ("nap" / "rap") — each owns its own render loop. */
  window.gsCatInlineField = function (h) {
    return '<div style="display:flex;gap:6px;align-items:center">' +
      '<input class="fi" id="gs-newcat" placeholder="New category name…" autocomplete="off" onkeydown="' + h + 'NewCatKey(event)" style="flex:1;min-width:0">' +
      '<button class="gs-cat-ic ok" title="Add this category" onclick="' + h + 'NewCatApply()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg></button>' +
      '<button class="gs-cat-ic" title="Cancel" onclick="' + h + 'NewCatCancel()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>';
  };

  /* ======================================================================
     HOOKS — the Products page
     ====================================================================== */

  /* The category filter select is filled from the store (it used to hardcode
     six names) and carries "Manage categories…" as its last entry. */
  window.raCatFilterChange = function (sel) {
    if (sel.value === '__manage') { go('ra_cats'); return; }
    if (typeof ptFilter === 'function') ptFilter('ra', 'cat', sel.value);
  };

  function wireFilter() {
    var sel = document.getElementById('ra-cat-filter');
    if (!sel) return;
    sel.innerHTML = '<option value="all">All categories</option>' +
      LIST.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') +
      '<option value="__manage">Manage categories…</option>';

    /* Arriving from a category's product count on the Categories page. */
    var want = '';
    try { want = sessionStorage.getItem(JUMP) || ''; sessionStorage.removeItem(JUMP); } catch (e) {}
    if (want && LIST.indexOf(want) >= 0) {
      sel.value = want;
      if (typeof ptFilter === 'function') ptFilter('ra', 'cat', want);
    }
  }

  /* ======================================================================
     THE PAGE
     ====================================================================== */
  var root = document.getElementById('ra-cats-root');
  if (!root) { wireFilter(); return; }

  var term = '';        /* search text */
  var editIdx = -1;     /* row being renamed */
  var confirmIdx = -1;  /* row asking "Remove?" */
  var flashIdx = -1;    /* row to pulse after an add / rename / move */
  var gripIdx = -1;     /* grip to re-focus after a keyboard move */
  var dragIdx = -1;

  /* ---- icons ------------------------------------------------------------- */
  var I_PENCIL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  var I_BIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  var I_TICK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>';
  var I_CROSS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var I_GRIP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>';

  /* ---- styles ------------------------------------------------------------ */
  /* Injected rather than added to css/retailer-admin.css so this feature is one
     file: the page, its behaviour and its look travel together. */
  function injectCss() {
    if (document.getElementById('ra-cats-css')) return;
    var st = document.createElement('style'); st.id = 'ra-cats-css';
    st.textContent =
      '#ra-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f2338;border:1px solid var(--gs);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:9999}' +
      '#ra-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.rcat-note{display:flex;gap:11px;align-items:flex-start;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--tw2);line-height:1.65}' +
      '.rcat-note svg{color:#5b9cf6;flex-shrink:0;margin-top:1px}' +
      '.rcat-search-wrap{position:relative;margin-bottom:12px}' +
      '.rcat-search-wrap>svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--tw3);pointer-events:none}' +
      '.rcat-search-wrap .fi{padding:9px 30px 9px 32px;font-size:12.5px;width:100%}' +
      '.rcat-search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--tw3);cursor:pointer;padding:3px;border-radius:5px;display:flex}' +
      '.rcat-search-clear:hover{background:rgba(255,255,255,.1);color:#fff}' +
      '.rcat-list{display:flex;flex-direction:column;gap:6px}' +
      /* position:relative matters — the theme's animated focus ring (.fs-ring) is an
         ABSOLUTE SIBLING of the focused control and lands in the nearest positioned
         ancestor; anchored to the row it tracks the field instead of the card. */
      '.rcat-row{position:relative;display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:9px;background:rgba(255,255,255,.02);transition:border-color .16s,background .16s,opacity .16s}' +
      '.rcat-row:hover{border-color:rgba(255,255,255,.2)}' +
      '.rcat-row .fi{padding:6px 9px;font-size:12.5px;flex:1;min-width:0}' +
      '.rcat-grip{background:none;border:1px solid transparent;color:var(--tw3);flex-shrink:0;display:flex;padding:4px 2px;border-radius:6px;cursor:grab;touch-action:none}' +
      '.rcat-grip:hover{color:var(--tw);background:rgba(255,255,255,.07)}' +
      '.rcat-grip:active{cursor:grabbing}' +
      '.rcat-grip[disabled]{opacity:.35;cursor:not-allowed}' +
      '.rcat-row.dragging{opacity:.45;border-color:var(--gs)}' +
      '.rcat-row.drop-before{box-shadow:0 -2px 0 0 var(--gs)}' +
      '.rcat-row.drop-after{box-shadow:0 2px 0 0 var(--gs)}' +
      '.rcat-pos{font-size:10.5px;font-weight:700;color:var(--tw3);width:20px;text-align:center;flex-shrink:0;font-variant-numeric:tabular-nums}' +
      '.rcat-name{flex:1;min-width:0;text-align:left;font-family:inherit;font-size:13px;font-weight:500;color:var(--tw);background:none;border:1px solid transparent;border-radius:7px;padding:6px 9px;cursor:text;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .12s,border-color .12s}' +
      '.rcat-name:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)}' +
      '.rcat-name mark{background:rgba(78,187,129,.28);color:inherit;border-radius:3px;padding:0 1px}' +
      '.rcat-use{font-family:inherit;font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--gs-l,#8fe3b6);background:rgba(78,187,129,.12);border:1px solid rgba(78,187,129,.3);border-radius:20px;padding:4px 9px;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:background .12s,color .12s}' +
      '.rcat-use:hover{background:rgba(78,187,129,.24);color:#fff}' +
      '.rcat-use.zero{color:var(--tw3);background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);cursor:default}' +
      '.rcat-use.zero:hover{background:rgba(255,255,255,.04);color:var(--tw3)}' +
      '.rcat-ico{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--tw2);cursor:pointer;padding:6px 7px;border-radius:7px;display:flex;flex-shrink:0;transition:background .12s,color .12s,border-color .12s}' +
      '.rcat-ico:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.rcat-x{background:rgba(224,96,90,.08);border-color:rgba(224,96,90,.25);color:#e0605a}' +
      '.rcat-x:hover{background:rgba(224,96,90,.22);border-color:#e0605a;color:#fff}' +
      '.rcat-ok{background:rgba(78,187,129,.16);border-color:rgba(78,187,129,.45);color:var(--gs-l,#8fe3b6)}' +
      '.rcat-ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}' +
      '.rcat-row.confirm{border-color:rgba(224,96,90,.6);background:rgba(224,96,90,.09)}' +
      '.rcat-confirm-txt{flex:1;min-width:0;font-size:12px;color:var(--tw2);line-height:1.45}' +
      '.rcat-confirm-txt b{color:var(--tw)}' +
      '.rcat-btn-sm{font-family:inherit;font-size:11px;font-weight:600;padding:6px 11px;border-radius:7px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--tw2);white-space:nowrap}' +
      '.rcat-btn-sm:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.rcat-btn-danger{background:rgba(224,96,90,.16);border-color:rgba(224,96,90,.45);color:#e0605a}' +
      '.rcat-btn-danger:hover{background:#e0605a;border-color:#e0605a;color:#fff}' +
      '.rcat-row.flash{border-color:var(--gs)!important;box-shadow:0 0 0 1px var(--gs),0 0 18px rgba(78,187,129,.3);animation:rcatPop .45s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes rcatPop{0%{transform:scale(.99);opacity:.55}100%{transform:scale(1);opacity:1}}' +
      '.rcat-add{display:flex;gap:8px;align-items:center;margin-top:14px;padding-top:14px;border-top:1px dashed rgba(255,255,255,.12)}' +
      '.rcat-add .fi{flex:1;min-width:0;padding:8px 11px;font-size:12.5px}' +
      '.rcat-empty{padding:26px 18px;text-align:center;color:var(--tw3);font-size:12.5px;line-height:1.8}' +
      '.rcat-empty b{color:var(--tw2)}' +
      '.rcat-count{font-size:11px;color:var(--tw3)}' +
      /* light theme */
      'body.lt #ra-toast{background:#fff;color:var(--lt-ink,#33415c);box-shadow:0 12px 30px rgba(20,40,80,.18)}' +
      'body.lt .rcat-row{background:var(--lt-surface-2,#fbfcfe);border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .rcat-row:hover{border-color:#c9d3e2}' +
      'body.lt .rcat-name{color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-name:hover{background:#eef1f6;border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .rcat-grip:hover{background:#eef1f6;color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-ico{background:#eef1f6;border-color:var(--lt-line,#e6ebf3);color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .rcat-ico:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-x{background:rgba(224,96,90,.1);border-color:rgba(224,96,90,.3);color:#c9453f}' +
      'body.lt .rcat-x:hover{background:#e0605a;border-color:#e0605a;color:#fff}' +
      'body.lt .rcat-ok{background:rgba(78,187,129,.14);border-color:rgba(78,187,129,.4);color:#2f9c62}' +
      'body.lt .rcat-ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}' +
      'body.lt .rcat-use{color:#2f9c62}' +
      'body.lt .rcat-use:hover{background:rgba(78,187,129,.22);color:#1f7a4a}' +
      'body.lt .rcat-use.zero{color:var(--lt-ink-3,#5e6b85);background:#f1f4f9;border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .rcat-btn-sm{background:#eef1f6;border-color:var(--lt-line,#e6ebf3);color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .rcat-btn-sm:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-btn-danger{background:rgba(224,96,90,.1);border-color:rgba(224,96,90,.35);color:#c9453f}' +
      'body.lt .rcat-btn-danger:hover{background:#e0605a;color:#fff}' +
      'body.lt .rcat-confirm-txt b{color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-empty b{color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-search-clear:hover{background:#eef1f6;color:var(--lt-ink,#33415c)}' +
      'body.lt .rcat-add{border-color:var(--lt-line,#e6ebf3)}';
    document.head.appendChild(st);
  }

  /* ---- search ------------------------------------------------------------ */
  function matches() {
    var t = term.trim().toLowerCase();
    return LIST.map(function (name, i) { return { name: name, i: i }; })
      .filter(function (r) { return !t || r.name.toLowerCase().indexOf(t) >= 0; });
  }
  function mark(name) {
    var t = term.trim();
    if (!t) return esc(name);
    var at = name.toLowerCase().indexOf(t.toLowerCase());
    if (at < 0) return esc(name);
    return esc(name.slice(0, at)) + '<mark>' + esc(name.slice(at, at + t.length)) + '</mark>' + esc(name.slice(at + t.length));
  }
  window.raCatSearch = function (v) { term = v || ''; editIdx = -1; confirmIdx = -1; renderList(); };
  window.raCatSearchKey = function (e) {
    if (e.key === 'Enter') { e.preventDefault(); window.raCatAddFromSearch(); }
    else if (e.key === 'Escape' && term) { e.preventDefault(); window.raCatClearSearch(); }
  };
  window.raCatClearSearch = function () {
    term = '';
    var s = document.getElementById('rcat-search'); if (s) { s.value = ''; s.focus(); }
    renderList();
  };
  /* Enter in the search field adds what was typed when nothing matches it —
     the fastest path from "it isn't there" to "it is". */
  window.raCatAddFromSearch = function () {
    var name = term.trim();
    if (!name || matches().length) return;
    var inp = document.getElementById('rcat-new'); if (inp) inp.value = name;
    window.raCatClearSearch();
    window.raCatAdd();
  };

  /* ---- shell ------------------------------------------------------------- */
  function uncategorised() {
    var n = 0;
    products().forEach(function (p) { if (!p.cat) n++; });
    return n;
  }

  function renderShell() {
    var unc = uncategorised();
    root.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px">' +
        '<div class="stat"><div class="stat-lbl">Categories</div><div class="stat-val" id="rcat-stat-n">' + LIST.length + '</div></div>' +
        '<div class="stat"><div class="stat-lbl">Products classified</div><div class="stat-val" style="color:#8fe3b6" id="rcat-stat-c">' + (products().length - unc) + '</div></div>' +
        '<div class="stat"><div class="stat-lbl">Without a category</div><div class="stat-val" style="color:' + (unc ? '#f5a623' : 'var(--tw2)') + '" id="rcat-stat-u">' + unc + '</div></div>' +
      '</div>' +
      '<div class="grp">' +
        '<div class="grp-hdr">Category list<span class="rcat-count" id="rcat-count" style="margin-left:auto;font-weight:400"></span></div>' +
        '<div class="grp-body">' +
          '<div class="rcat-note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
            '<div>These are your catalogue&rsquo;s categories &mdash; they fill the Category dropdown on every product and the filter on the Products list. Click a name to rename it; renaming re-labels the products using it. Drag the handle, or focus it and press &uarr; / &darr;, to change the order they appear in. Changes apply straight away.</div></div>' +
          '<div class="rcat-search-wrap">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input class="fi" id="rcat-search" placeholder="Search categories&hellip;" autocomplete="off" oninput="raCatSearch(this.value)" onkeydown="raCatSearchKey(event)">' +
            '<button class="rcat-search-clear" id="rcat-search-clear" style="display:none" title="Clear search" onclick="raCatClearSearch()">' + I_CROSS + '</button>' +
          '</div>' +
          '<div class="rcat-list" id="rcat-list"></div>' +
          '<div class="rcat-add">' +
            '<input class="fi" id="rcat-new" placeholder="New category name&hellip;" autocomplete="off" onkeydown="raCatAddKey(event)">' +
            '<button class="btn-g" onclick="raCatAdd()" style="height:36px;padding:0 15px;font-size:12px;display:inline-flex;align-items:center;gap:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>Add category</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function syncStats() {
    var unc = uncategorised();
    var a = document.getElementById('rcat-stat-n'); if (a) a.textContent = LIST.length;
    var b = document.getElementById('rcat-stat-c'); if (b) b.textContent = products().length - unc;
    var c = document.getElementById('rcat-stat-u');
    if (c) { c.textContent = unc; c.style.color = unc ? '#f5a623' : 'var(--tw2)'; }
  }

  /* ---- list -------------------------------------------------------------- */
  function renderList() {
    var host = document.getElementById('rcat-list'); if (!host) return;
    var rows = matches(), searching = !!term.trim();

    host.innerHTML = rows.length ? rows.map(function (r) {
      var i = r.i, name = r.name, used = usage(name);

      if (i === confirmIdx) {
        return '<div class="rcat-row confirm">' +
          '<span class="rcat-confirm-txt">Remove <b>' + esc(name) + '</b>?' +
            (used ? ' ' + used + ' product' + (used === 1 ? '' : 's') + ' will be left without a category.' : ' No products use it.') + '</span>' +
          '<button class="rcat-btn-sm" onclick="raCatCancelRemove()">Keep</button>' +
          '<button class="rcat-btn-sm rcat-btn-danger" onclick="raCatRemove(' + i + ')">Remove</button>' +
        '</div>';
      }

      if (i === editIdx) {
        return '<div class="rcat-row editing">' +
          '<span class="rcat-pos">' + (i + 1) + '</span>' +
          '<input class="fi" id="rcat-edit-input" value="' + esc(name) + '" autocomplete="off" spellcheck="false" onkeydown="raCatEditKey(event,' + i + ')">' +
          '<button class="rcat-ico rcat-ok" title="Apply the new name" onclick="raCatApply(' + i + ')">' + I_TICK + '</button>' +
          '<button class="rcat-ico" title="Cancel &mdash; keep the current name" onclick="raCatCancelEdit()">' + I_CROSS + '</button>' +
        '</div>';
      }

      return '<div class="rcat-row' + (i === flashIdx ? ' flash' : '') + '" data-i="' + i + '"' +
          ' ondragstart="raCatDragStart(event,' + i + ')" ondragover="raCatDragOver(event,' + i + ')"' +
          ' ondragleave="raCatDragLeave(event)" ondrop="raCatDrop(event,' + i + ')" ondragend="raCatDragEnd(event)">' +
        '<button class="rcat-grip" data-grip="' + i + '"' + (searching ? ' disabled' : '') +
          ' title="' + (searching ? 'Clear the search to reorder' : 'Drag to reorder &mdash; or press &uarr; / &darr;') + '"' +
          ' aria-label="Reorder ' + esc(name) + '"' +
          ' onmousedown="raCatGripDown(this)" onmouseup="raCatGripUp(this)" onkeydown="raCatGripKey(event,' + i + ')">' + I_GRIP + '</button>' +
        '<span class="rcat-pos">' + (i + 1) + '</span>' +
        '<button class="rcat-name" title="Click to rename" onclick="raCatEdit(' + i + ')">' + mark(name) + '</button>' +
        '<button class="rcat-use' + (used ? '' : ' zero') + '"' +
          (used ? ' title="Show these products on the Products list" onclick="raCatShowProducts(' + i + ')"' : ' title="No products carry this category yet" disabled') + '>' +
          used + ' product' + (used === 1 ? '' : 's') + '</button>' +
        '<button class="rcat-ico" title="Rename category" onclick="raCatEdit(' + i + ')">' + I_PENCIL + '</button>' +
        '<button class="rcat-ico rcat-x" title="Remove category" onclick="raCatAskRemove(' + i + ')">' + I_BIN + '</button>' +
      '</div>';
    }).join('')
      : (searching
        ? '<div class="rcat-empty">No categories match <b>' + esc(term.trim()) + '</b>.<br>' +
            '<button class="rcat-btn-sm" style="margin-top:10px" onclick="raCatAddFromSearch()">Add &ldquo;' + esc(term.trim()) + '&rdquo; as a new category</button></div>'
        : '<div class="rcat-empty">No categories yet.<br>Add the first one below &mdash; products can&rsquo;t be classified until there is one.</div>');

    flashIdx = -1;

    var clr = document.getElementById('rcat-search-clear');
    if (clr) clr.style.display = term ? 'flex' : 'none';

    var c = document.getElementById('rcat-count');
    if (c) {
      c.textContent = searching
        ? rows.length + ' of ' + LIST.length + ' shown'
        : LIST.length + ' categor' + (LIST.length === 1 ? 'y' : 'ies');
    }
    syncStats();

    if (editIdx >= 0) {
      var inp = document.getElementById('rcat-edit-input');
      if (inp) { inp.focus(); inp.select(); }
    } else if (gripIdx >= 0) {
      /* keep the keyboard on the row that just moved */
      var g = host.querySelector('[data-grip="' + gripIdx + '"]');
      if (g) g.focus();
      gripIdx = -1;
    }
  }

  /* ---- jump to the products carrying a category -------------------------- */
  /* Takes the INDEX, not the name — a name goes through an HTML attribute and a
     quote in it would break the handler. */
  window.raCatShowProducts = function (i) {
    var name = LIST[i]; if (!name) return;
    try { sessionStorage.setItem(JUMP, name); } catch (e) {}
    go('ra6');
  };

  /* ---- reorder ----------------------------------------------------------- */
  /* The row is draggable only while the grip is held, so the name button and the
     rename field keep their normal click / selection behaviour. */
  window.raCatGripDown = function (g) {
    if (g.disabled) return;
    var row = g.closest('.rcat-row'); if (row) row.draggable = true;
  };
  window.raCatGripUp = function (g) {
    var row = g.closest('.rcat-row'); if (row) row.draggable = false;
  };
  window.raCatGripKey = function (e, i) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (term.trim()) { toast('Clear the search to reorder'); return; }
    move(i, i + (e.key === 'ArrowUp' ? -1 : 1), true);
  };
  function clearDropMarks() {
    var host = document.getElementById('rcat-list'); if (!host) return;
    host.querySelectorAll('.drop-before,.drop-after').forEach(function (el) {
      el.classList.remove('drop-before', 'drop-after');
    });
  }
  window.raCatDragStart = function (e, i) {
    dragIdx = i;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {}
    var row = e.currentTarget; setTimeout(function () { row.classList.add('dragging'); }, 0);
  };
  window.raCatDragOver = function (e, i) {
    if (dragIdx < 0 || i === dragIdx) return;
    e.preventDefault();                       /* required, or drop never fires */
    e.dataTransfer.dropEffect = 'move';
    var row = e.currentTarget, r = row.getBoundingClientRect();
    var after = (e.clientY - r.top) > r.height / 2;
    row.classList.toggle('drop-after', after);
    row.classList.toggle('drop-before', !after);
  };
  window.raCatDragLeave = function (e) { e.currentTarget.classList.remove('drop-before', 'drop-after'); };
  window.raCatDrop = function (e, i) {
    e.preventDefault();
    var row = e.currentTarget, r = row.getBoundingClientRect();
    var after = (e.clientY - r.top) > r.height / 2;
    clearDropMarks();
    var from = dragIdx; dragIdx = -1;
    if (from < 0 || from === i) return;
    var to = i + (after ? 1 : 0);
    if (from < to) to--;                      /* removing the row first shifts the target */
    move(from, to, false);
  };
  window.raCatDragEnd = function (e) {
    dragIdx = -1;
    e.currentTarget.draggable = false;
    e.currentTarget.classList.remove('dragging');
    clearDropMarks();
  };
  function move(from, to, keepGrip) {
    if (to < 0 || to >= LIST.length || from === to) return;
    var moved = LIST.splice(from, 1)[0];
    LIST.splice(to, 0, moved);
    save();
    flashIdx = to;
    if (keepGrip) gripIdx = to;
    confirmIdx = -1; editIdx = -1;
    renderList();
    toast('“' + moved + '” moved to position ' + (to + 1));
  }

  /* ---- rename ------------------------------------------------------------ */
  window.raCatEdit = function (i) { editIdx = i; confirmIdx = -1; renderList(); };
  window.raCatCancelEdit = function () { editIdx = -1; renderList(); };
  window.raCatEditKey = function (e, i) {
    if (e.key === 'Enter') { e.preventDefault(); window.raCatApply(i); }
    else if (e.key === 'Escape') { e.preventDefault(); window.raCatCancelEdit(); }
  };
  /* Never committed on blur — the tick is the only commit, so clicking away
     leaves the category as it was. */
  window.raCatApply = function (i) {
    var inp = document.getElementById('rcat-edit-input'); if (!inp) return;
    var was = LIST[i], now = (inp.value || '').trim();
    if (now === was) { editIdx = -1; renderList(); return; }
    if (!now) { if (window.gsShake) window.gsShake(inp); inp.focus(); toast('A category needs a name'); return; }
    if (dupe(now, i)) { if (window.gsShake) window.gsShake(inp); inp.focus(); toast('“' + now + '” already exists'); return; }
    LIST[i] = now; save();
    var n = 0;
    products().forEach(function (p) { if (p.cat === was) { p.cat = now; n++; } });
    remapTo(was, now);
    editIdx = -1; flashIdx = i;
    renderList();
    toast('“' + was + '” renamed to “' + now + '”' + (n ? ' · ' + n + ' product' + (n === 1 ? '' : 's') + ' updated' : ''));
  };

  /* ---- remove ------------------------------------------------------------ */
  window.raCatAskRemove = function (i) { confirmIdx = i; editIdx = -1; renderList(); };
  window.raCatCancelRemove = function () { confirmIdx = -1; renderList(); };
  window.raCatRemove = function (i) {
    var name = LIST[i];
    if (name == null) return;
    LIST.splice(i, 1); save();
    var n = 0;
    products().forEach(function (p) { if (p.cat === name) { p.cat = ''; n++; } });
    remapTo(name, '');
    confirmIdx = -1; editIdx = -1;
    renderList();
    toast('“' + name + '” removed' + (n ? ' · ' + n + ' product' + (n === 1 ? '' : 's') + ' left without one' : ''));
  };

  /* ---- add --------------------------------------------------------------- */
  window.raCatAddKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); window.raCatAdd(); } };
  window.raCatAdd = function () {
    var inp = document.getElementById('rcat-new'); if (!inp) return;
    var name = (inp.value || '').trim();
    if (!name) { if (window.gsShake) window.gsShake(inp); toast('Type a category name first'); return; }
    if (dupe(name, -1)) { if (window.gsShake) window.gsShake(inp); toast('“' + name + '” already exists'); return; }
    window.raCatCreate(name);
    inp.value = '';
    flashIdx = LIST.length - 1;
    confirmIdx = -1; editIdx = -1;
    /* a stale search would hide the row that was just added */
    if (term.trim() && name.toLowerCase().indexOf(term.trim().toLowerCase()) < 0) {
      term = '';
      var s = document.getElementById('rcat-search'); if (s) s.value = '';
    }
    renderList();
    inp.focus();
    toast('“' + name + '” added');
    var host = document.getElementById('rcat-list');
    if (host && host.lastElementChild) host.lastElementChild.scrollIntoView({ block: 'nearest' });
  };

  injectCss();
  renderShell();
  renderList();
})();
