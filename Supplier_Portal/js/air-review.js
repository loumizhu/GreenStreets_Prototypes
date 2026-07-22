/* ==========================================================================
   air-review.js — data-driven AI-Review with multi-component support.
   Rebuilds the review experience: proper wizard-style field controls
   (dropdown / Yes-No toggle / % with slider / number+unit / text), a sticky
   left sidebar listing every packaging component detected in an import (only
   shown when >1), per-component Accept (with validation) + Delete, and a
   single "Finish upload" action. Renders into #air-root.
   Depends on globals from supplier-portal.js / greenstreets-theme.js:
   go(), gsToast(), window.GSEnhanceSelects().
   ========================================================================== */
(function () {
  'use strict';

  var AIR_MATERIALS = ['Paper', 'Cardboard', 'Corrugate', 'LDPE', 'HDPE', 'PP', 'PET', 'PVC', 'PS', 'Glass', 'Aluminium', 'Steel', 'Wood', 'Textile', 'Composite', 'Other'];

  var AIR_SCHEMA = [
    { n: 'Packaging Level & Format', f: [
      { k: 'level', l: 'Packaging Level', t: 'select', o: ['Primary', 'Secondary', 'Tertiary'] },
      { k: 'format', l: 'Packaging Format', t: 'select', o: ['Swing Tag', 'Label', 'Poly Bag', 'Box / Carton', 'Hanger', 'Wrap', 'Tissue Paper', 'Pallet', 'Fastener', 'Other'] },
      { k: 'reusable', l: 'Reusable', t: 'bool' },
      { k: 'refillable', l: 'Refillable', t: 'bool' }
    ] },
    { n: 'Packaging Source Type', f: [
      { k: 'source', l: 'Packaging Source Type', t: 'select', o: ['Paper / Cardboard', 'Plastic', 'Metal', 'Glass', 'Composite', 'Wood', 'Textile'] },
      { k: 'hasRecycled', l: 'Contains Recycled Content', t: 'bool' }
    ] },
    { n: 'Material Information', f: [
      { k: 'mat1', l: 'Material 1 Name', t: 'select', o: AIR_MATERIALS },
      { k: 'mat1pct', l: '% Material 1', t: 'pct' },
      { k: 'mat2', l: 'Material 2 Name', t: 'select', o: AIR_MATERIALS, opt: true },
      { k: 'mat2pct', l: '% Material 2', t: 'pct', opt: true }
    ] },
    { n: 'Post-Consumer & Recycled Content', f: [
      { k: 'pcr', l: 'PCR %', t: 'pct' },
      { k: 'pir', l: 'PIR %', t: 'pct' },
      { k: 'rctype', l: 'Recycled Content Type', t: 'select', o: ['PCR Paper', 'PCR Plastic', 'PIR Plastic', 'Ocean-bound', 'None'], opt: true },
      { k: 'evidence', l: 'Supporting Evidence', t: 'text', opt: true }
    ] },
    { n: 'Colour & Decoration', f: [
      { k: 'colour', l: 'Colour', t: 'select', o: ['Clear', 'White', 'Natural / Kraft', 'Full colour print', 'Black', 'Other'] },
      { k: 'ink', l: 'Ink Type', t: 'select', o: ['None', 'Water-based', 'Solvent-based', 'UV-cured', 'Soy-based'], opt: true },
      { k: 'coating', l: 'Coating', t: 'select', o: ['None', 'Varnish', 'Lamination', 'Aqueous', 'Wax'], opt: true }
    ] },
    { n: 'Weight, Grammage & Dimensions', f: [
      { k: 'gsm', l: 'Grammage', t: 'num', u: 'gsm', opt: true },
      { k: 'weight', l: 'Unit Weight', t: 'num', u: 'g' },
      { k: 'width', l: 'Width', t: 'num', u: 'mm' },
      { k: 'height', l: 'Height', t: 'num', u: 'mm' },
      { k: 'depth', l: 'Depth', t: 'num', u: 'mm', opt: true }
    ] },
    { n: 'Material Compliance', f: [
      { k: 'reach', l: 'REACH Compliant', t: 'bool' },
      { k: 'heavy', l: 'Heavy Metals <100ppm', t: 'bool' },
      { k: 'bpa', l: 'BPA Free', t: 'bool' }
    ] }
  ];

  function makeComp(name, level, map) {
    var vals = {};
    AIR_SCHEMA.forEach(function (sec) {
      sec.f.forEach(function (f) {
        var e = map[f.k];
        var v = e ? e[0] : '';
        var conf = e ? e[1] : 'missing';
        if (v === '' || v == null) { v = ''; conf = 'missing'; }
        vals[f.k] = { v: String(v), conf: conf };
      });
    });
    return { name: name, level: level, reviewed: false, vals: vals };
  }

  var COMPONENTS = [
    makeComp('Swing Tag', 'Primary', {
      level: ['Primary', 'high'], format: ['Swing Tag', 'high'], reusable: ['No', 'high'], refillable: ['No', 'high'],
      source: ['Paper / Cardboard', 'high'], hasRecycled: ['Yes', 'med'],
      mat1: ['Paper', 'high'], mat1pct: ['100', 'high'],
      pcr: ['30', 'med'], pir: ['0', 'high'], rctype: ['PCR Paper', 'med'],
      colour: ['Full colour print', 'high'], ink: ['Water-based', 'med'],
      gsm: ['300', 'high'], weight: ['2.1', 'high'], width: ['55', 'high'], height: ['90', 'high'],
      reach: ['Yes', 'high'], heavy: ['Yes', 'high']
    }),
    makeComp('Poly Bag', 'Primary', {
      level: ['Primary', 'high'], format: ['Poly Bag', 'high'], reusable: ['No', 'high'], refillable: ['No', 'high'],
      source: ['Plastic', 'high'], hasRecycled: ['No', 'med'],
      mat1: ['LDPE', 'high'], mat1pct: ['100', 'high'],
      colour: ['Clear', 'high'], ink: ['None', 'high'], coating: ['None', 'high'],
      weight: ['8.5', 'med'], width: ['320', 'high'], height: ['450', 'high']
    }),
    makeComp('Shipping Carton', 'Secondary', {
      level: ['Secondary', 'high'], format: ['Box / Carton', 'high'], reusable: ['No', 'high'], refillable: ['No', 'high'],
      source: ['Paper / Cardboard', 'high'], hasRecycled: ['Yes', 'high'],
      mat1: ['Corrugate', 'high'], mat1pct: ['100', 'high'],
      pcr: ['65', 'high'], pir: ['10', 'med'], rctype: ['PCR Paper', 'high'], evidence: ['FSC-cert.pdf', 'high'],
      colour: ['Natural / Kraft', 'high'], ink: ['Water-based', 'high'], coating: ['None', 'high'],
      gsm: ['180', 'high'], weight: ['180', 'high'], width: ['400', 'high'], height: ['300', 'high'], depth: ['250', 'high'],
      reach: ['Yes', 'high'], heavy: ['Yes', 'high'], bpa: ['Yes', 'high']
    })
  ];

  var cur = 0;

  function svg(kind) {
    if (kind === 'check') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    if (kind === 'alert') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }
  function badge(conf) {
    if (conf === 'high') return '<span class="air-badge high">' + svg('check') + 'High confidence</span>';
    if (conf === 'med') return '<span class="air-badge med">' + svg('alert') + 'Check value</span>';
    if (conf === 'user') return '<span class="air-badge user">' + svg('check') + 'Edited</span>';
    return '<span class="air-badge missing">' + svg('info') + 'Missing</span>';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function toast(m) { if (typeof window.gsToast === 'function') window.gsToast(m); }

  function fieldHtml(f) {
    var c = COMPONENTS[cur];
    var cell = c.vals[f.k] || { v: '', conf: 'missing' };
    var v = cell.v, conf = cell.conf;
    var req = f.opt ? '' : '<span class="req-star">*</span>';
    var ctrl = '';
    if (f.t === 'bool') {
      ctrl = '<div class="air-toggle" data-k="' + f.k + '">' +
        '<button type="button" class="' + (v === 'Yes' ? 'on-yes' : '') + '" onclick="airBool(this,\'' + f.k + '\',\'Yes\')">Yes</button>' +
        '<button type="button" class="' + (v === 'No' ? 'on-no' : '') + '" onclick="airBool(this,\'' + f.k + '\',\'No\')">No</button>' +
        '</div>';
    } else if (f.t === 'pct') {
      var num = (v === '' ? '' : v);
      ctrl = '<div class="air-pct" data-k="' + f.k + '">' +
        '<input class="air-pct-num" type="number" min="0" max="100" value="' + esc(num) + '" placeholder="0" oninput="airPctNum(this,\'' + f.k + '\')">' +
        '<span class="air-pct-suffix">%</span>' +
        '<input class="air-pct-range" type="range" min="0" max="100" step="1" value="' + (num === '' ? 0 : esc(num)) + '" oninput="airPctRange(this,\'' + f.k + '\')">' +
        '</div>';
    } else if (f.t === 'num') {
      ctrl = '<div class="air-num-unit"><input class="fi" type="number" value="' + esc(v) + '" placeholder="Enter value" oninput="airSet(this,\'' + f.k + '\')">' +
        (f.u ? '<span class="air-unit">' + esc(f.u) + '</span>' : '') + '</div>';
    } else if (f.t === 'select') {
      var opts = '<option value="" ' + (v === '' ? 'selected' : '') + ' disabled hidden>Select…</option>';
      var list = f.o.slice();
      if (v !== '' && list.indexOf(v) === -1) list.unshift(v);
      list.forEach(function (o) { opts += '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; });
      ctrl = '<select class="fi" onchange="airSet(this,\'' + f.k + '\')">' + opts + '</select>';
    } else {
      ctrl = '<input class="fi" type="text" value="' + esc(v) + '" placeholder="Enter value" oninput="airSet(this,\'' + f.k + '\')">';
    }
    var lblCls = 'air-field-lbl' + (conf === 'missing' ? ' lbl-missing' : '');
    return '<div class="air-field" data-k="' + f.k + '">' +
      '<div class="' + lblCls + '">' + esc(f.l) + req + '</div>' +
      '<div class="air-ctrl-row">' + ctrl + '<span class="air-badge-slot">' + badge(conf) + '</span></div>' +
      '</div>';
  }

  function fieldOf(el) { return el.closest ? el.closest('.air-field') : null; }
  function markEdited(el) {
    var field = fieldOf(el); if (!field) return;
    field.classList.remove('air-invalid');
    var lbl = field.querySelector('.air-field-lbl');
    if (lbl) lbl.classList.remove('lbl-missing');
    var slot = field.querySelector('.air-badge-slot');
    if (slot) slot.innerHTML = badge('user');
  }

  window.airSet = function (el, key) {
    var c = COMPONENTS[cur]; if (!c) return;
    c.vals[key] = { v: el.value, conf: 'user' };
    markEdited(el);
  };
  window.airBool = function (btn, key, val) {
    var c = COMPONENTS[cur]; if (!c) return;
    c.vals[key] = { v: val, conf: 'user' };
    var btns = btn.parentNode.querySelectorAll('button');
    btns[0].className = (val === 'Yes' ? 'on-yes' : '');
    btns[1].className = (val === 'No' ? 'on-no' : '');
    markEdited(btn);
  };
  window.airPctNum = function (inp, key) {
    var v = parseFloat(inp.value);
    if (isNaN(v)) v = ''; else v = Math.max(0, Math.min(100, v));
    var r = inp.closest('.air-pct').querySelector('.air-pct-range');
    if (r && v !== '') r.value = v;
    var c = COMPONENTS[cur]; if (c) c.vals[key] = { v: (v === '' ? '' : String(v)), conf: 'user' };
    markEdited(inp);
  };
  window.airPctRange = function (r, key) {
    var v = Math.max(0, Math.min(100, parseInt(r.value, 10) || 0));
    var n = r.closest('.air-pct').querySelector('.air-pct-num');
    if (n) n.value = v;
    var c = COMPONENTS[cur]; if (c) c.vals[key] = { v: String(v), conf: 'user' };
    markEdited(r);
  };

  function counts(c) {
    var o = { confirmed: 0, attention: 0, missing: 0 };
    AIR_SCHEMA.forEach(function (sec) { sec.f.forEach(function (f) {
      var cell = c.vals[f.k] || { conf: 'missing' };
      if (cell.conf === 'high' || cell.conf === 'user') o.confirmed++;
      else if (cell.conf === 'med') o.attention++;
      else o.missing++;
    }); });
    return o;
  }
  function reqMissing(c) {
    var n = 0;
    AIR_SCHEMA.forEach(function (sec) { sec.f.forEach(function (f) {
      if (f.opt) return;
      var cell = c.vals[f.k]; var v = cell ? String(cell.v).trim() : '';
      if (v === '') n++;
    }); });
    return n;
  }

  function navBtns() {
    var total = COMPONENTS.length, prevDis = cur <= 0, nextDis = cur >= total - 1;
    function b(dir, label, dis) {
      return '<button onclick="airSelect(' + (cur + dir) + ')" ' + (dis ? 'disabled' : '') +
        ' style="display:flex;align-items:center;gap:5px;height:32px;padding:0 14px;background:' + (dis ? 'transparent' : 'rgba(255,255,255,.07)') +
        ';border:1px solid rgba(255,255,255,' + (dis ? '.07' : '.15') + ');color:rgba(255,255,255,' + (dis ? '.2' : '.6') +
        ');border-radius:7px;font-family:inherit;font-size:12px;cursor:' + (dis ? 'default' : 'pointer') + '">' + label + '</button>';
    }
    return '<div style="display:flex;align-items:center;gap:6px">' +
      b(-1, '‹ Prev', prevDis) +
      '<span style="font-size:11px;color:rgba(255,255,255,.35);white-space:nowrap">' + (cur + 1) + ' / ' + total + '</span>' +
      b(1, 'Next ›', nextDis) + '</div>';
  }

  function renderMain() {
    var host = document.getElementById('air-main'); if (!host) return;
    var c = COMPONENTS[cur]; if (!c) return;
    var total = COMPONENTS.length, cnt = counts(c);
    var secHtml = AIR_SCHEMA.map(function (sec, si) {
      var attn = 0;
      sec.f.forEach(function (f) { var cell = c.vals[f.k] || { conf: 'missing' }; if (!f.opt && (cell.conf === 'med' || cell.conf === 'missing')) attn++; });
      var attnPill = attn ? '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(245,166,35,.1);color:rgba(245,166,35,.8);border:1px solid rgba(245,166,35,.25);margin-left:8px">' + attn + ' need attention</span>' : '';
      return '<div class="pkg-detail-section"><div class="pkg-detail-section-hdr"><span class="pkg-detail-section-num">' + (si + 1) + '</span>' + esc(sec.n) + attnPill + '</div><div class="pkg-detail-grid">' + sec.f.map(fieldHtml).join('') + '</div></div>';
    }).join('');

    var nav = navBtns();
    var header = '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 12px;gap:12px;flex-wrap:wrap"><div>' +
      '<div style="font-size:15px;font-weight:700;color:#fff">' + esc(c.name) + (c.reviewed ? ' <span style="font-size:10px;font-weight:700;color:#4ebb81;background:rgba(78,187,129,.14);border:1px solid rgba(78,187,129,.3);padding:2px 7px;border-radius:4px;vertical-align:2px">Accepted</span>' : '') + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">Component ' + (cur + 1) + ' of ' + total + '<span style="margin:0 6px;opacity:.3">·</span><span style="color:#4ebb81">' + cnt.confirmed + ' confirmed</span><span style="margin:0 4px;opacity:.3">·</span><span style="color:#f5a623">' + cnt.attention + ' to check</span><span style="margin:0 4px;opacity:.3">·</span><span style="color:rgba(255,255,255,.35)">' + cnt.missing + ' missing</span></div>' +
      '</div>' + nav + '</div>';
    var footer = '<div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' + nav +
      '<button onclick="airAccept()" style="display:flex;align-items:center;gap:8px;height:40px;padding:0 26px;background:var(--gs);border:none;color:#04130c;border-radius:9px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:filter .12s">' +
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
      var miss = reqMissing(c);
      var dot = c.reviewed ? 'reviewed' : 'attention';
      var meta = c.reviewed ? 'Accepted' : (miss ? miss + ' required left' : 'Ready to accept');
      return '<div class="air-comp' + (i === cur ? ' active' : '') + '" onclick="airSelect(' + i + ')">' +
        '<span class="air-comp-dot ' + dot + '"></span>' +
        '<div class="air-comp-body"><div class="air-comp-name">' + esc(c.name) + '</div><div class="air-comp-meta">' + esc(c.level) + ' · ' + meta + '</div></div>' +
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
    cur = i;
    render();
    var root = document.getElementById('air-root');
    if (root && root.scrollIntoView) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.airAccept = function () {
    var c = COMPONENTS[cur]; if (!c) return;
    document.querySelectorAll('.air-field.air-invalid').forEach(function (x) { x.classList.remove('air-invalid'); });
    var invalid = [];
    AIR_SCHEMA.forEach(function (sec) { sec.f.forEach(function (f) {
      if (f.opt) return;
      var cell = c.vals[f.k]; var v = cell ? String(cell.v).trim() : '';
      if (v === '') invalid.push(f.k);
    }); });
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
      toast(invalid.length + ' required field' + (invalid.length > 1 ? 's' : '') + ' still need a value');
      if (first && first.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    c.reviewed = true;
    toast('“' + c.name + '” accepted');
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
    if (cur >= COMPONENTS.length) cur = COMPONENTS.length - 1;
    else if (idx < cur) cur--;
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

  /* keep old entry points working (aiNav/aiAccept from other pages) */
  window.aiNav = function (i) { window.airSelect(i); };
  window.aiAccept = function () { window.airAccept(); };

  function init() { if (document.getElementById('air-root')) { cur = 0; render(); } }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
