/* ==========================================================================
   air-review.js — AI Upload Review rendered from the CANONICAL component
   schema (js/gs-schema.js), so it shows the exact same sections, labels,
   dropdown vocabularies, Yes/No controls, dynamic material rows and Supporting
   Documents as the manual Component Wizard and the saved detail/edit page.

   Confidence is AI-review METADATA only (High confidence / Check value /
   Missing / User verified). It never changes a field's meaning, location,
   options, validation or export mapping. An accepted component produces the
   SAME record structure a manually-created component does, so opening it from
   Packaging Components shows identical fields, values, material rows, documents,
   dropdown selections and compliance answers.

   Renders into #air-root (#air-side + #air-main). Depends on globals from
   gs-schema.js, supplier-portal.js and greenstreets-theme.js.
   ========================================================================== */
(function () {
  'use strict';

  var SCHEMA = (window.GS_COMPONENT_SCHEMA || []);
  var VOCAB = (window.GS_VOCAB || {});

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }

  /* ---- confidence metadata ---- */
  function svg(kind) {
    if (kind === 'check') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    if (kind === 'alert') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }
  function badge(conf) {
    if (conf === 'high') return '<span class="air-badge high">' + svg('check') + 'High confidence</span>';
    if (conf === 'med') return '<span class="air-badge med">' + svg('alert') + 'Check value</span>';
    if (conf === 'user') return '<span class="air-badge user">' + svg('check') + 'User verified</span>';
    return '<span class="air-badge missing">' + svg('info') + 'Missing</span>';
  }

  /* ---- component record: canonical shape shared with manual/detail flows ----
     vals[fieldKey] = { v, conf }, plus materials[] and documents[]. */
  function findField(key) {
    for (var s = 0; s < SCHEMA.length; s++) for (var f = 0; f < SCHEMA[s].fields.length; f++) if (SCHEMA[s].fields[f].key === key) return SCHEMA[s].fields[f];
    return null;
  }
  function blankVals() {
    var v = {};
    SCHEMA.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        if (f.control === 'materials' || f.control === 'docs') return;
        v[f.key] = { v: '', conf: 'missing' };
      });
    });
    return v;
  }
  function makeComp(name, seed) {
    seed = seed || {};
    var vals = blankVals();
    Object.keys(seed).forEach(function (k) {
      if (k === 'materials' || k === 'documents') return;
      var e = seed[k];
      if (!vals[k]) vals[k] = { v: '', conf: 'missing' };
      vals[k] = { v: String(e[0]), conf: e[1] || 'high' };
    });
    return {
      name: name,
      reviewed: false,
      vals: vals,
      materials: (seed.materials || [{ name: '', pct: '' }]).map(function (m) { return { name: m.name || '', pct: (m.pct == null ? '' : m.pct) }; }),
      documents: (seed.documents || []).slice()
    };
  }

  /* Demo import (values only — the schema decides how each renders). One
     component intentionally carries 6 materials + 3 documents. */
  var COMPONENTS = [
    makeComp('Swing Tag', {
      packagingLevel: ['Primary', 'high'], packagingType: ['Swing Tag', 'high'], otherTypeDesc: ['', 'missing'],
      sourceType: ['Local', 'high'], baseMaterial: ['Paper_Cardboard', 'high'],
      materials: [{ name: 'Paper Kraft', pct: 100 }],
      recycledContent: ['Yes', 'med'], pcr: ['30', 'med'], pir: ['0', 'high'], recycledEvidence: ['Product specification', 'med'], recycledComments: ['', 'missing'],
      colour: ['Multi', 'high'], opacity: ['Coloured - opaque and sortable', 'high'], decoration: ['Printed - Flexo', 'high'],
      weight: ['1.72', 'high'], grammage: ['300', 'high'], gauge: ['', 'missing'],
      length: ['139', 'high'], width: ['40', 'high'], height: ['', 'missing'],
      certification: ['OEKOTEX', 'high'], otherCertDetails: ['', 'missing'], supplierName: ['Misma', 'high'], supplierAddress: ['Motijheel, Dhaka', 'med'],
      documents: ['FSC_CoC_Certificate_2026.pdf'],
      materialCompliance: ['No', 'high'], mineralOils: ['No', 'high'], bpa: ['No', 'high'], pfas: ['No', 'high'], chlorine: ['None', 'high']
    }),
    makeComp('Poly Bag', {
      packagingLevel: ['Primary', 'high'], packagingType: ['Bag (Poly)', 'high'],
      sourceType: ['Local', 'high'], baseMaterial: ['Plastic_Single_MonoLayer', 'high'],
      materials: [{ name: 'Plastic LDPE (Low Density Polyethylene)', pct: 100 }],
      recycledContent: ['No', 'med'],
      colour: ['Clear', 'high'], opacity: ['Colourless', 'high'], decoration: ['None', 'high'],
      weight: ['8.5', 'med'], length: ['320', 'high'], width: ['450', 'high'],
      certification: ['None', 'high'], supplierName: ['Windy Apparels Ltd', 'high'], supplierAddress: ['Dhaka, Bangladesh', 'high'],
      materialCompliance: ['No', 'high'], mineralOils: ['No', 'high'], bpa: ['No', 'high'], pfas: ['No', 'high'], chlorine: ['None', 'high']
    }),
    makeComp('Shipping Carton', {
      packagingLevel: ['Secondary', 'high'], packagingType: ['Box/Carton', 'high'],
      sourceType: ['Local', 'high'], baseMaterial: ['Corrugate', 'high'],
      materials: [
        { name: 'Paper Kraft', pct: 55 }, { name: 'Paper FBB - Folding Box Board', pct: 20 },
        { name: 'Plastic LDPE (Low Density Polyethylene)', pct: 10 }, { name: 'Plastic PP (Polypropylene)', pct: 8 },
        { name: 'Metal Aluminium', pct: 5 }, { name: 'Other', pct: 2 }
      ],
      recycledContent: ['Yes', 'high'], pcr: ['65', 'high'], pir: ['10', 'med'], recycledEvidence: ['Production certificates and certificates of conformity', 'high'],
      colour: ['Brown', 'high'], opacity: ['Coloured - opaque and sortable', 'high'], decoration: ['Printed - Flexo', 'high'],
      weight: ['180', 'high'], grammage: ['180', 'high'],
      length: ['400', 'high'], width: ['300', 'high'], height: ['250', 'high'],
      certification: ['FSC Recycled', 'high'], supplierName: ['Windy Apparels Ltd', 'high'], supplierAddress: ['Dhaka, Bangladesh', 'high'],
      documents: ['FSC_CoC_Certificate_2026.pdf', 'REACH_Compliance_Declaration_2026.pdf', 'Migration_Test_Report.pdf'],
      materialCompliance: ['TPCH/PROP65/REACH/EU directive 94/62/EC', 'high'], mineralOils: ['No', 'high'], bpa: ['No', 'high'], pfas: ['No', 'high'], chlorine: ['ECF (Elemental Chlorine Free)', 'med']
    })
  ];

  var DOC_LIBRARY = ['FSC_CoC_Certificate_2026.pdf', 'REACH_Compliance_Declaration_2026.pdf', 'GRS_Scope_Certificate.pdf', 'Migration_Test_Report.pdf', 'OEKO-TEX_Standard100.pdf'];
  var cur = 0;

  /* ---- controls ---- */
  function optionsFor(f) {
    if (window.GSSchema) return window.GSSchema.fieldOptions(f);
    if (f.control === 'yesno') return ['Yes', 'No'];
    return (f.vocab && VOCAB[f.vocab]) ? VOCAB[f.vocab].slice() : [];
  }

  function ctrlHtml(f, cell) {
    var v = cell.v;
    if (f.control === 'yesno') {
      return '<div class="air-toggle" data-k="' + f.key + '">' +
        '<button type="button" class="' + (v === 'Yes' ? 'on-yes' : '') + '" onclick="airBool(this,\'' + f.key + '\',\'Yes\')">Yes</button>' +
        '<button type="button" class="' + (v === 'No' ? 'on-no' : '') + '" onclick="airBool(this,\'' + f.key + '\',\'No\')">No</button>' +
        '</div>';
    }
    if (f.control === 'number') {
      return '<div class="air-num-unit"><input class="fi" type="number" value="' + esc(v) + '" placeholder="Enter value" oninput="airSet(this,\'' + f.key + '\')">' +
        (f.unit ? '<span class="air-unit">' + esc(f.unit) + '</span>' : '') + '</div>';
    }
    if (f.control === 'select' || f.control === 'source') {
      var list = optionsFor(f);
      if (v !== '' && list.indexOf(v) === -1) list = [v].concat(list);
      var opts = '<option value="" ' + (v === '' ? 'selected' : '') + ' disabled hidden>Select…</option>';
      list.forEach(function (o) { opts += '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; });
      return '<select class="fi" onchange="airSet(this,\'' + f.key + '\')">' + opts + '</select>';
    }
    if (f.control === 'textarea') {
      return '<textarea class="fi" rows="2" placeholder="Enter value" oninput="airSet(this,\'' + f.key + '\')">' + esc(v) + '</textarea>';
    }
    return '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="airSet(this,\'' + f.key + '\')">';
  }

  function fieldHtml(f) {
    var c = COMPONENTS[cur];
    var cell = c.vals[f.key] || { v: '', conf: 'missing' };
    var conf = cell.conf;
    var req = f.req ? '<span class="req-star">*</span>' : '';
    var lblCls = 'air-field-lbl' + (conf === 'missing' ? ' lbl-missing' : '');
    return '<div class="air-field" data-k="' + f.key + '">' +
      '<div class="' + lblCls + '">' + esc(f.label) + req + '</div>' +
      '<div class="air-ctrl-row">' + ctrlHtml(f, cell) + '<span class="air-badge-slot">' + badge(conf) + '</span></div>' +
      '</div>';
  }

  /* ---- dynamic materials (unlimited) ---- */
  function materialsHtml() {
    var c = COMPONENTS[cur];
    var rows = c.materials.map(function (m, i) {
      var nmeList = VOCAB.materialName ? VOCAB.materialName.slice() : [];
      if (m.name && nmeList.indexOf(m.name) === -1) nmeList = [m.name].concat(nmeList);
      var opts = '<option value="" ' + (m.name === '' ? 'selected' : '') + ' disabled hidden>Select material…</option>';
      nmeList.forEach(function (o) { opts += '<option' + (o === m.name ? ' selected' : '') + '>' + esc(o) + '</option>'; });
      var canRemove = i > 0;
      return '<div class="air-mat-row" data-i="' + i + '">' +
        '<div class="air-mat-name"><select class="fi" onchange="airMat(' + i + ',\'name\',this.value)">' + opts + '</select></div>' +
        '<div class="air-mat-pct"><input class="fi" type="number" min="0" max="100" value="' + esc(m.pct) + '" placeholder="%" oninput="airMat(' + i + ',\'pct\',this.value)"><span class="air-unit">%</span></div>' +
        (canRemove ? '<button class="air-mat-del" title="Remove material" onclick="airMatDel(' + i + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' : '<span class="air-mat-del-spacer"></span>') +
        '</div>';
    }).join('');
    var used = c.materials.filter(function (m) { return (m.name || '').trim(); }).length;
    var total = c.materials.reduce(function (s, m) { return s + (parseFloat(m.pct) || 0); }, 0);
    total = Math.round(total * 100) / 100;
    var ok = total === 100;
    return '<div class="air-materials" data-k="materials">' +
      '<div class="air-mat-head"><span>Material name</span><span>% by weight</span><span></span></div>' +
      rows +
      '<button class="air-mat-add" onclick="airMatAdd()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>Add material</button>' +
      '<div class="air-mat-sum' + (ok ? ' ok' : ' warn') + '"><span>Materials used: <b>' + used + '</b></span>' +
      '<span>Total by weight: <b>' + total + '%</b></span>' +
      (ok ? '<span class="air-mat-ok">✓ Totals 100%</span>' : '<span class="air-mat-bad">Must total 100% (currently ' + total + '%)</span>') + '</div>' +
      '</div>';
  }

  /* ---- Supporting Documents (unlimited) ---- */
  function docsHtml() {
    var c = COMPONENTS[cur];
    var chips = c.documents.map(function (d, i) {
      return '<span class="air-doc-chip">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<span class="air-doc-name">' + esc(d) + '</span>' +
        '<button class="air-doc-x" title="Remove document" onclick="airDocDel(' + i + ')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</span>';
    }).join('');
    var avail = DOC_LIBRARY.filter(function (d) { return c.documents.indexOf(d) === -1; });
    var picker = '<select class="fi air-doc-pick" onchange="airDocPick(this)"><option value="" selected disabled hidden>Select an existing document…</option>' +
      avail.map(function (d) { return '<option>' + esc(d) + '</option>'; }).join('') + '</select>';
    return '<div class="air-docs" data-k="documents">' +
      '<div class="air-doc-chips">' + (chips || '<span class="air-doc-empty">No documents linked yet</span>') + '</div>' +
      '<div class="air-doc-actions">' + picker +
      '<button class="air-doc-add" onclick="airDocNew()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>Add new document</button></div>' +
      '</div>';
  }

  function sectionFieldHtml(f) {
    if (f.control === 'materials') return '<div class="air-field air-field-wide" data-k="materials"><div class="air-field-lbl">Material composition<span class="req-star">*</span></div>' + materialsHtml() + '</div>';
    if (f.control === 'docs') return '<div class="air-field air-field-wide" data-k="documents"><div class="air-field-lbl">' + esc(f.label) + '</div>' + docsHtml() + '</div>';
    return fieldHtml(f);
  }

  /* ---- edit tracking ---- */
  function fieldOf(el) { return el.closest ? el.closest('.air-field') : null; }
  function markEdited(el) {
    var field = fieldOf(el); if (!field) return;
    field.classList.remove('air-invalid');
    var lbl = field.querySelector('.air-field-lbl'); if (lbl) lbl.classList.remove('lbl-missing');
    var slot = field.querySelector('.air-badge-slot'); if (slot) slot.innerHTML = badge('user');
  }
  window.airSet = function (el, key) { var c = COMPONENTS[cur]; if (!c) return; c.vals[key] = { v: el.value, conf: 'user' }; markEdited(el); };
  window.airBool = function (btn, key, val) {
    var c = COMPONENTS[cur]; if (!c) return;
    c.vals[key] = { v: val, conf: 'user' };
    var btns = btn.parentNode.querySelectorAll('button');
    btns[0].className = (val === 'Yes' ? 'on-yes' : ''); btns[1].className = (val === 'No' ? 'on-no' : '');
    markEdited(btn);
  };
  window.airMat = function (i, key, val) { var c = COMPONENTS[cur]; if (!c || !c.materials[i]) return; c.materials[i][key] = val; refreshMaterials(); };
  window.airMatAdd = function () { var c = COMPONENTS[cur]; if (!c) return; c.materials.push({ name: '', pct: '' }); refreshMaterials(); };
  window.airMatDel = function (i) { var c = COMPONENTS[cur]; if (!c || i <= 0) return; c.materials.splice(i, 1); refreshMaterials(); };
  function refreshMaterials() {
    var host = document.querySelector('.air-field[data-k="materials"]'); if (!host) return;
    host.innerHTML = '<div class="air-field-lbl">Material composition<span class="req-star">*</span></div>' + materialsHtml();
    if (typeof window.GSEnhanceSelects === 'function') { try { window.GSEnhanceSelects(host); } catch (e) {} }
  }
  window.airDocPick = function (sel) { var c = COMPONENTS[cur]; if (!c || !sel.value) return; if (c.documents.indexOf(sel.value) === -1) c.documents.push(sel.value); refreshDocs(); };
  window.airDocNew = function () {
    var c = COMPONENTS[cur]; if (!c) return;
    var n = prompt('Name of the new supporting document (e.g. Test_Report.pdf):');
    if (n && n.trim()) { c.documents.push(n.trim()); refreshDocs(); }
  };
  window.airDocDel = function (i) { var c = COMPONENTS[cur]; if (!c) return; c.documents.splice(i, 1); refreshDocs(); };
  function refreshDocs() {
    var host = document.querySelector('.air-field[data-k="documents"]'); if (!host) return;
    host.innerHTML = '<div class="air-field-lbl">Supporting Documents</div>' + docsHtml();
    if (typeof window.GSEnhanceSelects === 'function') { try { window.GSEnhanceSelects(host); } catch (e) {} }
  }

  /* ---- counts / validation (confidence is metadata only) ---- */
  function counts(c) {
    var o = { confirmed: 0, attention: 0, missing: 0 };
    SCHEMA.forEach(function (sec) { sec.fields.forEach(function (f) {
      if (f.control === 'materials' || f.control === 'docs') return;
      var cell = c.vals[f.key] || { conf: 'missing' };
      if (cell.conf === 'high' || cell.conf === 'user') o.confirmed++;
      else if (cell.conf === 'med') o.attention++;
      else o.missing++;
    }); });
    return o;
  }
  function isRequired(f, c) {
    if (f.req) return true;
    if (f.reqIf) { var d = c.vals[f.reqIf.field]; return d && String(d.v) === f.reqIf.value; }
    return false;
  }
  function validate(c) {
    var bad = [];
    SCHEMA.forEach(function (sec) { sec.fields.forEach(function (f) {
      if (f.control === 'materials') {
        var used = c.materials.filter(function (m) { return (m.name || '').trim(); }).length;
        var total = c.materials.reduce(function (s, m) { return s + (parseFloat(m.pct) || 0); }, 0);
        if (used < 1 || Math.round(total * 100) / 100 !== 100) bad.push('materials');
        return;
      }
      if (f.control === 'docs') return;
      if (!isRequired(f, c)) return;
      var cell = c.vals[f.key]; var v = cell ? String(cell.v).trim() : '';
      if (v === '') bad.push(f.key);
    }); });
    return bad;
  }

  function navBtns() {
    var total = COMPONENTS.length, prevDis = cur <= 0, nextDis = cur >= total - 1;
    function b(dir, label, dis) {
      return '<button onclick="airSelect(' + (cur + dir) + ')" ' + (dis ? 'disabled' : '') +
        ' style="display:flex;align-items:center;gap:5px;height:32px;padding:0 14px;background:' + (dis ? 'transparent' : 'rgba(255,255,255,.07)') +
        ';border:1px solid rgba(255,255,255,' + (dis ? '.07' : '.15') + ');color:rgba(255,255,255,' + (dis ? '.2' : '.6') +
        ');border-radius:7px;font-family:inherit;font-size:12px;cursor:' + (dis ? 'default' : 'pointer') + '">' + label + '</button>';
    }
    return '<div style="display:flex;align-items:center;gap:6px">' + b(-1, '‹ Prev', prevDis) +
      '<span style="font-size:11px;color:rgba(255,255,255,.35);white-space:nowrap">' + (cur + 1) + ' / ' + total + '</span>' +
      b(1, 'Next ›', nextDis) + '</div>';
  }

  function renderMain() {
    var host = document.getElementById('air-main'); if (!host) return;
    var c = COMPONENTS[cur]; if (!c) return;
    var total = COMPONENTS.length, cnt = counts(c);
    var secHtml = SCHEMA.map(function (sec) {
      return '<div class="pkg-detail-section"><div class="pkg-detail-section-hdr"><span class="pkg-detail-section-num">' + sec.num + '</span>' + esc(sec.title) + '</div>' +
        '<div class="pkg-detail-grid">' + sec.fields.map(sectionFieldHtml).join('') + '</div></div>';
    }).join('');
    var nav = navBtns();
    var header = '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 12px;gap:12px;flex-wrap:wrap"><div>' +
      '<div style="font-size:15px;font-weight:700;color:#fff">' + esc(c.name) + (c.reviewed ? ' <span style="font-size:10px;font-weight:700;color:#4ebb81;background:rgba(78,187,129,.14);border:1px solid rgba(78,187,129,.3);padding:2px 7px;border-radius:4px;vertical-align:2px">Accepted</span>' : '') + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">AI import · ' + esc((window.gsRetailerText ? window.gsRetailerText('name') : '') ) + ' schema<span style="margin:0 6px;opacity:.3">·</span><span style="color:#4ebb81">' + cnt.confirmed + ' confirmed</span><span style="margin:0 4px;opacity:.3">·</span><span style="color:#f5a623">' + cnt.attention + ' to check</span><span style="margin:0 4px;opacity:.3">·</span><span style="color:rgba(255,255,255,.35)">' + cnt.missing + ' missing</span></div>' +
      '</div>' + nav + '</div>';
    var footer = '<div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' + nav +
      '<button onclick="airAccept()" style="display:flex;align-items:center;gap:8px;height:40px;padding:0 26px;background:var(--gs);border:none;color:#04130c;border-radius:9px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' + (c.reviewed ? 'Re-accept component' : 'Accept component') + '</button></div>';
    host.innerHTML = header + secHtml + footer;
    if (typeof window.GSEnhanceSelects === 'function') { try { window.GSEnhanceSelects(host); } catch (e) {} }
  }

  function renderSidebar() {
    var side = document.getElementById('air-side'); if (!side) return;
    var total = COMPONENTS.length;
    if (total <= 1) { side.style.display = 'none'; return; }
    side.style.display = 'flex';
    var reviewed = COMPONENTS.filter(function (c) { return c.reviewed; }).length;
    var items = COMPONENTS.map(function (c, i) {
      var miss = validate(c).length;
      var dot = c.reviewed ? 'reviewed' : 'attention';
      var meta = c.reviewed ? 'Accepted' : (miss ? miss + ' to resolve' : 'Ready to accept');
      var lvl = (c.vals.packagingLevel && c.vals.packagingLevel.v) || '';
      return '<div class="air-comp' + (i === cur ? ' active' : '') + '" onclick="airSelect(' + i + ')">' +
        '<span class="air-comp-dot ' + dot + '"></span>' +
        '<div class="air-comp-body"><div class="air-comp-name">' + esc(c.name) + '</div><div class="air-comp-meta">' + esc(lvl) + (lvl ? ' · ' : '') + meta + '</div></div>' +
        '<button class="air-comp-del" title="Remove this component" onclick="airDelete(' + i + ',event)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div>';
    }).join('');
    side.innerHTML =
      '<div class="air-side-hdr"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2a2 2 0 0 0 2-2V4a2 2 0 0 1 2-2z"/></svg>' + total + ' components detected</div>' +
      '<div class="air-side-sub">Your import contained multiple packaging components. Review and accept each one.</div>' +
      '<div class="air-comp-list">' + items + '</div>' +
      '<div class="air-side-finish"><div class="air-finish-progress"><b>' + reviewed + '</b> of ' + total + ' accepted</div>' +
      '<button class="air-finish-btn" onclick="airFinish()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Finish upload</button></div>';
  }

  function render() { renderSidebar(); renderMain(); }

  window.airSelect = function (i) {
    if (i < 0 || i >= COMPONENTS.length) return;
    cur = i; render();
    var root = document.getElementById('air-root');
    if (root && root.scrollIntoView) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Accepted component → canonical record (same shape the manual & detail flows
     use), persisted so opening it from Packaging Components shows identical data. */
  function toRecord(c) {
    var rec = { name: c.name, materials: c.materials.slice(), documents: c.documents.slice(), fields: {} };
    SCHEMA.forEach(function (sec) { sec.fields.forEach(function (f) {
      if (f.control === 'materials' || f.control === 'docs') return;
      rec.fields[f.key] = (c.vals[f.key] || {}).v || '';
    }); });
    return rec;
  }
  function persistAccepted(c) {
    try {
      var store = JSON.parse(sessionStorage.getItem('gs_accepted_components') || '{}');
      store[c.name] = toRecord(c);
      sessionStorage.setItem('gs_accepted_components', JSON.stringify(store));
    } catch (e) {}
  }

  window.airAccept = function () {
    var c = COMPONENTS[cur]; if (!c) return;
    document.querySelectorAll('.air-field.air-invalid').forEach(function (x) { x.classList.remove('air-invalid'); });
    var invalid = validate(c);
    if (invalid.length) {
      var first = null;
      invalid.forEach(function (k) {
        var fld = document.querySelector('.air-field[data-k="' + k + '"]');
        if (fld) {
          fld.classList.add('air-invalid');
          fld.classList.remove('air-shake'); void fld.offsetWidth; fld.classList.add('air-shake');
          setTimeout((function (f) { return function () { f.classList.remove('air-shake'); }; })(fld), 600);
          if (!first) first = fld;
        }
      });
      var hasMat = invalid.indexOf('materials') > -1;
      toast(invalid.length + ' item' + (invalid.length > 1 ? 's' : '') + ' still need attention' + (hasMat ? ' (materials must total 100%)' : ''));
      if (first && first.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    c.reviewed = true;
    persistAccepted(c);
    var note = window.GSSchema ? window.GSSchema.materialExportNote(c.materials) : '';
    toast('“' + c.name + '” accepted' + (note ? ' — ' + note : ''));
    var next = -1;
    for (var i = 0; i < COMPONENTS.length; i++) { if (!COMPONENTS[i].reviewed) { next = i; break; } }
    if (next !== -1 && next !== cur) { window.airSelect(next); }
    else { render(); if (next === -1) toast('All components accepted — finish the upload'); }
  };

  window.airDelete = function (idx, ev) {
    if (ev) ev.stopPropagation();
    if (COMPONENTS.length <= 1) { toast('At least one component is required'); return; }
    var name = COMPONENTS[idx] ? COMPONENTS[idx].name : '';
    COMPONENTS.splice(idx, 1);
    if (cur >= COMPONENTS.length) cur = COMPONENTS.length - 1; else if (idx < cur) cur--;
    render();
    toast('“' + name + '” removed');
  };

  window.airFinish = function () {
    var total = COMPONENTS.length;
    var reviewed = COMPONENTS.filter(function (c) { return c.reviewed; }).length;
    if (reviewed === 0) { toast('Accept at least one component before finishing'); return; }
    try { sessionStorage.setItem('gs_air_done', JSON.stringify({ reviewed: reviewed, total: total })); } catch (e) {}
    if (typeof window.go === 'function') window.go('sp9');
  };

  window.aiNav = function (i) { window.airSelect(i); };
  window.aiAccept = function () { window.airAccept(); };

  function init() { if (document.getElementById('air-root')) { cur = 0; render(); } }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
