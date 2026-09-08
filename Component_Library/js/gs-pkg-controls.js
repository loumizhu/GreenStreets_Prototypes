/* ==========================================================================
   gs-pkg-controls.js — the packaging-detail RICH CONTROLS layer.

   A verbatim port of the control builders in
   Supplier_Portal/js/supplier-portal.js, which is the model for every packaging
   detail page: Yes/No selects become toggle switches, short picklists become
   segmented choice lists, % fields get a slider + number stepper, long picklists
   and material names become type-or-pick comboboxes, and each material's
   name + % pair is grouped into one .pkg-mat-row card.

   Entry point: GSPkgControls(root) — call it after rendering
   .pkg-detail-section / .pkg-detail-feat markup. Pass {readOnly:true} to keep
   the model's appearance while blocking interaction (the Retailer User is a
   read-only persona).
   ========================================================================== */
(function (root) {
  'use strict';
  var GS_MATERIAL_NAMES = (root.GS_VOCAB && root.GS_VOCAB.materialName) ? root.GS_VOCAB.materialName.slice() : [];

  function gsIsYesNo(texts){
    if(texts.length!==2) return false;
    var s = texts.map(function(t){return t.toLowerCase();}).sort();
    return s[0]==='no' && s[1]==='yes';
  }
  
  function gsBuildToggle(feat, sel, input){
    if(feat.classList.contains('gs-has-toggle')) return;
    feat.classList.add('gs-has-toggle');
    var on = /yes/i.test((input&&input.value)||'') || /yes/i.test(sel.value||'');
    var t = document.createElement('button');
    t.type='button';
    t.className='gs-toggle'+(on?' on':'');
    t.setAttribute('role','switch');
    t.setAttribute('aria-checked', on?'true':'false');
    t.innerHTML='<span class="gs-toggle-track"><span class="gs-toggle-thumb"></span></span><span class="gs-toggle-lbl">'+(on?'Yes':'No')+'</span>';
    t.addEventListener('click',function(){
      var now = !t.classList.contains('on');
      t.classList.toggle('on', now);
      t.setAttribute('aria-checked', now?'true':'false');
      t.querySelector('.gs-toggle-lbl').textContent = now?'Yes':'No';
      gsSetSelectValue(sel, now?'Yes':'No');
      if(input) input.value = now?'Yes':'No';
      sel.dispatchEvent(new Event('change',{bubbles:true}));
    });
    feat.appendChild(t);
  }
  
  function gsBuildSegmented(feat, sel, input, texts){
    if(feat.classList.contains('gs-has-seg')) return;
    feat.classList.add('gs-has-seg');
    var wrap = document.createElement('div');
    wrap.className='gs-seg';
    var curr = (input&&input.value) || sel.value;
    texts.forEach(function(txt){
      var b = document.createElement('button');
      b.type='button';
      b.className='gs-seg-opt'+((txt===curr)?' on':'');
      b.textContent = txt;
      b.addEventListener('click',function(){
        wrap.querySelectorAll('.gs-seg-opt').forEach(function(o){o.classList.remove('on');});
        b.classList.add('on');
        gsSetSelectValue(sel, txt);
        if(input) input.value = txt;
        sel.dispatchEvent(new Event('change',{bubbles:true}));
      });
      wrap.appendChild(b);
    });
    feat.appendChild(wrap);
  }
  
  function gsBuildPct(feat, input){
    if(feat.classList.contains('gs-has-pct')) return;
    feat.classList.add('gs-has-pct');
    var n = parseFloat(String(input.value).replace(/[^0-9.]/g,''));
    if(isNaN(n)) n = 0;
    n = Math.max(0, Math.min(100, n));
    var wrap = document.createElement('div');
    wrap.className='gs-pct';
    var slider = document.createElement('input');
    slider.type='range'; slider.min='0'; slider.max='100'; slider.step='1';
    slider.value=String(n); slider.className='gs-pct-slider';
    var numWrap = document.createElement('div');
    numWrap.className='gs-pct-numwrap';
    var num = document.createElement('input');
    num.type='number'; num.min='0'; num.max='100'; num.step='1';
    num.value=String(n); num.className='gs-pct-num fi';
    var unit = document.createElement('span');
    unit.className='fi-unit'; unit.textContent='%';
    numWrap.appendChild(num); numWrap.appendChild(unit);
    function commit(v){
      v = Math.max(0, Math.min(100, parseFloat(v)||0));
      slider.value=String(v); num.value=String(v);
      input.value = v + '%';
      slider.style.setProperty('--gs-pct', v + '%');
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    slider.addEventListener('input',function(){ commit(slider.value); });
    num.addEventListener('input',function(){ commit(num.value); });
    slider.style.setProperty('--gs-pct', n + '%');
    wrap.appendChild(slider);
    wrap.appendChild(numWrap);
    feat.appendChild(wrap);
    if(typeof window.GSEnhanceNumbers==='function'){ try{ window.GSEnhanceNumbers(wrap); }catch(_){} }
  }
  
  function gsMakeSelectEditable(feat){
    if(!feat) return;
    var sel = feat.querySelector('.pkg-detail-feat-select');
    var input = feat.querySelector('.pkg-detail-feat-input');
    if(!sel || !input) return;
    var values = Array.prototype.filter.call(sel.options, function(o){
      var t = o.text.trim();
      return !o.disabled && t && !/^select/i.test(t);
    }).map(function(o){ return o.text.trim(); });
    if(!values.length) return;
    feat.classList.add('gs-combo-sel');
    gsAttachCombo(input, values, sel);
  }
  
  function gsAttachCombo(input, values, sel){
    if(!input || input.dataset.gsCombo || !values || !values.length) return;
    input.dataset.gsCombo = '1';
    input.classList.add('editable-text');
    input.setAttribute('autocomplete','off');
    input.removeAttribute('list');
    if(!input.placeholder) input.placeholder = 'Type or pick a value';
  
    var wrap = document.createElement('div');
    wrap.className = 'gs-ecombo';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var caret = document.createElement('button');
    caret.type = 'button'; caret.className = 'gs-ecombo-caret'; caret.tabIndex = -1;
    caret.setAttribute('aria-label','Show options');
    caret.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>';
    wrap.appendChild(caret);
  
    var menu = document.createElement('div');
    menu.className = 'cs-menu gs-ecombo-menu';
    document.body.appendChild(menu);
    var open = false, hi = -1, shown = [];
  
    function render(term){
      term = (term||'').trim().toLowerCase();
      shown = values.filter(function(v){ return !term || v.toLowerCase().indexOf(term) > -1; });
      if(!shown.length) shown = values.slice();   /* never show an empty list */
      menu.innerHTML = '';
      shown.forEach(function(v, i){
        var o = document.createElement('div');
        o.className = 'cs-opt' + (v === input.value.trim() ? ' sel' : '') + (i === hi ? ' cs-hi' : '');
        o.textContent = v;
        o.addEventListener('mousedown', function(e){ e.preventDefault(); pick(v); });
        menu.appendChild(o);
      });
    }
    function position(){
      var r = input.getBoundingClientRect();
      menu.style.minWidth = Math.round(r.width) + 'px';
      menu.style.left = Math.round(r.left) + 'px';
      var below = window.innerHeight - r.bottom;
      if(below < 180 && r.top > below){
        menu.style.top = '';
        menu.style.bottom = Math.round(window.innerHeight - r.top + 5) + 'px';
      } else {
        menu.style.bottom = '';
        menu.style.top = Math.round(r.bottom + 5) + 'px';
      }
    }
    function openMenu(term){
      hi = -1; render(term); position();
      menu.classList.add('open'); wrap.classList.add('open'); open = true;
    }
    function closeMenu(){ menu.classList.remove('open'); wrap.classList.remove('open'); open = false; hi = -1; }
    function pick(v){
      input.value = v;
      if(sel) gsSetSelectValue(sel, v);
      closeMenu();
      input.dispatchEvent(new Event('change',{bubbles:true}));
      if(sel) sel.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function moveHi(d){
      if(!open){ openMenu(''); return; }
      hi = (hi + d + shown.length) % shown.length;
      var kids = menu.children;
      for(var i=0;i<kids.length;i++) kids[i].classList.toggle('cs-hi', i === hi);
      if(kids[hi]) kids[hi].scrollIntoView({block:'nearest'});
    }
  
    caret.addEventListener('mousedown', function(e){ e.preventDefault(); });
    caret.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if(open) { closeMenu(); return; }
      input.focus(); openMenu('');   /* caret always shows the FULL list */
    });
    input.addEventListener('focus', function(){ if(!open) openMenu(''); });
    input.addEventListener('click', function(){ if(!open) openMenu(input.value); });
    input.addEventListener('input', function(){ openMenu(input.value); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); moveHi(1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); moveHi(-1); }
      else if(e.key === 'Enter'){ if(open && hi > -1){ e.preventDefault(); pick(shown[hi]); } else closeMenu(); }
      else if(e.key === 'Escape'){ if(open){ e.stopPropagation(); closeMenu(); } }
      else if(e.key === 'Tab'){ closeMenu(); }
    });
    input.addEventListener('blur', function(){
      setTimeout(function(){
        if(!open) return;
        closeMenu();
        var v = input.value.trim();
        if(v && sel) gsSetSelectValue(sel, v);   /* free text is allowed — keep the select in step */
      }, 120);
    });
    if(sel){
      input.addEventListener('change', function(){
        var v = input.value.trim();
        if(v) gsSetSelectValue(sel, v);
      });
      sel.addEventListener('change', function(){
        var o = sel.options[sel.selectedIndex];
        if(o && o.text.trim() !== input.value.trim()) input.value = o.text.trim();
      });
    }
    document.addEventListener('click', function(e){
      if(open && !wrap.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
    window.addEventListener('scroll', function(){ if(open) position(); }, true);
    window.addEventListener('resize', function(){ if(open) position(); });
  }
  
  function gsBuildCombobox(input){
    /* Was a native <datalist>; Chrome filters that popup by the field's current
       value, so a filled field showed a one-item list. Use the themed combo. */
    if(!input.placeholder) input.placeholder='Type or pick a material';
    gsAttachCombo(input, GS_MATERIAL_NAMES, null);
  }
  
  function gsSetSelectValue(sel, val){
    var found=false;
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].text.trim()===val || sel.options[i].value===val){ sel.selectedIndex=i; found=true; break; }
    }
    if(!found){ var o=document.createElement('option'); o.text=val; o.value=val; o.selected=true; sel.appendChild(o); }
  }
  
  function gsIsMaterialNameFeat(feat, label){
    if(feat.getAttribute('data-mt')==='name') return true;
    return /material\s*\d*\s*name/i.test(label);
  }
  
  function gsEnhanceFeat(feat){
    var sel   = feat.querySelector('.pkg-detail-feat-select');
    var input = feat.querySelector('.pkg-detail-feat-input');
    var lblEl = feat.querySelector('.pkg-detail-feat-lbl');
    var label = lblEl ? lblEl.textContent.trim() : '';
    if(feat.classList.contains('air-feat')) return; /* AI-review fields keep their own UI */
    if(sel){
      var opts  = Array.prototype.filter.call(sel.options, function(o){ return !o.disabled && o.value!=='' ; });
      var texts = opts.map(function(o){ return o.text.trim(); });
      if(gsIsYesNo(texts)){ gsBuildToggle(feat, sel, input); }
      else if(opts.length<=4 && label.toLowerCase().indexOf('no. of materials')<0){ gsBuildSegmented(feat, sel, input, texts); }
      /* else: leave as the themed dropdown */
    } else if(input){
      if(/%/.test(label) || /\bpercent/i.test(label)){ gsBuildPct(feat, input); }
      else if(gsIsMaterialNameFeat(feat, label)){ gsBuildCombobox(input); }
    }
  }
  
  function pkgMatRemoveBtn() {
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'pkg-mat-remove';
    rm.title = 'Remove this material';
    rm.setAttribute('onclick', 'pkgRemoveMaterial(this)');
    rm.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    return rm;
  }
  
  function pkgWrapMaterialRows(grid) {
    if (!grid) return;
    var order = [];
    grid.querySelectorAll('[data-mr]').forEach(function(el){
      var mr = el.getAttribute('data-mr');
      if (order.indexOf(mr) === -1) order.push(mr);
    });
    order.forEach(function(mr){
      var feats = grid.querySelectorAll('.pkg-detail-feat[data-mr="' + mr + '"]');
      if (!feats.length) return;
      var row = feats[0].parentElement;
      if (!row || !row.classList.contains('pkg-mat-row')) {
        row = document.createElement('div');
        row.className = 'pkg-mat-row';
        feats[0].parentElement.insertBefore(row, feats[0]);
        feats.forEach(function(ft){ row.appendChild(ft); });
      }
      row.setAttribute('data-mrow', mr);
      if (!row.querySelector('.pkg-mat-remove')) row.appendChild(pkgMatRemoveBtn());
      else row.appendChild(row.querySelector('.pkg-mat-remove')); /* keep it last / right-aligned */
    });
  }
  
  /* Walk a rendered detail body and upgrade every field to the model's control. */
  function GSPkgControls(scope, opts) {
    opts = opts || {};
    scope = scope || document;
    scope.querySelectorAll('.pkg-detail-feat').forEach(function (feat) {
      try { gsEnhanceFeat(feat); } catch (e) {}
    });
    scope.querySelectorAll('.pkg-detail-grid').forEach(function (grid) {
      if (!grid.querySelector('[data-mr]')) return;
      grid.classList.add('pkg-mat-grid');          /* one material per line */
      pkgWrapMaterialRows(grid);
      grid.querySelectorAll('.pkg-detail-feat').forEach(function (feat) {
        if (feat.hasAttribute('data-mr')) return;
        var lbl = feat.querySelector('.pkg-detail-feat-lbl');
        if (lbl && lbl.textContent.trim().toLowerCase().indexOf('base material') === 0) gsMakeSelectEditable(feat);
      });
    });
    if (opts.readOnly) {
      scope.querySelectorAll('.pkg-detail-section').forEach(function (s) { s.classList.add('gs-pkg-ro'); });
      scope.querySelectorAll('input,select,button,.gs-toggle,.gs-seg-opt').forEach(function (el) {
        el.tabIndex = -1;
        if (el.tagName === 'INPUT') el.readOnly = true;
        if (el.tagName === 'SELECT') el.disabled = true;
      });
    }
  }

  root.GSPkgControls = GSPkgControls;
  root.gsEnhanceFeat = root.gsEnhanceFeat || gsEnhanceFeat;
})(window);
