/* ==========================================================================
   ra-product.js — Retailer Admin product detail (data-driven).
   Renders into #ra-prod-root. Shows the selected product, its expected
   packaging components (editable inline, like the supplier portal), lets the
   retailer add components the supplier must fill, and drives the review
   workflow: approve the product or send it back to the supplier as incomplete.
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
      comps.push({
        name: COMP_POOL[i % COMP_POOL.length],
        level: LEVELS[i % 3],
        material: provided ? MATERIALS[i % MATERIALS.length] : '',
        weight: provided ? String((2 + i * 7)) : '',
        pcr: provided ? String(50 + (i * 7) % 45) : '',
        recycle: provided ? RECYCLE[i % RECYCLE.length] : '',
        notes: '',
        status: provided ? 'Provided' : 'Awaiting'
      });
    }
    return comps;
  }

  var PROD = findProduct();
  var COMPS = buildComponents(PROD);
  var APPROVED = PROD.status === 'Complete';
  var openIdx = -1; /* which component card is expanded */

  /* ---- toast ---- */
  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  /* ---- derived product state ---- */
  function awaitingCount() { return COMPS.filter(function (c) { return c.status !== 'Provided'; }).length; }
  function statusPill() {
    if (APPROVED) return '<span class="pill pill-green">Retailer approved</span>';
    if (COMPS.length === 0) return '<span class="pill pill-grey">No components</span>';
    if (awaitingCount() === 0) return '<span class="pill pill-blue">Ready to approve</span>';
    return '<span class="pill" style="background:rgba(245,166,35,.14);color:#f5a623;border:1px solid rgba(245,166,35,.32)">Awaiting supplier</span>';
  }
  function compStatusPill(c) {
    if (c.status === 'Provided') return '<span class="pill pill-green" style="font-size:9px">Provided</span>';
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
      '.rap-comp{border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:11px;margin-bottom:10px;overflow:hidden;background:rgba(255,255,255,.02)}' +
      '.rap-comp-hdr{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;transition:background .14s}' +
      '.rap-comp-hdr:hover{background:rgba(255,255,255,.03)}' +
      '.rap-comp-name{font-size:13px;font-weight:600;color:var(--tw);flex-shrink:0}' +
      '.rap-comp-sum{font-size:11px;color:var(--tw3);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
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
      '.rap-comp-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--bw,rgba(255,255,255,.08))}' +
      '.rap-hdr-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
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
      '.rap-exp{position:relative;display:inline-flex;align-items:center}' +
      '.rap-exp-in{width:64px;padding:6px 24px 6px 10px !important;-moz-appearance:textfield;appearance:textfield;text-align:left}' +
      '.rap-exp-in::-webkit-outer-spin-button,.rap-exp-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}' +
      '.rap-exp-steps{position:absolute;right:4px;top:3px;bottom:3px;display:flex;flex-direction:column;justify-content:center;gap:2px}' +
      '.rap-exp-steps button{width:17px;height:12px;padding:0;border:none;background:rgba(255,255,255,.09);color:var(--tw2,rgba(255,255,255,.74));cursor:pointer;border-radius:3px;display:flex;align-items:center;justify-content:center}' +
      '.rap-exp-steps button:hover{background:var(--gs);color:#04130c}';
    document.head.appendChild(st);
  }

  /* ---- component card ---- */
  function compCard(c, i) {
    var open = i === openIdx;
    var missingHint = c.status !== 'Provided';
    function f(label, key, kind, opts) {
      var v = c[key] || '';
      var awaitTag = (missingHint && v === '') ? '<span class="await-tag">supplier to fill</span>' : '';
      var ctrl;
      if (kind === 'select') {
        var o = '<option value="">—</option>' + opts.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
        ctrl = '<select class="fi" onchange="rapEdit(' + i + ',\'' + key + '\',this.value)">' + o + '</select>';
      } else if (kind === 'num') {
        ctrl = '<input class="fi" type="number" value="' + esc(v) + '" placeholder="—" oninput="rapEdit(' + i + ',\'' + key + '\',this.value)">';
      } else {
        ctrl = '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="rapEdit(' + i + ',\'' + key + '\',this.value)">';
      }
      return '<div class="rap-f"><label>' + esc(label) + awaitTag + '</label>' + ctrl + '</div>';
    }
    var sum = c.status === 'Provided'
      ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR')
      : 'Awaiting supplier — details not yet provided';
    return '<div class="rap-comp' + (open ? ' open' : '') + '" data-i="' + i + '">' +
      '<div class="rap-comp-hdr" onclick="rapToggle(' + i + ')">' +
        '<span class="rap-comp-name">' + esc(c.name) + '</span>' +
        '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
        compStatusPill(c) +
        '<span class="rap-comp-sum">' + sum + '</span>' +
        '<svg class="rap-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</div>' +
      '<div class="rap-comp-body">' +
        '<div class="rap-grid">' +
          f('Component name', 'name', 'text') +
          f('Level', 'level', 'select', LEVELS) +
          f('Material', 'material', 'select', MATERIALS) +
          f('Weight (g)', 'weight', 'num') +
          f('PCR %', 'pcr', 'num') +
          f('Recyclability', 'recycle', 'select', RECYCLE) +
        '</div>' +
        '<div class="rap-f" style="margin-bottom:12px">' + '<label>Notes for supplier</label><input class="fi" type="text" value="' + esc(c.notes) + '" placeholder="e.g. confirm coating and ink type" oninput="rapEdit(' + i + ',\'notes\',this.value)"></div>' +
        '<div class="rap-comp-actions">' +
          '<label style="display:flex;align-items:center;gap:7px;font-size:11px;color:var(--tw2)">Status <select class="fi" style="width:auto;padding:5px 8px;font-size:11px" onchange="rapEdit(' + i + ',\'status\',this.value)"><option value="Awaiting"' + (c.status !== 'Provided' ? ' selected' : '') + '>Awaiting supplier</option><option value="Provided"' + (c.status === 'Provided' ? ' selected' : '') + '>Provided</option></select></label>' +
          '<button class="btn-g-sm" onclick="rapRemove(' + i + ')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg> Remove</button>' +
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
    var expOpts = ''; for (var eo = 1; eo <= 12; eo++) expOpts += '<option value="' + eo + '">';

    var header =
      '<div class="pg-hdr-bar"><div>' +
        '<div class="pg-title">' + esc(PROD.sku) + '</div>' +
        '<div class="pg-sub">' + esc(PROD.desc) + ' · ' + esc(PROD.cat) + ' · Supplier: ' + esc(PROD.supplier) + '</div>' +
      '</div><div class="pg-actions rap-hdr-actions">' +
        statusPill() +
        '<button class="btn-g" onclick="rapSendToSupplier()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send to supplier</button>' +
        (APPROVED
          ? '<button class="btn-g" onclick="rapReopen()">Re-open</button>'
          : '<button class="btn-p" ' + (canApprove ? '' : 'disabled style="opacity:.45;cursor:not-allowed"') + ' onclick="rapApprove()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:-2px;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>Approve product</span></button>') +
      '</div></div>';

    var banner =
      '<div class="rap-banner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
      '<div>Define the packaging components you expect for this product below. Fields left blank are flagged for <strong style="color:var(--tw)">' + esc(PROD.supplier) + '</strong> to complete. When every component is provided you can approve the product; otherwise send it back to the supplier as incomplete.</div></div>';

    var info =
      '<div class="grp" style="margin-bottom:12px"><div class="grp-hdr">Product details</div><div class="grp-body">' +
        '<div class="rap-grid" style="margin:0">' +
          '<div class="rap-f"><label>SKU</label><input class="fi" value="' + esc(PROD.sku) + '"></div>' +
          '<div class="rap-f"><label>Description</label><input class="fi" value="' + esc(PROD.desc) + '"></div>' +
          '<div class="rap-f"><label>Category</label><input class="fi" value="' + esc(PROD.cat) + '"></div>' +
          '<div class="rap-f"><label>Assigned supplier</label><input class="fi" value="' + esc(PROD.supplier) + '"></div>' +
        '</div>' +
      '</div></div>';

    var compCards = COMPS.map(compCard).join('') || '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No packaging components yet — add the ones you expect for this product.</div>';
    var comps =
      '<div class="grp" style="margin-bottom:12px"><div class="grp-hdr">Expected packaging components' +
        '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + COMPS.length + ' total · ' + awaiting + ' awaiting supplier</span>' +
        '<div style="margin-left:auto;display:flex;align-items:center;gap:12px">' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--tw2);white-space:nowrap"># expected' +
            '<span class="rap-exp">' +
              '<input type="text" inputmode="numeric" list="rap-exp-list" value="' + COMPS.length + '" class="fi rap-exp-in" onchange="rapSetExpected(this.value)" title="Number of packaging components you expect for this product — pick from the list or type a value">' +
              '<datalist id="rap-exp-list">' + expOpts + '</datalist>' +
              '<span class="rap-exp-steps">' +
                '<button type="button" tabindex="-1" aria-label="Increase" onclick="rapExpStep(1)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 15 12 9 18 15"/></svg></button>' +
                '<button type="button" tabindex="-1" aria-label="Decrease" onclick="rapExpStep(-1)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg></button>' +
              '</span>' +
            '</span>' +
          '</label>' +
          '<button class="btn-g-sm" onclick="rapAdd()"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add packaging component</button>' +
        '</div>' +
      '</div><div class="grp-body">' + compCards + '</div></div>';

    root.innerHTML = header + banner + info + comps;
  }

  /* ---- actions ---- */
  window.rapToggle = function (i) { openIdx = (openIdx === i ? -1 : i); render(); };
  window.rapEdit = function (i, key, val) {
    if (!COMPS[i]) return;
    COMPS[i][key] = val;
    if (key === 'status') { render(); return; }
    /* keep the card open while typing — only refresh the header pills lightly */
  };
  window.rapRemove = function (i) {
    var name = COMPS[i] ? COMPS[i].name : '';
    COMPS.splice(i, 1);
    if (openIdx === i) openIdx = -1; else if (i < openIdx) openIdx--;
    render(); toast('“' + name + '” removed');
  };
  function blankComp(name, level, material) {
    return { name: name || ('Component ' + (COMPS.length + 1)), level: level || 'Primary', material: material || '', weight: '', pcr: '', recycle: '', notes: '', status: 'Awaiting' };
  }
  function addComp(c) {
    COMPS.push(c);
    openIdx = COMPS.length - 1;
    render();
    var last = document.querySelector('.rap-comp[data-i="' + (COMPS.length - 1) + '"]');
    if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* set the number of expected components (retailer declares a count) */
  window.rapSetExpected = function (n) {
    n = Math.max(0, Math.min(20, parseInt(n, 10) || 0));
    if (n > COMPS.length) { while (COMPS.length < n) COMPS.push(blankComp()); }
    else if (n < COMPS.length) { COMPS.length = n; if (openIdx >= n) openIdx = -1; }
    render();
    toast(n + ' expected component' + (n === 1 ? '' : 's'));
  };
  window.rapExpStep = function (d) { window.rapSetExpected(COMPS.length + d); };

  /* Add packaging component -> picker (pick from library or create new),
     mirroring the supplier portal's add-component flow. */
  window.rapAdd = function () { openPicker(); };

  function openPicker() {
    var ov = document.getElementById('rap-picker'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'rap-picker'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) closePicker(); };
    ov.innerHTML =
      '<div class="rap-modal">' +
        '<div class="rap-modal-hdr"><span>Add packaging component</span>' +
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
    toast('“' + x.name + '” added — awaiting supplier detail');
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
    toast('“' + name.trim() + '” created — awaiting supplier detail');
  };
  function closePicker() { var ov = document.getElementById('rap-picker'); if (ov) ov.remove(); }
  window.rapClosePicker = closePicker;
  window.rapApprove = function () {
    if (awaitingCount() > 0) { toast('Some components are still awaiting the supplier'); return; }
    APPROVED = true; render(); toast('Product approved');
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
