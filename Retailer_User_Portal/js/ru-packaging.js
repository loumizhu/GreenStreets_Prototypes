/* ==========================================================================
   ru-packaging.js — Retailer User packaging detail (READ-ONLY).
   Renders into #ru-pkg-root.

   SOURCE OF TRUTH: js/gs-schema.js (a byte-identical copy of
   Supplier_Portal/js/gs-schema.js). The nine sections, their numbers/titles and
   every field label come from GS_COMPONENT_SCHEMA at render time — nothing is
   hand-typed — so this view shows exactly the same information as the Super
   Admin, Supplier and Retailer Admin packaging details. The record is keyed by
   the schema's canonical field keys.

   The Retailer User is a read-only persona, so every value is display-only and
   there is no Edit toggle. Reads the clicked row from sessionStorage('ru_pkg');
   a canonical dataset per packaging type fills the full compliance record.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ru-pkg-root')) return;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- canonical schema ---------------------------------------------------- */
  var SCHEMA = window.GS_COMPONENT_SCHEMA;
  if (!SCHEMA || !window.GSSchema) {
    document.getElementById('ru-pkg-root').innerHTML =
      '<div style="padding:16px;font-size:12.5px;color:var(--tw3)">Packaging schema unavailable — <code>js/gs-schema.js</code> did not load.</div>';
    return;
  }
  var DOCS_LABEL = 'Supporting Documents';
  var SECTIONS = SCHEMA.map(function (sec) {
    var out = { n: sec.num, title: sec.title, fields: [] };
    sec.fields.forEach(function (f) {
      if (f.control === 'materials') { out.mat = true; return; }
      if (f.control === 'docs') { out.docs = true; DOCS_LABEL = f.label; return; }
      /* keep the whole schema field — control + vocab drive which model control
         this renders as (toggle / segmented / slider / combobox). */
      out.fields.push(f);
    });
    return out;
  });

  /* ---- canonical compliance record (identical to the Super Admin / Retailer
     Admin detail pages). Every value is a member of its GS_VOCAB list. ------- */
  var CANONICAL = {
    'Swing Tag': {
      packagingLevel: 'Primary', packagingType: 'Swing Tag', otherTypeDesc: '', sourceType: 'Local',
      baseMaterial: 'Cardboard_CartonBoard',
      materials: [{ name: 'Paper FBB - Folding Box Board', pct: '100%' }],
      recycledContent: 'No', pcr: '', pir: '', recycledEvidence: '', recycledComments: '',
      colour: 'White', opacity: 'Coloured - opaque and sortable', decoration: 'Printed - Flexo',
      weight: '1.72', grammage: '300', gauge: '',
      length: '139', width: '40', height: '0.036',
      certification: 'OEKOTEX', otherCertDetails: '', supplierName: 'Misma', supplierAddress: 'Motijheel, Dhaka',
      materialCompliance: 'No', mineralOils: 'No', bpa: 'No', pfas: 'No', chlorine: 'None',
      documents: []
    }
  };

  /* listing "Type" label → GS_VOCAB.packagingType */
  var TYPE_MAP = {
    'swing tag': 'Swing Tag', 'polybag': 'Bag (Poly)', 'poly bag': 'Bag (Poly)',
    'carton': 'Box/Carton', 'box / carton': 'Box/Carton', 'box/carton': 'Box/Carton',
    'hanger': 'Hanger (Plastic Hanger)', 'shipping box': 'Shipper', 'shoe box': 'Box/Carton',
    'tissue wrap': 'Paper Sheet', 'belly band': 'Band', 'care-label sachet': 'Sachet'
  };
  /* listing material shorthand → GS_VOCAB.baseMaterial */
  var BASEMAT_MAP = {
    'paper / card': 'Cardboard_CartonBoard', 'paper/card': 'Cardboard_CartonBoard', 'paper': 'Paper',
    'ldpe': 'Plastic_Single_MonoLayer', 'pet': 'Plastic_Single_MonoLayer', 'pp': 'Plastic_Single_MonoLayer',
    'metal': 'Metal'
  };

  function readRow() {
    var raw = null; try { raw = sessionStorage.getItem('ru_pkg'); } catch (e) {}
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    return { product: 'Blue Slim Fit Jeans', sku: 'PRK-002-JN-BLU', type: 'Swing tag', material: 'Paper / card', level: 'Primary', weight: '4 g', status: 'Incomplete' };
  }

  /* build the display model: canonical values by type, overlaid with the row */
  function buildModel(row) {
    var canonName = TYPE_MAP[(row.type || '').toLowerCase()] || row.type || '';
    var base = CANONICAL[canonName] ? JSON.parse(JSON.stringify(CANONICAL[canonName])) : {};
    var m = {
      packagingLevel: row.level || base.packagingLevel || 'Primary',
      packagingType: canonName || base.packagingType || row.type || '',
      otherTypeDesc: base.otherTypeDesc || '',
      sourceType: base.sourceType || 'Local',
      baseMaterial: base.baseMaterial || BASEMAT_MAP[(row.material || '').toLowerCase()] || '',
      materials: base.materials || [{ name: '', pct: '' }],
      recycledContent: base.recycledContent || 'No', pcr: base.pcr || '', pir: base.pir || '',
      recycledEvidence: base.recycledEvidence || '', recycledComments: base.recycledComments || '',
      colour: base.colour || '', opacity: base.opacity || '', decoration: base.decoration || '',
      weight: base.weight || (row.weight || '').replace(/\s*g$/, '') || '', grammage: base.grammage || '', gauge: base.gauge || '',
      length: base.length || '', width: base.width || '', height: base.height || '',
      certification: base.certification || '', otherCertDetails: base.otherCertDetails || '',
      supplierName: base.supplierName || '', supplierAddress: base.supplierAddress || '',
      materialCompliance: base.materialCompliance || 'No', mineralOils: base.mineralOils || 'No',
      bpa: base.bpa || 'No', pfas: base.pfas || 'No', chlorine: base.chlorine || 'None',
      documents: base.documents || []
    };
    return m;
  }

  /* ---- markup: identical to the model, Supplier_Portal packaging detail ----
     The page emits the model's own .pkg-detail-section / .pkg-detail-feat
     structure and then hands it to GSPkgControls (a verbatim port of the
     model's control builders), so every field renders as the same control:
     Yes/No → toggle, short picklist → segmented choice list, % → slider +
     stepper, long picklist / material name → combobox, and each material's
     name + % share one .pkg-mat-row card. Read-only for this persona. */
  function injectCss() {
    if (document.getElementById('ru-pkg-css')) return;
    var st = document.createElement('style'); st.id = 'ru-pkg-css';
    st.textContent =
      '.rpk-wrap{max-width:760px}' +
      '.rpk-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}' +
      '.rpk-head-actions{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap}' +
      '.rpk-mat-note{grid-column:1/-1;font-size:11px;line-height:1.5;color:var(--amber,#f5a623);background:rgba(245,166,35,.09);border:1px solid rgba(245,166,35,.28);border-radius:8px;padding:8px 11px}';
    document.head.appendChild(st);
  }

  function disp(v) { return (v === '' || v == null) ? '—' : v; }

  /* one field → the model's markup: a display input, plus the real <select>
     holding the value whenever the schema gives the field an option list. */
  function field(f, PKG) {
    var val = disp(PKG[f.key]);
    var opts = window.GSSchema.fieldOptions(f) || [];
    var h = '<div class="pkg-detail-feat"><div class="pkg-detail-feat-lbl">' + esc(f.label) + '</div>';
    if (opts.length) {
      h += '<input class="pkg-detail-feat-input" value="' + esc(val) + '" readonly>';
      h += '<select class="pkg-detail-feat-select"><option value="" disabled>Select…</option>' +
        opts.map(function (o) {
          return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
    } else {
      h += '<input class="pkg-detail-feat-input editable-text" value="' + esc(val) + '" readonly>';
    }
    return h + '</div>';
  }

  /* materials: one .pkg-detail-feat pair per material, tagged data-mr/data-mt
     exactly as the model does, so pkgWrapMaterialRows() groups them into a row. */
  function materialsHtml(PKG) {
    var mats = PKG.materials && PKG.materials.length ? PKG.materials : [{ name: '', pct: '' }];
    var rows = mats.map(function (m, i) {
      var n = i + 1;
      return '<div class="pkg-detail-feat" data-mr="' + n + '" data-mt="name"><div class="pkg-detail-feat-lbl">Material ' + n + ' Name</div>' +
          '<input class="pkg-detail-feat-input editable-text" value="' + esc(disp(m.name)) + '" readonly></div>' +
        '<div class="pkg-detail-feat" data-mr="' + n + '" data-mt="pct"><div class="pkg-detail-feat-lbl">% Material ' + n + '</div>' +
          '<input class="pkg-detail-feat-input editable-text" value="' + esc(disp(m.pct)) + '" readonly></div>';
    }).join('');
    /* "Total of all the materials" is a CALCULATED LABEL, never a field: the sum
       of the % Material N values above (the base material carries no percentage).
       This view is read-only, so it is computed once at render. */
    var total = Math.round(mats.reduce(function (t, m) {
      var n = parseFloat(String(m.pct == null ? '' : m.pct).replace(/[^0-9.]/g, ''));
      return t + (isNaN(n) ? 0 : n);
    }, 0) * 100) / 100;
    var named = mats.filter(function (m) { return String(m.name || '').trim() && m.name !== '—'; }).length;
    var off = named && Math.round(total) !== 100 ? ' pkg-mat-total-off' : '';
    var totalHtml = '<div class="pkg-mat-total' + off + '">' +
      '<span class="pkg-mat-total-lbl">Total of all the materials</span>' +
      '<span class="pkg-mat-total-val">' + total + '%</span></div>';
    var note = window.GSSchema.materialExportNote(mats);
    return rows + totalHtml + (note ? '<div class="rpk-mat-note">' + esc(note) + '</div>' : '');
  }

  function docsHtml(PKG) {
    var docs = PKG.documents || [];
    var chips = docs.map(function (d) {
      return '<span class="doc-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>' + esc(d) + '</span></span>';
    }).join('');
    var empty = docs.length ? '' : '<span class="pkg-detail-feat-lbl" style="text-transform:none;letter-spacing:0">No documents attached.</span>';
    return '<div class="pkg-detail-feat"><div class="pkg-detail-feat-lbl">' + esc(DOCS_LABEL) + '</div>' +
      '<div class="doc-chips">' + chips + empty + '</div></div>';
  }

  function section(s, PKG) {
    var inner = s.fields.map(function (f) { return field(f, PKG); }).join('');
    if (s.mat) inner += materialsHtml(PKG);
    if (s.docs) inner += docsHtml(PKG);
    /* .pkg-sec-edit-mode is what makes the model's rich controls visible; the
       read-only lock in css/pkg-detail.css keeps them look-but-don't-touch. */
    return '<div class="pkg-detail-section pkg-sec-edit-mode"><div class="pkg-detail-section-hdr">' +
      '<span class="pkg-detail-section-num">' + s.n + '</span>' + esc(s.title) + '</div>' +
      '<div class="pkg-detail-grid">' + inner + '</div></div>';
  }

  function statusMeta(status) {
    var s = (status || '').toLowerCase();
    if (s.indexOf('complete') === 0) return 'pill-green';
    if (s.indexOf('incomplete') === 0) return 'pill-red';
    if (s.indexOf('pending') === 0) return 'pill-amber';
    return 'pill-grey';
  }

  function render() {
    injectCss();
    var row = readRow();
    var PKG = buildModel(row);
    var root = document.getElementById('ru-pkg-root');
    var crumb = document.getElementById('ru-pkg-crumb'); if (crumb) crumb.textContent = PKG.packagingType || row.type || 'Packaging';

    var lvl = PKG.packagingLevel;
    var levelPill = '<span class="pill ' + (lvl === 'Primary' ? 'pill-blue' : (lvl === 'Secondary' ? 'pill-green' : 'pill-grey')) + '">' + esc(lvl || 'Primary') + '</span>';
    var statusPill = '<span class="pill ' + statusMeta(row.status) + '">' + esc(row.status || 'Pending') + '</span>';

    var head =
      '<div class="rpk-head"><div>' +
        '<div class="pg-title">' + esc(PKG.packagingType || row.type) + '</div>' +
        '<div class="pg-sub">' + esc(row.sku || '') + ' · ' + esc(row.product || '') + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:8px">' + levelPill + statusPill + '</div>' +
      '</div><div class="rpk-head-actions">' +
        '<button class="btn-g" onclick="ruPkgDownloadDoC()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-12"/></svg>Download DoC</button>' +
      '</div></div>';

    var note = '<div class="alert" style="background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.22);color:#9dc4ff;margin-bottom:14px">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><use href="#gsi-7"/></svg>' +
      '<span>Read-only view — as a Retailer User you can review and download packaging data. Editing components is a Retailer Admin action.</span></div>';

    var body = SECTIONS.map(function (s) { return section(s, PKG); }).join('');
    var footer = '<div style="margin-top:14px"><button class="btn-g" onclick="go(\'ru10\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m0 0 6 6m-6-6 6-6"/></svg>Back to packaging portfolio</button></div>';

    root.innerHTML = '<div class="rpk-wrap">' + head + note + body + footer + '</div>';
    /* upgrade every field to the model's control (read-only for this persona) */
    if (typeof window.GSPkgControls === 'function') {
      try { window.GSPkgControls(root, { readOnly: true }); } catch (e) {}
    }
  }

  window.ruPkgDownloadDoC = function () { if (window.ruToast) ruToast('Declaration of Conformity downloaded'); };

  render();
})();
