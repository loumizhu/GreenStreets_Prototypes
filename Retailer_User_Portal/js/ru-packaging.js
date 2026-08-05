/* ==========================================================================
   ru-packaging.js — Retailer User packaging detail (READ-ONLY).
   Renders into #ru-pkg-root the SAME numbered sections + field labels as the
   Super Admin (supplier-portal engine) and Retailer Admin packaging details,
   so all three portals show identical packaging information. The Retailer User
   is a read-only persona, so there is no Edit toggle — values are display-only.
   Reads the clicked row from sessionStorage('ru_pkg'); a canonical dataset per
   packaging type fills the full compliance record (Swing Tag mirrors the
   Super Admin Packaging-Swing-Tag page exactly).
   ========================================================================== */
(function () {
  'use strict';
  if (!document.getElementById('ru-pkg-root')) return;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---- section schema (numbers + labels mirror the super-admin detail) ---- */
  var SECTIONS = [
    { n: 1, title: 'Packaging Level & Format', fields: [
      { label: 'Packaging Level', key: 'level' },
      { label: 'Packaging Type (name)', key: 'type' },
      { label: 'Other Packaging Type Description', key: 'typeOther' }
    ]},
    { n: 2, title: 'Packaging Source Type', fields: [
      { label: 'Packaging Source Type', key: 'source' }
    ]},
    { n: 3, title: 'Material Information', fields: [
      { label: 'Base Material', key: 'baseMat' },
      { label: 'Material 1 Name', key: 'mat1' },
      { label: '% Material 1', key: 'mat1pct' },
      { label: 'Total of all the materials', key: 'matTotal' }
    ]},
    { n: 4, title: 'Post-Consumer & Post-Industrial Recycled Content', fields: [
      { label: 'Recycled Content', key: 'recycled' },
      { label: 'Post-Consumer Recycled Content (%)', key: 'pcr' },
      { label: 'Post-Industrial Recycled Content (%)', key: 'pir' },
      { label: 'Supporting evidence of recycled content', key: 'evidence' },
      { label: 'Recycled Content Comments', key: 'recComments' }
    ]},
    { n: 5, title: 'Colour & Decoration', fields: [
      { label: 'Material Colour', key: 'colour' },
      { label: 'Opacity', key: 'opacity' },
      { label: 'Decoration', key: 'decoration' }
    ]},
    { n: 6, title: 'Weight & Grammage', fields: [
      { label: 'Weight (g)', key: 'weight' },
      { label: 'Grammage (gsm)', key: 'grammage' },
      { label: 'Gauge in Micron (um)', key: 'gauge' }
    ]},
    { n: 7, title: 'Material Dimensions', fields: [
      { label: 'Length (mm) (or diameter if applicable)', key: 'length' },
      { label: 'Width (mm)', key: 'width' },
      { label: 'Height or Depth (mm)', key: 'height' }
    ]},
    { n: 8, title: 'Additional Packaging Information', fields: [
      { label: 'Certification', key: 'cert' },
      { label: 'Other Certification Details', key: 'certOther' },
      { label: 'Packaging Supplier Name', key: 'pkgSupplier' },
      { label: 'Packaging Supplier Address', key: 'pkgSupplierAddr' }
    ]},
    { n: 9, title: 'Material Compliance', fields: [
      { label: 'Material Compliance', key: 'matCompliance' },
      { label: 'Does the material and/or inks contain mineral oils above allowable limits?', key: 'mineralOils' },
      { label: 'Does the material contain BPA above allowable limits?', key: 'bpa' },
      { label: 'Does the material contain PFAs?', key: 'pfas' },
      { label: 'Is chlorine used in the manufacture of the material/component?', key: 'chlorine' }
    ]}
  ];

  /* ---- canonical compliance records (identical to the Super Admin pages) ---- */
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

  /* normalise the listing "Type" label to a canonical packaging type name */
  var TYPE_MAP = {
    'swing tag': 'Swing Tag', 'polybag': 'Bag (Poly)', 'poly bag': 'Bag (Poly)',
    'carton': 'Box/Carton', 'box / carton': 'Box/Carton', 'box/carton': 'Box/Carton',
    'hanger': 'Hanger (Plastic Hanger)', 'shipping box': 'Shipper', 'shoe box': 'Box/Carton',
    'tissue wrap': 'Paper Sheet', 'belly band': 'Band', 'care-label sachet': 'Sachet'
  };
  var BASEMAT_MAP = {
    'paper / card': 'Paper_Cardboard', 'paper/card': 'Paper_Cardboard', 'paper': 'Paper_Cardboard',
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
      level: row.level || base.level || 'Primary',
      type: canonName || base.type || row.type || '',
      typeOther: base.typeOther || '—',
      source: base.source || 'Local',
      baseMat: base.baseMat || BASEMAT_MAP[(row.material || '').toLowerCase()] || '',
      mat1: base.mat1 || '—', mat1pct: base.mat1pct || '—', matTotal: base.matTotal || '—',
      recycled: base.recycled || 'No', pcr: base.pcr || '—', pir: base.pir || '—',
      evidence: base.evidence || '', recComments: base.recComments || '—',
      colour: base.colour || '', opacity: base.opacity || '', decoration: base.decoration || '',
      weight: base.weight || (row.weight || '').replace(/\s*g$/, '') || '—', grammage: base.grammage || '—', gauge: base.gauge || '—',
      length: base.length || '—', width: base.width || '—', height: base.height || '—',
      cert: base.cert || '', certOther: base.certOther || '—', pkgSupplier: base.pkgSupplier || '—', pkgSupplierAddr: base.pkgSupplierAddr || '—',
      matCompliance: base.matCompliance || 'No', mineralOils: base.mineralOils || 'No', bpa: base.bpa || 'No', pfas: base.pfas || 'No', chlorine: base.chlorine || 'None'
    };
    return m;
  }

  /* ---- styles (mirror the Retailer Admin .rpk-* look) ---- */
  function injectCss() {
    if (document.getElementById('ru-pkg-css')) return;
    var st = document.createElement('style'); st.id = 'ru-pkg-css';
    st.textContent =
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
      '.rpk-in{padding:7px 10px;font-size:12.5px;width:100%;box-sizing:border-box;background:rgba(255,255,255,.02);border:1px solid var(--bw,rgba(255,255,255,.09));border-radius:8px;color:var(--tw2,rgba(255,255,255,.82));font-family:inherit}' +
      '.rpk-in[data-empty="1"]{color:var(--tw3,rgba(255,255,255,.45))}';
    document.head.appendChild(st);
  }

  function field(f, PKG) {
    var v = PKG[f.key];
    var disp = (v === '' || v == null) ? '—' : v;
    var wide = (f.key === 'pkgSupplierAddr' || f.key === 'recComments' || f.label.length > 48);
    return '<div class="rpk-f' + (wide ? ' rpk-wide' : '') + '"><div class="rpk-lbl">' + esc(f.label) + '</div>' +
      '<input class="rpk-in" value="' + esc(disp) + '"' + (disp === '—' ? ' data-empty="1"' : '') + ' readonly></div>';
  }
  function section(s, PKG) {
    return '<div class="rpk-sec"><div class="rpk-sec-hdr"><span class="rpk-sec-num">' + s.n + '</span>' + esc(s.title) + '</div>' +
      '<div class="rpk-grid">' + s.fields.map(function (f) { return field(f, PKG); }).join('') + '</div></div>';
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
    var crumb = document.getElementById('ru-pkg-crumb'); if (crumb) crumb.textContent = PKG.type || row.type || 'Packaging';

    var levelPill = '<span class="pill ' + (PKG.level === 'Primary' ? 'pill-blue' : (PKG.level === 'Secondary' ? 'pill-green' : 'pill-grey')) + '">' + esc(PKG.level || 'Primary') + '</span>';
    var statusPill = '<span class="pill ' + statusMeta(row.status) + '">' + esc(row.status || 'Pending') + '</span>';

    var head =
      '<div class="rpk-head"><div>' +
        '<div class="pg-title">' + esc(PKG.type || row.type) + '</div>' +
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
  }

  window.ruPkgDownloadDoC = function () { if (window.ruToast) ruToast('Declaration of Conformity downloaded'); };

  render();
})();
