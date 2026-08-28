/* ==========================================================================
   ra-product.js — Retailer Admin product detail (data-driven).
   Renders into #ra-prod-root. Shows the selected product, its packaging
   components (editable inline), lets the retailer add components from the
   library, and drives the review workflow: approve the product or send it
   back to the supplier as incomplete.
   Depends on window.PRODUCTS_RA + go() from retailer-admin.js.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ra-prod-root')) return;

  var LEVELS = ['Primary', 'Secondary', 'Tertiary'];
  var MATERIALS = ['Recycled card', 'Corrugated card', 'FSC paper', 'Recycled plastic', 'LDPE plastic', 'PET plastic', 'Woven polyester', 'Wood', 'Glass', 'Aluminium', 'Other'];
  var RECYCLE = ['Widely recyclable', 'Check locally', 'Not currently recyclable'];
  var COMP_POOL = ['Swing Tag', 'Box / Carton', 'Hanger', 'Poly Bag', 'Tissue Paper', 'Header Card', 'Shipping Carton', 'Pallet Wrap', 'Care Label'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* pick the product */
  function findProduct() {
    var list = window.PRODUCTS_RA || [];
    var sku = null;
    try { sku = sessionStorage.getItem('ra_pi'); } catch (e) {}
    var p = null;
    if (sku) p = list.filter(function (x) { return x.sku === sku; })[0];
    p = p || list[0] || { sku: 'PRK-000', desc: 'Product', cat: '—', supplier: '—', pkg: 'Not started', status: 'Pending' };

    /* Seed missing palletization and mock tags */
    p.unitsPerCase = p.unitsPerCase || 24;
    p.casesPerPallet = p.casesPerPallet || 40;
    p.totalWeight = p.totalWeight || 350;
    p.deadline = p.deadline || 'Due in 14 days';

    return p;
  }

  /* synthesise the component list from the product's coverage text */
  function buildComponents(p) {
    var total = 2, done = 0;
    var m = /(\d+)\s+of\s+(\d+)/.exec(p.pkg || '');
    if (m) { done = +m[1]; total = +m[2]; }
    else if (/(\d+)\s+components/.test(p.pkg || '')) { total = +RegExp.$1; done = total; }
    else if (/not started/i.test(p.pkg || '')) { total = 3; done = 0; }
    if (p.status === 'Complete') done = total;
    var comps = [];
    for (var i = 0; i < total; i++) {
      var provided = i < done;
      var rems = [];
      if (!provided) {
        rems.push({ type: 'Automated', date: 'Oct 1, 10:00 AM' });
        if (i % 2 === 0) rems.push({ type: 'Manual', date: 'Oct 5, 14:30 PM' });
      }
      comps.push({
        name: COMP_POOL[i % COMP_POOL.length],
        level: LEVELS[i % 3],
        material: provided ? MATERIALS[i % MATERIALS.length] : '',
        weight: provided ? String((2 + i * 7)) : '',
        pcr: provided ? String(50 + (i * 7) % 45) : '',
        recycle: provided ? RECYCLE[i % RECYCLE.length] : '',
        notes: '',
        status: provided ? 'Provided' : 'Awaiting',
        qty: 1,
        approved: p.status === 'Complete' && provided, /* seed approved for already-complete products */
        reminders: rems
      });
    }
    return comps;
  }

  var PROD = findProduct();
  /* Two lists: EXPECTED (what the retailer expects — empty at first, orange) and ACTUAL (what the
     supplier has actually provided — green, may already be approved). Product approval is driven by ACTUAL. */
  var ACTUAL = buildComponents(PROD);
  var EXPECTED = [];
  var APPROVED = PROD.status === 'Complete';
  var openIdx = -1; /* which component card is expanded */
  var pendingHl = null; /* {key,i} of just-added cards to pop-highlight after the next render */

  function list(key) { return key === 'expected' ? EXPECTED : ACTUAL; }

  /* inline SVG "example image" so provided components show something clickable offline */
  var IMG_PALETTE = [['#4ebb81', '#2f7d57'], ['#5b9cf6', '#2f5fb0'], ['#f5a623', '#c47d10'], ['#b07de0', '#6f4aa0'], ['#e0605a', '#a83b36'], ['#3fc4c9', '#1f7d80']];
  function sampleImg(label, k) {
    var c = IMG_PALETTE[k % IMG_PALETTE.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="380" height="285">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs>' +
      '<rect width="380" height="285" fill="url(#g)"/>' +
      '<rect x="115" y="72" width="150" height="115" rx="12" fill="#ffffff" fill-opacity="0.94"/>' +
      '<rect x="115" y="72" width="150" height="30" rx="12" fill="#0b1b2e" fill-opacity="0.10"/>' +
      '<circle cx="190" cy="133" r="21" fill="none" stroke="' + c[1] + '" stroke-width="6"/>' +
      '<text x="190" y="243" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">' + esc(label) + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  ACTUAL.forEach(function (c, i) { if (c.status === 'Provided') c.img = sampleImg(c.name, i); });

  /* pop + stroke highlight for freshly-added component cards */
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
      }, k * 130);
    });
  }

  /* ---- toast ---- */
  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  /* ---- derived product state ---- */
  function awaitingCount() { return ACTUAL.filter(function (c) { return c.status !== 'Provided'; }).length; }
  function approvedCount() { return ACTUAL.filter(function (c) { return c.approved; }).length; }
  function allApproved() { return ACTUAL.length > 0 && approvedCount() === ACTUAL.length; }
  function statusPill() {
    if (APPROVED) return '<span class="pill pill-green">Retailer approved</span>';
    if (ACTUAL.length === 0) return '<span class="pill pill-grey">No components</span>';
    if (awaitingCount() === 0) return '<span class="pill pill-blue">Ready to approve</span>';
    return '<span class="pill" style="background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Awaiting supplier</span>';
  }
  function compStatusPill(c) {
    if (c.approved) return '<span class="pill pill-green" style="font-size:9px">✅ Approved</span>';
    if (c.status === 'Provided') return '<span class="pill" style="font-size:9px;background:rgba(91,156,246,.14);color:#5b9cf6;border:1px solid rgba(91,156,246,.32)">Provided</span>';
    return '<span class="pill" style="font-size:9px;background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Awaiting supplier</span>';
  }

  /* ---- inject styles ---- */
  function injectCss() {
    if (document.getElementById('ra-prod-css')) return;
    var st = document.createElement('style'); st.id = 'ra-prod-css';
    st.textContent =
      '#ra-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f2338;border:1px solid var(--gs);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:9999}' +
      '#ra-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.rap-banner{display:flex;gap:11px;align-items:flex-start;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--tw2);line-height:1.6}' +
      '.rap-banner svg{color:#5b9cf6;flex-shrink:0;margin-top:1px}' +
      '.rap-comp{border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:11px;margin-bottom:10px;overflow:visible;background:rgba(255,255,255,.02);transition:border-color .5s ease,box-shadow .5s ease;position:relative}' +
      '.rap-comp:hover{z-index:10}' +
      '.rap-comp.rap-comp-approved{border-color:rgba(78,187,129,.4);background:rgba(78,187,129,.04)}' +
      '.rap-comp-hdr{display:grid;grid-template-columns:minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(140px, 2.5fr) minmax(280px, 3.5fr);gap:10px;align-items:center;padding:10px 14px;transition:background .14s;border-radius:10px}' +
      '.rap-comp-hdr:hover{background:rgba(255,255,255,.03)}' +
      '.rap-tt-wrap{position:relative;display:inline-flex}' +
      '.rap-tt{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;background:#0e2036;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px;width:280px;box-shadow:0 12px 30px rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .15s, transform .15s;z-index:100;font-size:11px;color:var(--tw2);cursor:default;white-space:normal;text-align:left}' +
      '.rap-tt-wrap:hover .rap-tt{opacity:1;visibility:visible;transform:translateX(-50%) translateY(3px)}' +
      '.rap-tt-hdr{font-weight:700;color:#fff;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}' +
      '.rap-tt-row{display:flex;justify-content:space-between;margin-bottom:6px}' +
      '.rap-tt-auto{color:var(--tw3)}' +
      '.rap-tt-manual{color:#f5a623}' +
      '.rap-btn-remind{background:rgba(245,166,35,.12)!important;border-color:rgba(245,166,35,.35)!important;color:#f5a623!important}' +
      '.rap-btn-remind:hover{background:rgba(245,166,35,.24)!important;border-color:#f5a623!important;color:#fff!important}' +
      '.rap-comp-name{font-size:13px;font-weight:600;color:var(--tw);flex-shrink:0}' +
      '.rap-comp-name-edit{outline:none;border:1px solid transparent;border-radius:5px;padding:2px 6px;margin:-2px -4px;cursor:text;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .14s,border-color .14s}' +
      '.rap-comp-name-edit:hover{background:rgba(255,255,255,.05);border-color:var(--bw,rgba(255,255,255,.14))}' +
      '.rap-comp-name-edit:focus{background:rgba(255,255,255,.08);border-color:var(--gs);overflow:visible;text-overflow:clip;max-width:none}' +
      '.rap-comp-name-edit:empty:before{content:"Component name";color:var(--tw3)}' +
      '.rap-comp-new{border-color:#f5a623!important;box-shadow:0 0 0 1px #f5a623,0 0 20px rgba(245,166,35,.38);animation:rapPop .5s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes rapPop{0%{transform:scale(.965)}45%{transform:scale(1.035)}100%{transform:scale(1)}}' +
      '.rap-comp-sum{font-size:11px;color:var(--tw3);flex:1;min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.rap-col{display:flex;align-items:center;gap:8px}' +
      '.rap-col-vert{display:flex;flex-direction:column;gap:3px}' +
      '.rap-hdr-btns{display:flex;align-items:center;gap:5px;flex-shrink:0;justify-content:flex-end;width:100%}' +
      '.rap-hdr-btns button{font-family:inherit;font-size:11px;font-weight:600;padding:4px 8px;border-radius:7px;cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--tw2);transition:background .12s,border-color .12s,color .12s;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}' +
      '.rap-hdr-btns button:hover{background:rgba(255,255,255,.12);color:#fff}' +
      '.rap-qty-btn{padding:3px 7px!important;font-size:13px!important;min-width:26px;justify-content:center}' +
      '.rap-qty-val{font-size:12px;font-weight:700;color:var(--tw);min-width:18px;text-align:center}' +
      '.rap-btn-approve{background:rgba(78,187,129,.12)!important;border-color:rgba(78,187,129,.35)!important;color:#4ebb81!important}' +
      '.rap-btn-approve:hover{background:rgba(78,187,129,.25)!important;border-color:var(--gs)!important;color:#fff!important}' +
      '.rap-btn-approved{background:rgba(78,187,129,.18)!important;border-color:rgba(78,187,129,.5)!important;color:#4ebb81!important;cursor:default!important}' +
      '.rap-btn-view{background:rgba(91,156,246,.1)!important;border-color:rgba(91,156,246,.3)!important;color:#5b9cf6!important}' +
      '.rap-btn-view:hover{background:rgba(91,156,246,.22)!important;color:#fff!important}' +
      '.rap-btn-remove{background:rgba(224,96,90,.08)!important;border-color:rgba(224,96,90,.25)!important;color:#e0605a!important}' +
      '.rap-btn-remove:hover{background:rgba(224,96,90,.2)!important;border-color:#e0605a!important;color:#fff!important}' +
      '.rap-chev{transition:transform .2s;color:var(--tw3);flex-shrink:0}' +
      '.rap-comp.open .rap-chev{transform:rotate(180deg)}' +
      '.rap-comp-body{display:none;padding:4px 14px 16px;border-top:1px solid var(--bw,rgba(255,255,255,.08))}' +
      '.rap-comp.open .rap-comp-body{display:block}' +
      '.rap-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px;margin:12px 0}' +
      '@media(max-width:720px){.rap-grid{grid-template-columns:1fr}}' +
      '.rap-f{display:flex;flex-direction:column;gap:5px;min-width:0}' +
      '.rap-f label{font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;color:var(--tw3);display:flex;align-items:center;gap:6px}' +
      '.rap-f .await-tag{font-size:8.5px;color:#f5a623;background:rgba(245,166,35,.12);border:1px solid rgba(245,166,35,.3);padding:1px 5px;border-radius:4px;letter-spacing:0}' +
      '.rap-f .fi{padding:7px 10px;font-size:12.5px}' +
      '.rap-comp-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--bw,rgba(255,255,255,.08))}' +
      '.rap-hdr-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      /* add-component buttons below list (split: direct + from-list) */
      '.rap-add-row{display:flex;gap:8px;margin-top:4px}' +
      '.rap-add-direct{flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 14px;background:var(--gs);border:1px solid var(--gs);color:#fff;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:650;cursor:pointer;transition:filter .14s;box-sizing:border-box}' +
      '.rap-add-direct:hover{filter:brightness(1.08)}' +
      '.rap-add-from-list{flex:0 0 20%;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 12px;background:rgba(78,187,129,.1);border:1px dashed rgba(78,187,129,.45);color:#fff;border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .14s;box-sizing:border-box;text-align:center;white-space:nowrap}' +
      '.rap-add-from-list:hover{background:rgba(78,187,129,.2)}' +
      /* picker modal */
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
      '.rap-doc-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:rgba(78,187,129,.15);border:1px solid rgba(78,187,129,.45);color:#4ebb81;border-radius:9px;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .14s}' +
      '.rap-doc-btn:hover{background:rgba(78,187,129,.28);color:#fff}' +
      /* Expected (orange) vs Actual (green-stroke) component cards */
      '.rap-comp-expected{border-color:rgba(245,166,35,.55)!important;background:rgba(245,166,35,.045)!important}' +
      '.rap-comp-expected:hover{border-color:rgba(245,166,35,.8)!important}' +
      '.rap-comp-actual{border-color:rgba(78,187,129,.5)!important;background:rgba(78,187,129,.035)!important}' +
      '.rap-comp-actual:hover{border-color:rgba(78,187,129,.8)!important}' +
      '.rap-comp-actual.rap-comp-approved{border-color:rgba(78,187,129,.7)!important;background:rgba(78,187,129,.07)!important}' +
      /* image slot next to the component name */
      '.rap-img-slot{width:40px;height:40px;flex-shrink:0;border-radius:9px;padding:0;cursor:pointer;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);transition:border-color .14s,transform .14s,box-shadow .14s}' +
      '.rap-img-empty{border:1.5px dashed var(--bw,rgba(255,255,255,.22));color:var(--tw3)}' +
      '.rap-img-empty:hover{border-color:var(--gs);color:var(--gs);background:rgba(78,187,129,.08)}' +
      '.rap-img-has{border:1px solid rgba(255,255,255,.14)}' +
      '.rap-img-has:hover{transform:scale(1.06);box-shadow:0 6px 18px rgba(0,0,0,.4);border-color:var(--gs)}' +
      '.rap-img-has img{width:100%;height:100%;object-fit:cover;display:block}' +
      /* add-row per card */
      '.rap-add-single{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;margin-top:4px;padding:11px 14px;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:650;cursor:pointer;box-sizing:border-box;transition:filter .14s,background .14s}' +
      '.rap-add-expected{background:rgba(245,166,35,.12);border:1px dashed rgba(245,166,35,.55);color:#f5a623}' +
      '.rap-add-expected:hover{background:rgba(245,166,35,.22);color:#fff}' +
      '.rap-add-actual{background:rgba(78,187,129,.1);border:1px dashed rgba(78,187,129,.5);color:#4ebb81}' +
      '.rap-add-actual:hover{background:rgba(78,187,129,.2);color:#fff}' +
      /* note button + inline note text (expected components) */
      '.rap-btn-note-on{background:rgba(245,166,35,.14)!important;border-color:rgba(245,166,35,.4)!important;color:#f5a623!important}' +
      '.rap-btn-note-on:hover{background:rgba(245,166,35,.26)!important;border-color:#f5a623!important;color:#fff!important}' +
      '.rap-note-txt{display:inline-block;margin-top:3px;color:#f5a623;font-weight:600;font-size:11px;line-height:1.45}' +
      /* image lightbox */
      '.rap-lb-ov{position:fixed;inset:0;background:rgba(4,10,20,.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:32px;cursor:zoom-out;animation:rapLbIn .18s ease}' +
      '@keyframes rapLbIn{from{opacity:0}to{opacity:1}}' +
      '.rap-lb-fig{max-width:90vw;max-height:90vh;display:flex;flex-direction:column;gap:10px;align-items:center}' +
      '.rap-lb-fig img{max-width:90vw;max-height:80vh;border-radius:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.8);border:1px solid rgba(255,255,255,.12)}' +
      '.rap-lb-cap{font-size:13px;font-weight:600;color:#fff;text-align:center}' +
      '.rap-lb-x{position:fixed;top:20px;right:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
      '.rap-lb-x:hover{background:rgba(255,255,255,.2)}';
    document.head.appendChild(st);
  }

  /* ---- image slot (upload when empty, view-large when set) ---- */
  function imgSlot(c, key, i) {
    if (c.img) {
      return '<button type="button" class="rap-img-slot rap-img-has" title="Click to view image" ' +
        'onclick="event.stopPropagation();rapLightbox(\'' + key + '\',' + i + ')"><img src="' + c.img + '" alt="' + esc(c.name) + '"></button>';
    }
    return '<button type="button" class="rap-img-slot rap-img-empty" title="Upload an image" ' +
      'onclick="event.stopPropagation();rapUploadImg(\'' + key + '\',' + i + ')">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></button>';
  }

  /* ---- component card (single line: image + details summary + row actions) ---- */
  function compCard(c, i, key) {
    var isExpected = key === 'expected';
    var missingHint = c.status !== 'Provided';
    var sum = isExpected
      ? 'Expected component — awaiting actual packaging data'
      : (c.status === 'Provided'
          ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR')
          : 'Awaiting supplier — details not yet provided');

    /* qty stepper */
    var qty = c.qty || 1;
    var qtyHtml = '<div style="display:flex;align-items:center;background:rgba(255,255,255,.04);border-radius:6px;margin-right:6px"><button type="button" class="rap-qty-btn" title="Decrease quantity" onclick="rapQtyStep(\'' + key + '\',' + i + ',-1)" style="border:none;background:transparent">−</button>' +
      '<span class="rap-qty-val">' + qty + '</span>' +
      '<button type="button" class="rap-qty-btn" title="Increase quantity" onclick="rapQtyStep(\'' + key + '\',' + i + ',1)" style="border:none;background:transparent">+</button></div>';

    /* remove button (both lists) */
    var removeBtn = '<button type="button" class="rap-btn-remove" title="Remove this component" onclick="rapRemove(\'' + key + '\',' + i + ')">🗑</button>';

    var midCol, actionBtns;
    if (isExpected) {
      /* Expected: orange, just what the retailer expects — no supplier/approve workflow yet. */
      midCol = '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
        '<span class="pill" style="font-size:9px;background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Expected</span>';
      var noteBtn = '<button type="button" class="rap-btn-note' + (c.notes ? ' rap-btn-note-on' : '') + '" title="' + (c.notes ? 'Edit note' : 'Add a note') + '" onclick="rapNote(\'' + key + '\',' + i + ')">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + (c.notes ? 'Edit note' : 'Note') + '</button>';
      actionBtns = qtyHtml + noteBtn + removeBtn;
    } else {
      /* Actual: green stroke, full supplier/approve workflow. */
      midCol = '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' + compStatusPill(c);

      var viewBtn = '<button type="button" class="rap-btn-view" title="View packaging detail" onclick="rapViewPkg(\'' + esc(c.name) + '\')">→ Detail</button>';

      var appBtn = '';
      if (c.status === 'Provided' && !APPROVED) {
        appBtn = c.approved
          ? '<button type="button" class="rap-btn-remove" style="color:var(--tw2)!important;background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.15)!important" onclick="rapCancelApproveComp(' + i + ')">Cancel Approval</button>'
          : '<button type="button" class="rap-btn-approve" onclick="rapApproveComp(' + i + ')">Approve</button>';
      } else if (c.status === 'Provided' && APPROVED) {
        appBtn = '<button type="button" class="rap-btn-approved" disabled>Approved</button>';
      }

      var ttHtml = '';
      if (missingHint && c.reminders && c.reminders.length > 0) {
        var lastRem = c.reminders[c.reminders.length - 1];
        ttHtml = '<div class="rap-tt"><div class="rap-tt-hdr">' + c.reminders.length + ' reminder' + (c.reminders.length > 1 ? 's' : '') + ' sent (Last: ' + lastRem.date + ')</div>';
        c.reminders.forEach(function (r) {
          var cl = r.type === 'Automated' ? 'rap-tt-auto' : 'rap-tt-manual';
          ttHtml += '<div class="rap-tt-row"><span class="' + cl + '">' + r.type + '</span><span style="color:#fff">' + r.date + '</span></div>';
        });
        ttHtml += '</div>';
      }
      var reminderBtn = missingHint
        ? '<div class="rap-tt-wrap"><button type="button" class="rap-btn-remind" title="Remind the supplier to complete this component" onclick="rapRemind(' + i + ')">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Send reminder</button>' + ttHtml + '</div>'
        : '';

      actionBtns = qtyHtml + viewBtn + appBtn + reminderBtn + removeBtn;
    }

    var cardClass = 'rap-comp ' + (isExpected ? 'rap-comp-expected' : ('rap-comp-actual' + (c.approved ? ' rap-comp-approved' : '')));

    return '<div class="' + cardClass + '" data-i="' + i + '" data-key="' + key + '">' +
      '<div class="rap-comp-hdr">' +
        '<div class="rap-col">' +
          imgSlot(c, key, i) +
          '<span class="rap-comp-name rap-comp-name-edit" contenteditable="true" spellcheck="false" title="Click to rename" ' +
            'onkeydown="rapTitleKey(event)" oninput="rapEditName(\'' + key + '\',' + i + ',this.textContent)">' + esc(c.name) + '</span>' +
        '</div>' +
        '<div class="rap-col-vert" style="align-items:flex-start">' +
          midCol +
        '</div>' +
        '<div class="rap-col">' +
          '<span class="rap-comp-sum" style="white-space:normal;line-height:1.4">' + sum + (!isExpected && c.status === 'Provided' ? '<br><span style="color:var(--tw2);font-weight:600">' + esc(c.recycle) + '</span>' : '') + (isExpected && c.notes ? '<br><span class="rap-note-txt"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + esc(c.notes) + '</span>' : '') + '</span>' +
        '</div>' +
        '<div class="rap-hdr-btns">' +
          actionBtns +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---- render ---- */
  function render() {
    injectCss();
    var root = document.getElementById('ra-prod-root');
    var crumb = document.getElementById('ra-prod-crumb'); if (crumb) crumb.textContent = PROD.sku;
    var awaiting = awaitingCount();
    var canApprove = !APPROVED && ACTUAL.length > 0 && awaiting === 0;

    var idIcon = (typeof window.gsIdenticon === 'function')
      ? '<span class="gs-id-ic" style="width:32px;height:32px;border-radius:8px">' + window.gsIdenticon(PROD.sku, 32) + '</span>'
      : '';

    var actions =
        '<button class="btn-g" onclick="rapSendToSupplier()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send to supplier</button>' +
        (APPROVED
          ? '<button class="rap-doc-btn" onclick="rapGenerateDoC()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Generate DoC</button>' +
            '<button class="btn-g" onclick="rapReopen()">Re-open</button>'
          : '<button class="btn-p" ' + (canApprove ? '' : 'disabled style="opacity:.45;cursor:not-allowed"') + ' onclick="rapApprove()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:-2px;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>Approve product</span></button>');

    var providedCount = ACTUAL.filter(function(c){return c.status === 'Provided';}).length;
    var progHtml = '<div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--tw2)"><div style="width:80px;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden"><div style="height:100%;background:var(--gs);width:' + (ACTUAL.length ? (providedCount/ACTUAL.length)*100 : 0) + '%"></div></div>' + providedCount + ' / ' + ACTUAL.length + '</div>';

    var deadlineTag = '<span class="pill pill-grey" style="font-size:11px;color:var(--tw2)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + PROD.deadline + '</span>';

    var cats = ['Apparel', 'Footwear', 'Accessories', 'Homeware', 'Beauty', 'Electronics'];
    var catOpts = cats.map(function(c){ return '<option' + (c===PROD.cat?' selected':'') + '>' + c + '</option>'; }).join('');
    if (cats.indexOf(PROD.cat) === -1) catOpts += '<option selected>' + esc(PROD.cat) + '</option>';

    var sups = ['Supplier Ltd (HK)', 'GreenStreets', 'Primark', 'Next', 'Zara'];
    var supOpts = sups.map(function(s){ return '<option' + (s===PROD.supplier?' selected':'') + '>' + s + '</option>'; }).join('');
    if (sups.indexOf(PROD.supplier) === -1) supOpts += '<option selected>' + esc(PROD.supplier) + '</option>';

    var topCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr" style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.05)">' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            idIcon +
            '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<span style="font-size:15px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em;color:#fff">' + esc(PROD.sku) + '</span>' +
              '<span style="font-size:12px;color:var(--tw2)">' + esc(PROD.desc) + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            progHtml +
            deadlineTag +
            statusPill() +
            '<div style="width:1px;height:24px;background:rgba(255,255,255,.1);margin:0 4px"></div>' +
            actions +
          '</div>' +
        '</div>' +
        '<div class="grp-body" style="padding:20px 18px">' +
          '<div class="rap-banner" style="margin-bottom:20px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
          '<div>Define the packaging components you expect for this product. Once every component has been provided by the supplier, you can approve the product. Use <b>Send reminder</b> to nudge the supplier on any component still outstanding.</div></div>' +
          '<div class="rap-grid" style="margin:0;grid-template-columns:1fr 1fr 1fr;gap:20px">' +
            '<div class="rap-f"><label>SKU</label><input class="fi" value="' + esc(PROD.sku) + '"></div>' +
            '<div class="rap-f"><label>Category</label><select class="fi" onchange="window.rapUpdateProd(\'cat\',this.value)">' + catOpts + '</select></div>' +
            '<div class="rap-f"><label>Assigned supplier</label><select class="fi" onchange="window.rapUpdateProd(\'supplier\',this.value)">' + supOpts + '</select></div>' +
            '<div class="rap-f"><label>Units per Case</label><div><input class="fi" type="number" value="' + PROD.unitsPerCase + '" onchange="window.rapUpdateProd(\'unitsPerCase\',this.value)"></div></div>' +
            '<div class="rap-f"><label>Cases per Pallet</label><div><input class="fi" type="number" value="' + PROD.casesPerPallet + '" onchange="window.rapUpdateProd(\'casesPerPallet\',this.value)"></div></div>' +
            '<div class="rap-f"><label>Total Product Weight (g)</label><div><input class="fi" type="number" value="' + PROD.totalWeight + '" onchange="window.rapUpdateProd(\'totalWeight\',this.value)"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function qtySum(arr) { var t = 0; arr.forEach(function (c) { t += (c.qty || 1); }); return t; }

    /* ── Card 1: EXPECTED packaging components (orange, empty at first) ── */
    var expCards = EXPECTED.map(function (c, i) { return compCard(c, i, 'expected'); }).join('') ||
      '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No expected components yet — use <b style="color:#f5a623">Add component</b> below to define the packaging you expect for this product.</div>';
    var expCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr">Expected Packaging Components' +
          '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + EXPECTED.length + ' expected (' + qtySum(EXPECTED) + ' item' + (qtySum(EXPECTED) === 1 ? '' : 's') + ')</span>' +
          '<span style="margin-left:auto;font-size:10px;color:#f5a623">What you expect the supplier to provide</span>' +
        '</div>' +
        '<div class="grp-body">' +
          expCards +
          '<button type="button" class="rap-add-single rap-add-expected" onclick="rapAddExpected()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Add component</button>' +
        '</div>' +
      '</div>';

    /* ── Card 2: ACTUAL packaging components (green stroke, already provided/approved) ── */
    var actCards = ACTUAL.map(function (c, i) { return compCard(c, i, 'actual'); }).join('') ||
      '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No actual components yet — use <b style="color:#4ebb81">Add Component From List</b> below.</div>';
    var actCard =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr">Actual Packaging Components' +
          '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + ACTUAL.length + ' component type' + (ACTUAL.length === 1 ? '' : 's') + ' (' + qtySum(ACTUAL) + ' item' + (qtySum(ACTUAL) === 1 ? '' : 's') + ' total)</span>' +
          '<span style="margin-left:auto;font-size:10px;color:var(--tw3)">' +
            (awaiting > 0 ? '<span style="color:#f5a623">' + awaiting + ' awaiting supplier</span>' : '<span style="color:#4ebb81">all provided</span>') +
          '</span>' +
        '</div>' +
        '<div class="grp-body">' +
          actCards +
          '<button type="button" class="rap-add-single rap-add-actual" onclick="rapAdd()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4"/></svg>Add Component From List</button>' +
        '</div>' +
      '</div>';

    root.innerHTML = topCard + expCard + actCard;

    flushHighlight();
  }

  /* ---- actions ---- */
  window.rapUpdateProd = function (key, val) { PROD[key] = val; };
  window.rapToggle = function (i) { openIdx = (openIdx === i ? -1 : i); render(); };
  window.rapEditName = function (key, i, val) { var L = list(key); if (L[i]) L[i].name = (val || '').replace(/\n/g, ' '); };
  window.rapTitleKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
  window.rapRemove = function (key, i) {
    var L = list(key); var name = L[i] ? L[i].name : '';
    L.splice(i, 1);
    render(); toast('"' + name + '" removed');
  };
  /* qty stepper (+ / -) */
  window.rapQtyStep = function (key, i, d) {
    var L = list(key); if (!L[i]) return;
    L[i].qty = Math.max(1, (L[i].qty || 1) + d);
    render();
  };
  /* approve individual component (ACTUAL only) */
  window.rapApproveComp = function (i) {
    var c = ACTUAL[i]; if (!c) return;
    if (c.status !== 'Provided') { toast('Component must be "Provided" before it can be approved'); return; }
    c.approved = true;
    render();
    if (allApproved()) toast('All components approved — you can now approve the product ✅');
    else toast('"' + c.name + '" approved');
  };
  /* cancel approve individual component */
  window.rapCancelApproveComp = function (i) {
    var c = ACTUAL[i]; if (!c) return;
    c.approved = false;
    render();
    toast('Approval cancelled for "' + c.name + '"');
  };
  /* ---- image upload + lightbox ---- */
  window.rapUploadImg = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) { inp.remove(); return; }
      var rd = new FileReader();
      rd.onload = function () { c.img = rd.result; render(); toast('Image added to "' + (c.name || 'component') + '"'); inp.remove(); };
      rd.readAsDataURL(f);
    };
    document.body.appendChild(inp); inp.click();
  };
  window.rapLightbox = function (key, i) {
    var c = list(key)[i]; if (!c || !c.img) return;
    var ov = document.getElementById('rap-lightbox'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'rap-lightbox'; ov.className = 'rap-lb-ov';
    ov.onclick = function () { rapCloseLightbox(); };
    ov.innerHTML = '<button class="rap-lb-x" title="Close" onclick="rapCloseLightbox()">×</button>' +
      '<figure class="rap-lb-fig"><img src="' + c.img + '" alt="' + esc(c.name) + '"><figcaption class="rap-lb-cap">' + esc(c.name) + '</figcaption></figure>';
    document.body.appendChild(ov);
  };
  window.rapCloseLightbox = function () { var ov = document.getElementById('rap-lightbox'); if (ov) ov.remove(); };
  /* ---- note editor (expected components) ---- */
  window.rapNote = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var ov = document.getElementById('rap-note'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'rap-note'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) rapCloseNote(); };
    ov.innerHTML =
      '<div class="rap-modal" style="max-width:440px">' +
        '<div class="rap-modal-hdr"><span>Note · ' + esc(c.name || 'component') + '</span>' +
          '<button class="rap-modal-x" onclick="rapCloseNote()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
        '<div class="rap-modal-body"><div class="rap-f"><label>Note for this expected component</label>' +
          '<textarea class="fi" id="rap-note-ta" rows="4" placeholder="e.g. Must be FSC-certified card, min 30% PCR content…" style="resize:vertical;min-height:92px;line-height:1.5">' + esc(c.notes || '') + '</textarea></div></div>' +
        '<div class="rap-modal-foot" style="justify-content:flex-end;gap:8px">' +
          (c.notes ? '<button class="btn-g-sm" onclick="rapClearNote(\'' + key + '\',' + i + ')">Remove note</button>' : '') +
          '<button class="btn-p" onclick="rapSaveNote(\'' + key + '\',' + i + ')"><span class="btn-c">Save note</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    var ta = document.getElementById('rap-note-ta'); if (ta) ta.focus();
  };
  window.rapSaveNote = function (key, i) {
    var c = list(key)[i]; if (!c) return;
    var ta = document.getElementById('rap-note-ta');
    c.notes = (ta ? ta.value : '').trim();
    rapCloseNote(); render();
    toast(c.notes ? 'Note saved for "' + (c.name || 'component') + '"' : 'Note cleared');
  };
  window.rapClearNote = function (key, i) {
    var c = list(key)[i]; if (c) c.notes = '';
    rapCloseNote(); render(); toast('Note removed');
  };
  window.rapCloseNote = function () { var ov = document.getElementById('rap-note'); if (ov) ov.remove(); };
  /* view packaging detail */
  window.rapViewPkg = function (name) {
    /* find the matching packaging in PACKAGINGS_RA by component type name (fuzzy) */
    var lib = window.PACKAGINGS_RA || [];
    var nm = (name || '').toLowerCase().replace(/[^a-z]/g, '');
    var match = lib.filter(function (p) {
      return (p.type || '').toLowerCase().replace(/[^a-z]/g, '') === nm;
    })[0] || lib[0];
    if (match && typeof openPackagingRA === 'function') {
      openPackagingRA(match.id);
    } else {
      toast('Opening packaging detail for "' + name + '"');
    }
  };
  function blankComp(name, level, material) {
    return { name: name || ('Component ' + (ACTUAL.length + EXPECTED.length + 1)), level: level || 'Primary', material: material || '', weight: '', pcr: '', recycle: '', notes: '', status: 'Awaiting', qty: 1, approved: false };
  }
  function addComp(key, c) {
    var L = list(key);
    L.push(c);
    openIdx = L.length - 1;
    pendingHl = [{ key: key, i: L.length - 1 }];
    /* Adding a new component changes the packaging make-up — an already-approved product must be
       re-reviewed, so cancel the approval and bring the "Approve product" button back. */
    var wasApproved = APPROVED;
    if (wasApproved) APPROVED = false;
    addComp._cancelled = wasApproved;   // callers check this to avoid overwriting the cancellation toast
    render();
    if (wasApproved) toast('Product approval cancelled — a new component was added, please re-approve');
    var last = document.querySelector('.rap-comp[data-key="' + key + '"][data-i="' + (L.length - 1) + '"]');
    if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusCompName(key, L.length - 1);
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

  /* Add an EXPECTED component directly (blank row) */
  window.rapAddExpected = function () {
    addComp('expected', blankComp('', 'Primary', ''));
    if (!addComp._cancelled) toast('Expected component added — rename it to what you expect the supplier to provide');
  };
  /* Send the supplier a reminder for an outstanding component */
  window.rapRemind = function (i) {
    var c = ACTUAL[i]; if (!c) return;
    toast('Reminder for "' + (c.name || 'component') + '" will be sent to ' + PROD.supplier + ' as an email.');
  };

  /* Add an ACTUAL packaging component from list → picker (library or create new) */
  window.rapAdd = function () { openPicker(); };

  function openPicker() {
    var ov = document.getElementById('rap-picker'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'rap-picker'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) closePicker(); };
    ov.innerHTML =
      '<div class="rap-modal">' +
        '<div class="rap-modal-hdr"><span>Add Component from list</span>' +
          '<button class="rap-modal-x" onclick="rapClosePicker()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
        '<div class="rap-modal-body">' +
          '<div id="rap-pick-list-wrap">' +
            '<input class="fi" id="rap-pick-search" placeholder="Search the packaging library…" oninput="rapPickSearch(this.value)" style="margin-bottom:10px">' +
            '<div class="rap-pick-list" id="rap-pick-list"></div>' +
          '</div>' +
          '<div id="rap-pick-create" style="display:none">' +
            '<div class="rap-f" style="margin-bottom:10px"><label>Component name</label><input class="fi" id="rap-new-name" placeholder="e.g. Corrugated Insert"></div>' +
            '<div class="rap-f" style="margin-bottom:4px"><label>Level</label><select class="fi" id="rap-new-level"><option>Primary</option><option>Secondary</option><option>Tertiary</option></select></div>' +
            '<a class="bc-link" style="font-size:11px;cursor:pointer;display:inline-block;margin-top:8px" onclick="rapPickBack()">‹ Back to library</a>' +
          '</div>' +
        '</div>' +
        '<div class="rap-modal-foot" id="rap-pick-foot">' +
          '<button class="btn-g-sm" onclick="rapPickShowCreate()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Create a new component</button>' +
        '</div>' +
        '<div class="rap-modal-foot" id="rap-create-foot" style="display:none;justify-content:flex-end">' +
          '<button class="btn-p" onclick="rapCreate()"><span class="btn-c">Add component</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    renderPickList('');
    var s = document.getElementById('rap-pick-search'); if (s) s.focus();
  }
  function renderPickList(term) {
    var host = document.getElementById('rap-pick-list'); if (!host) return;
    var lib = window.PKG_LIBRARY || [];
    term = (term || '').toLowerCase();
    var rows = lib.filter(function (x) { return !term || (x.name + ' ' + x.material + ' ' + x.level).toLowerCase().indexOf(term) >= 0; });
    host.innerHTML = rows.length ? rows.map(function (x) {
      var idx = lib.indexOf(x);
      return '<div class="rap-pick-item" onclick="rapPickLib(' + idx + ')">' +
        '<div><div class="rap-pick-name">' + esc(x.name) + '</div><div class="rap-pick-meta">' + esc(x.material) + ' · ' + esc(x.recyclability || '') + '</div></div>' +
        '<span class="pill ' + (x.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(x.level) + '</span>' +
        '</div>';
    }).join('') : '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No matches — create a new component below.</div>';
  }
  window.rapPickSearch = function (v) { renderPickList(v); };
  window.rapPickLib = function (i) {
    var x = (window.PKG_LIBRARY || [])[i]; if (!x) return;
    closePicker();
    addComp('actual', blankComp(x.name, x.level, x.material));
    if (!addComp._cancelled) toast('"' + x.name + '" added — awaiting supplier detail');
  };
  window.rapPickShowCreate = function () {
    document.getElementById('rap-pick-list-wrap').style.display = 'none';
    document.getElementById('rap-pick-create').style.display = 'block';
    document.getElementById('rap-pick-foot').style.display = 'none';
    document.getElementById('rap-create-foot').style.display = 'flex';
    var n = document.getElementById('rap-new-name'); if (n) n.focus();
  };
  window.rapPickBack = function () {
    document.getElementById('rap-pick-list-wrap').style.display = 'block';
    document.getElementById('rap-pick-create').style.display = 'none';
    document.getElementById('rap-pick-foot').style.display = 'flex';
    document.getElementById('rap-create-foot').style.display = 'none';
  };
  window.rapCreate = function () {
    var name = (document.getElementById('rap-new-name') || {}).value || '';
    var level = (document.getElementById('rap-new-level') || {}).value || 'Primary';
    if (!name.trim()) { toast('Enter a component name'); return; }
    closePicker();
    addComp('actual', blankComp(name.trim(), level, ''));
    if (!addComp._cancelled) toast('"' + name.trim() + '" created — awaiting supplier detail');
  };
  function closePicker() { var ov = document.getElementById('rap-picker'); if (ov) ov.remove(); }
  window.rapClosePicker = closePicker;

  window.rapApprove = function () {
    if (ACTUAL.length === 0) { toast('Add at least one component first'); return; }
    if (awaitingCount() > 0) { toast('All components must be provided by the supplier first'); return; }
    APPROVED = true; render(); toast('Product approved ✅');
  };
  /* Opens the Generate DoC page (ra12) rather than faking a download. */
  window.rapGenerateDoC = function () {
    try { sessionStorage.setItem('ra_doc_sku', PROD.sku); } catch (e) {}
    go('ra12');
  };
  window.rapReopen = function () { APPROVED = false; render(); toast('Product re-opened for editing'); };
  window.rapSendToSupplier = function () {
    APPROVED = false;
    var n = awaitingCount();
    render();
    toast(n > 0 ? 'Sent to ' + PROD.supplier + ' — ' + n + ' component' + (n > 1 ? 's' : '') + ' to complete' : 'Sent to ' + PROD.supplier + ' for review');
  };

  render();
})();
