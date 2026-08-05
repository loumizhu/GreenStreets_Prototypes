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
    return p || list[0] || { sku: 'PRK-000', desc: 'Product', cat: '—', supplier: '—', pkg: 'Not started', status: 'Pending' };
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
  var COMPS = buildComponents(PROD);
  var APPROVED = PROD.status === 'Complete';
  var openIdx = -1; /* which component card is expanded */
  var pendingHl = null; /* indices of just-added cards to pop-highlight after the next render */

  /* pop + orange-stroke highlight for freshly-added component cards */
  function flushHighlight() {
    if (!pendingHl || !pendingHl.length) { pendingHl = null; return; }
    var ix = pendingHl; pendingHl = null;
    ix.forEach(function (i, k) {
      setTimeout(function () {
        var card = document.querySelector('.rap-comp[data-i="' + i + '"]');
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
  function awaitingCount() { return COMPS.filter(function (c) { return c.status !== 'Provided'; }).length; }
  function approvedCount() { return COMPS.filter(function (c) { return c.approved; }).length; }
  function allApproved() { return COMPS.length > 0 && approvedCount() === COMPS.length; }
  function statusPill() {
    if (APPROVED) return '<span class="pill pill-green">Retailer approved</span>';
    if (COMPS.length === 0) return '<span class="pill pill-grey">No components</span>';
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
      '.rap-doc-btn:hover{background:rgba(78,187,129,.28);color:#fff}';
    document.head.appendChild(st);
  }

  /* ---- component card (single line: details summary + row actions) ---- */
  function compCard(c, i) {
    var missingHint = c.status !== 'Provided';
    var sum = c.status === 'Provided'
      ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR')
      : 'Awaiting supplier — details not yet provided';

    /* qty stepper */
    var qty = c.qty || 1;
    var qtyHtml = '<div style="display:flex;align-items:center;background:rgba(255,255,255,.04);border-radius:6px;margin-right:6px"><button type="button" class="rap-qty-btn" title="Decrease quantity" onclick="rapQtyStep(' + i + ',-1)" style="border:none;background:transparent">−</button>' +
      '<span class="rap-qty-val">' + qty + '</span>' +
      '<button type="button" class="rap-qty-btn" title="Increase quantity" onclick="rapQtyStep(' + i + ',1)" style="border:none;background:transparent">+</button></div>';

    /* view detail button */
    var viewBtn = '<button type="button" class="rap-btn-view" title="View packaging detail" onclick="rapViewPkg(\'' + esc(c.name) + '\')">→ Detail</button>';

    /* approve button for completed ones that are not yet approved, or cancel if approved */
    var appBtn = '';
    if (c.status === 'Provided' && !APPROVED) {
      if (c.approved) {
        appBtn = '<button type="button" class="rap-btn-remove" style="color:var(--tw2)!important;background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.15)!important" onclick="rapCancelApproveComp(' + i + ')">Cancel Approval</button>';
      } else {
        appBtn = '<button type="button" class="rap-btn-approve" onclick="rapApproveComp(' + i + ')">Approve</button>';
      }
    } else if (c.status === 'Provided' && APPROVED) {
      appBtn = '<button type="button" class="rap-btn-approved" disabled>Approved</button>';
    }

    /* tooltip content for reminders */
    var ttHtml = '';
    if (missingHint && c.reminders && c.reminders.length > 0) {
      var lastRem = c.reminders[c.reminders.length - 1];
      ttHtml = '<div class="rap-tt"><div class="rap-tt-hdr">' + c.reminders.length + ' reminder' + (c.reminders.length>1?'s':'') + ' sent (Last: ' + lastRem.date + ')</div>';
      c.reminders.forEach(function(r) {
        var cl = r.type === 'Automated' ? 'rap-tt-auto' : 'rap-tt-manual';
        ttHtml += '<div class="rap-tt-row"><span class="'+cl+'">' + r.type + '</span><span style="color:#fff">' + r.date + '</span></div>';
      });
      ttHtml += '</div>';
    }

    /* send-reminder button — only for incomplete (awaiting) components */
    var reminderBtn = missingHint
      ? '<div class="rap-tt-wrap"><button type="button" class="rap-btn-remind" title="Remind the supplier to complete this component" onclick="rapRemind(' + i + ')">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Send reminder</button>' + ttHtml + '</div>'
      : '';

    /* remove button */
    var removeBtn = '<button type="button" class="rap-btn-remove" title="Remove this component" onclick="rapRemove(' + i + ')">🗑</button>';

    return '<div class="rap-comp' + (c.approved ? ' rap-comp-approved' : '') + '" data-i="' + i + '">' +
      '<div class="rap-comp-hdr">' +
        '<div class="rap-col">' +
          '<span class="rap-comp-name rap-comp-name-edit" contenteditable="true" spellcheck="false" title="Click to rename" ' +
            'onkeydown="rapTitleKey(event)" oninput="rapEditName(' + i + ',this.textContent)">' + esc(c.name) + '</span>' +
        '</div>' +
        '<div class="rap-col-vert" style="align-items:flex-start">' +
          '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
          compStatusPill(c) +
        '</div>' +
        '<div class="rap-col">' +
          '<span class="rap-comp-sum" style="white-space:normal;line-height:1.4">' + sum + (c.status === 'Provided' ? '<br><span style="color:var(--tw2);font-weight:600">' + esc(c.recycle) + '</span>' : '') + '</span>' +
        '</div>' +
        '<div class="rap-hdr-btns">' +
          qtyHtml +
          viewBtn +
          appBtn +
          reminderBtn +
          removeBtn +
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
    var canApprove = !APPROVED && COMPS.length > 0 && awaiting === 0;

    var idIcon = (typeof window.gsIdenticon === 'function')
      ? '<span class="gs-id-ic" style="width:24px;height:24px;border-radius:6px">' + window.gsIdenticon(PROD.sku, 24) + '</span>'
      : '';

    var header =
      '<div class="pg-hdr-bar"><div>' +
        '<div class="pg-title" style="display:inline-flex;align-items:center;gap:10px">' + idIcon +
          '<span style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em">' + esc(PROD.sku) + '</span></div>' +
        '<div class="pg-sub">' + esc(PROD.desc) + ' · ' + esc(PROD.cat) + ' · Supplier: ' + esc(PROD.supplier) + '</div>' +
      '</div><div class="pg-actions rap-hdr-actions">' +
        statusPill() +
        '<button class="btn-g" onclick="rapSendToSupplier()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send to supplier</button>' +
        (APPROVED
          ? '<button class="rap-doc-btn" onclick="rapDownloadDoC()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download DoC</button>' +
            '<button class="btn-g" onclick="rapReopen()">Re-open</button>'
          : '<button class="btn-p" ' + (canApprove ? '' : 'disabled style="opacity:.45;cursor:not-allowed"') + ' onclick="rapApprove()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:-2px;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>Approve product</span></button>') +
      '</div></div>';

    var banner =
      '<div class="rap-banner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
      '<div>Define the packaging components you expect for this product. Once every component has been provided by the supplier, you can approve the product. Use <b>Send reminder</b> to nudge the supplier on any component still outstanding.</div></div>';

    var info =
      '<div class="grp" style="margin-bottom:12px"><div class="grp-hdr">Product details</div><div class="grp-body">' +
        '<div class="rap-grid" style="margin:0">' +
          '<div class="rap-f"><label>SKU</label><input class="fi" value="' + esc(PROD.sku) + '"></div>' +
          '<div class="rap-f"><label>Description</label><input class="fi" value="' + esc(PROD.desc) + '"></div>' +
          '<div class="rap-f"><label>Category</label><input class="fi" value="' + esc(PROD.cat) + '"></div>' +
          '<div class="rap-f"><label>Assigned supplier</label><input class="fi" value="' + esc(PROD.supplier) + '"></div>' +
        '</div>' +
      '</div></div>';

    var compCards = COMPS.map(compCard).join('') || '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No packaging components yet — use the button below to add the ones you expect.</div>';

    var totalQty = 0;
    COMPS.forEach(function(c) { totalQty += (c.qty || 1); });

    var comps =
      '<div class="grp" style="margin-bottom:12px">' +
        '<div class="grp-hdr">Packaging components' +
          '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + COMPS.length + ' component type' + (COMPS.length===1?'':'s') + ' (' + totalQty + ' item' + (totalQty===1?'':'s') + ' total)</span>' +
          '<span style="margin-left:auto;font-size:10px;color:var(--tw3)">' +
            (awaiting > 0 ? '<span style="color:#f5a623">' + awaiting + ' awaiting supplier</span>' : '') +
          '</span>' +
        '</div>' +
        '<div class="grp-body">' +
          compCards +
          /* Add-component buttons: big direct-add (left) + smaller from-list (right) */
          '<div class="rap-add-row">' +
            '<button type="button" class="rap-add-direct" onclick="rapAddDirect()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>' +
              'Add component' +
            '</button>' +
            '<button type="button" class="rap-add-from-list" onclick="rapAdd()">' +
              'Add component from list' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    root.innerHTML = header + banner + info + comps;

    flushHighlight();
  }

  /* ---- actions ---- */
  window.rapToggle = function (i) { openIdx = (openIdx === i ? -1 : i); render(); };
  window.rapEdit = function (i, key, val) {
    if (!COMPS[i]) return;
    COMPS[i][key] = val;
    if (key === 'status') {
      /* un-approve if status changes back to awaiting */
      if (val !== 'Provided') COMPS[i].approved = false;
      render(); return;
    }
  };
  window.rapEditName = function (i, val) { if (COMPS[i]) COMPS[i].name = (val || '').replace(/\n/g, ' '); };
  window.rapTitleKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
  window.rapRemove = function (i) {
    var name = COMPS[i] ? COMPS[i].name : '';
    COMPS.splice(i, 1);
    if (openIdx === i) openIdx = -1; else if (i < openIdx) openIdx--;
    render(); toast('"' + name + '" removed');
  };
  /* qty stepper (+ / -) */
  window.rapQtyStep = function (i, d) {
    if (!COMPS[i]) return;
    COMPS[i].qty = Math.max(1, (COMPS[i].qty || 1) + d);
    render();
  };
  /* approve individual component */
  window.rapApproveComp = function (i) {
    var c = COMPS[i]; if (!c) return;
    if (c.status !== 'Provided') { toast('Component must be "Provided" before it can be approved'); return; }
    c.approved = true;
    render();
    if (allApproved()) toast('All components approved — you can now approve the product ✅');
    else toast('"' + c.name + '" approved');
  };
  /* cancel approve individual component */
  window.rapCancelApproveComp = function (i) {
    var c = COMPS[i]; if (!c) return;
    c.approved = false;
    render();
    toast('Approval cancelled for "' + c.name + '"');
  };
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
    return { name: name || ('Component ' + (COMPS.length + 1)), level: level || 'Primary', material: material || '', weight: '', pcr: '', recycle: '', notes: '', status: 'Awaiting', qty: 1, approved: false };
  }
  function addComp(c) {
    COMPS.push(c);
    openIdx = COMPS.length - 1;
    pendingHl = [COMPS.length - 1];
    render();
    var last = document.querySelector('.rap-comp[data-i="' + (COMPS.length - 1) + '"]');
    if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusCompName(COMPS.length - 1);
  }
  function focusCompName(i) {
    setTimeout(function () {
      var card = document.querySelector('.rap-comp[data-i="' + i + '"]');
      var name = card && card.querySelector('.rap-comp-name-edit');
      if (!name) return;
      name.focus();
      try { var r = document.createRange(); r.selectNodeContents(name); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) {}
    }, 60);
  }

  /* Add a component directly (blank row, not from the library) */
  window.rapAddDirect = function () {
    addComp(blankComp('', 'Primary', ''));
    toast('New component added — rename it and await supplier detail');
  };
  /* Send the supplier a reminder for an outstanding component */
  window.rapRemind = function (i) {
    var c = COMPS[i]; if (!c) return;
    toast('Reminder for "' + (c.name || 'component') + '" will be sent to ' + PROD.supplier + ' as an email.');
  };

  /* Add packaging component from list → picker (library or create new) */
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
    addComp(blankComp(x.name, x.level, x.material));
    toast('"' + x.name + '" added — awaiting supplier detail');
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
    addComp(blankComp(name.trim(), level, ''));
    toast('"' + name.trim() + '" created — awaiting supplier detail');
  };
  function closePicker() { var ov = document.getElementById('rap-picker'); if (ov) ov.remove(); }
  window.rapClosePicker = closePicker;

  window.rapApprove = function () {
    if (COMPS.length === 0) { toast('Add at least one component first'); return; }
    if (awaitingCount() > 0) { toast('All components must be provided by the supplier first'); return; }
    APPROVED = true; render(); toast('Product approved ✅');
  };
  window.rapDownloadDoC = function () { toast('Declaration of Conformity downloaded'); };
  window.rapReopen = function () { APPROVED = false; render(); toast('Product re-opened for editing'); };
  window.rapSendToSupplier = function () {
    APPROVED = false;
    var n = awaitingCount();
    render();
    toast(n > 0 ? 'Sent to ' + PROD.supplier + ' — ' + n + ' component' + (n > 1 ? 's' : '') + ' to complete' : 'Sent to ' + PROD.supplier + ' for review');
  };

  render();
})();
