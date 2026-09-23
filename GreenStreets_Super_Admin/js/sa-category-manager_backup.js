/* ==========================================================================
   sa-category-manager.js — the platform "Manage categories" window.

   Loaded ONLY by 01-greenstreets_super_admin_Add-Product.html (+ its Light
   twin), whose Category dropdown (js/sa-add-product.js) carries
   "Manage categories…" as its first entry: picking it puts the select back to
   its previous value and calls window.saOpenCategoryManager() from here.

   Categories are PLATFORM-level — the Super Admin owns the taxonomy every
   retailer classifies against — so this window edits window.SA_CATEGORIES and
   the page re-renders from it.

   What the window does, and what each action really touches:
     • search   — filters the list only; never changes the stored order;
     • rename   — a field with ✓ apply / ✕ cancel (Enter / Esc do the same).
       NEVER committed on blur: the tick is the only commit, so clicking away
       leaves the category as it was. Applying also re-labels every product
       already carrying it in the catalogue dataset (PRODUCTS_S11);
     • remove   — asks first, and says how many catalogue products use it;
     • reorder  — drag the grip, or focus it and press ↑ / ↓. That order is the
       order of the Category dropdown, so it is worth controlling;
     • add      — appended to the end of the list.
   Everything applies immediately; "Done" only closes the window.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('sa-newprod-root')) return;

  var OV = 'sa-catmgr';
  var confirmIdx = -1;   /* the row currently asking "Remove?" */
  var editIdx = -1;      /* the row currently being renamed */
  var flashIdx = -1;     /* the row to pulse after an add / rename / move */
  var gripIdx = -1;      /* the grip to re-focus after a keyboard move */
  var dragIdx = -1;      /* the row being dragged */
  var term = '';         /* the search field's current text */

  function cats() { return (window.SA_CATEGORIES = window.SA_CATEGORIES || []); }
  function selectedCat() { return (window.sapGetCat ? window.sapGetCat() : '') || ''; }
  function products() { return window.PRODUCTS_S11 || []; }
  function toast(m) {
    if (typeof window.sapToast === 'function') { window.sapToast(m); return; }
    if (typeof window.saProdMiniToast === 'function') { window.saProdMiniToast(m); return; }
    var t = document.getElementById('sa-toast');
    if (!t) { t = document.createElement('div'); t.id = 'sa-toast'; document.body.appendChild(t); }
    t.textContent = m; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function usage(name) {
    var n = 0;
    products().forEach(function (p) { if (p.cat === name) n++; });
    return n;
  }

  /* ---- the page this window belongs to ----------------------------------- */
  /* Re-render the New-product page so its Category dropdown shows the new list,
     then re-theme its controls (render() emits plain <select>s). */
  function refreshPage() {
    if (!window.sapRender) return;
    window.sapRender();
    var root = document.getElementById('sa-newprod-root');
    if (root && window.GSEnhanceSelects) window.GSEnhanceSelects(root);
    if (root && window.GSEnhanceNumbers) window.GSEnhanceNumbers(root);
  }

  /* ---- styles ------------------------------------------------------------ */
  function injectCss() {
    if (document.getElementById('sa-catmgr-css')) return;
    var st = document.createElement('style'); st.id = 'sa-catmgr-css';
    st.textContent =
      /* window shell — self-contained, so this page needs no other portal's modal CSS */
      '.cat-ov{position:fixed;inset:0;background:rgba(4,10,20,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:9998;padding:20px}' +
      '.cat-modal{width:100%;max-width:480px;max-height:80vh;display:flex;flex-direction:column;background:linear-gradient(165deg,rgba(15,26,46,.99),rgba(9,17,32,1));border:1px solid var(--line-2,rgba(148,180,230,.26));border-radius:var(--rl,14px);overflow:hidden;box-shadow:0 30px 70px -20px rgba(0,0,0,.7)}' +
      '.cat-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line,rgba(255,255,255,.09));font-size:14.5px;font-weight:700;color:var(--tw,#fff)}' +
      '.cat-close{background:rgba(255,255,255,.06);border:none;color:var(--tw2);cursor:pointer;padding:5px;border-radius:8px;display:flex}' +
      '.cat-close:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.cat-body{padding:16px 18px;display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}' +
      '.cat-foot{padding:12px 18px;border-top:1px solid var(--line,rgba(255,255,255,.09));display:flex;align-items:center;justify-content:space-between}' +
      '.cat-note{display:flex;gap:11px;align-items:flex-start;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);border-radius:10px;padding:11px 13px;margin-bottom:12px;font-size:12px;color:var(--tw2);line-height:1.6;flex-shrink:0}' +
      '.cat-note svg{color:#5b9cf6;flex-shrink:0;margin-top:1px}' +
      /* search */
      '.cat-search-wrap{position:relative;margin-bottom:10px;flex-shrink:0}' +
      '.cat-search-wrap>svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--tw3);pointer-events:none}' +
      '.cat-search-wrap .fi{padding:8px 30px 8px 32px;font-size:12.5px;width:100%}' +
      '.cat-search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--tw3);cursor:pointer;padding:3px;border-radius:5px;display:flex}' +
      '.cat-search-clear:hover{background:rgba(255,255,255,.1);color:#fff}' +
      /* one scroller: the window fills to 80vh and only the list scrolls */
      '.cat-list{display:flex;flex-direction:column;gap:6px;flex:1;min-height:56px;overflow-y:auto;padding-right:2px}' +
      /* position:relative matters — the theme's animated focus ring (.fs-ring) is inserted as an
         ABSOLUTE SIBLING of the focused control and lands in the nearest positioned ancestor.
         Anchored to the row, it moves and resizes with the field instead of staying behind while
         the list scrolls. */
      '.cat-row{position:relative;display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--line,rgba(255,255,255,.09));border-radius:9px;background:rgba(255,255,255,.02);transition:border-color .16s,background .16s,opacity .16s}' +
      '.cat-row:hover{border-color:rgba(255,255,255,.2)}' +
      '.cat-row .fi{padding:6px 9px;font-size:12.5px;flex:1;min-width:0}' +
      /* drag handle */
      '.cat-grip{background:none;border:1px solid transparent;color:var(--tw3);flex-shrink:0;display:flex;padding:4px 2px;border-radius:6px;cursor:grab;touch-action:none}' +
      '.cat-grip:hover{color:var(--tw);background:rgba(255,255,255,.07)}' +
      '.cat-grip:active{cursor:grabbing}' +
      '.cat-grip[disabled]{opacity:.35;cursor:not-allowed}' +
      '.cat-row.dragging{opacity:.45;border-color:var(--gs)}' +
      '.cat-row.drop-before{box-shadow:0 -2px 0 0 var(--gs)}' +
      '.cat-row.drop-after{box-shadow:0 2px 0 0 var(--gs)}' +
      '.cat-name{flex:1;min-width:0;text-align:left;font-family:inherit;font-size:12.5px;font-weight:500;color:var(--tw);background:none;border:1px solid transparent;border-radius:7px;padding:6px 9px;cursor:text;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .12s,border-color .12s}' +
      '.cat-name:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)}' +
      '.cat-name mark{background:rgba(78,187,129,.28);color:inherit;border-radius:3px;padding:0 1px}' +
      '.cat-on{color:var(--gs-l,#8fe3b6)!important;background:rgba(78,187,129,.12)!important;border-color:rgba(78,187,129,.3)!important}' +
      '.cat-use{font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--gs-l,#8fe3b6);background:rgba(78,187,129,.12);border:1px solid rgba(78,187,129,.3);border-radius:20px;padding:3px 8px;white-space:nowrap;flex-shrink:0}' +
      '.cat-use.zero{color:var(--tw3);background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12)}' +
      '.cat-ico{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--tw2);cursor:pointer;padding:5px 6px;border-radius:7px;display:flex;flex-shrink:0;transition:background .12s,color .12s,border-color .12s}' +
      '.cat-ico:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.cat-x{background:rgba(224,96,90,.08);border-color:rgba(224,96,90,.25);color:#e0605a}' +
      '.cat-x:hover{background:rgba(224,96,90,.22);border-color:#e0605a;color:#fff}' +
      '.cat-ok{background:rgba(78,187,129,.16);border-color:rgba(78,187,129,.45);color:var(--gs-l,#8fe3b6)}' +
      '.cat-ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}' +
      /* .cat-row.editing carries no styling on purpose: the field's own focus ring is the
         highlight, and a second stroke around the whole row only doubled it up */
      '.cat-row.confirm{border-color:rgba(224,96,90,.6);background:rgba(224,96,90,.09)}' +
      '.cat-confirm-txt{flex:1;min-width:0;font-size:12px;color:var(--tw2);line-height:1.45}' +
      '.cat-confirm-txt b{color:var(--tw)}' +
      '.cat-btn-sm{font-family:inherit;font-size:11px;font-weight:600;padding:5px 10px;border-radius:7px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--tw2);white-space:nowrap}' +
      '.cat-btn-sm:hover{background:rgba(255,255,255,.14);color:#fff}' +
      '.cat-btn-danger{background:rgba(224,96,90,.16);border-color:rgba(224,96,90,.45);color:#e0605a}' +
      '.cat-btn-danger:hover{background:#e0605a;border-color:#e0605a;color:#fff}' +
      '.cat-row.flash{border-color:var(--gs)!important;box-shadow:0 0 0 1px var(--gs),0 0 18px rgba(78,187,129,.3);animation:catPop .45s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes catPop{0%{transform:scale(.97);opacity:.5}100%{transform:scale(1);opacity:1}}' +
      '.cat-add{display:flex;gap:8px;align-items:center;flex-shrink:0;margin-top:12px;padding-top:12px;border-top:1px dashed rgba(255,255,255,.12)}' +
      '.cat-add .fi{flex:1;min-width:0;padding:7px 10px;font-size:12.5px}' +
      '.cat-empty{padding:18px;text-align:center;color:var(--tw3);font-size:12px;line-height:1.7}' +
      '.cat-empty b{color:var(--tw2)}' +
      '.cat-count{font-size:11px;color:var(--tw3)}' +
      /* light theme */
      'body.lt .cat-modal{background:var(--lt-surface,#fff);border-color:var(--lt-line-2,#dbe2ee)}' +
      'body.lt .cat-hdr{color:var(--lt-ink,#33415c);border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .cat-foot{border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .cat-close{background:#eef1f6;color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .cat-close:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-row{background:var(--lt-surface-2,#fbfcfe);border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .cat-row:hover{border-color:#c9d3e2}' +
      'body.lt .cat-name{color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-name:hover{background:#eef1f6;border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .cat-grip:hover{background:#eef1f6;color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-ico{background:#eef1f6;border-color:var(--lt-line,#e6ebf3);color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .cat-ico:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-x{background:rgba(224,96,90,.1);border-color:rgba(224,96,90,.3);color:#c9453f}' +
      'body.lt .cat-x:hover{background:#e0605a;border-color:#e0605a;color:#fff}' +
      'body.lt .cat-ok{background:rgba(78,187,129,.14);border-color:rgba(78,187,129,.4);color:#2f9c62}' +
      'body.lt .cat-ok:hover{background:var(--gs);border-color:var(--gs);color:#fff}' +
      'body.lt .cat-use{color:#2f9c62}' +
      'body.lt .cat-use.zero{color:var(--lt-ink-3,#5e6b85);background:#f1f4f9;border-color:var(--lt-line,#e6ebf3)}' +
      'body.lt .cat-btn-sm{background:#eef1f6;border-color:var(--lt-line,#e6ebf3);color:var(--lt-ink-2,#5a6b86)}' +
      'body.lt .cat-btn-sm:hover{background:#e2e7f0;color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-btn-danger{background:rgba(224,96,90,.1);border-color:rgba(224,96,90,.35);color:#c9453f}' +
      'body.lt .cat-btn-danger:hover{background:#e0605a;color:#fff}' +
      'body.lt .cat-confirm-txt b{color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-empty b{color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-search-clear:hover{background:#eef1f6;color:var(--lt-ink,#33415c)}' +
      'body.lt .cat-add{border-color:var(--lt-line,#e6ebf3)}';
    document.head.appendChild(st);
  }

  /* ---- icons ------------------------------------------------------------- */
  var I_PENCIL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  var I_BIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  var I_TICK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>';
  var I_CROSS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var I_GRIP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>';

  /* ---- open / close ------------------------------------------------------ */
  window.saOpenCategoryManager = function () {
    injectCss();
    close();
    confirmIdx = -1; editIdx = -1; flashIdx = -1; gripIdx = -1; dragIdx = -1; term = '';
    var ov = document.createElement('div');
    ov.id = OV; ov.className = 'cat-ov';
    ov.onclick = function (e) { if (e.target === ov) close(); };
    ov.innerHTML =
      '<div class="cat-modal">' +
        '<div class="cat-hdr"><span>Manage categories</span>' +
          '<button class="cat-close" onclick="saCatClose()" title="Close"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
        '<div class="cat-body">' +
          '<div class="cat-note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
            '<div>The platform category list — every retailer classifies products with these. Click a name to rename it, then apply with the tick. Drag the handle (or focus it and press ↑ / ↓) to reorder. Changes apply straight away.</div></div>' +
          '<div class="cat-search-wrap">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input class="fi" id="cat-search" placeholder="Search categories…" autocomplete="off" oninput="saCatSearch(this.value)" onkeydown="saCatSearchKey(event)">' +
            '<button class="cat-search-clear" id="cat-search-clear" style="display:none" title="Clear search" onclick="saCatClearSearch()">' + I_CROSS + '</button>' +
          '</div>' +
          '<div class="cat-list" id="cat-list"></div>' +
          '<div class="cat-add">' +
            '<input class="fi" id="cat-new" placeholder="New category name…" autocomplete="off" onkeydown="saCatAddKey(event)">' +
            '<button class="btn-g-sm" onclick="saCatAdd()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>Add category</button>' +
          '</div>' +
        '</div>' +
        '<div class="cat-foot">' +
          '<span class="cat-count" id="cat-count"></span>' +
          '<button class="btn-p" onclick="saCatClose()"><span class="btn-c">Done</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    document.addEventListener('keydown', escKey);
    renderList();
    var s = document.getElementById('cat-search'); if (s) s.focus();
  };

  function close() {
    var ov = document.getElementById(OV);
    if (ov) ov.remove();
    document.removeEventListener('keydown', escKey);
  }
  window.saCatClose = close;
  function escKey(e) {
    if (e.key !== 'Escape') return;
    /* Esc backs out of a row state first, and only then closes the window. */
    if (editIdx >= 0) { editIdx = -1; renderList(); return; }
    if (confirmIdx >= 0) { confirmIdx = -1; renderList(); return; }
    close();
  }

  /* ---- search ------------------------------------------------------------ */
  window.saCatSearch = function (v) {
    term = v || '';
    editIdx = -1; confirmIdx = -1;   /* the row under edit may filter away */
    renderList();
  };
  window.saCatSearchKey = function (e) {
    if (e.key === 'Enter') { e.preventDefault(); window.saCatAddFromSearch(); }
    else if (e.key === 'Escape' && term) { e.preventDefault(); e.stopPropagation(); window.saCatClearSearch(); }
  };
  window.saCatClearSearch = function () {
    term = '';
    var s = document.getElementById('cat-search'); if (s) { s.value = ''; s.focus(); }
    renderList();
  };
  /* Enter in the search field (or the empty-state button) adds what was typed
     when nothing matches it — the fastest path from "it isn't there" to "it is". */
  window.saCatAddFromSearch = function () {
    var name = term.trim();
    if (!name || matches().length) return;
    var inp = document.getElementById('cat-new'); if (inp) inp.value = name;
    window.saCatClearSearch();
    window.saCatAdd();
  };

  function matches() {
    var t = term.trim().toLowerCase();
    return cats().map(function (name, i) { return { name: name, i: i }; })
      .filter(function (r) { return !t || r.name.toLowerCase().indexOf(t) >= 0; });
  }
  /* Highlight the matched run inside a name — text only, escaped either side. */
  function mark(name) {
    var t = term.trim();
    if (!t) return esc(name);
    var at = name.toLowerCase().indexOf(t.toLowerCase());
    if (at < 0) return esc(name);
    return esc(name.slice(0, at)) + '<mark>' + esc(name.slice(at, at + t.length)) + '</mark>' + esc(name.slice(at + t.length));
  }

  /* ---- list -------------------------------------------------------------- */
  function renderList() {
    var host = document.getElementById('cat-list'); if (!host) return;
    var all = cats(), rows = matches(), searching = !!term.trim();

    var cur = selectedCat();
    host.innerHTML = rows.length ? rows.map(function (r) {
      var i = r.i, name = r.name, used = usage(name);

      if (i === confirmIdx) {
        return '<div class="cat-row confirm">' +
          '<span class="cat-confirm-txt">Remove <b>' + esc(name) + '</b>?' +
            (name === cur ? ' It is selected on this product.' : '') +
            (used ? ' ' + used + ' catalogue product' + (used === 1 ? '' : 's') + ' will be left without a category.' : '') + '</span>' +
          '<button class="cat-btn-sm" onclick="saCatCancelRemove()">Keep</button>' +
          '<button class="cat-btn-sm cat-btn-danger" onclick="saCatRemove(' + i + ')">Remove</button>' +
        '</div>';
      }

      if (i === editIdx) {
        return '<div class="cat-row editing">' +
          '<span class="cat-grip" style="cursor:default">' + I_GRIP + '</span>' +
          '<input class="fi" id="cat-edit-input" value="' + esc(name) + '" autocomplete="off" spellcheck="false" onkeydown="saCatEditKey(event,' + i + ')">' +
          '<button class="cat-ico cat-ok" title="Apply the new name" onclick="saCatApply(' + i + ')">' + I_TICK + '</button>' +
          '<button class="cat-ico" title="Cancel — keep the current name" onclick="saCatCancelEdit()">' + I_CROSS + '</button>' +
        '</div>';
      }

      return '<div class="cat-row' + (i === flashIdx ? ' flash' : '') + '" data-i="' + i + '"' +
          ' ondragstart="saCatDragStart(event,' + i + ')" ondragover="saCatDragOver(event,' + i + ')"' +
          ' ondragleave="saCatDragLeave(event)" ondrop="saCatDrop(event,' + i + ')" ondragend="saCatDragEnd(event)">' +
        '<button class="cat-grip" data-grip="' + i + '"' + (searching ? ' disabled' : '') +
          ' title="' + (searching ? 'Clear the search to reorder' : 'Drag to reorder — or press ↑ / ↓') + '"' +
          ' aria-label="Reorder ' + esc(name) + '"' +
          ' onmousedown="saCatGripDown(this)" onmouseup="saCatGripUp(this)"' +
          ' onkeydown="saCatGripKey(event,' + i + ')">' + I_GRIP + '</button>' +
        '<button class="cat-name" title="Click to rename" onclick="saCatEdit(' + i + ')">' + mark(name) + '</button>' +
        (name === cur ? '<span class="cat-use cat-on">On this product</span>' : '') +
        '<span class="cat-use' + (used ? '' : ' zero') + '" title="Products already in the catalogue with this category">' +
          used + ' product' + (used === 1 ? '' : 's') + '</span>' +
        '<button class="cat-ico" title="Rename category" onclick="saCatEdit(' + i + ')">' + I_PENCIL + '</button>' +
        '<button class="cat-ico cat-x" title="Remove category" onclick="saCatAskRemove(' + i + ')">' + I_BIN + '</button>' +
      '</div>';
    }).join('')
      : (searching
        ? '<div class="cat-empty">No categories match <b>' + esc(term.trim()) + '</b>.<br>' +
            '<button class="cat-btn-sm" style="margin-top:8px" onclick="saCatAddFromSearch()">Add “' + esc(term.trim()) + '” as a new category</button></div>'
        : '<div class="cat-empty">No categories yet — add the first one below.</div>');

    flashIdx = -1;

    var clr = document.getElementById('cat-search-clear');
    if (clr) clr.style.display = term ? 'flex' : 'none';

    var c = document.getElementById('cat-count');
    if (c) {
      c.textContent = searching
        ? rows.length + ' of ' + all.length + ' shown'
        : all.length + ' categor' + (all.length === 1 ? 'y' : 'ies');
    }

    if (editIdx >= 0) {
      var inp = document.getElementById('cat-edit-input');
      if (inp) { inp.focus(); inp.select(); }
    } else if (gripIdx >= 0) {
      /* keep the keyboard on the row that just moved */
      var g = host.querySelector('[data-grip="' + gripIdx + '"]');
      if (g) g.focus();
      gripIdx = -1;
    }
  }

  function dupe(name, skip) {
    var n = name.trim().toLowerCase();
    return cats().some(function (x, i) { return i !== skip && x.trim().toLowerCase() === n; });
  }

  /* ---- reorder ----------------------------------------------------------- */
  /* The row is only draggable while the grip is held, so the name button and the
     rename field keep their normal click/selection behaviour. */
  window.saCatGripDown = function (g) {
    if (g.disabled) return;
    var row = g.closest('.cat-row'); if (row) row.draggable = true;
  };
  window.saCatGripUp = function (g) {
    var row = g.closest('.cat-row'); if (row) row.draggable = false;
  };
  window.saCatGripKey = function (e, i) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (term.trim()) { toast('Clear the search to reorder'); return; }
    move(i, i + (e.key === 'ArrowUp' ? -1 : 1), true);
  };

  function clearDropMarks() {
    var host = document.getElementById('cat-list'); if (!host) return;
    host.querySelectorAll('.drop-before,.drop-after').forEach(function (el) {
      el.classList.remove('drop-before', 'drop-after');
    });
  }

  window.saCatDragStart = function (e, i) {
    dragIdx = i;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {}
    var row = e.currentTarget; setTimeout(function () { row.classList.add('dragging'); }, 0);
  };
  window.saCatDragOver = function (e, i) {
    if (dragIdx < 0 || i === dragIdx) return;
    e.preventDefault();                       /* required, or drop never fires */
    e.dataTransfer.dropEffect = 'move';
    var row = e.currentTarget, r = row.getBoundingClientRect();
    var after = (e.clientY - r.top) > r.height / 2;
    row.classList.toggle('drop-after', after);
    row.classList.toggle('drop-before', !after);
  };
  window.saCatDragLeave = function (e) {
    e.currentTarget.classList.remove('drop-before', 'drop-after');
  };
  window.saCatDrop = function (e, i) {
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
  window.saCatDragEnd = function (e) {
    dragIdx = -1;
    e.currentTarget.draggable = false;
    e.currentTarget.classList.remove('dragging');
    clearDropMarks();
  };

  function move(from, to, keepGrip) {
    var list = cats();
    if (to < 0 || to >= list.length || from === to) return;
    var moved = list.splice(from, 1)[0];
    list.splice(to, 0, moved);
    flashIdx = to;
    if (keepGrip) gripIdx = to;
    confirmIdx = -1; editIdx = -1;
    refreshPage(); renderList();
    toast('“' + moved + '” moved to position ' + (to + 1));
  }

  /* ---- rename ------------------------------------------------------------ */
  window.saCatEdit = function (i) { editIdx = i; confirmIdx = -1; renderList(); };
  window.saCatCancelEdit = function () { editIdx = -1; renderList(); };
  window.saCatEditKey = function (e, i) {
    if (e.key === 'Enter') { e.preventDefault(); window.saCatApply(i); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); window.saCatCancelEdit(); }
  };
  window.saCatApply = function (i) {
    var inp = document.getElementById('cat-edit-input'); if (!inp) return;
    var list = cats(), was = list[i], now = (inp.value || '').trim();
    if (now === was) { editIdx = -1; renderList(); return; }
    if (!now) { if (window.gsShake) window.gsShake(inp); inp.focus(); toast('A category needs a name'); return; }
    if (dupe(now, i)) { if (window.gsShake) window.gsShake(inp); inp.focus(); toast('“' + now + '” already exists'); return; }
    list[i] = now;
    /* re-label the catalogue products that carry it, and this product too */
    var n = 0;
    products().forEach(function (p) { if (p.cat === was) { p.cat = now; n++; } });
    if (window.sapSetCat && selectedCat() === was) window.sapSetCat(now);
    editIdx = -1; flashIdx = i;
    refreshPage(); renderList();
    toast('“' + was + '” renamed to “' + now + '”' + (n ? ' · ' + n + ' catalogue product' + (n === 1 ? '' : 's') + ' updated' : ''));
  };

  /* ---- remove ------------------------------------------------------------ */
  window.saCatAskRemove = function (i) { confirmIdx = i; editIdx = -1; renderList(); };
  window.saCatCancelRemove = function () { confirmIdx = -1; renderList(); };
  window.saCatRemove = function (i) {
    var list = cats(), name = list[i];
    if (name == null) return;
    list.splice(i, 1);
    var n = 0;
    products().forEach(function (p) { if (p.cat === name) { p.cat = ''; n++; } });
    var clearedHere = (selectedCat() === name);
    if (clearedHere && window.sapSetCat) window.sapSetCat('');
    confirmIdx = -1; editIdx = -1;
    refreshPage(); renderList();
    toast('“' + name + '” removed' + (clearedHere ? ' · this product has no category now' : '') +
      (n ? ' · ' + n + ' catalogue product' + (n === 1 ? '' : 's') + ' left without one' : ''));
  };

  /* ---- add --------------------------------------------------------------- */
  window.saCatAddKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); window.saCatAdd(); } };
  window.saCatAdd = function () {
    var inp = document.getElementById('cat-new'); if (!inp) return;
    var name = (inp.value || '').trim();
    if (!name) { if (window.gsShake) window.gsShake(inp); toast('Type a category name first'); return; }
    if (dupe(name, -1)) { if (window.gsShake) window.gsShake(inp); toast('“' + name + '” already exists'); return; }
    cats().push(name);
    inp.value = '';
    flashIdx = cats().length - 1;
    confirmIdx = -1; editIdx = -1;
    /* a stale search would hide the row that was just added */
    if (term.trim() && name.toLowerCase().indexOf(term.trim().toLowerCase()) < 0) {
      term = '';
      var s = document.getElementById('cat-search'); if (s) s.value = '';
    }
    refreshPage(); renderList();
    inp.focus();
    toast('“' + name + '” added');
    var host = document.getElementById('cat-list');
    if (host && host.lastElementChild) host.lastElementChild.scrollIntoView({ block: 'nearest' });
  };

})();

