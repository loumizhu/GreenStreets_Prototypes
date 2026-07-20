/* Greenstreets shared behaviour: animated focus outline + themed selects. Linked by all prototypes. */
(function(){

  /* ── Animated focus outline ──────────────────────────────────────────────────────────────────
     Draws a conic-gradient border ring (.fs-ring, styled in css/greenstreets-theme.css) over the
     focused field / select-trigger / button. The ring is inserted as an ABSOLUTE SIBLING of the
     control (not a fixed overlay on <body>), so it shares the control's stacking context: it hides
     behind a modal when the control is behind one, shows above content for a control inside the
     modal, and scrolls with the control. (An overlay is needed at all because <input> can't take a
     ::before, and masking the input would hide its own text.) */
  var SEL='.fi, .btn-p, .btn-g, .btn-g-sm';
  var ring=null, curEl=null, rafId=0;

  /* cubic-bezier(x1,y1,x2,y2) → easing function; 'linear' handled by the caller */
  function cubicBezier(x1,y1,x2,y2){
    function cx(t){return ((1-3*x2+3*x1)*t+(3*x2-6*x1))*t*t+3*x1*t;}
    function cy(t){return ((1-3*y2+3*y1)*t+(3*y2-6*y1))*t*t+3*y1*t;}
    function dcx(t){return 3*(1-3*x2+3*x1)*t*t+2*(3*x2-6*x1)*t+3*x1;}
    return function(x){
      if(x<=0)return 0; if(x>=1)return 1;
      var t=x,i,e,d;
      for(i=0;i<8;i++){e=cx(t)-x;if(Math.abs(e)<1e-4)return cy(t);d=dcx(t);if(Math.abs(d)<1e-6)break;t-=e/d;}
      var a=0,b=1;t=x;
      while(a<b){e=cx(t);if(Math.abs(e-x)<1e-4)break;if(x>e)a=t;else b=t;t=(a+b)/2;}
      return cy(t);
    };
  }
  function easingFromVar(){
    var cs=getComputedStyle(document.documentElement);
    var raw=(cs.getPropertyValue('--field-stroke-ease')||'').trim();
    var m=raw.match(/cubic-bezier\(([^)]+)\)/);
    if(m){var n=m[1].split(',').map(parseFloat);if(n.length===4&&n.every(function(x){return !isNaN(x);}))return cubicBezier(n[0],n[1],n[2],n[3]);}
    return function(x){return x;}; // linear / fallback
  }

  function place(){
    if(!ring||!curEl||!curEl.isConnected){remove();return;}
    /* Position relative to the ring's own containing block (its offsetParent) using getBoundingClientRect —
       NOT curEl.offsetLeft, because inside a <table> the control's offsetParent is the cell/table (unpositioned)
       while the ring's containing block is the nearest positioned ancestor (.main/.pbody). Those differ, which
       threw the outline far to the left for buttons in table cells. */
    var cb=ring.offsetParent||document.documentElement;
    var cbr=cb.getBoundingClientRect(), r=curEl.getBoundingClientRect();
    ring.style.left=(r.left-cbr.left-(cb.clientLeft||0)+(cb.scrollLeft||0))+'px';
    ring.style.top=(r.top-cbr.top-(cb.clientTop||0)+(cb.scrollTop||0))+'px';
    ring.style.width=r.width+'px';
    ring.style.height=r.height+'px';
    ring.style.setProperty('--fs-radius',getComputedStyle(curEl).borderRadius);
  }
  function remove(){ if(rafId){cancelAnimationFrame(rafId);rafId=0;} if(ring){ring.remove(); ring=null; curEl=null;} }
  function draw(){
    var cs=getComputedStyle(document.documentElement);
    var dur=parseFloat(cs.getPropertyValue('--field-stroke-speed'))*1000; if(!(dur>0))dur=500;
    var ease=easingFromVar(), start=0, target=ring;
    function step(now){
      if(target!==ring)return;               // superseded / removed
      if(!start)start=now;
      var p=Math.min((now-start)/dur,1);
      ring.style.setProperty('--fs-a',(ease(p)*90).toFixed(2)+'deg');
      if(p<1)rafId=requestAnimationFrame(step);
    }
    rafId=requestAnimationFrame(step);
  }
  function show(el){
    remove();
    curEl=el;
    ring=document.createElement('div');
    ring.className='fs-ring';
    ring.style.setProperty('--fs-a','0deg');
    el.parentNode.insertBefore(ring, el.nextSibling);
    place();
    requestAnimationFrame(function(){ if(ring&&curEl===el) place(); });   // re-measure once layout settles
    draw();
  }
  document.addEventListener('focusin',function(e){
    var t=e.target;
    if(t && t.matches && t.matches(SEL) && t.offsetParent!==null) show(t);
  });
  document.addEventListener('focusout',remove);
  window.addEventListener('resize',place);

  /* ── Themed custom select ─────────────────────────────────────────────────────────────────────
     Native <select> popups are OS-drawn and can't be given the glass look (dark, rounded). This
     replaces every `select.fi` with a themed trigger + dropdown while keeping the real <select> in
     the DOM (hidden) for its value and any existing change handlers. */
  function buildSelect(sel){
    if(sel.dataset.cs || sel.multiple) return;
    sel.dataset.cs='1';

    var wrap=document.createElement('div'); wrap.className='cs-wrap';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.style.display='none';
    /* Carry the select's own sizing onto the wrap so the trigger width stays fixed
       and doesn't jump with the selected option text. */
    ['width','minWidth','maxWidth','flex','flexBasis'].forEach(function(pr){ if(sel.style[pr]) wrap.style[pr]=sel.style[pr]; });

    var trigger=document.createElement('div');
    trigger.className='fi cs-trigger';
    trigger.tabIndex=sel.disabled?-1:0;
    var val=document.createElement('span'); val.className='cs-val';
    var caret=document.createElement('span'); caret.className='cs-caret';
    caret.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    trigger.appendChild(val); trigger.appendChild(caret);
    wrap.appendChild(trigger);

    var menu=document.createElement('div'); menu.className='cs-menu';
    wrap.appendChild(menu);

    function sync(){
      var o=sel.options[sel.selectedIndex]; val.textContent=o?o.text:'';
      /* For content-sized selects (no explicit width), lock the trigger's min-width to
         the widest it has been so a shorter selection can't shrink it (which also kept
         the focus ring from mismatching the new width). */
      if(!wrap.style.width && !wrap.style.flex){
        var w=trigger.offsetWidth, cur=parseFloat(trigger.style.minWidth)||0;
        if(w>cur) trigger.style.minWidth=w+'px';
      }
    }
    function render(){
      menu.innerHTML='';
      Array.prototype.forEach.call(sel.options,function(o,i){
        var d=document.createElement('div');
        d.className='cs-opt'+(i===sel.selectedIndex?' sel':'');
        d.textContent=o.text;
        d.addEventListener('mousedown',function(e){
          e.preventDefault();                         // keep focus on the trigger
          sel.selectedIndex=i; sync(); close();
          sel.dispatchEvent(new Event('change',{bubbles:true}));
        });
        menu.appendChild(d);
      });
    }
    function positionMenu(){
      /* The menu is a position:fixed portal appended to <body>, so it's anchored to the viewport (not clipped
         by a card's overflow, and not offset by an ancestor's backdrop-filter/transform — which would make a
         fixed element resolve against that ancestor instead of the viewport). Anchor to the trigger; flip up
         if there isn't room below. */
      var tr=trigger.getBoundingClientRect();
      /* Size the menu to its own content (CSS width:max-content) but never narrower than the trigger,
         so short current selections (e.g. "Tops") don't clip longer options. */
      menu.style.width=''; menu.style.minWidth=tr.width+'px';
      var mw=menu.offsetWidth;
      var left=Math.min(tr.left, window.innerWidth-mw-8);
      menu.style.left=Math.max(8,left)+'px';
      var mh=menu.offsetHeight, below=window.innerHeight-tr.bottom;
      if(below<mh+12 && tr.top>below) menu.style.top=Math.max(6,tr.top-mh-6)+'px';
      else menu.style.top=(tr.bottom+6)+'px';
    }
    function open(){
      if(sel.disabled)return;
      render();
      if(menu.parentNode!==document.body) document.body.appendChild(menu);   // portal out of any transformed/clipping ancestor
      wrap.classList.add('open'); menu.classList.add('open');
      positionMenu();
    }
    function close(){ wrap.classList.remove('open'); menu.classList.remove('open'); }
    window.addEventListener('scroll',function(e){
      if(!menu.classList.contains('open')) return;
      /* don't close while scrolling inside the menu itself (that broke option scrolling) */
      if(e.target && e.target.closest && e.target.closest('.cs-menu')) return;
      close();
    },true);
    window.addEventListener('resize',function(){ if(menu.classList.contains('open')) positionMenu(); });
    function toggle(){ wrap.classList.contains('open')?close():open(); }

    trigger.addEventListener('click',toggle);
    trigger.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
      else if(e.key==='Escape'){ close(); }
    });
    document.addEventListener('click',function(e){ if(!wrap.contains(e.target) && !menu.contains(e.target)) close(); });
    sel.addEventListener('change',sync);   // keep the themed label in sync when value is set programmatically

    sync();
  }
  function enhanceSelects(root){ (root||document).querySelectorAll('select.fi').forEach(buildSelect); }

  /* ── Input micro-interactions ────────────────────────────────────────────────────────────────
     Shake-on-error: window.gsShake(el) plays a quick horizontal shake + red border (call it on invalid
     submit). Rotating placeholder: an input with data-rotate="Search by name|Search by domain|…" cycles
     its placeholder every few seconds while empty & unfocused (a subtle fade between values). */
  window.gsShake=function(el){
    if(!el) return;
    el.classList.remove('gs-shake'); void el.offsetWidth;   // restart the animation
    el.classList.add('gs-shake');
    el.addEventListener('animationend',function h(){ el.classList.remove('gs-shake'); el.removeEventListener('animationend',h); });
  };
  function initRotatePlaceholders(root){
    (root||document).querySelectorAll('input[data-rotate]').forEach(function(inp){
      if(inp.dataset.gsRot) return; inp.dataset.gsRot='1';
      var list=(inp.getAttribute('data-rotate')||'').split('|').map(function(s){return s.trim();}).filter(Boolean);
      if(list.length<2) return;
      var i=0;
      setInterval(function(){
        if(document.activeElement===inp || inp.value) return;   // don't fight the user
        i=(i+1)%list.length;
        inp.style.transition='color .001s'; // no-op guard
        inp.classList.add('gs-ph-fade');
        setTimeout(function(){ inp.placeholder=list[i]; inp.classList.remove('gs-ph-fade'); }, 200);
      }, 2800);
    });
  }
  window.GSRotatePlaceholders=initRotatePlaceholders;
  function init(){ enhanceSelects(); enhanceNumbers(); wireSortableTables(); initListings(); initRotatePlaceholders(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  window.GSEnhanceSelects=enhanceSelects; // allow re-scan after dynamic content is injected

  /* ── Themed number stepper ────────────────────────────────────────────────────────────────────
     Native <input type=number> spinners are OS-drawn (light, off-theme). This hides them and drops a
     themed ▲/▼ stepper into the field's positioned wrapper; if the field shows a unit suffix (.fi-unit)
     it's nudged left so the two don't overlap. Re-run window.GSEnhanceNumbers(root) after injecting fields. */
  var CHEV_UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 15 12 9 18 15"/></svg>';
  var CHEV_DN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>';
  function stepNumber(inp,dir){
    var step=parseFloat(inp.step)||1, min=inp.min!==''?parseFloat(inp.min):null, max=inp.max!==''?parseFloat(inp.max):null;
    var v=parseFloat(inp.value); if(isNaN(v))v=0;
    v=Math.round((v+dir*step)*1e6)/1e6;
    if(min!=null&&v<min)v=min; if(max!=null&&v>max)v=max;
    inp.value=v;
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    inp.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function enhanceNumbers(root){
    (root||document).querySelectorAll('input.fi[type="number"]').forEach(function(inp){
      if(inp.dataset.gsNum) return; inp.dataset.gsNum='1';
      var host=inp.parentNode; if(!host) return;
      if(getComputedStyle(host).position==='static') host.style.position='relative';
      var unit=host.querySelector('.fi-unit');
      if(unit){ unit.style.right='30px'; inp.style.paddingRight='52px'; }
      else { inp.style.paddingRight='28px'; }
      var box=document.createElement('div'); box.className='gs-num-steppers';
      var up=document.createElement('button'); up.type='button'; up.tabIndex=-1; up.className='gs-num-btn'; up.innerHTML=CHEV_UP;
      var dn=document.createElement('button'); dn.type='button'; dn.tabIndex=-1; dn.className='gs-num-btn'; dn.innerHTML=CHEV_DN;
      up.addEventListener('click',function(e){e.preventDefault();stepNumber(inp,1);});
      dn.addEventListener('click',function(e){e.preventDefault();stepNumber(inp,-1);});
      box.appendChild(up); box.appendChild(dn); host.appendChild(box);
    });
  }
  window.GSEnhanceNumbers=enhanceNumbers;

  /* ── Sortable data-table headers ──────────────────────────────────────────────────────────────
     Every .tbl header becomes click-to-sort (skipping empty action columns, tables that opt out with
     data-nosort, and the paginated product tables that own their own sort engine). The arrow shows the
     active column + direction; sorting is numeric when the cell looks numeric, else alphabetical. */
  function gsCellText(r,idx){ var c=r.cells[idx]; return c?c.textContent.trim():''; }
  function gsCmp(a,b){
    var an=parseFloat(a.replace(/[^0-9.\-]/g,'')), bn=parseFloat(b.replace(/[^0-9.\-]/g,''));
    if(!isNaN(an)&&!isNaN(bn)&&/\d/.test(a)&&/\d/.test(b)) return an-bn;
    return a.localeCompare(b);
  }
  /* Tri-state sort (asc → desc → cleared) with shift-click to add a secondary/tertiary sort key. */
  function gsSortTable(th, ev){
    var table=th.closest('table'), head=th.parentNode, tbody=table.tBodies[0];
    if(!tbody) return;
    if(!table._gsOrig) table._gsOrig=Array.prototype.slice.call(tbody.rows);   // remember insertion order for "cleared"
    var idx=Array.prototype.indexOf.call(head.children,th);
    var multi=!!(ev&&ev.shiftKey);
    var keys=(table._gsSort||[]).slice();
    if(!multi) keys=keys.filter(function(k){return k.idx===idx;});   // single-column mode drops the others
    var cur=null; keys.forEach(function(k){if(k.idx===idx)cur=k;});
    if(cur){ if(cur.dir==='asc') cur.dir='desc'; else keys=keys.filter(function(k){return k.idx!==idx;}); }
    else keys.push({idx:idx,dir:'asc'});
    table._gsSort=keys;
    Array.prototype.forEach.call(head.children,function(h){ h.removeAttribute('data-sort'); var a=h.querySelector('.gs-sort-arrow'); if(a) a.textContent=' ↕'; });
    keys.forEach(function(k,order){
      var h=head.children[k.idx]; if(!h) return;
      h.setAttribute('data-sort',k.dir);
      var a=h.querySelector('.gs-sort-arrow'); if(a) a.textContent=(k.dir==='asc'?' ▲':' ▼')+(keys.length>1?String(order+1):'');
    });
    var rows=table._gsOrig.filter(function(r){return r.parentNode===tbody && !r.classList.contains('gs-empty-row');});
    if(keys.length){
      rows=rows.slice().sort(function(a,b){
        for(var i=0;i<keys.length;i++){ var k=keys[i], c=gsCmp(gsCellText(a,k.idx),gsCellText(b,k.idx)); if(c) return k.dir==='asc'?c:-c; }
        return 0;
      });
    }
    rows.forEach(function(r){tbody.appendChild(r);});
    var er=tbody.querySelector('.gs-empty-row'); if(er) tbody.appendChild(er);
    if(table.dataset.gsList) gsAfterFilter(table, table._gsSearchTerm||'');   // re-apply page window to the new order
  }
  window.gsSortTable=gsSortTable;
  function wireSortableTables(root){
    (root||document).querySelectorAll('table.tbl').forEach(function(tbl){
      if(tbl.hasAttribute('data-nosort')) return;
      if((tbl.id||'').indexOf('pt-table')===0) return;   // paginated product tables own their sort engine
      var head=tbl.tHead; if(!head||!head.rows.length) return;
      var body=tbl.tBodies[0], sampleRow=body&&body.rows[0];
      Array.prototype.forEach.call(head.rows[0].cells,function(th,i){
        if(th.dataset.gsSort) return;
        if(th.hasAttribute('onclick')) return;            // already has a sort handler
        if(!th.textContent.trim()) return;                // skip empty columns (checkbox/action)
        if(/^actions?$/i.test(th.textContent.trim())) return;                       // action column — not sortable
        if(sampleRow && sampleRow.cells[i] && sampleRow.cells[i].querySelector('button')) return; // cells hold buttons → action column
        th.dataset.gsSort='1'; th.classList.add('gs-sortable');
        th.title='Click to sort · Shift-click to add a secondary sort'; th.tabIndex=0; th.setAttribute('role','button');
        var a=document.createElement('span'); a.className='gs-sort-arrow'; a.textContent=' ↕'; th.appendChild(a);
        th.addEventListener('click',function(e){gsSortTable(th,e);});
        th.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); gsSortTable(th,e); } });
      });
    });
  }
  window.GSWireSortableTables=wireSortableTables;

  /* ── Generic listing search + filter ──────────────────────────────────────────────────────────
     Lets any data table get a working filter bar with almost no per-table JS. Drop a `.filter-toolbar`
     containing a search `input` and/or `select.fi` controls directly above a table, wire the search with
     oninput="gsFilterToolbar(this)" and each select with onchange="gsFilterToolbar(this)", and the table's
     <tr>s are shown/hidden by plain-text match (a row must contain every active term). Scoped to the
     nearest .grp-body / .landing-tab-panel / .grp so multiple tables on one screen don't interfere. */
  window.gsFilterToolbar=function(el){
    var tb=(el.closest && el.closest('.filter-toolbar'))||el.parentNode;
    var scope=(el.closest && (el.closest('.grp-body')||el.closest('.landing-tab-panel')||el.closest('.grp')))||document;
    var terms=[], searchTerm='';
    tb.querySelectorAll('input').forEach(function(i){if(i.type==='checkbox')return;var v=(i.value||'').toLowerCase().trim();if(v){terms.push(v);if(!searchTerm)searchTerm=v;}});
    /* a select's FIRST option is always the "All …" default (its value may be display text like "All regions"),
       so only treat index>0 as an active filter term */
    tb.querySelectorAll('select').forEach(function(s){if(s.selectedIndex>0){var v=(s.value||'').toLowerCase().trim();if(v&&v!=='all'&&v!=='any')terms.push(v);}});
    scope.querySelectorAll('table').forEach(function(tbl){
      if(!tbl.tBodies[0]) return;
      Array.prototype.forEach.call(tbl.tBodies[0].rows,function(tr){
        if(tr.classList.contains('gs-empty-row')) return;
        var t=tr.textContent.toLowerCase();
        tr.classList.toggle('gs-filtered', !terms.every(function(term){return t.indexOf(term)>=0;}));
      });
      tbl._gsSearchTerm=searchTerm;
      if(tbl._gsPage!==undefined) tbl._gsPage=0;   // filtering resets to the first page
      gsAfterFilter(tbl, searchTerm);
    });
  };
  /* Single refresh entry point: apply the pagination window, re-highlight, refresh bulk state. */
  function gsAfterFilter(table, term){
    if(!table.tBodies[0]) return;
    if(term===undefined) term=table._gsSearchTerm||'';
    gsRenderPage(table);
    gsHighlight(table, term);
    if(table._gsBulkRefresh) table._gsBulkRefresh();
  }
  window.gsAfterFilter=gsAfterFilter;
  /* Show only the current page of the matched (non-filtered) rows; drive the pager UI + empty state. */
  function gsRenderPage(table){
    var tbody=table.tBodies[0]; if(!tbody) return;
    var matched=[], anyData=false;
    Array.prototype.forEach.call(tbody.rows,function(r){
      if(r.classList.contains('gs-empty-row')) return;
      anyData=true; r.classList.remove('gs-paged');
      if(!r.classList.contains('gs-filtered')) matched.push(r);
    });
    var total=matched.length, size=table._gsPageSize||total||1;
    var pages=Math.max(1,Math.ceil(total/size));
    if(table._gsPage===undefined) table._gsPage=0;
    if(table._gsPage>=pages) table._gsPage=pages-1;
    if(table._gsPage<0) table._gsPage=0;
    var start=table._gsPage*size, end=start+size;
    matched.forEach(function(r,i){ if(i<start||i>=end) r.classList.add('gs-paged'); });
    gsEmptyState(table, total===0 && anyData);
    if(table._gsPagerUpdate) table._gsPagerUpdate(total, start, Math.min(end,total), pages, table._gsPage);
    else if(table._gsCountEl) table._gsCountEl.textContent='Showing '+total+' row'+(total===1?'':'s');
  }
  window.gsRenderPage=gsRenderPage;
  function gsHighlight(table, term){
    var tbody=table.tBodies[0]; if(!tbody) return;
    tbody.querySelectorAll('mark.gs-hl').forEach(function(m){ var p=m.parentNode; if(!p)return; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); });
    if(!term || term.length<2) return;   // avoid noisy single-char highlights
    Array.prototype.forEach.call(tbody.rows,function(r){
      if(r.classList.contains('gs-filtered')||r.classList.contains('gs-paged')||r.classList.contains('gs-empty-row')) return;
      Array.prototype.forEach.call(r.cells,function(td){ gsMarkNodes(td, term); });
    });
  }
  function gsMarkNodes(el, term){
    var tl=term.toLowerCase();
    var walker=document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes=[], n;
    while((n=walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var txt=node.nodeValue, low=txt.toLowerCase(), i=low.indexOf(tl);
      if(i<0 || (node.parentNode&&node.parentNode.tagName==='MARK')) return;
      var frag=document.createDocumentFragment(), last=0;
      while(i>=0){
        if(i>last) frag.appendChild(document.createTextNode(txt.slice(last,i)));
        var mk=document.createElement('mark'); mk.className='gs-hl'; mk.textContent=txt.slice(i,i+term.length);
        frag.appendChild(mk); last=i+term.length; i=low.indexOf(tl,last);
      }
      if(last<txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      if(node.parentNode) node.parentNode.replaceChild(frag, node);
    });
  }
  function gsEmptyState(table, show){
    var tbody=table.tBodies[0]; if(!tbody) return;
    var er=tbody.querySelector('tr.gs-empty-row');
    if(show){
      if(!er){
        er=document.createElement('tr'); er.className='gs-empty-row';
        var td=document.createElement('td'); td.className='gs-empty'; td.colSpan=(table.tHead&&table.tHead.rows[0])?table.tHead.rows[0].cells.length:99;
        td.innerHTML='<div>No matching rows</div><button class="btn-g-sm gs-clear-filters" type="button">Clear filters</button>';
        er.appendChild(td); tbody.appendChild(er);
        td.querySelector('.gs-clear-filters').addEventListener('click',function(){ gsClearFilters(table); });
      }
      er.style.display='';
    } else if(er){ er.style.display='none'; }
  }
  function gsClearFilters(table){
    var tb=table._gsToolbar;
    if(tb){
      tb.querySelectorAll('input').forEach(function(i){ if(i.type!=='checkbox') i.value=''; });
      tb.querySelectorAll('select').forEach(function(s){ if(s.selectedIndex!==0){ s.selectedIndex=0; s.dispatchEvent(new Event('change',{bubbles:true})); } });
    }
    Array.prototype.forEach.call(table.tBodies[0].rows,function(r){ r.classList.remove('gs-filtered'); });
    table._gsSearchTerm=''; if(table._gsPage!==undefined) table._gsPage=0;
    gsAfterFilter(table,'');
  }

  /* ── Data-grid toolkit ────────────────────────────────────────────────────────────────────────
     Turns any `.tbl` listing that has a `.filter-toolbar` into a proper data grid: a grouped filter bar
     (search separated from a clustered filter group + right-aligned tools), row-density toggle, column
     chooser, CSV export, bulk-select with a floating action bar, a "showing X of Y" count, sticky header
     on long lists, and keyboard navigation. Everything is additive and wrapped per-table in try/catch so
     a single odd table can never break the page. Skips the paginated product tables (own engine). */
  var IC_ROWS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  var IC_COLS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>';
  var IC_DL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  function gsToolBtn(label,icon){
    var b=document.createElement('button'); b.type='button'; b.className='gs-tool-btn'; b.innerHTML=icon+'<span>'+label+'</span>'; return b;
  }
  function gsCsvCell(s){ return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
  function gsExportCsv(table, selectedOnly){
    var head=table.tHead.rows[0], out=[];
    function visCols(){ return Array.prototype.filter.call(head.cells,function(th){ return th.style.display!=='none' && !th.classList.contains('gs-check-col'); }); }
    out.push(visCols().map(function(th){return gsCsvCell(th.textContent.replace(/[↕▲▼0-9]+$/,'').trim());}));
    Array.prototype.forEach.call(table.tBodies[0].rows,function(r){
      if(r.style.display==='none'||r.classList.contains('gs-empty-row')) return;
      if(selectedOnly){ var c=r.querySelector('.gs-row-check'); if(!c||!c.checked) return; }
      var cells=[];
      Array.prototype.forEach.call(r.cells,function(td,i){ var th=head.cells[i]; if(th&&th.style.display==='none')return; if(td.classList.contains('gs-check-col'))return; cells.push(gsCsvCell(td.textContent.trim().replace(/\s+/g,' '))); });
      out.push(cells);
    });
    var blob=new Blob([out.map(function(r){return r.join(',');}).join('\n')],{type:'text/csv'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='greenstreets-export.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
  }
  function gsSetColVisible(table,i,vis){
    var d=vis?'':'none';
    if(table.tHead) Array.prototype.forEach.call(table.tHead.rows,function(r){ if(r.cells[i]) r.cells[i].style.display=d; });
    Array.prototype.forEach.call(table.tBodies[0].rows,function(r){ if(r.cells[i]) r.cells[i].style.display=d; });
    var cg=table.querySelector('colgroup');
    if(cg && cg.children[i]){ var col=cg.children[i]; if(vis) col.setAttribute('width', col.dataset.w||''); else { col.dataset.w=col.getAttribute('width')||''; col.setAttribute('width','0'); } }
  }
  function gsBuildColMenu(table){
    var menu=document.createElement('div'); menu.className='gs-colmenu';
    Array.prototype.forEach.call(table.tHead.rows[0].cells,function(th,i){
      var label=th.textContent.replace(/[↕▲▼0-9]+$/,'').trim();
      if(!label||th.classList.contains('gs-check-col')) return;
      var lab=document.createElement('label');
      var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=true;
      cb.addEventListener('change',function(){ gsSetColVisible(table,i,cb.checked); });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(label)); menu.appendChild(lab);
    });
    return menu;
  }
  function gsAddBulk(table){
    var head=table.tHead&&table.tHead.rows[0]; if(!head) return;
    var scope=table.closest('.grp-body')||table.parentNode;
    var bar=document.createElement('div'); bar.className='gs-bulkbar';
    bar.innerHTML='<span class="gs-bulk-count">0 selected</span><span class="spacer"></span><button class="btn-g-sm gs-bulk-export" type="button">Export selected</button><button class="btn-g-sm gs-bulk-clear" type="button">Clear</button>';
    scope.appendChild(bar);
    function hidden(r){ return r.classList.contains('gs-filtered')||r.classList.contains('gs-paged')||r.classList.contains('gs-empty-row'); }
    function refresh(){
      var vis=0, sel=0;
      Array.prototype.forEach.call(table.tBodies[0].rows,function(r){ if(hidden(r))return; var c=r.querySelector('.gs-row-check'); if(!c)return; vis++; if(c.checked)sel++; });
      bar.querySelector('.gs-bulk-count').textContent=sel+' selected';
      bar.classList.toggle('on', sel>0);
      all.checked = vis>0 && sel===vis; all.indeterminate = sel>0 && sel<vis;
    }
    var all;
    // reuse the table's OWN checkbox column if it already has one (avoids a doubled checkbox); else create one
    var existing = head.cells[0] && head.cells[0].querySelector('input[type="checkbox"]');
    if(existing){
      all=existing; if(!all.title) all.title='Select all'; head.cells[0].classList.add('gs-check-col');
      Array.prototype.forEach.call(table.tBodies[0].rows,function(r){
        if(r.classList.contains('gs-empty-row')) return;
        var cell=r.cells[0], c=cell&&cell.querySelector('input[type="checkbox"]');
        if(c){ c.classList.add('gs-row-check'); cell.classList.add('gs-check-col');
               cell.addEventListener('click',function(e){ e.stopPropagation(); });
               c.addEventListener('change',refresh); }
      });
    } else {
      var cg=table.querySelector('colgroup');
      if(cg){ var col=document.createElement('col'); col.setAttribute('width','40'); cg.insertBefore(col,cg.firstChild); }
      var th=document.createElement('th'); th.className='gs-check-col';
      all=document.createElement('input'); all.type='checkbox'; all.title='Select all'; th.appendChild(all);
      head.insertBefore(th, head.firstChild);
      Array.prototype.forEach.call(table.tBodies[0].rows,function(r){
        if(r.classList.contains('gs-empty-row')) return;
        var td=document.createElement('td'); td.className='gs-check-col';
        var c=document.createElement('input'); c.type='checkbox'; c.className='gs-row-check';
        td.appendChild(c); r.insertBefore(td, r.firstChild);
        td.addEventListener('click',function(e){ e.stopPropagation(); });   // don't trigger row navigation/burst
        c.addEventListener('change',refresh);
      });
    }
    bar.querySelector('.gs-bulk-export').addEventListener('click',function(){ gsExportCsv(table,true); });
    bar.querySelector('.gs-bulk-clear').addEventListener('click',function(){ table.querySelectorAll('.gs-row-check').forEach(function(c){c.checked=false;}); all.checked=false; refresh(); });
    all.addEventListener('change',function(){
      Array.prototype.forEach.call(table.tBodies[0].rows,function(r){ if(hidden(r))return; var c=r.querySelector('.gs-row-check'); if(c)c.checked=all.checked; });
      refresh();
    });
    table._gsBulkRefresh=refresh;
  }
  /* Wire the SEARCH input of a pre-existing decorative toolbar to the generic filter so it becomes
     functional. We deliberately do NOT auto-wire selects here: a search box matches any cell text, but a
     pre-existing select's option labels (e.g. "EU only") may not appear verbatim in the cells, and wiring
     it would turn a harmless no-op into "hide every row". Purpose-built selects that DO map to cell text
     already carry their own `onchange="gsFilterToolbar(this)"` and keep working. */
  function gsWireToolbar(tb){
    tb.querySelectorAll('input').forEach(function(i){ if(i.type==='checkbox'||i.getAttribute('oninput')||i.dataset.gsWired) return; i.dataset.gsWired='1'; i.addEventListener('input',function(){gsFilterToolbar(i);}); });
  }
  function gsGroupToolbar(tb){
    var search=tb.querySelector('.search-wrap');
    if(search) search.classList.add('ftb-search');
    var group=document.createElement('div'); group.className='ftb-group';
    Array.prototype.slice.call(tb.children).forEach(function(ch){
      if(ch===search) return;
      if(ch.classList&&(ch.classList.contains('cs-wrap')||ch.tagName==='SELECT')) group.appendChild(ch);
    });
    if(group.children.length){ if(search&&search.nextSibling) tb.insertBefore(group,search.nextSibling); else tb.appendChild(group); }
    return group;
  }
  function gsAddTools(tb, table){
    var actions=document.createElement('div'); actions.className='ftb-actions';
    var dens=gsToolBtn('Compact',IC_ROWS);
    dens.addEventListener('click',function(){ table.classList.toggle('tbl-compact'); dens.classList.toggle('on'); });
    var colWrap=document.createElement('div'); colWrap.style.position='relative';
    var colBtn=gsToolBtn('Columns',IC_COLS), colMenu=gsBuildColMenu(table);
    colWrap.appendChild(colBtn); colWrap.appendChild(colMenu);
    colBtn.addEventListener('click',function(e){ e.stopPropagation(); colMenu.classList.toggle('on'); });
    document.addEventListener('click',function(e){ if(!colWrap.contains(e.target)) colMenu.classList.remove('on'); });
    var exp=gsToolBtn('Export',IC_DL);
    exp.addEventListener('click',function(){ gsExportCsv(table,false); });
    actions.appendChild(dens); actions.appendChild(colWrap); actions.appendChild(exp);
    tb.appendChild(actions);
  }
  /* Bottom pager: count on the left, controls on the right (Rows-per-page + Prev/Page X of Y/Next +
     Go-to-page). Present on every enhanced listing so it scales to hundreds of rows; with few rows it's a
     single page with the controls disabled. */
  function gsAddPager(table){
    table._gsPageSize=20; table._gsPage=0;
    var anchor=table.closest('.tbl-wrap')||table;
    var bar=document.createElement('div'); bar.className='gs-pager';
    var count=document.createElement('div'); count.className='gs-tbl-count';
    var ctrls=document.createElement('div'); ctrls.className='gs-pager-ctrls';
    ctrls.innerHTML=
      '<span class="gs-pager-lbl">Rows</span>'+
      '<select class="fi fi-select gs-pager-size"><option value="20">20</option><option value="50">50</option><option value="100">100</option><option value="100000">All</option></select>'+
      '<button type="button" class="btn-g-sm gs-pager-prev">‹ Prev</button>'+
      '<span class="gs-pager-info"></span>'+
      '<button type="button" class="btn-g-sm gs-pager-next">Next ›</button>'+
      '<span class="gs-pager-lbl">Go to</span>'+
      '<select class="fi fi-select gs-pager-jump"></select>';
    bar.appendChild(count); bar.appendChild(ctrls);
    if(anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    table._gsCountEl=count;
    var sizeSel=ctrls.querySelector('.gs-pager-size'), jumpSel=ctrls.querySelector('.gs-pager-jump'),
        prev=ctrls.querySelector('.gs-pager-prev'), next=ctrls.querySelector('.gs-pager-next'), info=ctrls.querySelector('.gs-pager-info');
    function reflow(){ gsRenderPage(table); gsHighlight(table, table._gsSearchTerm||''); }
    sizeSel.addEventListener('change',function(){ table._gsPageSize=parseInt(sizeSel.value,10)||20; table._gsPage=0; reflow(); });
    prev.addEventListener('click',function(){ table._gsPage=Math.max(0,table._gsPage-1); reflow(); });
    next.addEventListener('click',function(){ table._gsPage=table._gsPage+1; reflow(); });
    jumpSel.addEventListener('change',function(){ table._gsPage=(parseInt(jumpSel.value,10)||1)-1; reflow(); });
    table._gsPagerUpdate=function(total,from,to,pages,page){
      count.textContent = total===0 ? 'No rows' : ('Showing '+(from+1)+'–'+to+' of '+total+' row'+(total===1?'':'s'));
      info.textContent = 'Page '+(total===0?0:page+1)+' of '+pages;
      prev.disabled=page<=0; next.disabled=page>=pages-1;
      if(jumpSel.options.length!==pages){ jumpSel.innerHTML=''; for(var p=1;p<=pages;p++){var o=document.createElement('option');o.value=p;o.textContent='Page '+p;jumpSel.appendChild(o);} }
      jumpSel.value=page+1;
      var jw=jumpSel.closest('.cs-wrap'); if(jw){var cv=jw.querySelector('.cs-val'); if(cv)cv.textContent='Page '+(page+1);}
    };
    if(window.GSEnhanceSelects) GSEnhanceSelects(ctrls);   // theme the two selects (init already ran)
  }
  function gsAddKeyboard(table){
    table.tabIndex=0;   // one Tab stop for the whole grid; arrows rove inside it
    function rows(){ return Array.prototype.filter.call(table.tBodies[0].rows,function(r){return r.style.display!=='none'&&!r.classList.contains('gs-empty-row');}); }
    Array.prototype.forEach.call(table.tBodies[0].rows,function(r){ if(!r.classList.contains('gs-empty-row')) r.tabIndex=-1; });
    // Tabbing onto the table moves real focus to the highlighted (or first) visible row
    table.addEventListener('focus',function(){ var rs=rows(); if(!rs.length)return; (rs.filter(function(r){return r.classList.contains('gs-kbd');})[0]||rs[0]).focus(); });
    table.addEventListener('keydown',function(e){
      if(['ArrowDown','ArrowUp','Home','End','Enter'].indexOf(e.key)<0) return;
      var rs=rows(); if(!rs.length) return;
      var actRow=(document.activeElement&&document.activeElement.closest)?document.activeElement.closest('tr'):null;
      var cur=rs.indexOf(actRow);
      if(e.key==='Enter'){ if(actRow&&cur>=0&&document.activeElement===actRow){ e.preventDefault(); actRow.click(); } return; }
      e.preventDefault();
      var ni = e.key==='Home'?0 : e.key==='End'?rs.length-1 : e.key==='ArrowDown'?Math.min((cur<0?-1:cur)+1,rs.length-1) : Math.max((cur<0?rs.length:cur)-1,0);
      rs.forEach(function(r){r.classList.remove('gs-kbd');});
      rs[ni].classList.add('gs-kbd'); rs[ni].tabIndex=-1; rs[ni].focus(); rs[ni].scrollIntoView({block:'nearest'});
    });
  }
  function enhanceListing(tb){
    var scope=tb.closest('.grp-body')||tb.parentNode;
    var table=scope.querySelector('table.tbl');
    if(!table || table.dataset.gsList) return;
    if((table.id||'').indexOf('pt-table')===0) return;
    if(!table.tHead || !table.tBodies[0]) return;
    table.dataset.gsList='1';
    table._gsToolbar=tb;
    var cg=table.querySelector('colgroup');
    if(cg) Array.prototype.forEach.call(cg.children,function(col){ col.dataset.w=col.getAttribute('width')||''; });
    // hide a redundant pre-existing "Showing X of Y" footer — the pager below replaces it
    var scopeFoot=scope.querySelector('.tbl-footer');
    if(scopeFoot && /showing/i.test(scopeFoot.textContent)) scopeFoot.style.display='none';
    gsWireToolbar(tb);
    gsGroupToolbar(tb);
    gsAddTools(tb, table);
    gsAddBulk(table);
    gsAddPager(table);
    gsAddKeyboard(table);
    var wrap=table.closest('.tbl-wrap');
    if(wrap){ wrap.style.maxHeight='60vh'; wrap.style.overflow='auto'; }   // scroll body under the sticky header on long pages
    gsAfterFilter(table,'');
  }
  function initListings(root){
    (root||document).querySelectorAll('.filter-toolbar').forEach(function(tb){
      try{ enhanceListing(tb); }catch(err){ /* never break the page over one table */ }
    });
  }
  window.GSInitListings=initListings;

  /* ── Button click ripple + particle burst ─────────────────────────────────────────────────────
     On every button click, expand a ripple ring from the cursor (or the button centre if the button
     was triggered by keyboard) and fling a ring of particles outward — both easing out. Everything is
     drawn on a single fixed overlay (#gs-fx-layer) so nothing is clipped by a button's own bounds, and
     every knob (enable, colour, opacity, duration, size, particle count/spread) is a CSS var the theme
     customizer tunes live. See css/greenstreets-theme.css for the .gs-ripple / .gs-particle styles. */
  var fxLayer=null;
  function fxRoot(){
    if(!fxLayer||!fxLayer.isConnected){
      fxLayer=document.createElement('div'); fxLayer.id='gs-fx-layer';
      document.body.appendChild(fxLayer);
    }
    return fxLayer;
  }
  function cssNum(name,def){
    var v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v)?def:v;
  }
  function fxOn(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim()!=='0'; }
  var FX_BTN='button, .btn-p, .btn-g, .btn-g-sm, .pnb, [role="button"], tr[onclick], .product-row-card, .cs-opt';
  /* "row" controls (listing rows/cards, menu options) get a gentler, smaller burst than buttons */
  var FX_ROW='tr[onclick], .product-row-card, .cs-opt';
  function fxButton(el){
    if(!el || !el.closest) return null;
    if(el.closest('.gs-num-steppers')) return null;   // number steppers are micro-controls — no burst
    return el.closest(FX_BTN);
  }
  function dropAfterAnim(el){
    el.addEventListener('animationend',function(){el.remove();});
    setTimeout(function(){ if(el.parentNode) el.remove(); },2200); // fallback if animationend never fires
  }
  function fireBurst(btn,x,y){
    var rect=btn.getBoundingClientRect();
    if(!rect.width && !rect.height) return;
    if(x==null){ x=rect.left+rect.width/2; y=rect.top+rect.height/2; }   // keyboard → burst from the centre
    var isRow=btn.matches && btn.matches(FX_ROW);
    var rowScale=isRow?cssNum('--ripple-row-scale',.5):1;   // listing rows/options get a gentler burst
    var layer=fxRoot();
    if(fxOn('--ripple-enabled')){
      var scale=cssNum('--ripple-size',1)*rowScale;
      var d;
      if(isRow){
        // base the row ripple on the row height (not the full wide row) so it stays compact
        d=Math.max(rect.height,32)*2*scale;
      }else{
        var dx=Math.max(x-rect.left,rect.right-x), dy=Math.max(y-rect.top,rect.bottom-y);
        d=Math.sqrt(dx*dx+dy*dy)*2*scale;
        if(!(d>0)) d=Math.max(rect.width,rect.height)*scale;
      }
      var r=document.createElement('div');
      r.className='gs-ripple';
      r.style.left=x+'px'; r.style.top=y+'px'; r.style.width=r.style.height=d+'px';
      layer.appendChild(r); dropAfterAnim(r);
    }
    if(fxOn('--particle-enabled')){
      var count=Math.round(cssNum('--particle-count',10));
      var dist=cssNum('--particle-distance',42)*rowScale;
      for(var i=0;i<count;i++){
        var ang=(Math.PI*2*i/count)+(Math.random()-.5)*0.5;
        var dd=dist*(0.7+Math.random()*0.6);
        var p=document.createElement('div');
        p.className='gs-particle';
        p.style.left=x+'px'; p.style.top=y+'px';
        p.style.setProperty('--gs-px',(Math.cos(ang)*dd).toFixed(1)+'px');
        p.style.setProperty('--gs-py',(Math.sin(ang)*dd).toFixed(1)+'px');
        layer.appendChild(p); dropAfterAnim(p);
      }
    }
  }
  /* Fire on pointerdown so the burst appears the instant the control is pressed — even for buttons that
     navigate away on the following click (e.g. the login button, or a listing row that opens a detail).
     Keyboard activation has no pointer event, so a click with detail===0 (Enter/Space) is handled
     separately and bursts from the control's centre. */
  var pointerFired=false;
  document.addEventListener('pointerdown',function(e){
    if(e.button!==undefined && e.button>0) return;      // primary pointer / touch only
    var btn=fxButton(e.target);
    if(!btn || btn.disabled || btn.getAttribute('aria-disabled')==='true') return;
    pointerFired=true; setTimeout(function(){pointerFired=false;},700);   // suppress the paired click
    fireBurst(btn,e.clientX,e.clientY);
  });
  document.addEventListener('click',function(e){
    if(pointerFired) return;                             // pointer press already burst on pointerdown
    if(e.detail!==0) return;                             // only keyboard activation (Enter/Space) reaches here
    var btn=fxButton(e.target);
    if(!btn || btn.disabled || btn.getAttribute('aria-disabled')==='true') return;
    fireBurst(btn,null,null);
  });
})();
