/* ==========================================================================
   ra-add-product.js — Retailer Admin "New product" page (create manually).
   Renders into #ra-newprod-root.

   Deliberately mirrors the Product-Detail page (js/ra-product.js): the same
   top identity card, the same two component cards (orange "Expected" =
   suggestions for the supplier, green "Actual" = packaging the retailer
   populates itself), the same single-line component rows with image slot,
   inline-renameable name, level pill, qty stepper, note & remove controls,
   and the same library picker modal. The differences are only the ones a
   *new* product implies:
     • the product identity is editable (name first, SKU auto-generated),
       instead of a fixed SKU header;
     • "Actual" rows expand (chevron) so the retailer can type the material /
       weight / PCR themselves — on the detail page that data comes from the
       supplier, so those rows have no body;
     • no approve / reminder workflow — the finish paths are "Send to supplier
       to complete" and "Create product".
   Reuses window.PKG_LIBRARY + go() from retailer-admin.js.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ra-newprod-root')) return;

  var LEVELS = ['Primary', 'Secondary', 'Tertiary'];
  var MATERIALS = ['Recycled card', 'Corrugated card', 'FSC paper', 'Recycled plastic', 'LDPE plastic', 'PET plastic', 'Woven polyester', 'Wood', 'Glass', 'Aluminium', 'Other'];
  var RECYCLE = ['Widely recyclable', 'Check locally', 'Not currently recyclable'];
  var CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Homeware', 'Beauty', 'Electronics'];
  var SUPPLIERS = ['Indotex Manufacturing', 'Luntai Packaging Co.', 'EcoPack GmbH', 'Nordic Materials AB', 'Verdepak S.A.', 'Hangzhou TextilePack'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- the product being built ---- */
  var PROD = { name: '', sku: '', desc: '', cat: '', supplier: '', unitsPerCase: 24, casesPerPallet: 40, totalWeight: 350 };
  var EXPECTED = [];   /* what the retailer expects / suggests to the supplier */
  var ACTUAL = [];     /* packaging the retailer fills in itself */
  var openIdx = -1;    /* index of the expanded ACTUAL row (-1 = none) */
  var pendingHl = null;

  function list(key) { return key === 'expected' ? EXPECTED : ACTUAL; }

  /* ---- SKU generation ---------------------------------------------------- */
  function nextSeq() {
    try { if (window.PRODUCTS_RA && window.PRODUCTS_RA.length) return window.PRODUCTS_RA.length + 1; } catch (e) {}
    return 65;
  }
  var SEQ = nextSeq();

  /* SKU = PRK-<3-digit seq>-<3-letter code from the name> */
  function genSku(name) {
    var letters = (name || '').toUpperCase().replace(/[^A-Z]/g, '');
    var code = (letters.slice(0, 3) || 'NEW');
    while (code.length < 3) code += 'X';
    return 'PRK-' + String(SEQ).padStart(3, '0') + '-' + code;
  }

  /* ---- new-card attention flash (same as the detail page) ---------------- */
  function flushHighlight() {
    if (!pendingHl || !pendingHl.length) { pendingHl = null; return; }
    var ix = pendingHl; pendingHl = null;
    ix.forEach(function (ref, k) {
      setTimeout(function () {
        var card = document.querySelector('.rap-comp[data-key="' + ref.key + '"][data-i="' + ref.i + '"]');
        if (!card) return;
        card.classList.remove('rap-comp-new'); void card.offsetWidth;
        card.classList.add('rap-comp-new');
        setTimeout(function () { card.classList.remove('rap-comp-new'); }, 1900);
      }, k * 150);
    });
  }

  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  /* ==========================================================================
     CSS — the .rap-* look is deliberately identical to ra-product.js, plus the
     handful of new-product-only rules (.nap-*). Guarded so the two pages never
     inject twice if they are ever loaded together.
     ========================================================================== */
  function injectCss() {
    if (document.getElementById('ra-prod-css') || document.getElementById('ra-nap-css')) return;
    var st = document.createElement('style'); st.id = 'ra-nap-css';
    st.textContent =
      '#ra-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f2338;border:1px solid var(--gs);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:9999}' +
      '#ra-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.rap-banner{display:flex;gap:11px;align-items:flex-start;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--tw2);line-height:1.6}' +
      '.rap-banner svg{color:#5b9cf6;flex-shrink:0;margin-top:1px}' +
      '.rap-comp{border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:11px;margin-bottom:10px;overflow:visible;background:rgba(255,255,255,.02);transition:border-color .5s ease,box-shadow .5s ease;position:relative}' +
      '.rap-comp:hover{z-index:10}' +
      '.rap-comp-hdr{display:grid;grid-template-columns:minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(140px, 2.5fr) minmax(280px, 3.5fr);gap:10px;align-items:center;padding:10px 14px;transition:background .14s;border-radius:10px}' +
      '.rap-comp-hdr:hover{background:rgba(255,255,255,.03)}' +
      '.rap-comp-name{font-size:13px;font-weight:600;color:var(--tw);flex-shrink:0}' +
      '.rap-comp-name-edit{outline:none;border:1px solid transparent;border-radius:5px;padding:2px 6px;margin:-2px -4px;cursor:text;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .14s,border-color .14s}' +
      '.rap-comp-name-edit:hover{background:rgba(255,255,255,.05);border-color:var(--bw,rgba(255,255,255,.14))}' +
      '.rap-comp-name-edit:focus{background:rgba(255,255,255,.08);border-color:var(--gs);overflow:visible;text-overflow:clip;max-width:none}' +
      '.rap-comp-name-edit:empty:before{content:"Component name";color:var(--tw3)}' +
      /* persistent orange on components that still need a real name */
      '.rap-comp-name-edit.rap-name-need{color:#f5a623;border-color:rgba(245,166,35,.5);background:rgba(245,166,35,.08)}' +
      '.rap-comp-name-edit.rap-name-need:hover{border-color:rgba(245,166,35,.7);background:rgba(245,166,35,.13)}' +
      '.rap-comp-name-edit.rap-name-need:empty:before{color:#f5a623}' +
      '.rap-comp-new{border-color:#f5a623!important;box-shadow:0 0 0 1px #f5a623,0 0 20px rgba(245,166,35,.38);animation:rapPop .5s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes rapPop{0%{transform:scale(.96);opacity:.4}100%{transform:scale(1);opacity:1}}' +
      '.rap-comp-sum{font-size:11px;color:var(--tw3);flex:1;min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.rap-col{display:flex;align-items:center;gap:8px}' +
      '.rap-col-vert{display:flex;flex-direction:column;gap:3px}' +
      '.rap-hdr-btns{display:flex;align-items:center;gap:5px;flex-shrink:0;justify-content:flex-end;width:100%}' +
      '.rap-hdr-btns button{font-family:inherit;font-size:11px;font-weight:600;padding:4px 8px;border-radius:7px;cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--tw2);transition:background .12s,border-color .12s,color .12s;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}' +
      '.rap-hdr-btns button:hover{background:rgba(255,255,255,.12);color:#fff}' +
      '.rap-qty-btn{padding:3px 7px!important;font-size:13px!important;min-width:26px;justify-content:center}' +
      '.rap-qty-val{font-size:12px;font-weight:700;color:var(--tw);min-width:18px;text-align:center}' +
      '.rap-btn-remove{background:rgba(224,96,90,.08)!important;border-color:rgba(224,96,90,.25)!important;color:#e0605a!important}' +
      '.rap-btn-remove:hover{background:rgba(224,96,90,.2)!important;border-color:#e0605a!important;color:#fff!important}' +
      '.rap-btn-promote{background:rgba(78,187,129,.1)!important;border-color:rgba(78,187,129,.32)!important;color:#4ebb81!important}' +
      '.rap-btn-promote:hover{background:rgba(78,187,129,.22)!important;border-color:var(--gs)!important;color:#fff!important}' +
      '.rap-chev{transition:transform .2s;color:var(--tw3);flex-shrink:0}' +
      '.rap-comp.open .rap-chev{transform:rotate(180deg)}' +
      '.rap-comp-body{display:none;padding:4px 14px 16px;border-top:1px solid var(--bw,rgba(255,255,255,.08))}' +
      '.rap-comp.open .rap-comp-body{display:block}' +
      '.rap-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px;margin:12px 0}' +
      '@media(max-width:720px){.rap-grid{grid-template-columns:1fr}}' +
      '.rap-f{display:flex;flex-direction:column;gap:5px;min-width:0}' +
      '.rap-f label{font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;color:var(--tw3);display:flex;align-items:center;gap:6px}' +
      '.rap-f label .req{color:#f5a623}' +
      '.rap-f .fi{padding:7px 10px;font-size:12.5px}' +
      '.rap-comp-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--bw,rgba(255,255,255,.08))}' +
      '.rap-modal-ov{position:fixed;inset:0;background:rgba(4,10,20,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:9998;padding:20px}' +
      '.rap-modal{width:100%;max-width:480px;max-height:80vh;display:flex;flex-direction:column;background:#0e2036;border:1px solid var(--line-2,rgba(148,180,230,.26));border-radius:14px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(0,0,0,.7)}' +
      '.rap-modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--bw,rgba(255,255,255,.09));font-size:13px;font-weight:650;color:#fff}' +
      '.rap-modal-x{background:none;border:none;color:var(--tw3);cursor:pointer;padding:4px;border-radius:6px}' +
      '.rap-modal-x:hover{background:rgba(255,255,255,.08);color:#fff}' +
      '.rap-modal-body{padding:16px;overflow-y:auto}' +
      '.rap-pick-list{display:flex;flex-direction:column;gap:6px;max-height:46vh;overflow-y:auto}' +
      '.rap-pick-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:9px;cursor:pointer;transition:background .14s,border-color .14s}' +
      '.rap-pick-item:hover{background:rgba(78,187,129,.08);border-color:var(--gs)}' +
      '.rap-pick-name{font-size:12.5px;font-weight:600;color:var(--tw)}' +
      '.rap-pick-meta{font-size:10.5px;color:var(--tw3);margin-top:2px}' +
      '.rap-modal-foot{padding:12px 16px;border-top:1px solid var(--bw,rgba(255,255,255,.09));display:flex;align-items:center}' +
      /* orange = expected / suggested · green = actual, populated here */
      '.rap-comp-expected{border-color:rgba(245,166,35,.55)!important;background:rgba(245,166,35,.045)!important}' +
      '.rap-comp-expected:hover{border-color:rgba(245,166,35,.8)!important}' +
      '.rap-comp-actual{border-color:rgba(78,187,129,.5)!important;background:rgba(78,187,129,.035)!important}' +
      '.rap-comp-actual:hover{border-color:rgba(78,187,129,.8)!important}' +
      '.rap-img-slot{width:40px;height:40px;flex-shrink:0;border-radius:9px;padding:0;cursor:pointer;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);transition:border-color .14s,transform .14s,box-shadow .14s}' +
      '.rap-img-empty{border:1.5px dashed var(--bw,rgba(255,255,255,.22));color:var(--tw3)}' +
      '.rap-img-empty:hover{border-color:var(--gs);color:var(--gs);background:rgba(78,187,129,.08)}' +
      '.rap-img-has{border:1px solid rgba(255,255,255,.14)}' +
      '.rap-img-has:hover{transform:scale(1.06);box-shadow:0 6px 18px rgba(0,0,0,.4);border-color:var(--gs)}' +
      '.rap-img-has img{width:100%;height:100%;object-fit:cover;display:block}' +
      '.rap-add-single{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;margin-top:4px;padding:11px 14px;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:650;cursor:pointer;box-sizing:border-box;transition:filter .14s,background .14s}' +
      '.rap-add-expected{background:rgba(245,166,35,.12);border:1px dashed rgba(245,166,35,.55);color:#f5a623}' +
      '.rap-add-expected:hover{background:rgba(245,166,35,.22);color:#fff}' +
      '.rap-add-actual{background:rgba(78,187,129,.1);border:1px dashed rgba(78,187,129,.5);color:#4ebb81}' +
      '.rap-add-actual:hover{background:rgba(78,187,129,.2);color:#fff}' +
      '.rap-btn-note-on{background:rgba(245,166,35,.14)!important;border-color:rgba(245,166,35,.4)!important;color:#f5a623!important}' +
      '.rap-btn-note-on:hover{background:rgba(245,166,35,.26)!important;border-color:#f5a623!important;color:#fff!important}' +
      '.rap-note-txt{display:inline-block;margin-top:3px;color:#f5a623;font-weight:600;font-size:11px;line-height:1.45}' +
      '.rap-lb-ov{position:fixed;inset:0;background:rgba(4,10,20,.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:32px;cursor:zoom-out;animation:rapLbIn .18s ease}' +
      '@keyframes rapLbIn{from{opacity:0}to{opacity:1}}' +
      '.rap-lb-fig{max-width:90vw;max-height:90vh;display:flex;flex-direction:column;gap:10px;align-items:center}' +
      '.rap-lb-fig img{max-width:90vw;max-height:80vh;border-radius:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.8);border:1px solid rgba(255,255,255,.12)}' +
      '.rap-lb-cap{font-size:13px;font-weight:600;color:#fff;text-align:center}' +
      '.rap-lb-x{position:fixed;top:20px;right:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
      '.rap-lb-x:hover{background:rgba(255,255,255,.2)}' +
      /* new-product-only bits */
      '.nap-sku{font-family:"SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.02em;color:var(--gs-l);font-weight:700;background:rgba(78,187,129,.06)}' +
      '.nap-sku-hint{font-size:10px;color:var(--tw3);font-weight:400;text-transform:none;letter-spacing:0}' +
      '.nap-id-sku{font-size:15px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em;color:#fff}' +
      '.nap-id-sku.nap-id-empty{color:var(--tw3);font-weight:400}';
    document.head.appendChild(st);
  }

  /* ---- image slot (upload when empty, view-large when set) ---------------- */
  function imgSlot(c, key, i) {
    if (c.img) {
      return '<button type="button" class="rap-img-slot rap-img-has" title="Click to view image" ' +
        'onclick="event.stopPropagation();napLightbox(\'' + key + '\',' + i + ')"><img src="' + c.img + '" alt="' + esc(c.name) + '"></button>';
    }
    return '<button type="button" class="rap-img-slot rap-img-empty" title="Upload an image" ' +
      'onclick="event.stopPropagation();napUploadImg(\'' + key + '\',' + i + ')">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></button>';
  }

  /* A component "needs a name" while it's still the blank row that was just added. */
  function needsName(c) { return !c || !(c.name || '').trim(); }

  /* keep the name field's orange "needs a name" styling in sync as the retailer
     types (called live, so no re-render is needed and the caret stays put) */
  function syncNameAttn(key, i) {
    var card = document.querySelector('.rap-comp[data-key="' + key + '"][data-i="' + i + '"]');
    if (!card) return;
    var el = card.querySelector('.rap-comp-name-edit');
    if (el) el.classList.toggle('rap-name-need', needsName(list(key)[i]));
  }

  /* ---- component card ---------------------------------------------------- */
  function compCard(c, i, key) {
    var isExpected = key === 'expected';
    var filled = (c.material || c.weight || c.pcr);
    var sum = isExpected
      ? 'Suggested component — the supplier fills in the packaging data'
      : (filled
          ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR')
          : 'No details yet — expand to enter them, or leave them for the supplier');

    var qty = c.qty || 1;
    var qtyHtml = '<div style="display:flex;align-items:center;background:rgba(255,255,255,.04);border-radius:6px;margin-right:6px"><button type="button" class="rap-qty-btn" title="Decrease quantity" onclick="napQtyStep(\'' + key + '\',' + i + ',-1)" style="border:none;background:transparent">−</button>' +
      '<span class="rap-qty-val">' + qty + '</span>' +
      '<button type="button" class="rap-qty-btn" title="Increase quantity" onclick="napQtyStep(\'' + key + '\',' + i + ',1)" style="border:none;background:transparent">+</button></div>';

    var removeBtn = '<button type="button" class="rap-btn-remove" title="Remove this component" onclick="napRemove(\'' + key + '\',' + i + ')">🗑</button>';

    var midCol, actionBtns, body = '';
    if (isExpected) {
      /* Expected / suggested: orange. No detail fields — the supplier provides them. */
      midCol = '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
        '<span class="pill" style="font-size:9px;background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Suggested</span>';
      var noteBtn = '<button type="button" class="rap-btn-note' + (c.notes ? ' rap-btn-note-on' : '') + '" title="' + (c.notes ? 'Edit note' : 'Add a note for the supplier') + '" onclick="napNote(\'' + key + '\',' + i + ')">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + (c.notes ? 'Edit note' : 'Note') + '</button>';
      var fillBtn = '<button type="button" class="rap-btn-promote" title="Move this to the components you fill in yourself" onclick="napPromote(' + i + ')">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>I\'ll fill it in</button>';
      actionBtns = qtyHtml + noteBtn + fillBtn + removeBtn;
    } else {
      /* Actual: green stroke, expandable so the retailer can type the data. */
      midCol = '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
        '<span class="pill" style="font-size:9px;' + (filled
          ? 'background:rgba(78,187,129,.14);color:#4ebb81;border:1px solid rgba(78,187,129,.34)">Entered'
          : 'background:rgba(255,255,255,.06);color:var(--tw3);border:1px solid rgba(255,255,255,.14)">Empty') + '</span>';
      var editBtn = '<button type="button" title="' + (i === openIdx ? 'Hide details' : 'Enter the packaging details') + '" onclick="napToggle(' + i + ')">' +
        (i === openIdx ? 'Close' : 'Edit details') +
        '<svg class="rap-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>';
      actionBtns = qtyHtml + editBtn + removeBtn;

      function f(label, k, kind, opts) {
        var v = c[k] || '';
        var ctrl;
        if (kind === 'select') {
          var o = '<option value="">—</option>' + opts.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
          ctrl = '<select class="fi" onchange="napEdit(\'' + key + '\',' + i + ',\'' + k + '\',this.value)">' + o + '</select>';
        } else if (kind === 'num') {
          ctrl = '<input class="fi" type="number" value="' + esc(v) + '" placeholder="—" oninput="napEdit(\'' + key + '\',' + i + ',\'' + k + '\',this.value)">';
        } else {
          ctrl = '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="napEdit(\'' + key + '\',' + i + ',\'' + k + '\',this.value)">';
        }
        return '<div class="rap-f"><label>' + esc(label) + '</label>' + ctrl + '</div>';
      }
      body =
        '<div class="rap-comp-body">' +
          '<div class="rap-grid">' +
            f('Component name', 'name', 'text') +
            f('Level', 'level', 'select', LEVELS) +
            f('Material', 'material', 'select', MATERIALS) +
            f('Weight (g)', 'weight', 'num') +
            f('PCR %', 'pcr', 'num') +
            f('Recyclability', 'recycle', 'select', RECYCLE) +
          '</div>' +
          '<div class="rap-comp-actions">' +
            '<button class="btn-g-sm" onclick="napDemote(' + i + ')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Let the supplier fill this in</button>' +
          '</div>' +
        '</div>';
    }

    var cardClass = 'rap-comp ' + (isExpected ? 'rap-comp-expected' : 'rap-comp-actual') + (!isExpected && i === openIdx ? ' open' : '');

    return '<div class="' + cardClass + '" data-i="' + i + '" data-key="' + key + '">' +
      '<div class="rap-comp-hdr">' +
        '<div class="rap-col">' +
          imgSlot(c, key, i) +
          '<span class="rap-comp-name rap-comp-name-edit' + (needsName(c) ? ' rap-name-need' : '') + '" contenteditable="true" spellcheck="false" title="Click to rename" ' +
            'onkeydown="napTitleKey(event)" oninput="napEditName(\'' + key + '\',' + i + ',this.textContent)">' + esc(c.name) + '</span>' +
        '</div>' +
        '<div class="rap-col-vert" style="align-items:flex-start">' + midCol + '</div>' +
        '<div class="rap-col">' +
          '<span class="rap-comp-sum" style="white-space:normal;line-height:1.4">' + sum +
            (isExpected && c.notes ? '<br><span class="rap-note-txt"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + esc(c.notes) + '</span>' : '') +
            (!isExpected && filled && c.recycle ? '<br><span style="color:var(--tw2);font-weight:600">' + esc(c.recycle) + '</span>' : '') +
          '</span>' +
        '</div>' +
        '<div class="rap-hdr-btns">' + actionBtns + '</div>' +
      '</div>' + body +
    '</div>';
  }

  /* ---- render ------------------------------------------------------------ */
  function render() {
    injectCss();
    var root = document.getElementById('ra-newprod-root');

    var idIcon = (PROD.sku && typeof window.gsIdenticon === 'function')
      ? '<span class="gs-id-ic" style="width:32px;height:32px;border-radius:8px">' + window.gsIdenticon(PROD.sku, 32) + '</span>'
      : '';

    var actions =
      '<button class="btn-g" onclick="go(\'ra6\')">Cancel</button>' +
      '<button class="btn-g" onclick="napSendToSupplier()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send to supplier</button>' +
      '<button class="btn-p" onclick="napSaveSelf()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:-2px;margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Create product</span></button>';

    var totalComps = EXPECTED.length + ACTUAL.length;
    var progHtml = '<div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--tw2)"><div style="width:80px;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden"><div style="height:100%;background:var(--gs);width:' + (totalComps ? (ACTUAL.length / totalComps) * 100 : 0) + '%"></div></div>' + ACTUAL.length + ' / ' + totalComps + ' entered</div>';

    var draftPill = '<span class="pill" style="font-size:11px;background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Draft</span>';

    var catOpts = '<option value="">Select a category…</option>' + CATEGORIES.map(function (x) { return '<option' + (x === PROD.cat ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    var supOpts = '<option value="">Unassigned</option>' + SUPPLIERS.map(function (x) { return '<option' + (x === PROD.supplier ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');

    var topCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr" style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.05)">' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            idIcon +
            '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<span class="nap-id-sku' + (PROD.sku ? '' : ' nap-id-empty') + '" id="nap-id-sku">' + esc(PROD.sku || 'New product') + '</span>' +
              '<span style="font-size:12px;color:var(--tw2)" id="nap-id-name">' + esc(PROD.name || 'Name it below — the SKU is generated for you') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            progHtml +
            draftPill +
            '<div style="width:1px;height:24px;background:rgba(255,255,255,.1);margin:0 4px"></div>' +
            actions +
          '</div>' +
        '</div>' +
        '<div class="grp-body" style="padding:20px 18px">' +
          '<div class="rap-banner" style="margin-bottom:20px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
          '<div>Give the product a <b style="color:var(--tw)">name</b> — its SKU is generated for you. Then list its packaging: put anything you want the supplier to complete under <b style="color:#f5a623">Suggested</b>, and anything you already know under <b style="color:#4ebb81">Entered by you</b>. Finish with <b style="color:var(--tw)">Send to supplier</b> or <b style="color:var(--tw)">Create product</b>.</div></div>' +
          '<div class="rap-grid" style="margin:0;grid-template-columns:1fr 1fr 1fr;gap:20px">' +
            '<div class="rap-f"><label>Product name <span class="req">*</span></label><input class="fi" id="nap-name" value="' + esc(PROD.name) + '" placeholder="e.g. Black Crew Neck Sweatshirt" oninput="napName(this.value)"></div>' +
            '<div class="rap-f"><label>SKU <span class="nap-sku-hint">· auto-generated</span></label><input class="fi nap-sku" id="nap-sku" value="' + esc(PROD.sku) + '" readonly title="Generated automatically from the product name"></div>' +
            '<div class="rap-f"><label>Description</label><input class="fi" value="' + esc(PROD.desc) + '" placeholder="Short description" oninput="napEditProd(\'desc\',this.value)"></div>' +
            '<div class="rap-f"><label>Category</label><select class="fi" onchange="napEditProd(\'cat\',this.value)">' + catOpts + '</select></div>' +
            '<div class="rap-f"><label>Assigned supplier</label><select class="fi" onchange="napEditProd(\'supplier\',this.value)">' + supOpts + '</select></div>' +
            '<div class="rap-f"><label>Units per Case</label><div><input class="fi" type="number" value="' + esc(PROD.unitsPerCase) + '" onchange="napEditProd(\'unitsPerCase\',this.value)"></div></div>' +
            '<div class="rap-f"><label>Cases per Pallet</label><div><input class="fi" type="number" value="' + esc(PROD.casesPerPallet) + '" onchange="napEditProd(\'casesPerPallet\',this.value)"></div></div>' +
            '<div class="rap-f"><label>Total Product Weight (g)</label><div><input class="fi" type="number" value="' + esc(PROD.totalWeight) + '" onchange="napEditProd(\'totalWeight\',this.value)"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function qtySum(arr) { var t = 0; arr.forEach(function (c) { t += (c.qty || 1); }); return t; }

    /* ── Card 1: SUGGESTED components (orange) — sent to the supplier ── */
    var expCards = EXPECTED.map(function (c, i) { return compCard(c, i, 'expected'); }).join('') ||
      '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">Nothing suggested yet — use <b style="color:#f5a623">Add suggested component</b> below to tell the supplier what packaging you expect.</div>';
    var expCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr">Suggested for the supplier' +
          '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + EXPECTED.length + ' suggested (' + qtySum(EXPECTED) + ' item' + (qtySum(EXPECTED) === 1 ? '' : 's') + ')</span>' +
          '<span style="margin-left:auto;font-size:10px;color:#f5a623">The supplier completes these</span>' +
        '</div>' +
        '<div class="grp-body">' +
          expCards +
          '<button type="button" class="rap-add-single rap-add-expected" onclick="napAddExpected()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Add suggested component</button>' +
        '</div>' +
      '</div>';

    /* ── Card 2: components the retailer populates itself (green) ── */
    var actCards = ACTUAL.map(function (c, i) { return compCard(c, i, 'actual'); }).join('') ||
      '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">Nothing entered yet — use <b style="color:#4ebb81">Add component from list</b> below to add packaging you already have the details for.</div>';
    var enteredCount = ACTUAL.filter(function (c) { return c.material || c.weight || c.pcr; }).length;
    var actCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr">Entered by you' +
          '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + ACTUAL.length + ' component type' + (ACTUAL.length === 1 ? '' : 's') + ' (' + qtySum(ACTUAL) + ' item' + (qtySum(ACTUAL) === 1 ? '' : 's') + ' total)</span>' +
          '<span style="margin-left:auto;font-size:10px;color:var(--tw3)">' +
            (ACTUAL.length === 0 ? '' : (enteredCount < ACTUAL.length
              ? '<span style="color:#f5a623">' + (ACTUAL.length - enteredCount) + ' still empty</span>'
              : '<span style="color:#4ebb81">all details entered</span>')) +
          '</span>' +
        '</div>' +
        '<div class="grp-body">' +
          actCards +
          '<button type="button" class="rap-add-single rap-add-actual" onclick="napAdd()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4"/></svg>Add component from list</button>' +
        '</div>' +
      '</div>';

    root.innerHTML = topCard + expCard + actCard;

    flushHighlight();
  }

  /* ---- product fields ---------------------------------------------------- */
  window.napName = function (v) {
    PROD.name = v;
    PROD.sku = v.trim() ? genSku(v) : '';
    var skuEl = document.getElementById('nap-sku'); if (skuEl) skuEl.value = PROD.sku;
    /* keep the identity header in sync without a re-render (the caret stays in the field) */
    var idSku = document.getElementById('nap-id-sku');
    if (idSku) { idSku.textContent = PROD.sku || 'New product'; idSku.classList.toggle('nap-id-empty', !PROD.sku); }
    var idName = document.getElementById('nap-id-name');
    if (idName) idName.textContent = PROD.name || 'Name it below — the SKU is generated for you';
  };
  window.napEditProd = function (key, v) { PROD[key] = v; };

  /* ---- component edits ---------------------------------------------------- */
  window.napToggle = function (i) { openIdx = (openIdx === i ? -1 : i); render(); };
  window.napEdit = function (key, i, field, val) {
    var L = list(key); if (!L[i]) return;
    L[i][field] = val;
    if (field === 'name') syncNameAttn(key, i);
    /* the row summary + status pill reflect the details — refresh the header only */
    if (field !== 'name') refreshRowSummary(key, i);
  };
  /* inline title edit — no re-render (keeps the contenteditable focus/caret) */
  window.napEditName = function (key, i, val) {
    var L = list(key); if (!L[i]) return;
    L[i].name = (val || '').replace(/\n/g, ' ');
    syncNameAttn(key, i);
  };
  window.napTitleKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };

  /* update a row's summary line + status pill in place (no full re-render, so a
     field the retailer is typing in keeps its focus) */
  function refreshRowSummary(key, i) {
    var c = list(key)[i]; if (!c) return;
    var card = document.querySelector('.rap-comp[data-key="' + key + '"][data-i="' + i + '"]');
    if (!card) return;
    var filled = (c.material || c.weight || c.pcr);
    var sumEl = card.querySelector('.rap-comp-sum');
    if (sumEl && key === 'actual') {
      sumEl.innerHTML = (filled
        ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR')
        : 'No details yet — expand to enter them, or leave them for the supplier') +
        (filled && c.recycle ? '<br><span style="color:var(--tw2);font-weight:600">' + esc(c.recycle) + '</span>' : '');
    }
    var pills = card.querySelectorAll('.rap-col-vert .pill');
    if (pills.length) {
      pills[0].className = 'pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey');
      pills[0].style.fontSize = '9px';
      pills[0].textContent = c.level || '';
    }
    if (pills.length > 1 && key === 'actual') {
      pills[1].textContent = filled ? 'Entered' : 'Empty';
      pills[1].style.cssText = 'font-size:9px;' + (filled
        ? 'background:rgba(78,187,129,.14);color:#4ebb81;border:1px solid rgba(78,187,129,.34)'
        : 'background:rgba(255,255,255,.06);color:var(--tw3);border:1px solid rgba(255,255,255,.14)');
    }
  }

  window.napQtyStep = function (key, i, d) {
    var L = list(key); var c = L[i]; if (!c) return;
    c.qty = Math.max(1, (c.qty || 1) + d);
    render();
  };
  window.napRemove = function (key, i) {
    var L = list(key); var name = L[i] ? L[i].name : '';
    L.splice(i, 1);
    if (key === 'actual') { if (openIdx === i) openIdx = -1; else if (i < openIdx) openIdx--; }
    render(); toast('“' + (name || 'Component') + '” removed');
  };

  /* move a suggested component into the list the retailer fills in itself, and back */
  window.napPromote = function (i) {
    var c = EXPECTED[i]; if (!c) return;
    EXPECTED.splice(i, 1);
    ACTUAL.push(c); openIdx = ACTUAL.length - 1;
    pendingHl = [{ key: 'actual', i: ACTUAL.length - 1 }];
    render(); toast('“' + (c.name || 'Component') + '” moved — enter its details here');
  };
  window.napDemote = function (i) {
    var c = ACTUAL[i]; if (!c) return;
    ACTUAL.splice(i, 1);
    if (openIdx === i) openIdx = -1; else if (i < openIdx) openIdx--;
    EXPECTED.push(c);
    pendingHl = [{ key: 'expected', i: EXPECTED.length - 1 }];
    render(); toast('“' + (c.name || 'Component') + '” moved — the supplier will complete it');
  };

  /* ---- component image --------------------------------------------------- */
  window.napUploadImg = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.style.display = 'none'; document.body.appendChild(inp);
    inp.onchange = function () {
      var file = inp.files && inp.files[0]; if (!file) { inp.remove(); return; }
      var rd = new FileReader();
      rd.onload = function () { c.img = rd.result; render(); toast('Image added to “' + (c.name || 'component') + '”'); inp.remove(); };
      rd.readAsDataURL(file);
    };
    inp.click();
  };
  window.napLightbox = function (key, i) {
    var c = list(key)[i]; if (!c || !c.img) return;
    var ov = document.getElementById('nap-lightbox'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'nap-lightbox'; ov.className = 'rap-lb-ov';
    ov.onclick = function () { napCloseLightbox(); };
    ov.innerHTML = '<button class="rap-lb-x" title="Close" onclick="napCloseLightbox()">×</button>' +
      '<figure class="rap-lb-fig"><img src="' + c.img + '" alt="' + esc(c.name) + '"><figcaption class="rap-lb-cap">' + esc(c.name) + '</figcaption></figure>';
    document.body.appendChild(ov);
  };
  window.napCloseLightbox = function () { var ov = document.getElementById('nap-lightbox'); if (ov) ov.remove(); };

  /* ---- note on a suggested component ------------------------------------- */
  window.napNote = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var ov = document.getElementById('nap-note'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'nap-note'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) napCloseNote(); };
    ov.innerHTML =
      '<div class="rap-modal" style="max-width:440px">' +
        '<div class="rap-modal-hdr"><span>Note · ' + esc(c.name || 'component') + '</span>' +
          '<button class="rap-modal-x" onclick="napCloseNote()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
        '<div class="rap-modal-body"><div class="rap-f"><label>Note for the supplier</label>' +
          '<textarea class="fi" id="nap-note-ta" rows="4" placeholder="e.g. Must be FSC-certified card, min 30% PCR content…" style="resize:vertical;min-height:92px;line-height:1.5">' + esc(c.notes || '') + '</textarea></div></div>' +
        '<div class="rap-modal-foot" style="justify-content:flex-end;gap:8px">' +
          '<button class="btn-g-sm" onclick="napClearNote(\'' + key + '\',' + i + ')">Clear</button>' +
          '<button class="btn-p" onclick="napSaveNote(\'' + key + '\',' + i + ')"><span class="btn-c">Save note</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    var ta = document.getElementById('nap-note-ta'); if (ta) ta.focus();
  };
  window.napSaveNote = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var ta = document.getElementById('nap-note-ta');
    c.notes = ta ? ta.value.trim() : '';
    napCloseNote(); render(); toast(c.notes ? 'Note saved' : 'Note cleared');
  };
  window.napClearNote = function (key, i) {
    var c = list(key)[i]; if (c) c.notes = '';
    napCloseNote(); render(); toast('Note cleared');
  };
  window.napCloseNote = function () { var ov = document.getElementById('nap-note'); if (ov) ov.remove(); };

  /* ---- adding components -------------------------------------------------- */
  function blankComp(name, level, material) {
    return { name: name || '', level: level || 'Primary', material: material || '', weight: '', pcr: '', recycle: '', notes: '', qty: 1 };
  }
  function addComp(key, c) {
    var L = list(key);
    L.push(c);
    if (key === 'actual') openIdx = L.length - 1;
    pendingHl = [{ key: key, i: L.length - 1 }];
    render();
    var last = document.querySelector('.rap-comp[data-key="' + key + '"][data-i="' + (L.length - 1) + '"]');
    if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!c.name) focusCompName(key, L.length - 1);
  }
  function focusCompName(key, i) {
    setTimeout(function () {
      var card = document.querySelector('.rap-comp[data-key="' + key + '"][data-i="' + i + '"]');
      var name = card && card.querySelector('.rap-comp-name-edit');
      if (!name) return;
      name.focus();
      try { var r = document.createRange(); r.selectNodeContents(name); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) {}
    }, 60);
  }

  /* Add a SUGGESTED component directly (blank row) */
  window.napAddExpected = function () {
    addComp('expected', blankComp('', 'Primary', ''));
    toast('Suggested component added — name what you expect the supplier to provide');
  };

  /* Add a component the retailer fills in → picker (library or create new) */
  window.napAdd = function () { openPicker(); };

  function openPicker() {
    var ov = document.getElementById('nap-picker'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'nap-picker'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) closePicker(); };
    ov.innerHTML =
      '<div class="rap-modal">' +
        '<div class="rap-modal-hdr"><span>Add component from list</span>' +
          '<button class="rap-modal-x" onclick="napClosePicker()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
        '<div class="rap-modal-body">' +
          '<div id="nap-pick-list-wrap">' +
            '<input class="fi" id="nap-pick-search" placeholder="Search the packaging library…" oninput="napPickSearch(this.value)" style="margin-bottom:10px">' +
            '<div class="rap-pick-list" id="nap-pick-list"></div>' +
          '</div>' +
          '<div id="nap-pick-create" style="display:none">' +
            '<div class="rap-f" style="margin-bottom:10px"><label>Component name</label><input class="fi" id="nap-new-name" placeholder="e.g. Corrugated Insert"></div>' +
            '<div class="rap-f" style="margin-bottom:4px"><label>Level</label><select class="fi" id="nap-new-level"><option>Primary</option><option>Secondary</option><option>Tertiary</option></select></div>' +
            '<a class="bc-link" style="font-size:11px;cursor:pointer;display:inline-block;margin-top:8px" onclick="napPickBack()">‹ Back to library</a>' +
          '</div>' +
        '</div>' +
        '<div class="rap-modal-foot" id="nap-pick-foot">' +
          '<button class="btn-g-sm" onclick="napPickShowCreate()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Create a new component</button>' +
        '</div>' +
        '<div class="rap-modal-foot" id="nap-create-foot" style="display:none;justify-content:flex-end">' +
          '<button class="btn-p" onclick="napCreate()"><span class="btn-c">Add component</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    renderPickList('');
    var s = document.getElementById('nap-pick-search'); if (s) s.focus();
  }
  function renderPickList(term) {
    var host = document.getElementById('nap-pick-list'); if (!host) return;
    var lib = window.PKG_LIBRARY || [];
    term = (term || '').toLowerCase();
    var rows = lib.filter(function (x) { return !term || (x.name + ' ' + x.material + ' ' + x.level).toLowerCase().indexOf(term) >= 0; });
    host.innerHTML = rows.length ? rows.map(function (x) {
      var idx = lib.indexOf(x);
      return '<div class="rap-pick-item" onclick="napPickLib(' + idx + ')">' +
        '<div><div class="rap-pick-name">' + esc(x.name) + '</div><div class="rap-pick-meta">' + esc(x.material) + ' · ' + esc(x.recyclability || '') + '</div></div>' +
        '<span class="pill ' + (x.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(x.level) + '</span>' +
        '</div>';
    }).join('') : '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No matches — create a new component below.</div>';
  }
  window.napPickSearch = function (v) { renderPickList(v); };
  window.napPickLib = function (i) {
    var x = (window.PKG_LIBRARY || [])[i]; if (!x) return;
    closePicker();
    var c = blankComp(x.name, x.level, x.material);
    if (x.recyclability && RECYCLE.indexOf(x.recyclability) >= 0) c.recycle = x.recyclability;
    addComp('actual', c);
    toast('“' + x.name + '” added — fill in its details');
  };
  window.napPickShowCreate = function () {
    document.getElementById('nap-pick-list-wrap').style.display = 'none';
    document.getElementById('nap-pick-create').style.display = 'block';
    document.getElementById('nap-pick-foot').style.display = 'none';
    document.getElementById('nap-create-foot').style.display = 'flex';
    var n = document.getElementById('nap-new-name'); if (n) n.focus();
  };
  window.napPickBack = function () {
    document.getElementById('nap-pick-list-wrap').style.display = 'block';
    document.getElementById('nap-pick-create').style.display = 'none';
    document.getElementById('nap-pick-foot').style.display = 'flex';
    document.getElementById('nap-create-foot').style.display = 'none';
  };
  window.napCreate = function () {
    var name = (document.getElementById('nap-new-name') || {}).value || '';
    var level = (document.getElementById('nap-new-level') || {}).value || 'Primary';
    if (!name.trim()) { toast('Enter a component name'); return; }
    closePicker(); addComp('actual', blankComp(name.trim(), level, ''));
    toast('“' + name.trim() + '” created — fill in its details');
  };
  function closePicker() { var ov = document.getElementById('nap-picker'); if (ov) ov.remove(); }
  window.napClosePicker = closePicker;

  /* ---- finish paths ------------------------------------------------------- */
  function requireName() {
    if (PROD.name.trim()) return true;
    toast('Enter a product name first');
    var n = document.getElementById('nap-name');
    if (n) { if (window.gsShake) window.gsShake(n); else n.focus(); }
    return false;
  }
  window.napSendToSupplier = function () {
    if (!requireName()) return;
    var who = PROD.supplier || 'the supplier';
    var n = EXPECTED.length;
    try { sessionStorage.setItem('ra_flash', JSON.stringify({ sku: PROD.sku, name: PROD.name.trim(), sent: true })); } catch (e) {}
    toast('“' + PROD.name.trim() + '” created — sent to ' + who + (n ? ' · ' + n + ' component' + (n === 1 ? '' : 's') + ' to complete' : ' for review'));
    setTimeout(function () { go('ra6'); }, 700);
  };
  window.napSaveSelf = function () {
    if (!requireName()) return;
    try { sessionStorage.setItem('ra_flash', JSON.stringify({ sku: PROD.sku, name: PROD.name.trim(), sent: false })); } catch (e) {}
    toast('“' + PROD.name.trim() + '” saved to your catalogue');
    setTimeout(function () { go('ra6'); }, 700);
  };

  render();
})();
