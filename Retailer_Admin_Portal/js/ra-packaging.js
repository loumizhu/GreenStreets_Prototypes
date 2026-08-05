/* ==========================================================================
   ra-packaging.js — Retailer Admin packaging detail (data-driven, editable).
   Renders into #ra-pkg-root. Shows one packaging component with the same
   numbered sections + field labels as the GreenStreets (super) admin packaging
   detail. A top "Edit" toggle flips every field between read-only and editable;
   values round-trip through the in-memory PACKAGINGS_RA row.
   Depends on window.PACKAGINGS_RA + go() from retailer-admin.js.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ra-pkg-root')) return;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- option lists (same taxonomy as the super-admin packaging schema) ---- */
  var TYPE_OPTS = ['Attacher/Tie (Barb)','Attacher/Tie (Cable tie)','Attacher/Tie (Elastic thread)','Attacher/Tie (Paper twisted)','Attacher/Tie (Shuttlelock)','Attacher/Tie (Thread)','Attacher/Tie (Twine)','Bag (Poly + Adhesive)','Bag (Poly Zip lock)','Bag (Poly)','Bag + Hook (Poly)','Band','Blister pack','Bottle (Beverage)','Bottle (Non-Beverage)','Box/Carton','Box/Carton + Hook','Box/Carton with plastic window','Bucket','Cable ties','Can (Aerosol)','Can/Box (Tin Plated Steel)','Cap','Cap + Brush','Card (Display eg. jewellry)','Card (Over-rider)','Cascade + Hook (Waterfall)','Cascade (Waterfall)','Clip','Collar','Cup','Display Unit CDU (Counter top)','Display Unit FSDU (Floor Standing)','Display Unit SRP (Shelf Ready Packaging)','Dropper','Edge Protector','Envelope','Envelope + Hook','Filling (Dunnage)','Void Filler / Cushioning','Film','Film (Lidding)','Foil','Godet','Handle','Hanger (Cardboard Hanger)','Hanger (Clip Hanger)','Hanger (Plastic Hanger)','Hanger (Plastic Hanger with Metal Hook)','Hook','Insert (Backing)','Insert (Butterfly top button)','Insert (Collar)','Insert (Cuff)','Insert (Divider)','Insert (Header)','Jar','Label (Booklet)','Leaflet (Instruction)','Lid','Lipstick','Net/Netting','Pallet (reusable e.g. CHEP)','Pallet Corner (edge post)','Pallet Cover','Pallet Label','Pallet Layer Pad','Pallette + Hinge top (Make-up)','Paper Sheet','Pencil','Pencil (twist lip/eye)','Plug','Pot','Pouch','Pump','Ribbon','Sachet','Seal','Self Adhesive Label (Peel & Read)','Self Adhesive Label (Single)','Shipper','Shrink Wrap','Skewer','Sleeve','Spring','Strapping','Stretch Wrap','Swing Tag','Tape','Tray','Trigger','Tub','Tube','Vac Pac Bag','Wrap band'];
  var SOURCE_OPTS = ['Local','Primark Preferred','Primark Nominated','Primark Nominated (Plastic Hangers - Apparel)','Primark Nominated (Plastic Hangers - Footwear)','Primark Nominated (Cardboard Hangers - Babywear)','Primark Nominated (Cardboard Hangers - Lingerie)'];
  var BASEMAT_OPTS = ['Paper_Cardboard','Cardboard_CartonBoard','Cardboard_CartonBoard_Laminated','Composite','Composite_Paper_Metal','Composite_Paper_Plastic','Corrugate','Corrugate_Microflute','Glass','Metal','Other','Paper','Paper_Laminated','Plastic_Multilayer_Composite','Plastic_Single_MonoLayer','Wood'];
  var EVIDENCE_OPTS = ['Product specification','Contracts','Production certificates and certificates of conformity','Business accounting systems','Accreditations and international standards','Quality assurance audits','Sales and purchase invoices','Other (Please state)'];
  var COLOUR_OPTS = ['Clear','Natural','Black','Blue','White','Brown','Green','Red','Orange','Yellow','Multi','Other'];
  var OPACITY_OPTS = ['Colourless','Coloured - translucent','Coloured - opaque and sortable','Coloured - dark and non-sortable'];
  var DECORATION_OPTS = ['None','Other','Printed - Flexo','Printed - Offset Litho','Printed - Gravure','Hot foil','Cold foil','Metalised','Fluorescent'];
  var CERT_OPTS = ['None','N/A','PEFC','FSC','FSC Mixed','FSC Recycled','RCS','GRS','OEKOTEX','Other'];
  var MATCOMP_OPTS = ['No','TPCH/PROP65 only','REACH/EU directive 94/62/EC only','TPCH/PROP65/REACH/EU directive 94/62/EC'];
  var CHLORINE_OPTS = ['None','EC (Elemental Chlorine)','ECF (Elemental Chlorine Free)','PCF (Processed Chlorine Free)','TCF Total Chlorine Free'];
  var YESNO = ['Yes','No'];

  /* ---- section schema (numbers + labels mirror the super-admin detail) ---- */
  var SECTIONS = [
    { n: 1, title: 'Packaging Level & Format', fields: [
      { label: 'Packaging Level', key: 'level', seg: ['Primary','Secondary','Tertiary'] },
      { label: 'Packaging Type (name)', key: 'type', type: 'select', opts: TYPE_OPTS },
      { label: 'Other Packaging Type Description', key: 'typeOther', type: 'text' }
    ]},
    { n: 2, title: 'Packaging Source Type', fields: [
      { label: 'Packaging Source Type', key: 'source', type: 'select', opts: SOURCE_OPTS }
    ]},
    { n: 3, title: 'Material Information', mat: true, fields: [
      { label: 'Base Material', key: 'baseMat', type: 'select', opts: BASEMAT_OPTS },
      { label: 'Total of all the materials', key: 'matTotal', type: 'text' }
    ]},
    { n: 4, title: 'Post-Consumer & Post-Industrial Recycled Content', fields: [
      { label: 'Recycled Content', key: 'recycled', toggle: true },
      { label: 'Post-Consumer Recycled Content (%)', key: 'pcr', pct: true },
      { label: 'Post-Industrial Recycled Content (%)', key: 'pir', pct: true },
      { label: 'Supporting evidence of recycled content', key: 'evidence', type: 'select', opts: EVIDENCE_OPTS },
      { label: 'Recycled Content Comments', key: 'recComments', type: 'text' }
    ]},
    { n: 5, title: 'Colour & Decoration', fields: [
      { label: 'Material Colour', key: 'colour', type: 'select', opts: COLOUR_OPTS },
      { label: 'Opacity', key: 'opacity', type: 'select', opts: OPACITY_OPTS },
      { label: 'Decoration', key: 'decoration', type: 'select', opts: DECORATION_OPTS }
    ]},
    { n: 6, title: 'Weight & Grammage', fields: [
      { label: 'Weight (g)', key: 'weight', type: 'text' },
      { label: 'Grammage (gsm)', key: 'grammage', type: 'text' },
      { label: 'Gauge in Micron (um)', key: 'gauge', type: 'text' }
    ]},
    { n: 7, title: 'Material Dimensions', fields: [
      { label: 'Length (mm) (or diameter if applicable)', key: 'length', type: 'text' },
      { label: 'Width (mm)', key: 'width', type: 'text' },
      { label: 'Height or Depth (mm)', key: 'height', type: 'text' }
    ]},
    { n: 8, title: 'Additional Packaging Information', docs: true, fields: [
      { label: 'Certification', key: 'cert', type: 'select', opts: CERT_OPTS },
      { label: 'Other Certification Details', key: 'certOther', type: 'text' },
      { label: 'Packaging Supplier Name', key: 'pkgSupplier', type: 'text' },
      { label: 'Packaging Supplier Address', key: 'pkgSupplierAddr', type: 'text' }
    ]},
    { n: 9, title: 'Material Compliance', fields: [
      { label: 'Material Compliance', key: 'matCompliance', type: 'select', opts: MATCOMP_OPTS },
      { label: 'Does the material and/or inks contain mineral oils above allowable limits?', key: 'mineralOils', toggle: true },
      { label: 'Does the material contain BPA above allowable limits?', key: 'bpa', toggle: true },
      { label: 'Does the material contain PFAs?', key: 'pfas', toggle: true },
      { label: 'Is chlorine used in the manufacture of the material/component?', key: 'chlorine', type: 'select', opts: CHLORINE_OPTS }
    ]}
  ];

  /* ---- find the packaging + seed an editable model ---- */
  function findPackaging() {
    var list = window.PACKAGINGS_RA || [];
    var id = null;
    try { id = sessionStorage.getItem('ra_pkg'); } catch (e) {}
    var row = null;
    if (id) row = list.filter(function (x) { return x.id === id; })[0];
    return row || list[0] || { id: 'pk-000', type: 'Packaging', level: 'Primary', matGroup: 'paper', sku: '—', desc: 'Product', supplier: '—', material: '', weight: '', pcr: '', recycle: '', status: 'Pending', pill: 'pill-grey' };
  }
  var TYPE_MAP = { 'Swing tag': 'Swing Tag', 'Box / carton': 'Box/Carton', 'Poly bag': 'Bag (Poly)', 'Hanger': 'Hanger (Plastic Hanger)', 'Tissue paper': 'Paper Sheet', 'Shipping carton': 'Shipper' };
  var BASEMAT_MAP = { paper: 'Paper_Cardboard', plastic: 'Plastic_Single_MonoLayer', corrugated: 'Corrugate' };
  /* canonical compliance records — identical to the Super Admin / Retailer User
     packaging detail pages, so all three portals show the same information. */
  var CANONICAL = {
    'Swing Tag': {
      level: 'Primary', type: 'Swing Tag', typeOther: '—', source: 'Local',
      baseMat: 'Paper_Cardboard', mat1: '—', mat1pct: '—', matTotal: '—',
      recycled: 'No', pcr: '—', pir: '—', evidence: '', recComments: '—',
      colour: '', opacity: 'Coloured - opaque and sortable', decoration: 'Printed - Flexo',
      weight: '1.72', grammage: '300', gauge: '—',
      length: '139', width: '40', height: '0.036',
      cert: 'OEKOTEX', certOther: '—', pkgSupplier: 'Misma', pkgSupplierAddr: 'Motijheel, Dhaka',
      matCompliance: 'No', mineralOils: 'No', bpa: 'No', pfas: 'No', chlorine: 'None'
    }
  };
  function seed(row) {
    var canon = CANONICAL[TYPE_MAP[row.type] || row.type];
    if (canon) return JSON.parse(JSON.stringify(canon));
    return {
      level: row.level || 'Primary',
      type: TYPE_MAP[row.type] || row.type || '',
      typeOther: '',
      source: 'Local',
      baseMat: BASEMAT_MAP[row.matGroup] || '',
      mat1: '', mat1pct: '', matTotal: '',
      recycled: row.pcr ? 'Yes' : 'No',
      pcr: row.pcr || '', pir: '',
      evidence: '', recComments: '',
      colour: '', opacity: '', decoration: '',
      weight: row.weight || '', grammage: '', gauge: '',
      length: '', width: '', height: '',
      cert: '', certOther: '', pkgSupplier: row.supplier || '', pkgSupplierAddr: '',
      matCompliance: 'No', mineralOils: 'No', bpa: 'No', pfas: 'No', chlorine: 'None'
    };
  }

  var ROW = findPackaging();
  var PKG = seed(ROW);
  /* dynamic materials + supporting documents (mirrors the super-admin detail) */
  PKG.materials = [{ name: PKG.mat1 || '—', pct: PKG.mat1pct || '—' }];
  PKG.docs = PKG.docs || [];
  /* Retailer Admin packaging detail is always directly editable (no Edit toggle),
     matching the super-admin Packaging detail. */
  var EDITING = true;

  /* ---- toast ---- */
  function toast(msg) {
    var t = document.getElementById('ra-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }

  /* ---- styles ---- */
  function injectCss() {
    if (document.getElementById('ra-pkg-css')) return;
    var st = document.createElement('style'); st.id = 'ra-pkg-css';
    st.textContent =
      '#ra-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f2338;border:1px solid var(--gs);color:#fff;padding:10px 18px;border-radius:9px;font-size:12.5px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:9999}' +
      '#ra-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.rpk-wrap{max-width:760px}' +
      '.rpk-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}' +
      '.rpk-head-actions{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap}' +
      '.rpk-sec{border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:12px;margin-bottom:12px;overflow:hidden;background:rgba(255,255,255,.02)}' +
      '.rpk-sec-hdr{display:flex;align-items:center;gap:10px;padding:12px 15px;font-size:13px;font-weight:650;color:var(--tw);background:rgba(255,255,255,.03);border-bottom:1px solid var(--bw,rgba(255,255,255,.08))}' +
      '.rpk-sec-num{width:22px;height:22px;flex-shrink:0;border-radius:50%;background:var(--gs);color:#04130c;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}' +
      '.rpk-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px 20px;padding:15px}' +
      '@media(max-width:720px){.rpk-grid{grid-template-columns:1fr}}' +
      '.rpk-f{display:flex;flex-direction:column;gap:5px;min-width:0}' +
      '.rpk-f.rpk-wide{grid-column:1/-1}' +
      '.rpk-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;color:var(--tw3)}' +
      '.rpk-f .fi{padding:7px 10px;font-size:12.5px}' +
      '.rpk-in{padding:7px 10px;font-size:12.5px;width:100%;box-sizing:border-box;background:rgba(255,255,255,.02);border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:8px;color:var(--tw2,rgba(255,255,255,.82));font-family:inherit}' +
      '.rpk-in[data-empty="1"]{color:var(--tw3,rgba(255,255,255,.45))}' +
      '.rpk-lbl-row{display:flex;align-items:center;justify-content:space-between;gap:6px}' +
      '.rpk-matrow{display:grid;grid-template-columns:1fr 1fr;gap:13px 20px}' +
      '@media(max-width:720px){.rpk-matrow{grid-template-columns:1fr}}' +
      '.rpk-matcol{display:flex;flex-direction:column;gap:5px;min-width:0}' +
      '.rpk-mat-rm{background:transparent;border:none;color:var(--tw3);cursor:pointer;padding:2px;display:inline-flex;border-radius:4px;flex-shrink:0}' +
      '.rpk-mat-rm:hover{color:var(--red,#e0605a);background:rgba(224,96,90,.14)}' +
      '.rpk-mat-add,.rpk-doc-add{display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:rgba(78,187,129,.1);border:1px dashed rgba(78,187,129,.45);color:var(--gs);border-radius:8px;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:background .12s}' +
      '.rpk-mat-add{grid-column:1/-1;margin-top:2px}' +
      '.rpk-mat-add:hover,.rpk-doc-add:hover{background:rgba(78,187,129,.18)}' +
      '.rpk-doc-add{align-self:flex-start;padding:7px 12px;margin-top:6px}' +
      '.rpk-docs{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0}' +
      '.rpk-doc-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;font-size:11px;background:rgba(255,255,255,.05);border:1px solid var(--line-2,rgba(148,180,230,.26));border-radius:7px;color:var(--tw2,rgba(255,255,255,.82))}' +
      '.rpk-doc-chip button{background:transparent;border:none;color:var(--tw3);cursor:pointer;font-size:14px;line-height:1;padding:0 1px}' +
      '.rpk-doc-chip button:hover{color:var(--red,#e0605a)}' +
      /* segmented choice list (e.g. Packaging Level) */
      '.rpk-seg{display:flex;flex-wrap:wrap;gap:5px}' +
      '.rpk-seg-opt{font-family:inherit;font-size:12px;font-weight:600;color:var(--tw2,rgba(255,255,255,.72));background:rgba(255,255,255,.05);border:1px solid var(--line-2,rgba(148,180,230,.26));border-radius:7px;padding:6px 12px;cursor:pointer;transition:all .12s}' +
      '.rpk-seg-opt:hover{background:rgba(255,255,255,.1);color:#fff}' +
      '.rpk-seg-opt.on{background:var(--gs);border-color:var(--gs);color:#04130c}' +
      /* Yes/No toggle switch */
      '.rpk-toggle{display:inline-flex;align-items:center;gap:9px;background:transparent;border:none;cursor:pointer;font-family:inherit;padding:2px 0;align-self:flex-start}' +
      '.rpk-toggle-track{position:relative;width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.2);transition:background .16s,border-color .16s;flex-shrink:0}' +
      '.rpk-toggle-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:left .16s}' +
      '.rpk-toggle.on .rpk-toggle-track{background:var(--gs);border-color:var(--gs)}' +
      '.rpk-toggle.on .rpk-toggle-thumb{left:20px}' +
      '.rpk-toggle-lbl{font-size:12.5px;font-weight:600;color:var(--tw,#fff)}' +
      /* % slider + number stepper */
      '.rpk-pct{display:flex;align-items:center;gap:12px;margin-top:2px}' +
      '.rpk-pct-slider{-webkit-appearance:none;appearance:none;flex:1;min-width:90px;height:6px;border-radius:999px;background:linear-gradient(90deg,var(--gs) var(--gs-pct,0%),rgba(255,255,255,.16) var(--gs-pct,0%));cursor:pointer}' +
      '.rpk-pct-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--gs);box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer}' +
      '.rpk-pct-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--gs);cursor:pointer}' +
      '.rpk-pct-numwrap{position:relative;flex-shrink:0}' +
      '.rpk-pct-num{width:78px;font-size:13px;color:#fff;font-weight:600;background:rgba(255,255,255,.07);border:1px solid rgba(91,156,246,.4);border-radius:6px;padding:5px 24px 5px 8px;font-family:inherit}' +
      '.rpk-pct-num:focus{outline:none;border-color:var(--gs);background:rgba(78,187,129,.08)}' +
      '.rpk-pct-numwrap .fi-unit{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:12px;color:rgba(255,255,255,.5);pointer-events:none}';
    document.head.appendChild(st);
  }

  /* ---- rich edit controls (mirror the super-admin engine) ---- */
  function segWidget(key, val, opts) {
    return '<div class="rpk-seg">' + opts.map(function (o) {
      return '<button type="button" class="rpk-seg-opt' + (o === val ? ' on' : '') + '" onclick="rpkSegPick(this,\'' + key + '\',\'' + esc(o) + '\')">' + esc(o) + '</button>';
    }).join('') + '</div>';
  }
  function toggleWidget(key, val) {
    var on = /yes/i.test(val || '');
    return '<button type="button" class="rpk-toggle' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-key="' + key + '" onclick="rpkToggleField(this)">' +
      '<span class="rpk-toggle-track"><span class="rpk-toggle-thumb"></span></span><span class="rpk-toggle-lbl">' + (on ? 'Yes' : 'No') + '</span></button>';
  }
  function pctWidget(attr, rawval) {
    var n = parseFloat(String(rawval).replace(/[^0-9.]/g, '')); if (isNaN(n)) n = 0; n = Math.max(0, Math.min(100, n));
    return '<div class="rpk-pct" ' + attr + ' style="--gs-pct:' + n + '%">' +
      '<input type="range" min="0" max="100" step="1" class="rpk-pct-slider" value="' + n + '" oninput="rpkPctApply(this)">' +
      '<div class="rpk-pct-numwrap"><input type="number" min="0" max="100" step="1" class="rpk-pct-num fi" value="' + n + '" oninput="rpkPctApply(this)"><span class="fi-unit">%</span></div></div>';
  }

  /* ---- field renderer ---- */
  function field(f) {
    var v = PKG[f.key] != null ? PKG[f.key] : '';
    var wide = (f.key === 'pkgSupplierAddr' || f.key === 'recComments' || f.label.length > 48);
    var ctrl;
    if (f.seg) {
      ctrl = segWidget(f.key, v || f.seg[0], f.seg);
    } else if (f.toggle) {
      ctrl = toggleWidget(f.key, v);
    } else if (f.pct) {
      ctrl = pctWidget('data-key="' + f.key + '"', v);
    } else if (!EDITING) {
      var disp = (v === '' || v == null) ? '—' : v;
      ctrl = '<input class="rpk-in" value="' + esc(disp) + '"' + (disp === '—' ? ' data-empty="1"' : '') + ' readonly>';
    } else if (f.type === 'select') {
      var opts = f.opts.slice();
      if (v && opts.indexOf(v) === -1) opts.unshift(v);
      var o = '<option value="">Select…</option>' + opts.map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
      ctrl = '<select class="fi" onchange="rpkEdit(\'' + f.key + '\',this.value)">' + o + '</select>';
    } else {
      ctrl = '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="rpkEdit(\'' + f.key + '\',this.value)">';
    }
    return '<div class="rpk-f' + (wide ? ' rpk-wide' : '') + '"><div class="rpk-lbl">' + esc(f.label) + '</div>' + ctrl + '</div>';
  }
  /* ---- dynamic materials (Add material) ---- */
  function materialsHtml() {
    var rows = PKG.materials.map(function (m, i) {
      var n = i + 1;
      var rm = PKG.materials.length > 1
        ? '<button type="button" class="rpk-mat-rm" title="Remove this material" onclick="rpkMatRemove(' + i + ')"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
        : '';
      var editing = EDITING;
      var nameCtrl = editing
        ? '<input class="fi" type="text" value="' + esc(m.name === '—' ? '' : m.name) + '" placeholder="Enter material" oninput="rpkMatEdit(' + i + ',\'name\',this.value)">'
        : '<input class="rpk-in" value="' + esc(m.name || '—') + '"' + ((m.name || '—') === '—' ? ' data-empty="1"' : '') + ' readonly>';
      var pctCtrl = editing
        ? pctWidget('data-mat="' + i + '"', m.pct)
        : '<input class="rpk-in" value="' + esc(m.pct || '—') + '"' + ((m.pct || '—') === '—' ? ' data-empty="1"' : '') + ' readonly>';
      return '<div class="rpk-f rpk-wide"><div class="rpk-matrow">' +
        '<div class="rpk-matcol"><div class="rpk-lbl rpk-lbl-row"><span>Material ' + n + ' Name</span>' + rm + '</div>' + nameCtrl + '</div>' +
        '<div class="rpk-matcol"><div class="rpk-lbl">% Material ' + n + '</div>' + pctCtrl + '</div>' +
        '</div></div>';
    }).join('');
    var addBtn = EDITING ? '<button type="button" class="rpk-mat-add" onclick="rpkMatAdd()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> Add material</button>' : '';
    return rows + addBtn;
  }

  /* ---- supporting documents (Add document) ---- */
  function docsHtml() {
    var chips = PKG.docs.map(function (d, i) {
      var x = EDITING ? '<button type="button" title="Remove" onclick="rpkDocRemove(' + i + ')">&times;</button>' : '';
      return '<span class="rpk-doc-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' + esc(d) + x + '</span>';
    }).join('');
    var empty = PKG.docs.length ? '' : '<span class="rpk-lbl" style="text-transform:none;letter-spacing:0">No documents attached yet.</span>';
    var addBtn = EDITING ? '<button type="button" class="rpk-doc-add" onclick="rpkDocAdd()"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> Add document</button>' : '';
    return '<div class="rpk-f rpk-wide"><div class="rpk-lbl">Supporting Documents</div>' +
      '<div class="rpk-docs">' + chips + empty + '</div>' + addBtn + '</div>';
  }

  function section(s) {
    var inner;
    if (s.mat) {
      /* Base Material · dynamic material rows · Add material · Total */
      inner = field(s.fields[0]) + materialsHtml() + field(s.fields[1]);
    } else if (s.docs) {
      inner = s.fields.map(field).join('') + docsHtml();
    } else {
      inner = s.fields.map(field).join('');
    }
    return '<div class="rpk-sec"><div class="rpk-sec-hdr"><span class="rpk-sec-num">' + s.n + '</span>' + esc(s.title) + '</div>' +
      '<div class="rpk-grid">' + inner + '</div></div>';
  }

  /* ---- render ---- */
  function render() {
    injectCss();
    var root = document.getElementById('ra-pkg-root');
    var crumb = document.getElementById('ra-pkg-crumb'); if (crumb) crumb.textContent = ROW.type;

    var statusPill = '<span class="pill ' + (ROW.pill || 'pill-grey') + '">' + esc(ROW.status || 'Pending') + '</span>';
    var levelPill = '<span class="pill ' + (PKG.level === 'Primary' ? 'pill-blue' : 'pill-grey') + '">' + esc(PKG.level || 'Primary') + '</span>';

    var head =
      '<div class="rpk-head"><div>' +
        '<div class="pg-title">' + esc(ROW.type) + '</div>' +
        '<div class="pg-sub">' + esc(ROW.sku) + ' · ' + esc(ROW.desc) + ' · Supplier: ' + esc(ROW.supplier) + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:8px">' + levelPill + statusPill + '</div>' +
      '</div><div class="rpk-head-actions">' +
        '<button class="btn-g" onclick="rpkDuplicate()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Duplicate</button>' +
        '<button class="btn-g" onclick="rpkDownloadDoC()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-14"/></svg>Download DoC</button>' +
      '</div></div>';

    var body = SECTIONS.map(section).join('');

    var footer = '<div style="margin-top:14px"><button class="btn-g" onclick="go(\'ra5\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-10"/></svg>Back to packaging components</button></div>';

    root.innerHTML = '<div class="rpk-wrap">' + head + body + footer + '</div>';
    if (EDITING && window.GSEnhanceSelects) window.GSEnhanceSelects(root);
  }

  /* ---- actions ---- */
  window.rpkEdit = function (key, val) {
    PKG[key] = val;
    /* mirror key fields onto the catalogue row so the listing reflects edits */
    if (key === 'weight') ROW.weight = val;
    if (key === 'pcr') ROW.pcr = val;
    if (key === 'level') ROW.level = val;
  };
  /* dynamic materials */
  window.rpkMatEdit = function (i, k, val) { if (PKG.materials[i]) PKG.materials[i][k] = val; };
  window.rpkMatAdd = function () { PKG.materials.push({ name: '', pct: '' }); render(); };
  window.rpkMatRemove = function (i) {
    PKG.materials.splice(i, 1);
    if (!PKG.materials.length) PKG.materials.push({ name: '', pct: '' });
    render();
  };
  /* supporting documents */
  var DOC_SAMPLES = ['Spec_sheet.pdf', 'Test_report.pdf', 'Material_declaration.pdf', 'Certificate.pdf', 'Safety_data_sheet.pdf'];
  window.rpkDocAdd = function () { PKG.docs.push(DOC_SAMPLES[PKG.docs.length % DOC_SAMPLES.length]); render(); toast('Document attached'); };
  window.rpkDocRemove = function (i) { PKG.docs.splice(i, 1); render(); };
  window.rpkDownloadDoC = function () { toast('Declaration of Conformity downloaded'); };
  /* segmented choice (e.g. Packaging Level) */
  window.rpkSegPick = function (btn, key, val) {
    var box = btn.closest('.rpk-seg');
    if (box) box.querySelectorAll('.rpk-seg-opt').forEach(function (o) { o.classList.remove('on'); });
    btn.classList.add('on');
    window.rpkEdit(key, val);
  };
  /* Yes/No toggle switch */
  window.rpkToggleField = function (btn) {
    var on = !btn.classList.contains('on');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    var lbl = btn.querySelector('.rpk-toggle-lbl'); if (lbl) lbl.textContent = on ? 'Yes' : 'No';
    PKG[btn.getAttribute('data-key')] = on ? 'Yes' : 'No';
  };
  /* % slider + number stepper */
  window.rpkPctApply = function (el) {
    var box = el.closest('.rpk-pct'); if (!box) return;
    var v = Math.max(0, Math.min(100, parseFloat(el.value) || 0));
    box.style.setProperty('--gs-pct', v + '%');
    var s = box.querySelector('.rpk-pct-slider'); if (s && s !== el) s.value = v;
    var num = box.querySelector('.rpk-pct-num'); if (num && num !== el) num.value = v;
    if (box.hasAttribute('data-key')) { PKG[box.getAttribute('data-key')] = v + '%'; }
    else if (box.hasAttribute('data-mat')) { var i = parseInt(box.getAttribute('data-mat'), 10); if (PKG.materials[i]) PKG.materials[i].pct = v + '%'; }
  };
  /* Duplicate this packaging into a new editable variation */
  window.rpkDuplicate = function () { toast('Duplicated “' + (ROW.type || 'packaging') + '” as a new variation — edit the copy independently'); };

  render();
})();
