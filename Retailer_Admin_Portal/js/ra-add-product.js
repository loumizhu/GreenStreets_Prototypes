/* ==========================================================================
   ra-add-product.js — Retailer Admin "New product" page (create manually).
   Renders into #ra-newprod-root. The retailer enters a product by hand:
     • Name is the first, required field; the SKU is auto-generated from it.
     • Optional description / category / assigned supplier.
     • Packaging components — add from the saved library OR create a new one
       (mirrors the supplier portal + the product-detail add-component flow).
     • Two finish paths: send to the supplier to complete the packaging data,
       or save the product with everything the retailer entered themselves.
   Reuses window.PKG_LIBRARY + go() from retailer-admin.js. Self-contained CSS
   (shares the .rap-* look with ra-product.js).
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ra-newprod-root')) return;

  var LEVELS = ['Primary', 'Secondary', 'Tertiary'];
  var MATERIALS = ['Recycled card', 'Corrugated card', 'FSC paper', 'Recycled plastic', 'LDPE plastic', 'PET plastic', 'Woven polyester', 'Wood', 'Glass', 'Aluminium', 'Other'];
  var RECYCLE = ['Widely recyclable', 'Check locally', 'Not currently recyclable'];
  var CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Homeware', 'Other'];
  var SUPPLIERS = ['Indotex Manufacturing', 'Luntai Packaging Co.', 'EcoPack GmbH', 'Nordic Materials AB', 'Verdepak S.A.', 'Hangzhou TextilePack'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* product being built */
  var PROD = { name: '', sku: '', desc: '', cat: '', supplier: '' };
  var COMPS = [];
  var openIdx = -1;
  var pendingHl = null; /* indices of just-added cards to pop-highlight after the next render */

  /* pop + orange-stroke highlight for freshly-added component cards, cascading
     one after the other when several are added at once (e.g. raising # expected) */
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

  /* next sequence number for the SKU (continues after the demo catalogue) */
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

  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  function injectCss() {
    if (document.getElementById('ra-prod-css') || document.getElementById('ra-nap-css')) return;
    var st = document.createElement('style'); st.id = 'ra-nap-css';
    st.textContent =
      '#ra-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f2338;border:1px solid var(--gs);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:9999}' +
      '#ra-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.rap-banner{display:flex;gap:11px;align-items:flex-start;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--tw2);line-height:1.6}' +
      '.rap-banner svg{color:#5b9cf6;flex-shrink:0;margin-top:1px}' +
      '.rap-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px;margin:12px 0}' +
      '@media(max-width:720px){.rap-grid{grid-template-columns:1fr}}' +
      '.rap-f{display:flex;flex-direction:column;gap:5px;min-width:0}' +
      '.rap-f label{font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;color:var(--tw3);display:flex;align-items:center;gap:6px}' +
      '.rap-f label .req{color:#f5a623}' +
      '.rap-f .fi{padding:7px 10px;font-size:12.5px}' +
      '.nap-sku{font-family:"SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.02em;color:var(--gs-l);font-weight:700;background:rgba(78,187,129,.06)}' +
      '.nap-sku-hint{font-size:10px;color:var(--tw3);font-weight:400;text-transform:none;letter-spacing:0}' +
      '.rap-comp{border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:11px;margin-bottom:10px;overflow:hidden;background:rgba(255,255,255,.02);transition:border-color .5s ease,box-shadow .5s ease}' +
      '.rap-comp-hdr{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;transition:background .14s}' +
      '.rap-comp-hdr:hover{background:rgba(255,255,255,.03)}' +
      '.rap-comp-name{font-size:13px;font-weight:600;color:var(--tw);flex-shrink:0}' +
      '.rap-comp-name-edit{outline:none;border:1px solid transparent;border-radius:5px;padding:2px 6px;margin:-2px -4px;cursor:text;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .14s,border-color .14s}' +
      '.rap-comp-name-edit:hover{background:rgba(255,255,255,.05);border-color:var(--bw,rgba(255,255,255,.14))}' +
      '.rap-comp-name-edit:focus{background:rgba(255,255,255,.08);border-color:var(--gs);overflow:visible;text-overflow:clip;max-width:none}' +
      '.rap-comp-name-edit:empty:before{content:"Component name";color:var(--tw3)}' +
      '.rap-comp-new{border-color:#f5a623!important;box-shadow:0 0 0 1px #f5a623,0 0 20px rgba(245,166,35,.38);animation:rapPop .5s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes rapPop{0%{transform:scale(.965)}45%{transform:scale(1.035)}100%{transform:scale(1)}}' +
      '.rap-exp{position:relative;display:inline-flex;align-items:center;gap:5px}' +
      '.rap-exp .cs-wrap,.rap-exp .rap-exp-sel{width:72px}' +
      '.rap-exp .cs-trigger,.rap-exp .rap-exp-sel{padding:6px 10px;font-size:12.5px}' +
      '.rap-exp-steps{display:flex;flex-direction:column;gap:2px;flex-shrink:0}' +
      '.rap-exp-steps button{width:20px;height:14px;padding:0;border:none;background:rgba(255,255,255,.09);color:var(--tw2,rgba(255,255,255,.74));cursor:pointer;border-radius:3px;display:flex;align-items:center;justify-content:center}' +
      '.rap-exp-steps button:hover{background:var(--gs);color:#04130c}' +
      '.rap-comp-sum{font-size:11px;color:var(--tw3);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.rap-chev{transition:transform .2s;color:var(--tw3);flex-shrink:0}' +
      '.rap-comp.open .rap-chev{transform:rotate(180deg)}' +
      '.rap-comp-body{display:none;padding:4px 14px 16px;border-top:1px solid var(--bw,rgba(255,255,255,.08))}' +
      '.rap-comp.open .rap-comp-body{display:block}' +
      '.rap-comp-actions{display:flex;justify-content:flex-end;align-items:center;gap:10px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--bw,rgba(255,255,255,.08))}' +
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
      '.nap-finish{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}' +
      '.nap-choice{flex:1;min-width:230px;text-align:left;border:1px solid var(--line-2,rgba(148,180,230,.26));border-radius:12px;padding:15px 16px;background:rgba(255,255,255,.03);cursor:pointer;transition:border-color .15s,background .15s;display:flex;flex-direction:column;gap:8px}' +
      '.nap-choice:hover{border-color:var(--gs);background:rgba(78,187,129,.06)}' +
      '.nap-choice h4{margin:0;font-size:13px;font-weight:650;color:var(--tw);display:flex;align-items:center;gap:8px}' +
      '.nap-choice p{margin:0;font-size:11.5px;line-height:1.55;color:var(--tw3)}' +
      '.nap-choice .nap-choice-cta{margin-top:auto;align-self:flex-start;font-size:11.5px;font-weight:650;color:var(--gs-l)}';
    document.head.appendChild(st);
  }

  function compCard(c, i) {
    var open = i === openIdx;
    function f(label, key, kind, opts) {
      var v = c[key] || '';
      var ctrl;
      if (kind === 'select') {
        var o = '<option value="">—</option>' + opts.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
        ctrl = '<select class="fi" onchange="napEdit(' + i + ',\'' + key + '\',this.value)">' + o + '</select>';
      } else if (kind === 'num') {
        ctrl = '<input class="fi" type="number" value="' + esc(v) + '" placeholder="—" oninput="napEdit(' + i + ',\'' + key + '\',this.value)">';
      } else {
        ctrl = '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="napEdit(' + i + ',\'' + key + '\',this.value)">';
      }
      return '<div class="rap-f"><label>' + esc(label) + '</label>' + ctrl + '</div>';
    }
    var filled = (c.material || c.weight || c.pcr);
    var sum = filled ? esc((c.material || '—') + ' · ' + (c.weight || '—') + ' g · ' + (c.pcr || '0') + '% PCR') : 'No details yet — you can fill these or leave them for the supplier';
    return '<div class="rap-comp' + (open ? ' open' : '') + '" data-i="' + i + '">' +
      '<div class="rap-comp-hdr" onclick="napToggle(' + i + ')">' +
        '<span class="rap-comp-name rap-comp-name-edit" contenteditable="true" spellcheck="false" title="Click to rename this component" ' +
          'onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" onkeydown="napTitleKey(event)" oninput="napEditName(' + i + ',this.textContent)">' + esc(c.name) + '</span>' +
        '<span class="pill ' + (c.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '" style="font-size:9px">' + esc(c.level) + '</span>' +
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
        '<div class="rap-comp-actions">' +
          '<button class="btn-g-sm" onclick="napRemove(' + i + ')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg> Remove</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    injectCss();
    var root = document.getElementById('ra-newprod-root');

    var header =
      '<div class="pg-hdr-bar"><div>' +
        '<div class="pg-title">New product</div>' +
        '<div class="pg-sub">Add a product to your catalogue manually</div>' +
      '</div><div class="pg-actions">' +
        '<button class="btn-g" onclick="go(\'ra6\')">Cancel</button>' +
      '</div></div>';

    var banner =
      '<div class="rap-banner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
      '<div>Give the product a <strong style="color:var(--tw)">name</strong> — its SKU is generated for you. Add the packaging components it ships in from your library or create new ones. When you\'re done, either <strong style="color:var(--tw)">send it to the supplier</strong> to complete the packaging data, or <strong style="color:var(--tw)">save it yourself</strong> with everything filled in.</div></div>';

    var catOpts = '<option value="">Select a category…</option>' + CATEGORIES.map(function (x) { return '<option' + (x === PROD.cat ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    var supOpts = '<option value="">Unassigned</option>' + SUPPLIERS.map(function (x) { return '<option' + (x === PROD.supplier ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');

    var info =
      '<div class="grp" style="margin-bottom:12px"><div class="grp-hdr">Product details</div><div class="grp-body">' +
        '<div class="rap-grid" style="margin:0">' +
          '<div class="rap-f"><label>Product name <span class="req">*</span></label><input class="fi" id="nap-name" value="' + esc(PROD.name) + '" placeholder="e.g. Black Crew Neck Sweatshirt" oninput="napName(this.value)"></div>' +
          '<div class="rap-f"><label>SKU <span class="nap-sku-hint">· auto-generated</span></label><input class="fi nap-sku" id="nap-sku" value="' + esc(PROD.sku) + '" readonly title="Generated automatically from the product name"></div>' +
          '<div class="rap-f"><label>Description</label><input class="fi" value="' + esc(PROD.desc) + '" placeholder="Short description" oninput="napEditProd(\'desc\',this.value)"></div>' +
          '<div class="rap-f"><label>Category</label><select class="fi" onchange="napEditProd(\'cat\',this.value)">' + catOpts + '</select></div>' +
          '<div class="rap-f"><label>Assigned supplier</label><select class="fi" onchange="napEditProd(\'supplier\',this.value)">' + supOpts + '</select></div>' +
        '</div>' +
      '</div></div>';

    var expMax = Math.max(12, COMPS.length);
    var expOpts = ''; for (var eo = 1; eo <= expMax; eo++) expOpts += '<option value="' + eo + '"' + (eo === COMPS.length ? ' selected' : '') + '>' + eo + '</option>';
    var compCards = COMPS.map(compCard).join('') || '<div style="padding:16px;text-align:center;color:var(--tw3);font-size:12px">No packaging components yet — add the ones you expect this product to ship in.</div>';
    var comps =
      '<div class="grp" style="margin-bottom:12px"><div class="grp-hdr">Expected packaging components' +
        '<span style="margin-left:8px;font-size:10px;font-weight:600;color:var(--tw3)">' + COMPS.length + ' added</span>' +
        '<div style="margin-left:auto;display:flex;align-items:center;gap:12px">' +
          '<span style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--tw2);white-space:nowrap"># expected' +
            '<span class="rap-exp">' +
              '<select id="nap-exp-sel" class="fi rap-exp-sel" onchange="napSetExpected(this.value)" title="Number of packaging components you expect for this product — pick from the list or step up/down">' + expOpts + '</select>' +
              '<span class="rap-exp-steps">' +
                '<button type="button" tabindex="-1" aria-label="Increase" onclick="napExpStep(1)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 15 12 9 18 15"/></svg></button>' +
                '<button type="button" tabindex="-1" aria-label="Decrease" onclick="napExpStep(-1)"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg></button>' +
              '</span>' +
            '</span>' +
          '</span>' +
          '<button class="btn-g-sm" onclick="napAdd()"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add packaging component</button>' +
        '</div>' +
      '</div><div class="grp-body">' + compCards + '</div></div>';

    var finish =
      '<div class="grp"><div class="grp-hdr">Save this product</div><div class="grp-body">' +
        '<div class="nap-finish">' +
          '<div class="nap-choice" onclick="napSendToSupplier()">' +
            '<h4><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gs-l)" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send to supplier to complete</h4>' +
            '<p>Create the product and invite the assigned supplier to fill in the packaging details you left blank.</p>' +
            '<span class="nap-choice-cta">Create &amp; send →</span>' +
          '</div>' +
          '<div class="nap-choice" onclick="napSaveSelf()">' +
            '<h4><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gs-l)" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>I\'ll enter everything myself</h4>' +
            '<p>Save the product now with the information you\'ve entered. You can keep editing its packaging any time.</p>' +
            '<span class="nap-choice-cta">Save product →</span>' +
          '</div>' +
        '</div>' +
      '</div></div>';

    root.innerHTML = header + banner + info + comps + finish;

    var expSel = document.getElementById('nap-exp-sel');
    if (expSel && window.GSEnhanceSelects) window.GSEnhanceSelects(expSel.parentNode);

    flushHighlight();
  }

  /* ---- product field edits ---- */
  window.napName = function (v) {
    PROD.name = v;
    PROD.sku = v.trim() ? genSku(v) : '';
    var skuEl = document.getElementById('nap-sku'); if (skuEl) skuEl.value = PROD.sku;
  };
  window.napEditProd = function (key, v) { PROD[key] = v; };

  /* ---- components ---- */
  window.napToggle = function (i) { openIdx = (openIdx === i ? -1 : i); render(); };
  window.napEdit = function (i, key, val) { if (COMPS[i]) COMPS[i][key] = val; };
  /* inline title edit — no re-render (keeps the contenteditable focus/caret) */
  window.napEditName = function (i, val) { if (COMPS[i]) COMPS[i].name = (val || '').replace(/\n/g, ' '); };
  window.napTitleKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
  /* # expected count — add blanks / trim from the end (nothing is supplier-provided yet) */
  function applyExpected(n) {
    if (n > COMPS.length) { pendingHl = []; while (COMPS.length < n) { pendingHl.push(COMPS.length); COMPS.push(blankComp()); } }
    else if (n < COMPS.length) { COMPS.length = n; if (openIdx >= n) openIdx = -1; }
    render();
    toast(n + ' expected component' + (n === 1 ? '' : 's'));
  }
  window.napSetExpected = function (n) {
    n = Math.max(0, Math.min(20, parseInt(n, 10) || 0));
    if (n === COMPS.length) { render(); return; }
    applyExpected(n);
  };
  window.napExpStep = function (d) { window.napSetExpected(COMPS.length + d); };
  window.napRemove = function (i) {
    var name = COMPS[i] ? COMPS[i].name : '';
    COMPS.splice(i, 1);
    if (openIdx === i) openIdx = -1; else if (i < openIdx) openIdx--;
    render(); toast('“' + name + '” removed');
  };
  function blankComp(name, level, material) {
    return { name: name || ('Component ' + (COMPS.length + 1)), level: level || 'Primary', material: material || '', weight: '', pcr: '', recycle: '', notes: '' };
  }
  function addComp(c) {
    COMPS.push(c); openIdx = COMPS.length - 1; pendingHl = [COMPS.length - 1]; render();
    var last = document.querySelector('.rap-comp[data-i="' + (COMPS.length - 1) + '"]');
    if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---- add-component picker: library OR create new (mirrors supplier portal) ---- */
  window.napAdd = function () { openPicker(); };
  function openPicker() {
    var ov = document.getElementById('nap-picker'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'nap-picker'; ov.className = 'rap-modal-ov';
    ov.onclick = function (e) { if (e.target === ov) closePicker(); };
    ov.innerHTML =
      '<div class="rap-modal">' +
        '<div class="rap-modal-hdr"><span>Add packaging component</span>' +
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
    closePicker(); addComp(blankComp(x.name, x.level, x.material));
    toast('“' + x.name + '” added');
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
    closePicker(); addComp(blankComp(name.trim(), level, ''));
    toast('“' + name.trim() + '” created');
  };
  function closePicker() { var ov = document.getElementById('nap-picker'); if (ov) ov.remove(); }
  window.napClosePicker = closePicker;

  /* ---- finish paths ---- */
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
    try { sessionStorage.setItem('ra_flash', JSON.stringify({ sku: PROD.sku, name: PROD.name.trim(), sent: true })); } catch (e) {}
    toast('“' + PROD.name.trim() + '” created — sent to ' + who + ' to complete');
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
