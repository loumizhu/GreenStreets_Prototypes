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
      { label: 'Packaging Level', key: 'level', type: 'select', opts: ['Primary','Secondary','Tertiary'] },
      { label: 'Packaging Type (name)', key: 'type', type: 'select', opts: TYPE_OPTS },
      { label: 'Other Packaging Type Description', key: 'typeOther', type: 'text' }
    ]},
    { n: 2, title: 'Packaging Source Type', fields: [
      { label: 'Packaging Source Type', key: 'source', type: 'select', opts: SOURCE_OPTS }
    ]},
    { n: 3, title: 'Material Information', fields: [
      { label: 'Base Material', key: 'baseMat', type: 'select', opts: BASEMAT_OPTS },
      { label: 'Material 1 Name', key: 'mat1', type: 'text' },
      { label: '% Material 1', key: 'mat1pct', type: 'text' },
      { label: 'Total of all the materials', key: 'matTotal', type: 'text' }
    ]},
    { n: 4, title: 'Post-Consumer & Post-Industrial Recycled Content', fields: [
      { label: 'Recycled Content', key: 'recycled', type: 'select', opts: YESNO },
      { label: 'Post-Consumer Recycled Content (%)', key: 'pcr', type: 'text' },
      { label: 'Post-Industrial Recycled Content (%)', key: 'pir', type: 'text' },
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
    { n: 8, title: 'Additional Packaging Information', fields: [
      { label: 'Certification', key: 'cert', type: 'select', opts: CERT_OPTS },
      { label: 'Other Certification Details', key: 'certOther', type: 'text' },
      { label: 'Packaging Supplier Name', key: 'pkgSupplier', type: 'text' },
      { label: 'Packaging Supplier Address', key: 'pkgSupplierAddr', type: 'text' }
    ]},
    { n: 9, title: 'Material Compliance', fields: [
      { label: 'Material Compliance', key: 'matCompliance', type: 'select', opts: MATCOMP_OPTS },
      { label: 'Does the material and/or inks contain mineral oils above allowable limits?', key: 'mineralOils', type: 'select', opts: YESNO },
      { label: 'Does the material contain BPA above allowable limits?', key: 'bpa', type: 'select', opts: YESNO },
      { label: 'Does the material contain PFAs?', key: 'pfas', type: 'select', opts: YESNO },
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
  function seed(row) {
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
  var EDITING = false;

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
      '.rpk-in[data-empty="1"]{color:var(--tw3,rgba(255,255,255,.45))}';
    document.head.appendChild(st);
  }

  /* ---- field renderer ---- */
  function field(f) {
    var v = PKG[f.key] != null ? PKG[f.key] : '';
    var wide = (f.key === 'pkgSupplierAddr' || f.key === 'recComments' || f.label.length > 48);
    var ctrl;
    if (!EDITING) {
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
  function section(s) {
    return '<div class="rpk-sec"><div class="rpk-sec-hdr"><span class="rpk-sec-num">' + s.n + '</span>' + esc(s.title) + '</div>' +
      '<div class="rpk-grid">' + s.fields.map(field).join('') + '</div></div>';
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
        '<button class="btn-g" onclick="rpkDownloadDoC()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-14"/></svg>Download DoC</button>' +
        (EDITING
          ? '<button class="btn-p" onclick="rpkToggleEdit()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:-2px;margin-right:5px"><use href="#gsi-19"/></svg>Save changes</span></button>'
          : '<button class="btn-p" onclick="rpkToggleEdit()"><span class="btn-c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px"><use href="#gsi-5"/></svg>Edit</span></button>') +
      '</div></div>';

    var body = SECTIONS.map(section).join('');

    var footer = '<div style="margin-top:14px"><button class="btn-g" onclick="go(\'ra5\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-10"/></svg>Back to packaging components</button></div>';

    root.innerHTML = '<div class="rpk-wrap">' + head + body + footer + '</div>';
    if (EDITING && window.GSEnhanceSelects) window.GSEnhanceSelects(root);
  }

  /* ---- actions ---- */
  window.rpkEdit = function (key, val) { PKG[key] = val; };
  window.rpkToggleEdit = function () {
    EDITING = !EDITING;
    if (!EDITING) {
      /* mirror the key fields back onto the catalogue row so the list reflects edits */
      ROW.weight = PKG.weight;
      ROW.pcr = PKG.pcr;
      ROW.level = PKG.level;
    }
    render();
    toast(EDITING ? 'Editing — make your changes, then Save' : 'Changes saved');
  };
  window.rpkDownloadDoC = function () { toast('Declaration of Conformity downloaded'); };

  render();
})();
