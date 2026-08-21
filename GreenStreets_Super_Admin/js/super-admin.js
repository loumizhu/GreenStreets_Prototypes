var IDS=['s1','s2','s3','s4','p1','p2','p3','p4','s5','s6','s7','s11','s12','s8','s9','s10','s13'];
/* ── Split build: cross-page navigation (see CLAUDE.md). go(id) is a real page load. ── */
var GS_PAGES={
  's1':'01-greenstreets_super_admin_Login.html',
  's2':'01-greenstreets_super_admin_Retailers.html',
  's3':'01-greenstreets_super_admin_Suppliers.html',
  's14':'01-greenstreets_super_admin_Add-Supplier.html',
  's4':'01-greenstreets_super_admin_Retailer-Detail.html',
  'p1':'01-greenstreets_super_admin_Add-Retailer-1.html',
  'p2':'01-greenstreets_super_admin_Add-Retailer-2.html',
  'p3':'01-greenstreets_super_admin_Add-Retailer-3.html',
  'p4':'01-greenstreets_super_admin_Add-Retailer-4.html',
  's5':'01-greenstreets_super_admin_Configure.html',
  's6':'01-greenstreets_super_admin_Impersonate.html',
  's7':'01-greenstreets_super_admin_Users.html',
  's11':'01-greenstreets_super_admin_Products.html',
  's12':'01-greenstreets_super_admin_Product-Detail.html',
  's8':'01-greenstreets_super_admin_Packagings.html',
  's9':'01-greenstreets_super_admin_Documents.html',
  'sa_docdetail':'01-greenstreets_super_admin_Document-Detail.html',
  's10':'01-greenstreets_super_admin_Supplier-Detail.html',
  's15':'01-greenstreets_super_admin_Audit-Log.html',
  's16':'01-greenstreets_super_admin_Notifications.html',
  's13':'01-greenstreets_super_admin_Settings.html',
  'suedit':'01-greenstreets_super_admin_User-Edit.html'
};
function go(id){
  if(GS_PAGES[id]){ window.location.href=GS_PAGES[id]; return; }
  /* fallback: same-page screen toggle (kept for any in-page ids not in the map) */
  var el=document.getElementById(id);
  if(el){ document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on')}); el.classList.add('on'); window.scrollTo(0,0); }
}

/* ── SHARED OPERATOR SIDEBAR — mounted into every <div class="sidebar" data-active="…"> ── */
var SIDEBAR_NAV=[
  {id:'s2',label:'Retailers',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'},
  {id:'s7',label:'Users',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},
  {id:'s3',label:'Suppliers',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'},
  {id:'s11',label:'Products',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>'},
  {id:'s8',label:'Packagings',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'},
  {id:'s9',label:'Documents',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'}
];
function sidebarHtml(activeId){
  var items=SIDEBAR_NAV.map(function(n){
    return '<a class="nav-item'+(n.id===activeId?' active':'')+'" onclick="go(\''+n.id+'\')">'+n.icon+n.label+'</a>';
  }).join('');
  return '<div class="sb-logo-zone"><img class="sb-logo" src="https://greenstreets.ie/wp-content/uploads/sites/2/2026/04/Logo-WG.png" alt="Greenstreets"></div>'+
    '<div class="sb-section">Green Street Super Admin</div>'+items+
    '<div class="sb-divider"></div>'+
    '<a class="nav-item'+(activeId==='s13'?' active':'')+'" onclick="go(\'s13\')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>Settings</a>'+
    '<a class="nav-item'+(activeId==='s15'?' active':'')+'" onclick="go(\'s15\')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z"/></svg>Audit log</a>'+
    '<div class="sb-notif-row" onclick="go(\'s16\')" style="'+(activeId==='s16'?'background:rgba(255,255,255,.06)':'')+'" ><div class="sb-bell-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="bell-badge">3</span></div><span class="sb-notif-label">Notifications</span></div>'+
    '<div class="sb-user" style="cursor:pointer" onclick="go(\'s13\')"><div class="sb-avatar">DM</div><div class="sb-user-info"><div class="sb-user-name">Dan Murphy</div><div class="sb-user-role">GS Admin</div></div>'+
    '<button class="sb-logout" onclick="event.stopPropagation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button></div>';
}
function mountSidebars(){
  document.querySelectorAll('.sidebar[data-active]').forEach(function(sb){
    sb.innerHTML=sidebarHtml(sb.dataset.active);
  });
}
mountSidebars();

/* ── Collapsible sidebar ──────────────────────────────────────────────────────
   Turns every sidebar into a collapsible icon-only rail. Injects a toggle button
   under the logo and a clickable right-edge hotspot (col-resize cursor hints at
   it); collapsed state is remembered in localStorage. Idempotent + guarded so it
   no-ops on pages without a sidebar. */
function enhanceSidebarCollapse(){
  document.querySelectorAll('.sidebar').forEach(function(sb){
    var zone=sb.querySelector('.sb-logo-zone');
    if(!zone || sb.querySelector('.sb-collapse-btn')) return;   // need a logo zone; skip if already enhanced
    try{ if(localStorage.getItem('gsSbCollapsed')==='1') sb.classList.add('sb-collapsed'); }catch(e){}
    function syncTitles(){
      var c=sb.classList.contains('sb-collapsed');
      sb.querySelectorAll('.nav-item').forEach(function(n){ n.title=c?(n.textContent||'').trim():''; });
    }
    function toggle(){
      sb.classList.toggle('sb-collapsed');
      try{ localStorage.setItem('gsSbCollapsed', sb.classList.contains('sb-collapsed')?'1':'0'); }catch(e){}
      syncTitles();
    }
    var btn=document.createElement('button');
    btn.type='button'; btn.className='sb-collapse-btn';
    btn.title='Collapse / expand sidebar'; btn.setAttribute('aria-label','Collapse or expand sidebar');
    btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>';
    btn.addEventListener('click',function(e){ e.stopPropagation(); toggle(); });
    zone.appendChild(btn);
    var edge=document.createElement('div');
    edge.className='sb-edge'; edge.title='Collapse / expand sidebar';
    edge.addEventListener('click',toggle);
    sb.appendChild(edge);
    syncTitles();
  });
}
enhanceSidebarCollapse();

/* ── Generic paginated/sortable/filterable table engine (Products screen) ── */
var __pt={};
function ptInit(scope,data,opts){
  __pt[scope]={data:data,page:0,pageSize:(opts.pageSize||20),sortCol:(opts.sortCol||null),sortDir:(opts.sortDir||1),search:'',filters:{},opts:opts,_animate:true};
  ptRender(scope);
}
function ptFiltered(scope){
  var st=__pt[scope];
  var rows=st.data.filter(function(r){
    if(st.search){
      var hay=(st.opts.searchFields||[]).map(function(f){return r[f];}).join(' ').toLowerCase();
      if(hay.indexOf(st.search)===-1)return false;
    }
    for(var k in st.filters){
      var v=st.filters[k];
      if(v&&v!=='all'&&String(r[k])!==v)return false;
    }
    return true;
  });
  if(st.sortCol){
    var rank=st.opts.rank&&st.opts.rank[st.sortCol];   // optional custom priority order for a column
    rows=rows.slice().sort(function(a,b){
      var av=a[st.sortCol],bv=b[st.sortCol];
      if(rank){ return ((rank[av]==null?99:rank[av])-(rank[bv]==null?99:rank[bv]))*st.sortDir; }
      if(typeof av==='string')return av.localeCompare(bv)*st.sortDir;
      return((av||0)-(bv||0))*st.sortDir;
    });
  }
  return rows;
}
function ptRender(scope){
  var st=__pt[scope];
  var rows=ptFiltered(scope);
  var total=rows.length;
  var totalPages=Math.max(1,Math.ceil(total/st.pageSize));
  if(st.page>=totalPages)st.page=totalPages-1;
  if(st.page<0)st.page=0;
  var start=st.page*st.pageSize;
  var pageRows=rows.slice(start,start+st.pageSize);
  var tbody=document.getElementById('pt-tbody-'+scope);
  if(tbody)tbody.innerHTML=pageRows.length?pageRows.map(st.opts.rowHtml).join(''):'<tr><td colspan="'+st.opts.cols+'" style="padding:26px;text-align:center;color:var(--tw3);font-size:12px">No matches — try clearing filters.</td></tr>';
  if(tbody && typeof gsEnhanceIds==='function') gsEnhanceIds(tbody,'.gs-id-cell');
  var countEl=document.getElementById('pt-count-'+scope);
  if(countEl){
    var from=total===0?0:start+1,to=Math.min(total,start+st.pageSize);
    countEl.textContent='Showing '+from+'–'+to+' of '+total+' '+(st.opts.noun||'items');
  }
  var pi=document.getElementById('pt-pageinfo-'+scope);
  if(pi)pi.textContent='Page '+(total===0?0:st.page+1)+' of '+totalPages;
  var jump=document.getElementById('pt-jump-'+scope);
  if(jump){
    if(jump.options.length!==totalPages){ jump.innerHTML=''; for(var p=1;p<=totalPages;p++){var o=document.createElement('option');o.value=p;o.textContent='Page '+p;jump.appendChild(o);} }
    jump.value=st.page+1;
    var wrap=jump.closest('.cs-wrap'); if(wrap){var cv=wrap.querySelector('.cs-val'); if(cv)cv.textContent='Page '+(st.page+1);}   // sync themed trigger label
  }
  var prev=document.getElementById('pt-prev-'+scope);
  if(prev)prev.disabled=st.page<=0;
  var next=document.getElementById('pt-next-'+scope);
  if(next)next.disabled=st.page>=totalPages-1;
  /* Listing motion: FLIP after a sort, else a staggered fade on (re)paint */
  if(tbody){
    if(st._flipFirst){ gsSAFlipPlay(tbody, st._flipFirst); st._flipFirst=null; st._animate=false; }
    else if(st._animate){ gsSAFadeRows(tbody); st._animate=false; }
  }
}
/* ── Listing animation helpers (fade-in + FLIP), honouring gs-reduce-motion ── */
function gsSAReduceMotion(){ return document.documentElement.classList.contains('gs-reduce-motion'); }
function gsSAFadeRows(tbody){
  if(!tbody||gsSAReduceMotion())return;
  var i=0;
  Array.prototype.forEach.call(tbody.querySelectorAll('tr'),function(el){
    if(el.offsetParent===null)return;
    el.style.animation='none'; void el.offsetWidth;
    el.style.animation='gsRowIn .4s ease both';
    el.style.animationDelay=(i*26)+'ms';
    i++;
    (function(e,d){ setTimeout(function(){ e.style.animation=''; e.style.animationDelay=''; },460+d); })(el,i*26);
  });
}
function gsSAFlipCapture(tbody){
  var m={}; if(!tbody||gsSAReduceMotion())return m;
  Array.prototype.forEach.call(tbody.querySelectorAll('tr[data-flip-key]'),function(el){
    if(el.offsetParent===null)return; m[el.getAttribute('data-flip-key')]=el.getBoundingClientRect().top;
  });
  return m;
}
/* FLIP with a leading-edge STAGGER: every moved row is displaced to its old
   position, then released to its new one — but not all at once. The row that
   lands highest starts first; each row below it follows a few ms later, so the
   reorder ripples top→bottom. The whole cascade stays under 500ms. */
function gsSAFlipPlay(tbody,first){
  if(!tbody||!first||gsSAReduceMotion())return;
  var moving=[];
  Array.prototype.forEach.call(tbody.querySelectorAll('tr[data-flip-key]'),function(el){
    if(el.offsetParent===null)return; var k=el.getAttribute('data-flip-key'); if(!(k in first))return;
    var newTop=el.getBoundingClientRect().top;
    var dy=first[k]-newTop;
    if(Math.abs(dy)>0.5){ el.style.transition='none'; el.style.transform='translateY('+dy+'px)'; moving.push({el:el,top:newTop}); }
  });
  if(!moving.length)return;
  /* order by final (post-sort) position so the top row leads the cascade */
  moving.sort(function(a,b){return a.top-b.top;});
  var n=moving.length, DUR=300;
  /* per-row delay, capped so (last delay + duration) < 500ms even for a full page */
  var step=Math.max(8, Math.min(26, Math.floor(170/Math.max(1,n-1))));
  void tbody.offsetHeight;
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    moving.forEach(function(m,i){
      m.el.style.transition='transform '+DUR+'ms cubic-bezier(.42,0,.58,1) '+(i*step)+'ms';
      m.el.style.transform='';
    });
    var total=DUR+(n-1)*step+40;
    setTimeout(function(){ moving.forEach(function(m){ m.el.style.transition=''; }); },total);
  }); });
}
function ptSearch(scope,val){__pt[scope].search=(val||'').toLowerCase();__pt[scope].page=0;ptRender(scope);}
function ptFilter(scope,key,val){__pt[scope].filters[key]=val;__pt[scope].page=0;ptRender(scope);}
function ptPageSize(scope,val){__pt[scope].pageSize=parseInt(val,10)||20;__pt[scope].page=0;ptRender(scope);}
function ptGoPage(scope,delta){__pt[scope].page+=delta;__pt[scope]._animate=true;ptRender(scope);}
function ptJump(scope,val){__pt[scope].page=(parseInt(val,10)||1)-1;__pt[scope]._animate=true;ptRender(scope);}
function ptSort(scope,col){
  var st=__pt[scope];
  st._flipFirst=gsSAFlipCapture(document.getElementById('pt-tbody-'+scope));
  if(st.sortCol===col)st.sortDir*=-1;else{st.sortCol=col;st.sortDir=1;}
  ptRender(scope);
  var table=document.getElementById('pt-table-'+scope);
  if(table)table.querySelectorAll('th[data-col]').forEach(function(th){
    var arrow=th.querySelector('.sort-arrow');
    if(!arrow)return;
    arrow.textContent=th.getAttribute('data-col')===col?(st.sortDir===1?'↑':'↓'):'↕';
  });
}

/* ── Product catalogue dataset (Products screen) ── */
var PRODUCTS_S11=(function(){
  var cats=['Tops','Bottoms','Dresses','Outerwear','Footwear','Accessories'];
  var retailers=['Primark Stores Ltd','H&M Group','Next plc','Zara / Inditex','M&S Group','Dunnes Stores','New Look'];
  var suppliers=['Indotex Manufacturing','Luntai Packaging Co.','EcoPack GmbH'];
  var adjs=['Black','Blue','Red','Khaki','White','Grey','Navy','Olive','Beige','Pink','Green','Cream','Charcoal','Rust','Teal'];
  var items=['Crew Neck Sweatshirt','Slim Fit Jeans','Midi Dress','Utility Jacket','Essential T-Shirt','Zip Hoodie','Chino Trousers','Puffer Coat','Knit Jumper','Cargo Shorts','Pleated Skirt','Denim Jacket','Trainers','Canvas Belt','Wool Scarf'];
  var statuses=['Complete','Incomplete','Pending approval','Incomplete','Pending','Pending approval'];
  var pills={Complete:'pill-green',Incomplete:'pill-amber',Pending:'pill-grey','Pending approval':'pill-blue'};
  var activities=['2 hrs ago','Yesterday','3 days ago','14 days ago','5 hrs ago','1 week ago'];
  var list=[];
  for(var i=0;i<64;i++){
    var cat=cats[i%cats.length];
    var adj=adjs[i%adjs.length];
    var item=items[i%items.length];
    var status=statuses[i%statuses.length];
    var comps=2+(i%4);
    var allDone=status==='Complete'||status==='Pending approval';
    var done=allDone?comps:(status==='Incomplete'?Math.max(0,comps-1-(i%comps)):0);
    var pkgText=allDone?(status==='Pending approval'?(comps+' components · ready to approve'):(comps+' components')):(status==='Pending'?'Not started':(done+' of '+comps+' done'));
    var pill=pills[status];
    if(status==='Incomplete'&&done===0)pill='pill-red';
    list.push({
      sku:'PRK-'+String(i+1).padStart(3,'0')+'-'+adj.slice(0,3).toUpperCase(),
      desc:adj+' '+item,cat:cat,
      retailer:retailers[i%retailers.length],
      supplier:suppliers[i%suppliers.length],
      pkg:pkgText,status:status,pill:pill,activity:activities[i%activities.length]
    });
  }
  return list;
})();
/* selection state — declared before ptInit so the first render's rowHtml can read it */
var saProdSel = new Set();
var saProdFiltered = [];

function saProdMiniToast(msg) {
  var t = document.getElementById('sa-toast');
  if (!t) { t = document.createElement('div'); t.id = 'sa-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = 'show';
  clearTimeout(saProdMiniToast._t);
  saProdMiniToast._t = setTimeout(function(){ t.className=''; }, 2600);
}

function saProdToggleRow(cb, sku) {
  if (cb.checked) saProdSel.add(sku); else saProdSel.delete(sku);
  var tr = cb.closest('tr'); if (tr) tr.classList.toggle('saprod-row-sel', cb.checked);
  saProdUpdateBar();
  saProdSyncSelectAll();
}

function saProdToggleAll(cb) {
  saProdFiltered.forEach(function(r){
    if (cb.checked) saProdSel.add(r.sku); else saProdSel.delete(r.sku);
  });
  document.querySelectorAll('#pt-tbody-s11 .saprod-cb').forEach(function(x){
    x.checked = cb.checked;
    var tr = x.closest('tr'); if (tr) tr.classList.toggle('saprod-row-sel', cb.checked);
  });
  saProdUpdateBar();
}

function saProdSyncSelectAll() {
  var head = document.getElementById('saprod-selectall'); if (!head) return;
  var n = saProdFiltered.length;
  var selN = saProdFiltered.reduce(function(a,r){ return a + (saProdSel.has(r.sku)?1:0); }, 0);
  head.checked = n > 0 && selN === n;
  head.indeterminate = selN > 0 && selN < n;
}

function saProdSyncSelection(pageRows, allRows) {
  if (!document.getElementById('saprod-selectall')) return;
  saProdFiltered = allRows || [];
  saProdSyncSelectAll();
  saProdUpdateBar();
}

function saProdClearSel() {
  saProdSel.clear();
  document.querySelectorAll('#pt-tbody-s11 .saprod-cb').forEach(function(x){
    x.checked = false; var tr = x.closest('tr'); if (tr) tr.classList.remove('saprod-row-sel');
  });
  saProdUpdateBar();
  saProdSyncSelectAll();
}

function saProdInjectCss() {
  if (document.getElementById('saprod-css')) return;
  var st = document.createElement('style'); st.id = 'saprod-css';
  st.textContent =
    '.saprod-cb,#saprod-selectall{width:15px;height:15px;accent-color:var(--gs);cursor:pointer;vertical-align:middle;margin:0}' +
    '#pt-table-s11 tr.saprod-row-sel td{background:rgba(78,187,129,.09)}' +
    '#pt-table-s11 tr.saprod-row-sel td:first-child{box-shadow:inset 3px 0 0 var(--gs)}' +
    '#saprod-bulkbar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(24px);display:flex;align-items:center;gap:10px;padding:9px 12px;background:#0f2338;border:1px solid var(--line-2,rgba(148,180,230,.28));border-radius:12px;box-shadow:0 16px 40px -10px rgba(0,0,0,.6);z-index:9997;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}' +
    '#saprod-bulkbar.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}' +
    '.saprod-bb-count{font-size:12.5px;color:var(--tw2);white-space:nowrap;padding:0 4px}' +
    '.saprod-bb-count b{color:#fff;font-size:13px}' +
    '.saprod-bb-sep{width:1px;height:20px;background:var(--bw,rgba(255,255,255,.14))}' +
    '.saprod-bb-btn{display:inline-flex;align-items:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--tw2);transition:background .12s,border-color .12s,color .12s;white-space:nowrap}' +
    '.saprod-bb-btn:hover{background:rgba(255,255,255,.12);color:#fff}' +
    '.saprod-bb-approve{background:rgba(78,187,129,.14);border-color:rgba(78,187,129,.4);color:#4ebb81}' +
    '.saprod-bb-approve:hover{background:rgba(78,187,129,.26);border-color:var(--gs);color:#fff}' +
    '.saprod-bb-clear{background:transparent;border-color:transparent;color:var(--tw3)}' +
    '.saprod-bb-clear:hover{background:rgba(255,255,255,.08);color:#fff}';
  document.head.appendChild(st);
}

function saProdEnsureBar() {
  saProdInjectCss();
  var bar = document.getElementById('saprod-bulkbar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'saprod-bulkbar';
  bar.innerHTML =
    '<span class="saprod-bb-count"><b id="saprod-bb-n">0</b> selected</span>' +
    '<span class="saprod-bb-sep"></span>' +
    '<button type="button" class="saprod-bb-btn saprod-bb-approve" onclick="saProdBulkApprove()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>Approve</button>' +
    '<button type="button" class="saprod-bb-btn" onclick="saProdBulkRemind()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Send reminder</button>' +
    '<button type="button" class="saprod-bb-btn" onclick="saProdBulkExport()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export CSV</button>' +
    '<button type="button" class="saprod-bb-btn" onclick="saProdBulkDownloadDoc()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>Download DoC</button>' +
    '<button type="button" class="saprod-bb-btn saprod-bb-clear" onclick="saProdClearSel()" aria-label="Clear selection">Clear</button>';
  document.body.appendChild(bar);
  return bar;
}

function saProdUpdateBar() {
  var bar = saProdEnsureBar();
  var n = saProdSel.size;
  document.getElementById('saprod-bb-n').textContent = n;
  bar.classList.toggle('show', n > 0);
}

function saProdSelectedRows() {
  var bySku = {}; (window.PRODUCTS_S11 || []).forEach(function(r){ bySku[r.sku] = r; });
  var out = []; saProdSel.forEach(function(sku){ if (bySku[sku]) out.push(bySku[sku]); });
  return out;
}

function saProdBulkApprove() {
  var rows = saProdSelectedRows();
  var eligible = rows.filter(function(r){ return r.status !== 'Complete'; });
  rows.forEach(function(r){ if (r.status !== 'Complete'){ r.status = 'Complete'; r.pill = 'pill-green'; r.pkg = 'Approved'; } });
  ptRender('s11');
  saProdClearSel();
  saProdMiniToast(eligible.length ? eligible.length + ' product' + (eligible.length>1?'s':'') + ' approved' : 'Selected products are already complete');
}

function saProdBulkRemind() {
  var rows = saProdSelectedRows();
  var n = rows.filter(function(r){ return r.status !== 'Complete'; }).length;
  saProdMiniToast(n ? 'Reminder sent for ' + n + ' product' + (n>1?'s':'') : 'No outstanding products in selection');
}

function saProdBulkExport() {
  var n = saProdSel.size;
  saProdMiniToast('Exporting ' + n + ' product' + (n>1?'s':'') + '...');
}

function saProdBulkDownloadDoc() {
  var n = saProdSel.size;
  saProdMiniToast('Downloading DoC for ' + n + ' product' + (n>1?'s':'') + '...');
}

function saDownloadDoc(sku) {
  saProdMiniToast('Downloading DoC for ' + sku + '...');
}
function saApproveProduct(sku, btn) {
  var rec = (window.PRODUCTS_S11 || []).filter(function(r){ return r.sku === sku; })[0];
  if (rec) { rec.status = 'Complete'; rec.pill = 'pill-green'; rec.pkg = 'Approved'; ptRender('s11'); }
  else if (btn) { btn.textContent = 'Approved'; btn.style.pointerEvents = 'none'; btn.style.opacity = '0.5'; }
  saProdMiniToast('Product ' + sku + ' approved — DoC now available');
}
function saSendReminder(sku) {
  saProdMiniToast('Reminder sent to supplier for ' + sku);
}

ptInit('s11',PRODUCTS_S11,{
  cols:10,pageSize:20,noun:'products',searchFields:['sku','desc','retailer'],sortCol:'status',sortDir:1,
  /* default status sort surfaces the rows needing action first (Pending approval → Incomplete → Pending → Complete) */
  rank:{status:{'Pending approval':0,'Incomplete':1,'Pending':2,'Complete':3}},
  afterRender: function(scope, pageRows, allRows){ saProdSyncSelection(pageRows, allRows); },
  rowHtml:function(r){
    var checked = saProdSel.has(r.sku) ? ' checked' : '';
    var isComplete = r.status === 'Complete';
    var cbCell = '<td class="saprod-cb-cell" onclick="event.stopPropagation()" style="vertical-align:middle;text-align:center"><input type="checkbox" class="saprod-cb" aria-label="Select '+r.sku+'"'+checked+' onclick="event.stopPropagation();saProdToggleRow(this,\''+r.sku+'\')"></td>';

    var docBtn = isComplete
      ? '<button class="btn-p" title="Download Declaration of Conformity" onclick="event.stopPropagation();saDownloadDoc(\''+r.sku+'\')" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;font-size:11px;padding:0 10px;margin-right:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:4px;position:relative;top:-1px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>DoC</button>'
      : '';
    /* Pending approval → prominent primary Approve; Incomplete → plain Approve */
    var approveBtn = r.status === 'Pending approval'
      ? '<button class="btn-p" title="Approve product" onclick="event.stopPropagation();saApproveProduct(\''+r.sku+'\',this)" tabindex="-1" data-approved="false" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;font-size:11px;padding:0 10px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="margin-right:4px;position:relative;top:-1px"><polyline points="20 6 9 17 4 12"></polyline></svg>Approve</button>'
      : (r.status === 'Incomplete'
          ? '<button class="act-mini" title="Approve product" onclick="event.stopPropagation();saApproveProduct(\''+r.sku+'\',this)" tabindex="-1" data-approved="false" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box">Approve</button>'
          : '');
    var reminderBtn = (r.status === 'Incomplete' || r.status === 'Pending')
      ? '<button class="act-mini" title="Send reminder" onclick="event.stopPropagation();saSendReminder(\''+r.sku+'\')" tabindex="-1" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;margin-right:6px">Send reminder</button>'
      : '';
      
    return '<tr class="saprod-row'+(checked?' saprod-row-sel':'')+'" style="cursor:pointer" data-flip-key="'+r.sku+'" onclick="go(\'s12\')">'+cbCell+'<td class="tbl-name"><span class="gs-id-cell">'+r.sku+'</span></td><td>'+r.desc+'</td><td class="tbl-muted">'+r.cat+'</td><td class="tbl-muted">'+r.retailer+'</td><td class="tbl-muted">'+r.supplier+'</td><td class="tbl-muted">'+r.pkg+'</td><td><span class="pill '+r.pill+'">'+r.status+'</span></td><td class="act-cell" style="white-space:nowrap;vertical-align:middle" onclick="event.stopPropagation()">'+docBtn+reminderBtn+approveBtn+'</td><td class="chev-cell"><div class="chev-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg></div></td></tr>';
  }
});

/* ── Add-packaging modal (Product detail) ── */
var PKG_LIBRARY=[
  {name:'Swing Tag',level:'Primary',material:'Recycled card'},{name:'Poly Bag',level:'Primary',material:'LDPE plastic'},
  {name:'Box / Carton',level:'Secondary',material:'Corrugated card'},{name:'Hanger',level:'Primary',material:'Recycled plastic'},
  {name:'Tissue Paper',level:'Primary',material:'FSC paper'},{name:'Header Card',level:'Primary',material:'Recycled card'},
  {name:'Void Fill',level:'Secondary',material:'Recycled paper'},{name:'Blister Pack',level:'Primary',material:'PET plastic'},
  {name:'Shipping Carton',level:'Tertiary',material:'Corrugated card'},{name:'Pallet',level:'Tertiary',material:'Wood'},
  {name:'Pallet Wrap',level:'Tertiary',material:'LDPE film'},{name:'Care Label',level:'Primary',material:'Woven polyester'},
  {name:'Barcode Sticker',level:'Primary',material:'Paper adhesive'},{name:'Adhesive Tape',level:'Secondary',material:'BOPP plastic'},
  {name:'Insert Card',level:'Primary',material:'Recycled card'},{name:'Garment Bag',level:'Primary',material:'LDPE plastic'},
  {name:'Dust Bag',level:'Primary',material:'Cotton'},{name:'Gift Box',level:'Secondary',material:'Card'},
  {name:'Ribbon',level:'Primary',material:'Polyester'},{name:'Bubble Wrap',level:'Secondary',material:'LDPE plastic'},
  {name:'Foam Insert',level:'Secondary',material:'EPE foam'},{name:'Mailer Bag',level:'Secondary',material:'Recycled LDPE'},
  {name:'Zip-lock Bag',level:'Primary',material:'LDPE plastic'},{name:'Desiccant Pack',level:'Primary',material:'Silica gel + Tyvek'},
  {name:'Corrugated Divider',level:'Secondary',material:'Corrugated card'},{name:'Shoe Box',level:'Secondary',material:'Card'}
];
function openPkgModal(scope){
  var overlay=document.getElementById('pkg-modal-'+scope);
  if(!overlay)return;
  overlay.classList.add('open');
  pkgModalBackToList(scope);
  var search=document.getElementById('pkg-modal-search-'+scope);
  if(search)search.value='';
  filterPkgModal(scope,'');
}
function closePkgModal(scope){
  var overlay=document.getElementById('pkg-modal-'+scope);
  if(overlay)overlay.classList.remove('open');
}
function filterPkgModal(scope,val){
  var q=(val||'').toLowerCase();
  var list=document.getElementById('pkg-modal-list-'+scope);
  if(!list)return;
  var items=PKG_LIBRARY.filter(function(p){return !q||p.name.toLowerCase().indexOf(q)!==-1;});
  list.innerHTML=items.length?items.map(function(p){
    var lvlPill=p.level==='Primary'?'pill-blue':(p.level==='Secondary'?'pill-green':'pill-grey');
    return '<div class="pkg-modal-item" onclick="pkgModalAdd(\''+scope+'\',\''+p.name.replace(/'/g,"\\'")+'\')"><span class="pkg-modal-name">'+p.name+'</span><span class="pill '+lvlPill+'">'+p.level+'</span></div>';
  }).join(''):'<div style="padding:24px;text-align:center;color:var(--tw3);font-size:12px">No components match your search.</div>';
}
function pkgModalShowCreate(scope){
  document.getElementById('pkg-modal-search-wrap-'+scope).style.display='none';
  document.getElementById('pkg-modal-list-'+scope).style.display='none';
  document.getElementById('pkg-modal-create-'+scope).style.display='block';
  document.getElementById('pkg-modal-footer-'+scope).innerHTML='<button class="pkg-modal-create-btn" style="border-style:solid;background:linear-gradient(135deg,var(--gs),var(--teal));color:#04160e;border-color:transparent" onclick="pkgModalCreateSubmit(\''+scope+'\')">Add component</button>';
}
function pkgModalBackToList(scope){
  document.getElementById('pkg-modal-search-wrap-'+scope).style.display='';
  document.getElementById('pkg-modal-create-'+scope).style.display='none';
  document.getElementById('pkg-modal-list-'+scope).style.display='';
  document.getElementById('pkg-modal-footer-'+scope).innerHTML='<button class="pkg-modal-create-btn" onclick="pkgModalShowCreate(\''+scope+'\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create a new component</button>';
}
function pkgModalAdd(scope,name){
  var item=PKG_LIBRARY.filter(function(p){return p.name===name;})[0];
  insertPkgRow(scope,item?item.name:name,item?item.level:'Primary',item?item.material:'—');
  closePkgModal(scope);
}
function pkgModalCreateSubmit(scope){
  var nameEl=document.getElementById('pkg-modal-newname-'+scope);
  var levelEl=document.getElementById('pkg-modal-newlevel-'+scope);
  var name=(nameEl.value||'').trim();
  if(!name){nameEl.focus();return;}
  insertPkgRow(scope,name,levelEl.value,'—');
  nameEl.value='';
  closePkgModal(scope);
}
function insertPkgRow(targetScope,name,level,material){
  var tbody=document.getElementById('pkg-tbody-'+targetScope);
  if(!tbody)return;
  var lvlPill=level==='Primary'?'pill-blue':'pill-grey';
  var tr=document.createElement('tr');
  tr.style.background='rgba(78,187,129,.08)';
  tr.innerHTML='<td class="tbl-name">'+name+'</td><td><span class="pill '+lvlPill+'">'+level+'</span></td><td class="tbl-muted">'+material+'</td><td class="tbl-muted">—</td><td class="tbl-muted">—</td><td><span class="pill pill-grey">Pending</span></td><td style="display:flex;gap:4px;padding:8px 12px"><button class="btn-g-sm">Edit</button><button class="btn-g-sm" onclick="this.closest(\'tr\').remove()">Remove</button></td>';
  tbody.appendChild(tr);
}

/* ── Retailer picker modal (Users — Add user) ── */
var RETAILER_LIBRARY=['Primark Stores Ltd','M&S Food Retail','Aldi GmbH','Next Retail Ltd','Tesco PLC','Zara Ireland','H&M Group','John Lewis Partnership','Boots UK','Lidl GB',"Sainsbury's",'Debenhams','River Island','New Look','Superdry'];
function openRetailerModal(){
  var overlay=document.getElementById('retailer-modal');
  if(!overlay)return;
  overlay.classList.add('open');
  var search=document.getElementById('retailer-modal-search');
  if(search)search.value='';
  filterRetailerModal('');
}
function closeRetailerModal(){
  var overlay=document.getElementById('retailer-modal');
  if(overlay)overlay.classList.remove('open');
}
function filterRetailerModal(val){
  var q=(val||'').toLowerCase();
  var list=document.getElementById('retailer-modal-list');
  if(!list)return;
  var items=RETAILER_LIBRARY.filter(function(r){return !q||r.toLowerCase().indexOf(q)!==-1;});
  list.innerHTML=items.length?items.map(function(r){
    return '<div class="pkg-modal-item" onclick="selectRetailer(\''+r.replace(/'/g,"\\'")+'\')"><span class="pkg-modal-name">'+r+'</span></div>';
  }).join(''):'<div style="padding:24px;text-align:center;color:var(--tw3);font-size:12px">No retailers match your search.</div>';
}
function selectRetailer(name){
  var inp=document.getElementById('adduser-retailer');
  if(inp)inp.value=name;
  closeRetailerModal();
}

/* ── Country selector (Add retailer — Jurisdiction step) ── */
var ALL_COUNTRIES=[
  {name:'Ireland',region:'EU',aws:'eu-west-1'},{name:'United Kingdom',region:'UK',aws:'eu-west-2'},
  {name:'Germany',region:'EU',aws:'eu-west-1'},{name:'France',region:'EU',aws:'eu-west-1'},
  {name:'Netherlands',region:'EU',aws:'eu-west-1'},{name:'Belgium',region:'EU',aws:'eu-west-1'},
  {name:'Spain',region:'EU',aws:'eu-west-1'},{name:'Italy',region:'EU',aws:'eu-west-1'},
  {name:'Sweden',region:'EU',aws:'eu-west-1'},{name:'Poland',region:'EU',aws:'eu-west-1'},
  {name:'Canada (Ontario)',region:'CA',aws:'ca-central-1'},{name:'Canada (Quebec)',region:'CA',aws:'ca-central-1'},
  {name:'Canada (BC)',region:'CA',aws:'ca-central-1'}
];
function buildCountryDropdown(){
  var dd=document.getElementById('csel-dropdown');
  if(!dd)return;
  dd.innerHTML=ALL_COUNTRIES.map(function(c){
    return '<div class="csel-opt" onclick="selectCountry(\''+c.name+'\',\''+c.region+'\',\''+c.aws+'\')">'+c.name+' <span class="region-tag">'+c.region+' · '+c.aws+'</span></div>';
  }).join('');
}
function showDropdown(){
  var dd=document.getElementById('csel-dropdown');
  if(dd){if(!dd.children.length)buildCountryDropdown();dd.style.display='block';}
}
/* Configure screen — multi-jurisdiction country picker (same country search card as add-retailer, but adds
   selected countries as removable chips instead of a single value). */
var CFG_JUR={'Ireland':{region:'EU',aws:'eu-west-1'},'United Kingdom':{region:'UK',aws:'eu-west-2'}};
function cfgBuildJurDD(){
  var dd=document.getElementById('cfg-jur-dd'); if(!dd)return;
  dd.innerHTML=ALL_COUNTRIES.map(function(c){
    return '<div class="csel-opt" onclick="cfgAddJur(\''+c.name+'\',\''+c.region+'\',\''+c.aws+'\')">'+c.name+' <span class="region-tag">'+c.region+' · '+c.aws+'</span></div>';
  }).join('');
}
function cfgShowJurDD(){ var dd=document.getElementById('cfg-jur-dd'); if(dd){ if(!dd.children.length)cfgBuildJurDD(); dd.style.display='block'; } }
function cfgFilterJur(v){ var dd=document.getElementById('cfg-jur-dd'); if(!dd)return; if(!dd.children.length)cfgBuildJurDD(); dd.style.display='block'; dd.querySelectorAll('.csel-opt').forEach(function(o){ o.style.display=o.textContent.toLowerCase().indexOf(v.toLowerCase())>-1?'':'none'; }); }
function cfgAddJur(name,region,aws){ CFG_JUR[name]={region:region,aws:aws}; var dd=document.getElementById('cfg-jur-dd'); if(dd)dd.style.display='none'; var inp=document.getElementById('cfg-jur-input'); if(inp)inp.value=''; cfgRenderJur(); }
function cfgRemoveJur(name){ delete CFG_JUR[name]; cfgRenderJur(); }
function cfgRenderJur(){
  var el=document.getElementById('cfg-jur-list'); if(!el)return;
  var keys=Object.keys(CFG_JUR);
  el.innerHTML=keys.length?keys.map(function(n){
    return '<span class="pill pill-gs" style="gap:6px;padding-right:6px">'+n+' <span style="opacity:.65">· '+CFG_JUR[n].aws+'</span> <span onclick="cfgRemoveJur(\''+n.replace(/'/g,"\\'")+'\')" title="Remove" style="cursor:pointer;font-weight:700;font-size:13px;line-height:1">×</span></span>';
  }).join(''):'<span class="tbl-muted">No jurisdictions selected yet.</span>';
}
document.addEventListener('DOMContentLoaded',cfgRenderJur);
document.addEventListener('click',function(e){ var w=e.target.closest&&e.target.closest('.csel-wrap'); var dd=document.getElementById('cfg-jur-dd'); if(dd && (!w || !w.contains(dd))) dd.style.display='none'; });
function filterCountries(val){
  var dd=document.getElementById('csel-dropdown');
  if(!dd)return;
  if(!dd.children.length)buildCountryDropdown();
  dd.style.display='block';
  dd.querySelectorAll('.csel-opt').forEach(function(o){
    o.style.display=o.textContent.toLowerCase().indexOf(val.toLowerCase())>-1?'':'none';
  });
}
function selectCountry(name,region,aws){
  var inp=document.getElementById('csel-input');
  var rf=document.getElementById('region-field');
  var rh=document.getElementById('region-hint');
  var dd=document.getElementById('csel-dropdown');
  if(inp)inp.value=name;
  if(rf)rf.value=region+' · '+aws;
  if(rh)rh.textContent='Data residency: AWS '+aws;
  if(dd)dd.style.display='none';
}
document.addEventListener('click',function(e){
  var dd=document.getElementById('csel-dropdown');
  var inp=document.getElementById('csel-input');
  if(dd&&inp&&!dd.contains(e.target)&&e.target!==inp){
    dd.style.display='none';
  }
});

/* ── THEME CUSTOMIZER ── */
var THEME_GROUPS=[
  {label:'Brand accent',vars:[
    {key:'--gs',label:'Primary green'},
    {key:'--gs-l',label:'Green — light'},
    {key:'--gs-d',label:'Green — dark'},
    {key:'--bl',label:'Accent blue'},
    {key:'--bl-l',label:'Blue — light'},
    {key:'--bl-d',label:'Blue — dark'},
    {key:'--teal',label:'Teal'}
  ]},
  {label:'Status colors',vars:[
    {key:'--amber',label:'Warning'},
    {key:'--red',label:'Critical'}
  ]},
  {label:'Background',vars:[
    {key:'--bg-0',label:'Base'},
    {key:'--bg-1',label:'Layer 1'},
    {key:'--bg-2',label:'Layer 2'}
  ]},
  {label:'Login card glow colors',vars:[
    {key:'--card-glow-color1',label:'Glow color 1'},
    {key:'--card-glow-color2',label:'Glow color 2'}
  ]},
  {label:'Field focus stroke',vars:[
    {key:'--field-stroke-color',label:'Stroke color'}
  ]}
];

var PRESETS=[
  {name:'Greenstreets',swatch:['#4ebb81','#5b9cf6','#43b3ad'],vars:{'--gs':'#4ebb81','--gs-l':'#8fe3b6','--gs-d':'#2f9c62','--bl':'#5b9cf6','--bl-d':'#3766b0','--bl-l':'#9dc4ff','--teal':'#43b3ad','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#070f1c','--bg-1':'#0b1830','--bg-2':'#0f2038'}},
  {name:'Ocean',swatch:['#2fb8c9','#5b8cf6','#2f7fa8'],vars:{'--gs':'#2fb8c9','--gs-l':'#7fe1ec','--gs-d':'#1f8794','--bl':'#5b8cf6','--bl-d':'#31519e','--bl-l':'#9db8ff','--teal':'#2f7fa8','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#050f1c','--bg-1':'#081c33','--bg-2':'#0b2740'}},
  {name:'Sunset',swatch:['#f5a623','#e0605a','#c9498f'],vars:{'--gs':'#f5a623','--gs-l':'#ffcd7a','--gs-d':'#c9821a','--bl':'#e0605a','--bl-d':'#a83f3a','--bl-l':'#ff9c96','--teal':'#c9498f','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#1a0f0a','--bg-1':'#2a160d','--bg-2':'#331c10'}},
  {name:'Violet',swatch:['#a07af6','#5b9cf6','#c94ad1'],vars:{'--gs':'#a07af6','--gs-l':'#c9aeff','--gs-d':'#6f47c9','--bl':'#5b9cf6','--bl-d':'#3766b0','--bl-l':'#9dc4ff','--teal':'#c94ad1','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#0d0a1c','--bg-1':'#160f30','--bg-2':'#1c1440'}},
  {name:'Slate mono',swatch:['#8fa3bd','#5b7089','#41536b'],vars:{'--gs':'#8fa3bd','--gs-l':'#c3d1e3','--gs-d':'#5b7089','--bl':'#5b7089','--bl-d':'#3a4a5e','--bl-l':'#a9bbd1','--teal':'#41536b','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#0a0e15','--bg-1':'#0f1620','--bg-2':'#131c29'}},
  {name:'Forest',swatch:['#5fbb4e','#43b3ad','#8fbb4e'],vars:{'--gs':'#5fbb4e','--gs-l':'#a3e38f','--gs-d':'#3d8c2f','--bl':'#43b3ad','--bl-d':'#2c7a76','--bl-l':'#8fe0da','--teal':'#8fbb4e','--amber':'#f5a623','--red':'#e0605a','--bg-0':'#0a1409','--bg-1':'#0f200d','--bg-2':'#132a10'}}
];

var EXTRA_CONTROLS=[
  {key:'--swoosh-opacity',label:'Swoosh overlay opacity',min:0,max:1,step:.05,def:.35,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--login-bg-opacity',label:'Login background opacity',min:0,max:1,step:.05,def:.55,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--login-logo-size',label:'Login logo size',min:100,max:280,step:5,def:180,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--sb-logo-size',label:'Sidebar logo size',min:40,max:140,step:5,def:85,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--card-glow-speed',label:'Card glow sweep speed',min:.2,max:20,step:.1,def:2,cssUnit:'s',fmt:function(v){return v.toFixed(1)+'s'},onChange:updateCardGlowAnimation},
  {key:'--card-glow-pause',label:'Card glow pause on each swipe',min:0,max:10,step:.1,def:0,cssUnit:'s',fmt:function(v){return v.toFixed(1)+'s'},onChange:updateCardGlowAnimation},
  {key:'--card-glow-opacity',label:'Card glow opacity',min:0,max:1,step:.05,def:1,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--spotlight-opacity',label:'Spotlight opacity',min:0,max:1,step:.05,def:.18,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--spotlight-size',label:'Spotlight size',min:80,max:500,step:10,def:240,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--sidebar-angle',label:'Sidebar gradient angle',min:0,max:360,step:5,def:190,cssUnit:'deg',fmt:function(v){return v+'°'}},
  {key:'--sidebar-op-1',label:'Sidebar gradient 1 opacity',min:0,max:1,step:.05,def:.78,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--sidebar-op-2',label:'Sidebar gradient 2 opacity',min:0,max:1,step:.05,def:.86,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--sidebar-item-py',label:'Sidebar item spacing (height)',min:4,max:16,step:1,def:8,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--sidebar-item-gap',label:'Sidebar item spacing (gap)',min:0,max:12,step:1,def:4,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--field-stroke-weight',label:'Border width (0 = off)',min:0,max:6,step:.5,def:2,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--field-stroke-speed',label:'Duration',min:.1,max:1.5,step:.05,def:.5,cssUnit:'s',fmt:function(v){return v.toFixed(2)+'s'}},
  {key:'--anim-dur',label:'Screen entrance duration',min:0,max:.8,step:.05,def:.25,cssUnit:'s',fmt:function(v){return v.toFixed(2)+'s'}},
  {key:'--anim-shift',label:'Screen entrance distance',min:0,max:30,step:1,def:8,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--anim-stagger',label:'Screen cascade stagger',min:0,max:.15,step:.005,def:.045,cssUnit:'s',fmt:function(v){return v.toFixed(3)+'s'}},
  {key:'--ripple-opacity',label:'Ripple opacity',min:0,max:1,step:.05,def:.45,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}},
  {key:'--ripple-duration',label:'Ripple duration',min:.1,max:2,step:.05,def:.62,cssUnit:'s',fmt:function(v){return v.toFixed(2)+'s'}},
  {key:'--ripple-size',label:'Ripple size',min:.5,max:3,step:.1,def:1,cssUnit:'',fmt:function(v){return v.toFixed(1)+'×'}},
  {key:'--particle-count',label:'Particle count',min:0,max:24,step:1,def:10,cssUnit:'',fmt:function(v){return v+''}},
  {key:'--particle-size',label:'Particle size',min:2,max:12,step:1,def:5,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--particle-distance',label:'Particle spread',min:10,max:120,step:2,def:42,cssUnit:'px',fmt:function(v){return v+'px'}},
  {key:'--particle-duration',label:'Particle duration',min:.2,max:2,step:.05,def:.7,cssUnit:'s',fmt:function(v){return v.toFixed(2)+'s'}},
  {key:'--ripple-row-scale',label:'Listing ripple size',min:.1,max:1.5,step:.05,def:.5,cssUnit:'',fmt:function(v){return Math.round(v*100)+'%'}}
];

function hexToRgbStr(hex){
  hex=(hex||'#ffffff').replace('#','');
  if(hex.length===3)hex=hex.split('').map(function(c){return c+c}).join('');
  var num=parseInt(hex,16)||0xffffff;
  return [(num>>16)&255,(num>>8)&255,num&255].join(',');
}

function updateCardGlowAnimation(){
  var cs=getComputedStyle(document.documentElement);
  var speed=parseFloat(cs.getPropertyValue('--card-glow-speed'))||2;
  var pause=parseFloat(cs.getPropertyValue('--card-glow-pause'))||0;
  /* full cycle = diagonal sweep (top-left→bottom-right) + pause-at-end + sweep back + pause-at-start,
     so the loop point (100%) lands back on the exact starting value — no jump-cut, a true bounce */
  var total=2*(speed+pause); if(total<=0)total=.1;
  var downEnd=(speed/total*100).toFixed(2);
  var bottomHoldEnd=((speed+pause)/total*100).toFixed(2);
  var upEnd=((2*speed+pause)/total*100).toFixed(2);
  document.documentElement.style.setProperty('--card-glow-total-duration',total+'s');
  var styleTag=document.getElementById('cardGlowKeyframeStyle');
  if(!styleTag){styleTag=document.createElement('style');styleTag.id='cardGlowKeyframeStyle';document.head.appendChild(styleTag);}
  styleTag.textContent='@keyframes cardGlow{'+
    '0%{background-position:0% 0%}'+
    downEnd+'%{background-position:100% 100%}'+
    bottomHoldEnd+'%{background-position:100% 100%}'+
    upEnd+'%{background-position:0% 0%}'+
    '100%{background-position:0% 0%}}';
}

var THEME_DEFAULTS={};
THEME_GROUPS.forEach(function(g){
  g.vars.forEach(function(v){
    THEME_DEFAULTS[v.key]=getComputedStyle(document.documentElement).getPropertyValue(v.key).trim();
  });
});
var EXTRA_DEFAULTS={};
EXTRA_CONTROLS.forEach(function(c){
  EXTRA_DEFAULTS[c.key]=getComputedStyle(document.documentElement).getPropertyValue(c.key).trim();
});
var loginBgEnabled=true;

function rangeSafeId(key){return 'rv-'+key.replace(/[^a-z0-9]/gi,'');}

/* field-focus-animation easing options (dropdown in the panel) */
var FIELD_EASINGS=[
  {label:'Ease out (default)',val:'cubic-bezier(.16,1,.3,1)'},
  {label:'Ease in',val:'cubic-bezier(.42,0,1,1)'},
  {label:'Ease in-out',val:'cubic-bezier(.65,0,.35,1)'},
  {label:'Linear',val:'linear'},
  {label:'Spring / overshoot',val:'cubic-bezier(.34,1.56,.64,1)'}
];
function applyFieldEase(val){document.documentElement.style.setProperty('--field-stroke-ease',val);}

/* ── theme-panel row builders (shared by the grouped sections below) ── */
function tcColorRow(key,label){
  var val=getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  return '<div class="theme-row"><span class="theme-row-lbl">'+label+'</span><div class="theme-row-input">'+
    '<input class="theme-hex" data-var="'+key+'" value="'+val+'" onchange="applyColor(this.dataset.var,this.value)">'+
    '<input class="theme-color-input" type="color" data-var="'+key+'" value="'+val+'" oninput="applyColor(this.dataset.var,this.value)"></div></div>';
}
function tcColorGroup(label){var g=THEME_GROUPS.filter(function(x){return x.label===label})[0];if(!g)return '';return g.vars.map(function(v){return tcColorRow(v.key,v.label);}).join('');}
function tcRangeRow(key){
  var c=EXTRA_CONTROLS.filter(function(x){return x.key===key})[0];if(!c)return '';
  var raw=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(c.key));var v=isNaN(raw)?c.def:raw;
  return '<div class="theme-row" style="flex-direction:column;align-items:stretch;gap:5px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center"><span class="theme-row-lbl">'+c.label+'</span>'+
    '<span class="theme-range-val" id="'+rangeSafeId(c.key)+'">'+c.fmt(v)+'</span></div>'+
    '<input type="range" class="theme-range" data-var="'+c.key+'" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+v+'" oninput="applyRangeControl(this)"></div>';
}
function tcEaseRow(){
  var cur=getComputedStyle(document.documentElement).getPropertyValue('--field-stroke-ease').trim().replace(/\s+/g,'');
  var opts=FIELD_EASINGS.map(function(e){return '<option value="'+e.val+'"'+(e.val.replace(/\s+/g,'')===cur?' selected':'')+'>'+e.label+'</option>';}).join('');
  return '<div class="theme-row"><span class="theme-row-lbl">Easing</span>'+
    '<select onchange="applyFieldEase(this.value)" style="width:152px;padding:6px 8px;font-size:11px;border-radius:7px;background:rgba(255,255,255,.05);color:var(--tw2);border:1px solid var(--line-2);font-family:inherit;cursor:pointer;color-scheme:dark">'+opts+'</select></div>';
}
function tcSpotlightColorRow(){
  var slVal=getComputedStyle(document.documentElement).getPropertyValue('--spotlight-color-hex').trim()||'#ffffff';
  return '<div class="theme-row"><span class="theme-row-lbl">Spotlight color</span><div class="theme-row-input">'+
    '<input class="theme-hex" data-var="--spotlight-color-hex" value="'+slVal+'" onchange="applySpotlightColor(this.value)">'+
    '<input class="theme-color-input" type="color" data-var="--spotlight-color-hex" value="'+slVal+'" oninput="applySpotlightColor(this.value)"></div></div>';
}
function tcSidebarColorRow(n){
  var hv=getComputedStyle(document.documentElement).getPropertyValue('--sidebar-color-hex-'+n).trim()||'#0f2038';
  return '<div class="theme-row"><span class="theme-row-lbl">Gradient color '+n+'</span><div class="theme-row-input">'+
    '<input class="theme-hex" data-var="--sidebar-color-hex-'+n+'" value="'+hv+'" onchange="applySidebarColor('+n+',this.value)">'+
    '<input class="theme-color-input" type="color" data-var="--sidebar-color-hex-'+n+'" value="'+hv+'" oninput="applySidebarColor('+n+',this.value)"></div></div>';
}
/* ── button click effect (ripple + particles) ── colours carry a paired hex + rgb var (like spotlight);
   the enable flags are plain 1/0 CSS vars the shared JS reads. */
function applyRippleColor(hex){
  document.documentElement.style.setProperty('--ripple-color-hex',hex);
  document.documentElement.style.setProperty('--ripple-rgb',hexToRgbStr(hex));
  document.querySelectorAll('[data-var="--ripple-color-hex"]').forEach(function(inp){inp.value=hex;});
}
function applyParticleColor(hex){
  document.documentElement.style.setProperty('--particle-color-hex',hex);
  document.documentElement.style.setProperty('--particle-rgb',hexToRgbStr(hex));
  document.querySelectorAll('[data-var="--particle-color-hex"]').forEach(function(inp){inp.value=hex;});
}
function toggleFxVar(key,on){document.documentElement.style.setProperty(key,on?'1':'0');}
function tcFxColorRow(key,label,fn){
  var v=getComputedStyle(document.documentElement).getPropertyValue(key).trim()||'#ffffff';
  return '<div class="theme-row"><span class="theme-row-lbl">'+label+'</span><div class="theme-row-input">'+
    '<input class="theme-hex" data-var="'+key+'" value="'+v+'" onchange="'+fn+'(this.value)">'+
    '<input class="theme-color-input" type="color" data-var="'+key+'" value="'+v+'" oninput="'+fn+'(this.value)"></div></div>';
}
function tcFxToggleRow(key,label){
  var on=getComputedStyle(document.documentElement).getPropertyValue(key).trim()!=='0';
  return '<div class="theme-row"><span class="theme-row-lbl">'+label+'</span>'+
    '<label class="tg-switch"><input type="checkbox" '+(on?'checked':'')+' onchange="toggleFxVar(\''+key+'\',this.checked)">'+
    '<span class="tg-track"></span><span class="tg-thumb"></span></label></div>';
}

function buildThemePanel(){
  var body=document.getElementById('themePanelBody');
  if(!body) return;   // prototyping nav bar (with the theme panel) removed — nothing to build
  var L=function(t){return '<div class="theme-sec-lbl">'+t+'</div>';};
  var html='';
  // Presets
  html+=L('Presets')+'<div class="preset-grid">';
  PRESETS.forEach(function(p,i){html+='<div class="preset-btn" onclick="applyPreset('+i+')"><div class="preset-swatch">'+
    p.swatch.map(function(c){return '<span style="background:'+c+'"></span>';}).join('')+'</div><div class="preset-name">'+p.name+'</div></div>';});
  html+='</div>';
  // Brand / status / background colours
  html+=L('Brand accent')+tcColorGroup('Brand accent');
  html+=L('Status colors')+tcColorGroup('Status colors');
  html+=L('Background')+tcColorGroup('Background');
  // Field focus animation (fields, selects & buttons)
  html+=L('Field focus animation');
  html+=tcColorRow('--field-stroke-color','Stroke color');
  html+=tcRangeRow('--field-stroke-weight');
  html+=tcRangeRow('--field-stroke-speed');
  html+=tcEaseRow();
  // Screen entrance cascade
  html+=L('Screen entrance');
  html+=tcRangeRow('--anim-dur');
  html+=tcRangeRow('--anim-shift');
  html+=tcRangeRow('--anim-stagger');
  // Login card
  html+=L('Login card');
  html+=tcColorGroup('Login card glow colors');
  html+=tcRangeRow('--card-glow-speed');
  html+=tcRangeRow('--card-glow-pause');
  html+=tcRangeRow('--card-glow-opacity');
  html+=tcRangeRow('--spotlight-opacity');
  html+=tcRangeRow('--spotlight-size');
  html+=tcSpotlightColorRow();
  html+=tcRangeRow('--login-bg-opacity');
  html+=tcRangeRow('--login-logo-size');
  html+='<div class="theme-row"><span class="theme-row-lbl">Use login background photo</span>'+
    '<label class="tg-switch"><input type="checkbox" id="loginBgToggle" '+(loginBgEnabled?'checked':'')+' onchange="toggleLoginBg(this.checked)">'+
    '<span class="tg-track"></span><span class="tg-thumb"></span></label></div>';
  // Sidebar appearance
  html+=L('Sidebar');
  html+=tcRangeRow('--sb-logo-size');
  html+=tcRangeRow('--sidebar-angle');
  html+=tcRangeRow('--sidebar-op-1');
  html+=tcRangeRow('--sidebar-op-2');
  html+=tcRangeRow('--sidebar-item-py');
  html+=tcRangeRow('--sidebar-item-gap');
  html+=tcSidebarColorRow(1)+tcSidebarColorRow(2);
  // Imagery
  html+=L('Imagery &amp; effects');
  html+=tcRangeRow('--swoosh-opacity');
  // Button click effect (ripple + particles)
  html+=L('Button click effect');
  html+=tcFxToggleRow('--ripple-enabled','Ripple on click');
  html+=tcFxColorRow('--ripple-color-hex','Ripple color','applyRippleColor');
  html+=tcRangeRow('--ripple-opacity');
  html+=tcRangeRow('--ripple-duration');
  html+=tcRangeRow('--ripple-size');
  html+=tcFxToggleRow('--particle-enabled','Particle burst');
  html+=tcFxColorRow('--particle-color-hex','Particle color','applyParticleColor');
  html+=tcRangeRow('--particle-count');
  html+=tcRangeRow('--particle-size');
  html+=tcRangeRow('--particle-distance');
  html+=tcRangeRow('--particle-duration');
  html+=tcRangeRow('--ripple-row-scale');
  // Save & load
  html+=L('Save &amp; load');
  html+='<div style="display:flex;gap:8px">'+
    '<button class="theme-reset-btn theme-io-btn" style="margin-top:0" onclick="exportThemeJSON()">Export JSON</button>'+
    '<button class="theme-reset-btn theme-io-btn" style="margin-top:0" onclick="document.getElementById(\'themeImportInput\').click()">Import JSON</button>'+
    '</div>'+
    '<input type="file" id="themeImportInput" accept="application/json" style="display:none" onchange="importThemeJSON(this)">';
  html+='<button class="theme-reset-btn" onclick="resetTheme()">Reset to default</button>';
  body.innerHTML=html;
}

function applyColor(key,val){
  document.documentElement.style.setProperty(key,val);
  document.querySelectorAll('[data-var="'+key+'"]').forEach(function(inp){inp.value=val;});
  clearActivePreset();
}

function applyRangeControl(input){
  var key=input.dataset.var;
  var ctrl=EXTRA_CONTROLS.filter(function(c){return c.key===key})[0];
  if(!ctrl)return;
  var v=parseFloat(input.value);
  document.documentElement.style.setProperty(key,v+ctrl.cssUnit);
  var disp=document.getElementById(rangeSafeId(key));
  if(disp)disp.textContent=ctrl.fmt(v);
  if(ctrl.onChange)ctrl.onChange();
}

function applySpotlightColor(hex){
  document.documentElement.style.setProperty('--spotlight-color-hex',hex);
  document.documentElement.style.setProperty('--spotlight-rgb',hexToRgbStr(hex));
  document.querySelectorAll('[data-var="--spotlight-color-hex"]').forEach(function(inp){inp.value=hex;});
}

function applySidebarColor(n,hex){
  document.documentElement.style.setProperty('--sidebar-color-hex-'+n,hex);
  document.documentElement.style.setProperty('--sidebar-rgb-'+n,hexToRgbStr(hex));
  document.querySelectorAll('[data-var="--sidebar-color-hex-'+n+'"]').forEach(function(inp){inp.value=hex;});
}

function applyPreset(i){
  var p=PRESETS[i];
  Object.keys(p.vars).forEach(function(k){document.documentElement.style.setProperty(k,p.vars[k]);});
  if(p.vars['--gs']){
    var accRgb=hexToRgbStr(p.vars['--gs']);
    document.documentElement.style.setProperty('--gs-rgb',accRgb);
    document.documentElement.style.setProperty('--accent-rgb',hexToRgbStr(p.vars['--gs-l']||p.vars['--gs']));
  }
  document.querySelectorAll('.theme-hex,.theme-color-input').forEach(function(inp){
    var k=inp.dataset.var;
    if(p.vars[k]!==undefined)inp.value=p.vars[k];
  });
  document.querySelectorAll('.preset-btn').forEach(function(b,idx){b.classList.toggle('active',idx===i);});
}

function clearActivePreset(){
  document.querySelectorAll('.preset-btn').forEach(function(b){b.classList.remove('active')});
}

function toggleLoginBg(on){
  loginBgEnabled=!!on;
  var el=document.getElementById('loginBgImg');
  if(el)el.classList.toggle('on',loginBgEnabled);
  var cb=document.getElementById('loginBgToggle');
  if(cb)cb.checked=loginBgEnabled;
}

function resetTheme(){
  Object.keys(THEME_DEFAULTS).forEach(function(k){document.documentElement.style.removeProperty(k);});
  Object.keys(EXTRA_DEFAULTS).forEach(function(k){document.documentElement.style.removeProperty(k);});
  document.documentElement.style.removeProperty('--spotlight-color-hex');
  document.documentElement.style.removeProperty('--spotlight-rgb');
  document.documentElement.style.removeProperty('--sidebar-color-hex-1');
  document.documentElement.style.removeProperty('--sidebar-rgb-1');
  document.documentElement.style.removeProperty('--sidebar-color-hex-2');
  document.documentElement.style.removeProperty('--sidebar-rgb-2');
  document.documentElement.style.removeProperty('--card-glow-total-duration');
  document.documentElement.style.removeProperty('--field-stroke-ease');
  document.documentElement.style.removeProperty('--ripple-color-hex');
  document.documentElement.style.removeProperty('--ripple-rgb');
  document.documentElement.style.removeProperty('--ripple-enabled');
  document.documentElement.style.removeProperty('--particle-color-hex');
  document.documentElement.style.removeProperty('--particle-rgb');
  document.documentElement.style.removeProperty('--particle-enabled');
  document.documentElement.style.removeProperty('--gs-rgb');
  document.documentElement.style.removeProperty('--accent-rgb');
  updateCardGlowAnimation();
  toggleLoginBg(true);
  buildThemePanel();
  clearActivePreset();
}

function toggleThemePanel(force){
  var panel=document.getElementById('themePanel');
  if(!panel) return;
  var btn=document.getElementById('themeToggleBtn');
  var open=force!==undefined?force:!panel.classList.contains('open');
  panel.classList.toggle('open',open);
  if(btn) btn.classList.toggle('active',open);
}

function collectThemeState(){
  var cs=getComputedStyle(document.documentElement);
  var state={colors:{},extra:{},loginBgEnabled:loginBgEnabled,spotlightColorHex:cs.getPropertyValue('--spotlight-color-hex').trim(),
    fieldEase:cs.getPropertyValue('--field-stroke-ease').trim(),
    sidebarColorHex1:cs.getPropertyValue('--sidebar-color-hex-1').trim(),sidebarColorHex2:cs.getPropertyValue('--sidebar-color-hex-2').trim(),
    rippleColorHex:cs.getPropertyValue('--ripple-color-hex').trim(),particleColorHex:cs.getPropertyValue('--particle-color-hex').trim(),
    rippleEnabled:cs.getPropertyValue('--ripple-enabled').trim()!=='0',particleEnabled:cs.getPropertyValue('--particle-enabled').trim()!=='0'};
  Object.keys(THEME_DEFAULTS).forEach(function(k){state.colors[k]=cs.getPropertyValue(k).trim();});
  EXTRA_CONTROLS.forEach(function(c){
    var raw=parseFloat(cs.getPropertyValue(c.key));
    state.extra[c.key]=isNaN(raw)?c.def:raw;
  });
  return state;
}

function exportThemeJSON(){
  var state=collectThemeState();
  var blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='greenstreets-theme.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function applyThemeState(state){
  if(state.colors)Object.keys(state.colors).forEach(function(k){document.documentElement.style.setProperty(k,state.colors[k]);});
  if(state.extra)Object.keys(state.extra).forEach(function(k){
    var ctrl=EXTRA_CONTROLS.filter(function(c){return c.key===k})[0];
    if(ctrl)document.documentElement.style.setProperty(k,state.extra[k]+ctrl.cssUnit);
  });
  if(state.spotlightColorHex)applySpotlightColor(state.spotlightColorHex);
  if(state.fieldEase)applyFieldEase(state.fieldEase);
  if(state.sidebarColorHex1)applySidebarColor(1,state.sidebarColorHex1);
  if(state.sidebarColorHex2)applySidebarColor(2,state.sidebarColorHex2);
  if(state.rippleColorHex)applyRippleColor(state.rippleColorHex);
  if(state.particleColorHex)applyParticleColor(state.particleColorHex);
  if(typeof state.rippleEnabled==='boolean')toggleFxVar('--ripple-enabled',state.rippleEnabled);
  if(typeof state.particleEnabled==='boolean')toggleFxVar('--particle-enabled',state.particleEnabled);
  if(typeof state.loginBgEnabled==='boolean')toggleLoginBg(state.loginBgEnabled);
  updateCardGlowAnimation();
  buildThemePanel();
  clearActivePreset();
}

function importThemeJSON(fileInput){
  var file=fileInput.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{applyThemeState(JSON.parse(e.target.result));}
    catch(err){alert('Invalid theme JSON file');}
  };
  reader.readAsText(file);
  fileInput.value='';
}

document.addEventListener('click',function(e){
  var wrap=document.querySelector('.theme-panel-wrap');
  if(wrap&&!wrap.contains(e.target))toggleThemePanel(false);
});

/* ── Export split-button dropdowns (Reports, etc.) ── */
function closeExportMenus(){
  document.querySelectorAll('.export-dd-menu.open').forEach(function(m){m.classList.remove('open');});
}
function toggleExportMenu(btn){
  var menu=btn.closest('.export-dd-wrap').querySelector('.export-dd-menu');
  var wasOpen=menu.classList.contains('open');
  closeExportMenus();
  if(!wasOpen)menu.classList.add('open');
}
document.addEventListener('click',function(e){
  if(!e.target.closest('.export-dd-wrap'))closeExportMenus();
});

/* ── Documents listing: row "more actions" kebab dropdown + document detail deep-link ── */
function toggleDropdown(btn){
  var dd=btn._gsDropdown||btn.nextElementSibling;
  if(!dd||!dd.classList.contains('reminder-dropdown'))return;
  btn._gsDropdown=dd;
  document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){ if(d!==dd)d.classList.remove('open'); });
  var opening=!dd.classList.contains('open');
  dd.classList.toggle('open');
  if(opening){
    if(dd.parentElement!==document.body)document.body.appendChild(dd);
    positionDropdown(btn,dd);
  }
}
function positionDropdown(btn,dd){
  var r=btn.getBoundingClientRect();
  var menuW=dd.offsetWidth||200,menuH=dd.offsetHeight||0;
  var left=Math.max(4,Math.min(r.right-menuW,window.innerWidth-menuW-4));
  var top=r.bottom+4;
  if(top+menuH>window.innerHeight)top=r.top-menuH-4;
  dd.style.left=left+'px';
  dd.style.top=top+'px';
}
window.addEventListener('scroll',function(){
  document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
},true);
document.addEventListener('click',function(e){
  if(!e.target.closest('.reminder-btn-wrap')&&!e.target.closest('.reminder-dropdown')){
    document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
  }
});
/* Open the document detail page for a given document id, optionally deep-linking to one
   of its action sections ('evidence'|'manual'|'versions'|'audit'|'export') — round-trips via sessionStorage. */
function openDocumentSA(docId,section){
  try{
    sessionStorage.setItem('sa_di',docId);
    if(section)sessionStorage.setItem('sa_di_section',section); else sessionStorage.removeItem('sa_di_section');
  }catch(e){}
  go('sa_docdetail');
}

/* login card glass hover — spotlight follows the cursor. Each zone gets its own --sx/--sy computed from
   its own rect (same fixed-px radius), so the circle reads as one continuous light across the zone seam. */
var loginCardEl=document.getElementById('loginCard');
if(loginCardEl){
  var spotlightZones=loginCardEl.querySelectorAll('.zone-spotlight');
  loginCardEl.addEventListener('mousemove',function(e){
    spotlightZones.forEach(function(zoneSpot){
      var r=zoneSpot.parentElement.getBoundingClientRect();
      zoneSpot.parentElement.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
      zoneSpot.parentElement.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
    });
  });
}

try{ updateCardGlowAnimation(); }catch(e){}
try{ buildThemePanel(); }catch(e){}

/* ═══════════════════════════════════════════════════════════════════════════
   Super Admin split-build enhancers: stat-chip tooltips, listing first-load
   fade, and the Settings → Appearance (theme selector) card.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Explanations for the top-right dashboard stat chips, keyed by their label. */
var GS_STAT_TIPS={
  'Active retailers':{h:'Active retailer tenants',b:'Retailer accounts currently onboarded and live on the platform. Excludes archived or pending-invite tenants. Open a retailer to see its suppliers, products and compliance status.'},
  'Total DoCs':{h:'Declarations of Conformity',b:'All PPWR Declarations of Conformity generated across every retailer tenant — the audit-ready PDFs proving each packaging type meets EU Regulation 2025/40. Includes current and superseded versions.'},
  'Total suppliers':{h:'Suppliers across all tenants',b:'Unique packaging suppliers invited by retailers to submit packaging data via the supplier portal. A supplier serving several retailers is counted once.'},
  'Alerts':{h:'Items needing attention',b:'Open compliance alerts across the portfolio: overdue supplier submissions, expiring EPR registrations, and DoCs flagged for regeneration after data changes.'},
  'Total users':{h:'Platform user accounts',b:'All retailer-side user accounts (Admins and Compliance Managers) across every tenant. Supplier-portal users are account-less and not counted here.'},
  'Active users':{h:'Recently active users',b:'Users who have signed in within the last 30 days — a quick pulse on adoption across your retailer tenants.'},
  'Pending invites':{h:'Unaccepted invitations',b:'User invitations that have been sent but not yet accepted. Resend or revoke from the Users screen.'},
  'Total products':{h:'Products (SKUs) tracked',b:'All retailer products imported across tenants. Each SKU owns one or more packaging components that must be completed for PPWR conformity.'},
  'Total SKUs':{h:'Products (SKUs) tracked',b:'All retailer products imported across tenants. Each SKU owns one or more packaging components that must be completed for PPWR conformity.'},
  'Packaging complete':{h:'Packaging data completeness',b:'Share of products whose packaging components have every mandatory PPWR field filled and passing conformity checks — the readiness signal for DoC generation.'},
  'Packagings complete':{h:'Packaging data completeness',b:'Share of packaging components with all mandatory PPWR fields complete and conformity checks passing.'},
  'Packaging components':{h:'Packaging components',b:'Individual packaging parts (primary, secondary, tertiary) linked to products — e.g. swing tags, polybags, cartons. Each carries its own material, weight, recycled-content and compliance data.'},
  'Awaiting data':{h:'Waiting on suppliers',b:'Packaging components with no submitted data yet — invitations sent but not completed. These are your chase list.'},
  'Awaiting packaging data':{h:'Waiting on suppliers',b:'Components with no submitted data yet — invitations sent but not completed by the supplier.'},
  'Pending submissions':{h:'In-progress submissions',b:'Supplier submissions started but not yet finished. Track link-opened and last-activity dates on each supplier detail page.'},
  'Suppliers submitted':{h:'Suppliers who submitted',b:'Suppliers who have completed and submitted at least one assigned packaging component through the portal.'},
  'Submitted':{h:'Submitted',b:'Records the supplier has completed and submitted. Submitted data is locked read-only unless a resubmission is requested.'},
  'Overdue':{h:'Overdue submissions',b:'Suppliers past their invitation deadline without submitting. Automated reminders fire at day 7, 14 and 21; send an ad-hoc reminder from the supplier detail page.'},
  'Total packaging weight':{h:'Portfolio packaging weight',b:'Aggregate weight (kg) of all packaging placed on market across tracked products — the basis for EPR tonnage reporting in Annex IX Table 1 format.'},
  'Proof docs':{h:'Supporting evidence documents',b:'Supplier-uploaded certificates and reports backing the packaging data: FSC certificates, recycled-content test reports, REACH data sheets and material safety data sheets.'},
  'Docs missing':{h:'Missing evidence',b:'Components that require a supporting document (substance flag = Yes or recycled content > 0%) but do not yet have one attached.'},
  'DoCs complete':{h:'Completed Declarations',b:'Declarations of Conformity fully generated and stored — every Annex VIII field populated and all conformity checks passed.'},
  'DoCs generated':{h:'Declarations generated',b:'Total DoC PDFs produced for this tenant, including superseded versions kept for the audit trail.'},
  'Declaration of conformity':{h:'DoC readiness',b:'Products with a valid, current Declaration of Conformity versus the total requiring one. Green means audit-ready within the 10-day Article 18 window.'},
  'Substance compliance':{h:'Substances of concern',b:'Components screened clear of restricted substances (BPA, PFAS, mineral oils, chlorine) versus those still needing declaration or evidence.'},
  'PFAS compliant':{h:'PFAS screening',b:'Packaging components declared free of PFAS (per- and polyfluoroalkyl substances) with supporting evidence where required.'},
  'Technical documentation':{h:'Technical documentation',b:'Products whose full technical file — material composition, recycled content, recyclability grade and evidence — is complete and audit-ready.'},
  'Technical docs':{h:'Technical documentation',b:'Products whose full technical file is complete and audit-ready.'},
  'Member states':{h:'EPR member states',b:'National EPR schemes this tenant is registered with. Each registration has its own ID, renewal date and status; ones expiring within 60 days are flagged.'},
  'Completion':{h:'Overall completion',b:'Overall packaging-data completeness for this scope — the headline progress figure toward full PPWR readiness.'},
  'Warnings':{h:'Warnings',b:'Non-blocking issues that need review — e.g. data changed since a DoC was generated, or a registration approaching renewal.'},
  'Urgent':{h:'Urgent items',b:'High-priority items requiring action now, such as registrations expiring imminently or overdue statutory deadlines.'},
  'Info':{h:'Informational',b:'Low-priority notices and status updates — no action required, shown for awareness.'},
  'Events today':{h:'Audit events today',b:'Actions recorded in the audit trail in the last 24 hours — user edits, submissions, document generation and automated System events.'},
  'Active':{h:'Active',b:'Currently active items in this list.'},
  'Total components':{h:'Packaging components',b:'All packaging components across this retailer’s products — swing tags, polybags, cartons, hangers and so on. Each is screened for PPWR compliance individually.'},
  'Complete':{h:'Complete components',b:'Packaging components with every mandatory PPWR field filled and all conformity checks passing — ready to feed a Declaration of Conformity.'}
};
function gsInitStatTooltips(){
  var tip=document.getElementById('gs-stat-tip');
  if(!tip){ tip=document.createElement('div'); tip.id='gs-stat-tip'; tip.className='stat-tip'; document.body.appendChild(tip); }
  document.querySelectorAll('.stat-mini').forEach(function(chip){
    if(chip._gsTip)return;
    var lblEl=chip.querySelector('.stat-lbl'); if(!lblEl)return;
    var info=GS_STAT_TIPS[lblEl.textContent.trim()]; if(!info)return;
    chip._gsTip=info; chip.setAttribute('data-tip','1'); chip.setAttribute('tabindex','0');
    var show=function(){
      tip.innerHTML='<div class="stat-tip-h">'+info.h+'</div><div class="stat-tip-b">'+info.b+'</div>';
      var r=chip.getBoundingClientRect();
      tip.style.visibility='hidden'; tip.classList.add('on');
      var tw=tip.offsetWidth, th=tip.offsetHeight;
      var left=Math.min(Math.max(8,r.left), window.innerWidth-tw-8);
      var top=r.bottom+8; if(top+th>window.innerHeight-8) top=r.top-th-8;
      tip.style.left=left+'px'; tip.style.top=top+'px'; tip.style.visibility='';
    };
    var hide=function(){ tip.classList.remove('on'); };
    chip.addEventListener('mouseenter',show);
    chip.addEventListener('mouseleave',hide);
    chip.addEventListener('focus',show);
    chip.addEventListener('blur',hide);
  });
}

/* First-load fade for generic (.tbl) listings — pt tables fade via ptInit/ptRender */
function gsInitListingFade(){
  if(gsSAReduceMotion())return;
  document.querySelectorAll('table.tbl:not([id^="pt-table"]) tbody').forEach(function(tb){ gsSAFadeRows(tb); });
}

/* Settings → Appearance (like the Supplier Portal): Theme preset, Accent colour, Logo,
   plus Display options (Text & UI size, Spacing density, Motion). Saved per-device in
   localStorage and applied on every load. */
var GSA_KEY='gs_superadmin_appearance';
function gsaLoad(){ try{ return JSON.parse(localStorage.getItem(GSA_KEY))||{}; }catch(e){ return {}; } }
function gsaSave(s){ try{ localStorage.setItem(GSA_KEY, JSON.stringify(s)); }catch(e){} }
function gsaShade(hex,amt){
  hex=(hex||'#4ebb81').replace('#',''); if(hex.length===3) hex=hex.split('').map(function(c){return c+c;}).join('');
  var n=parseInt(hex,16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  function m(x){ return Math.max(0,Math.min(255, Math.round(amt<0? x*(1+amt) : x+(255-x)*amt))); }
  return '#'+[m(r),m(g),m(b)].map(function(x){return('0'+x.toString(16)).slice(-2);}).join('');
}
function gsaApply(s){
  s=s||gsaLoad();
  if(s.theme!=null && typeof applyPreset==='function' && typeof PRESETS!=='undefined' && PRESETS[s.theme]){ applyPreset(s.theme); }
  if(s.accent){
    var root=document.documentElement.style;
    root.setProperty('--gs',s.accent);
    root.setProperty('--gs-l',gsaShade(s.accent,.34));
    root.setProperty('--gs-d',gsaShade(s.accent,-.28));
    if(typeof hexToRgbStr==='function'){
      var accRgb=hexToRgbStr(s.accent);
      root.setProperty('--particle-rgb',accRgb);
      root.setProperty('--gs-rgb',accRgb);
      root.setProperty('--accent-rgb',hexToRgbStr(gsaShade(s.accent,.34)));
    }
    root.setProperty('--particle-color-hex',s.accent);
    root.setProperty('--field-stroke-color',s.accent);
  }
  if(s.logo){ document.querySelectorAll('.sb-logo,.login-logo,img[alt="Greenstreets"]').forEach(function(im){ im.src=s.logo; }); }
  var scale=s.textScale||1;
  var containers=document.querySelectorAll('.app-body,.login-wrap,.pshell,.pbody');
  for(var i=0;i<containers.length;i++) containers[i].style.zoom=(scale===1?'':scale);
  var cl=document.documentElement.classList;
  cl.remove('gs-density-compact','gs-density-comfortable');
  if(s.density==='compact') cl.add('gs-density-compact');
  else if(s.density==='comfortable') cl.add('gs-density-comfortable');
  if(s.reduceMotion) cl.add('gs-reduce-motion'); else cl.remove('gs-reduce-motion');
}
function gsaRefresh(){ var h=document.getElementById('settings-appearance'); if(h){ h._built=false; buildSettingsAppearance(); } }
function gsaSet(patch){ var st=gsaLoad(); for(var k in patch) st[k]=patch[k]; gsaSave(st); gsaApply(st); }
function gsaSeg(label,hint,opts,cur,onPick){
  var btns=opts.map(function(o){ return '<button class="gsa-seg-btn'+(o.v===cur?' active':'')+'" data-v="'+o.v+'">'+o.t+'</button>'; }).join('');
  var row=document.createElement('div'); row.className='gsa-row';
  row.innerHTML='<div class="gsa-row-lbl">'+label+(hint?'<small>'+hint+'</small>':'')+'</div><div class="gsa-seg">'+btns+'</div>';
  row.querySelectorAll('.gsa-seg-btn').forEach(function(b){
    b.addEventListener('click',function(){
      row.querySelectorAll('.gsa-seg-btn').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active'); onPick(b.getAttribute('data-v'));
    });
  });
  return row;
}
function gsaSection(label,hint){
  var sec=document.createElement('div'); sec.className='gsa-sec';
  sec.innerHTML='<div class="flbl" style="margin-bottom:4px">'+label+'</div>'+(hint?'<div class="fhint" style="margin:0 0 10px">'+hint+'</div>':'');
  return sec;
}
var GSA_ACCENTS=['#4ebb81','#2fb6ad','#5b9cf6','#8b5cf6','#f5943b','#e0607f','#e0c05a','#e0605a'];
/* Inject the full theme-customizer panel (previously in the prototyping bar) as a
   floating top-right panel, opened by the Settings "Open theme customizer" button. */
function gsaEnsureThemePanel(){
  if(document.getElementById('themePanel')) return;
  var wrap=document.createElement('div');
  wrap.className='theme-panel-wrap'; wrap.id='themeWrap';
  wrap.style.cssText='position:fixed;top:16px;right:16px;z-index:9998';
  wrap.innerHTML=
    '<button class="theme-toggle-btn" id="themeToggleBtn" style="display:none" onclick="toggleThemePanel()">Theme</button>'+
    '<div class="theme-panel" id="themePanel">'+
      '<div class="theme-panel-hdr"><span>Customize theme</span>'+
      '<button class="theme-panel-close" onclick="toggleThemePanel(false)">✕</button></div>'+
      '<div class="theme-panel-body" id="themePanelBody"></div>'+
    '</div>';
  document.body.appendChild(wrap);
  try{ buildThemePanel(); }catch(e){}
}
function buildSettingsAppearance(){
  var host=document.getElementById('settings-appearance'); if(!host||host._built)return; host._built=true;
  var s=gsaLoad();
  host.innerHTML='<div class="fhint" style="margin-bottom:16px">Personalise the console. Preferences are saved on this device and apply across every screen.</div>';
  var wrap=document.createElement('div'); wrap.className='gsa-wrap'; host.appendChild(wrap);

  /* Ensure the full theme customizer panel exists (it used to live in the removed prototyping bar) */
  gsaEnsureThemePanel();

  /* Advanced — open the full theme customizer */
  var advSec=gsaSection('Advanced','Fine-tune every colour, effect and animation.');
  var advBtn=document.createElement('button'); advBtn.className='btn-g-sm';
  advBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>Open theme customizer';
  advBtn.onclick=function(ev){ ev.stopPropagation(); toggleThemePanel(true); };
  advSec.appendChild(advBtn); wrap.appendChild(advSec);

  /* Theme preset (dark-appearance palettes). If the Settings page provides the
     grouped theme-cluster mount (#settings-theme-presets), inject the swatches
     there — next to the light-theme palette — instead of into the personalise block. */
  if(typeof PRESETS!=='undefined'){
    var pg=document.createElement('div'); pg.className='appr-presets';
    PRESETS.forEach(function(p,i){
      var sw=p.swatch.map(function(c){return '<span style="background:'+c+'"></span>';}).join('');
      var card=document.createElement('div'); card.className='appr-preset'+((s.theme===i)?' active':'');
      card.innerHTML='<div class="appr-preset-sw">'+sw+'</div><div class="appr-preset-name">'+p.name+'</div>';
      card.onclick=function(){ gsaSet({theme:i, accent:undefined}); gsaRefresh(); };
      pg.appendChild(card);
    });
    var presetMount=document.getElementById('settings-theme-presets');
    if(presetMount){ presetMount.innerHTML=''; presetMount.appendChild(pg); }
    else { var themeSec=gsaSection('Dark theme presets','Colour theme used in the dark appearance.'); themeSec.appendChild(pg); wrap.appendChild(themeSec); }
  }

  /* Accent colour */
  var accSec=gsaSection('Accent colour','Overrides the theme accent — buttons, highlights and effects use it.');
  var accRow=document.createElement('div'); accRow.className='appr-accents';
  var curAccent=(s.accent||getComputedStyle(document.documentElement).getPropertyValue('--gs').trim()).toLowerCase();
  GSA_ACCENTS.forEach(function(hex){
    var chip=document.createElement('div'); chip.className='appr-accent'+((hex.toLowerCase()===curAccent)?' active':'');
    chip.style.background=hex; chip.title=hex;
    chip.onclick=function(){ gsaSet({accent:hex}); gsaRefresh(); };
    accRow.appendChild(chip);
  });
  var custom=document.createElement('input'); custom.type='color'; custom.className='appr-color-in';
  custom.value=(/^#([0-9a-f]{6})$/i.test(curAccent)?curAccent:'#4ebb81'); custom.title='Custom colour';
  custom.oninput=function(){ gsaSet({accent:custom.value}); };
  accRow.appendChild(custom);
  accSec.appendChild(accRow); wrap.appendChild(accSec);

  /* Logo */
  var logoSec=gsaSection('Logo','Upload your organisation logo (PNG or SVG). Shown on the login and sidebar.');
  var logoRow=document.createElement('div'); logoRow.className='appr-logo-row';
  var prev=document.createElement('div'); prev.className='appr-logo-prev';
  var prevImg=document.createElement('img');
  var existing=document.querySelector('.sb-logo,.login-logo,img[alt="Greenstreets"]');
  prevImg.src=s.logo||(existing?existing.src:''); prevImg.alt='Logo preview';
  prev.appendChild(prevImg);
  var file=document.createElement('input'); file.type='file'; file.accept='image/*'; file.style.display='none';
  file.onchange=function(){ var f=file.files&&file.files[0]; if(!f)return; var rd=new FileReader(); rd.onload=function(){ gsaSet({logo:rd.result}); prevImg.src=rd.result; }; rd.readAsDataURL(f); };
  var up=document.createElement('button'); up.className='btn-g-sm'; up.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Upload logo';
  up.onclick=function(){ file.click(); };
  var rm=document.createElement('button'); rm.className='btn-g-sm'; rm.textContent='Use default';
  rm.onclick=function(){ var st=gsaLoad(); delete st.logo; gsaSave(st); if(existing) prevImg.src=existing.getAttribute('src'); };
  var lbtns=document.createElement('div'); lbtns.className='appr-logo-btns'; lbtns.appendChild(file); lbtns.appendChild(up); lbtns.appendChild(rm);
  logoRow.appendChild(prev); logoRow.appendChild(lbtns); logoSec.appendChild(logoRow); wrap.appendChild(logoSec);

  /* Display options */
  var dispSec=gsaSection('Display','Text size, spacing density and motion.');
  wrap.appendChild(dispSec);
  wrap.appendChild(gsaSeg('Text &amp; UI size','',
    [{v:'0.9',t:'Small'},{v:'1',t:'Default'},{v:'1.1',t:'Large'},{v:'1.2',t:'Larger'}],
    String(s.textScale||1), function(v){ gsaSet({textScale:parseFloat(v)}); }));
  wrap.appendChild(gsaSeg('Spacing density','',
    [{v:'compact',t:'Compact'},{v:'default',t:'Default'},{v:'comfortable',t:'Comfortable'}],
    s.density||'default', function(v){ gsaSet({density:v}); }));
  wrap.appendChild(gsaSeg('Motion','',
    [{v:'full',t:'Full'},{v:'reduced',t:'Reduced'}],
    s.reduceMotion?'reduced':'full', function(v){ gsaSet({reduceMotion:(v==='reduced')}); }));

  /* Reset */
  var foot=document.createElement('div'); foot.style.marginTop='6px';
  var reset=document.createElement('button'); reset.className='btn-g-sm'; reset.textContent='Reset to default';
  reset.onclick=function(){ gsaSave({}); ['--gs','--gs-l','--gs-d','--particle-rgb','--particle-color-hex','--field-stroke-color'].forEach(function(v){document.documentElement.style.removeProperty(v);}); gsaApply({}); gsaRefresh(); };
  foot.appendChild(reset); wrap.appendChild(foot);
}
window.gsaApply=gsaApply;
gsaApply();   // apply saved display prefs as early as possible

window.addEventListener('load',function(){
  try{ gsInitStatTooltips(); }catch(e){}
  try{ gsInitListingFade(); }catch(e){}
  try{ buildSettingsAppearance(); }catch(e){}
  try{ gsaApply(); }catch(e){}
  try{ gsInitAutocomplete(); }catch(e){}
});


/* ═══════════════════════════════════════════════════════════════════════════
   Retailer-Detail: user row → edit page, inline role change, edit-page fill.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Open the user editor for a given user object (persist via sessionStorage). */
function suOpenUser(u){
  try{ sessionStorage.setItem('gs_user', JSON.stringify(u||{})); }catch(e){}
  go('suedit');
}

/* Inline role picker — click a role pill (or "Change role") to switch Admin ⇄ Retailer user. */
var SU_ROLES=[{v:'Admin',cls:'pill-blue'},{v:'Retailer user',cls:'pill-grey'}];
function suRoleMenu(pill){
  if(!pill) return;
  document.querySelectorAll('.su-role-menu').forEach(function(m){m.remove();});
  var menu=document.createElement('div');
  menu.className='su-role-menu';
  SU_ROLES.forEach(function(r){
    var cur=pill.textContent.trim()===r.v;
    var opt=document.createElement('div');
    opt.className='su-role-opt'+(cur?' active':'');
    opt.innerHTML='<span class="pill '+r.cls+'">'+r.v+'</span>'+(cur?'<span class="su-role-tick">✓</span>':'');
    opt.addEventListener('click',function(ev){
      ev.stopPropagation();
      pill.textContent=r.v;
      pill.classList.remove('pill-blue','pill-grey');
      pill.classList.add(r.cls);
      menu.remove();
    });
    menu.appendChild(opt);
  });
  document.body.appendChild(menu);
  var rect=pill.getBoundingClientRect();
  menu.style.left=Math.min(rect.left, window.innerWidth-menu.offsetWidth-8)+'px';
  menu.style.top=(rect.bottom+6)+'px';
  requestAnimationFrame(function(){ menu.classList.add('on'); });
  setTimeout(function(){
    document.addEventListener('click',function h(e){
      if(!menu.contains(e.target)){ menu.remove(); document.removeEventListener('click',h); }
    });
  },0);
}

/* Save handler on the User-Edit page (prototype: toast + return to retailer detail). */
function suSaveUser(){
  var first=(document.getElementById('ue-first')||{}).value||'';
  if(typeof gsToast==='function') gsToast('User '+((first||'').trim()||'details')+' updated');
  go('s4');
}

/* Populate the User-Edit page from the sessionStorage user record. */
function suFillUserEdit(){
  if(!document.getElementById('ue-first')) return;
  var u={};
  try{ u=JSON.parse(sessionStorage.getItem('gs_user')||'{}'); }catch(e){}
  var name=(u.name||'').trim();
  var parts=name.split(/\s+/);
  var first=parts.shift()||'';
  var last=parts.join(' ');
  var set=function(id,val){ var el=document.getElementById(id); if(el&&val!=null) el.value=val; };
  set('ue-first',first); set('ue-last',last); set('ue-email',u.email||''); set('ue-job',u.job||'');
  set('ue-role',u.role||'Retailer user'); set('ue-status',u.status||'Active');
  var t=document.getElementById('ue-title'); if(t&&name) t.textContent=name;
  var c=document.getElementById('ue-crumb'); if(c&&name) c.textContent=name;
  var s=document.getElementById('ue-sub'); if(s) s.textContent=(u.email||'')+(u.active?(' · last active '+u.active):'');
}

/* Tiny toast helper (used by suSaveUser). */
function gsToast(msg){
  var t=document.getElementById('gs-toast');
  if(!t){ t=document.createElement('div'); t.id='gs-toast'; t.className='gs-toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('on');
  clearTimeout(t._h); t._h=setTimeout(function(){ t.classList.remove('on'); },2200);
}

window.suOpenUser=suOpenUser; window.suRoleMenu=suRoleMenu; window.suSaveUser=suSaveUser; window.gsToast=gsToast;

/* Add the overdue-suppliers stat tip + run the edit-page fill on load. */
if(typeof GS_STAT_TIPS!=='undefined'){
  GS_STAT_TIPS['Suppliers overdue']={h:'Suppliers past deadline',b:'Suppliers invited by this retailer who have not submitted their packaging data by the deadline. Automated reminders fire at day 7, 14 and 21. This tenant’s admin was last active 2 hours ago — nudge them to chase the APAC region.'};
}
window.addEventListener('load',function(){ try{ suFillUserEdit(); }catch(e){} });


/* ═══════════════════════════════════════════════════════════════════════════
   Cross-page "open filtered" actions (Retailers / Suppliers listing action column).
   Each action button opens a target listing pre-filtered to the row's entity, with
   a dismissible context banner. The filter term is derived from the row name, so the
   same markup works for every row (no per-row wiring).
   ═══════════════════════════════════════════════════════════════════════════ */

/* Open target page (s3 Suppliers / s7 Users / s11 Products / s8 Packagings / s10 …)
   filtered to the entity named in the clicked button's row. */
function suRowCtx(btn, pageId){
  var tr=btn.closest('tr');
  var nameEl=tr?tr.querySelector('.tbl-name'):null;
  var label=nameEl?nameEl.textContent.trim():'';
  var term=label.split(/\s+/)[0] || label;   // first word = loose match (e.g. "Primark")
  suGoFiltered(pageId, {label:label, term:term});
}
function suGoFiltered(pageId, f){
  try{ sessionStorage.setItem('gs_ctxfilter', JSON.stringify({page:pageId, label:f.label, term:f.term})); }catch(e){}
  go(pageId);
}

/* Apply a pending context filter on the target page (called on load). */
function suApplyCtxFilter(){
  var raw; try{ raw=sessionStorage.getItem('gs_ctxfilter'); }catch(e){}
  if(!raw) return;
  var f; try{ f=JSON.parse(raw); }catch(e){ return; }
  sessionStorage.removeItem('gs_ctxfilter');
  var main=document.querySelector('.screen.on .main')||document.querySelector('.main');
  if(!main) return;
  // Prefill a paginated (pt) search input, if present
  var ptInp=main.querySelector('input[oninput^="ptSearch"]');
  if(ptInp){ ptInp.value=f.term; ptInp.dispatchEvent(new Event('input',{bubbles:true})); }
  // Prefill a generic filter-toolbar search input
  var tbInp=main.querySelector('.filter-toolbar input.fi-search, .filter-toolbar input:not([type=checkbox])');
  if(tbInp && tbInp!==ptInp){ tbInp.value=f.term; tbInp.dispatchEvent(new Event('input',{bubbles:true})); }
  suShowCtxBanner(main, f.label);
}
function suShowCtxBanner(main, label){
  var old=main.querySelector('.ctx-filter'); if(old) old.remove();
  var bar=document.createElement('div');
  bar.className='ctx-filter';
  bar.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>'+
                '<span>Filtered to <b>'+label+'</b></span>'+
                '<button class="ctx-clear" onclick="suClearCtxFilter(this)">Clear filter ✕</button>';
  // insert after the breadcrumb if present, else at the very top of .main
  var bc=main.querySelector('.breadcrumb');
  if(bc && bc.nextSibling) main.insertBefore(bar, bc.nextSibling);
  else main.insertBefore(bar, main.firstChild);
}
function suClearCtxFilter(btn){
  var main=btn.closest('.main'); if(!main) return;
  var bar=main.querySelector('.ctx-filter'); if(bar) bar.remove();
  var ptInp=main.querySelector('input[oninput^="ptSearch"]');
  if(ptInp){ ptInp.value=''; ptInp.dispatchEvent(new Event('input',{bubbles:true})); }
  var tbInp=main.querySelector('.filter-toolbar input.fi-search, .filter-toolbar input:not([type=checkbox])');
  if(tbInp && tbInp!==ptInp){ tbInp.value=''; tbInp.dispatchEvent(new Event('input',{bubbles:true})); }
}
window.suRowCtx=suRowCtx; window.suGoFiltered=suGoFiltered; window.suClearCtxFilter=suClearCtxFilter;

/* Remove a packaging component row from the listing (prototype: fade out + drop). */
function suRemovePackaging(btn){
  var tr=btn.closest('tr'); if(!tr) return;
  var name=(tr.querySelector('.tbl-name')||{}).textContent||'this component';
  tr.style.transition='opacity .25s, transform .25s';
  tr.style.opacity='0'; tr.style.transform='translateX(12px)';
  setTimeout(function(){ tr.remove(); if(typeof gsToast==='function') gsToast('Removed “'+name.trim()+'”'); },240);
}
window.suRemovePackaging=suRemovePackaging;

window.addEventListener('load',function(){ try{ suApplyCtxFilter(); }catch(e){} });


/* ═══════════════════════════════════════════════════════════════════════════
   Fuzzy autocomplete for every listing search box. Suggestions are drawn from the
   table the toolbar filters (full dataset for pt-tables, DOM rows otherwise),
   fuzzy-ranked, keyboard-navigable, with the matched characters highlighted.
   Selecting a suggestion fills the input and re-runs the existing filter.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Subsequence fuzzy score: exact substrings rank highest (prefix best), then
   subsequence matches with contiguity/start bonuses. Returns -1 for no match. */
function gsFuzzyScore(q, str){
  q=(q||'').toLowerCase(); str=(str||'').toLowerCase();
  if(!q) return 0;
  var idx=str.indexOf(q);
  if(idx>=0) return 1000 - idx*3 - (str.length - q.length);
  var qi=0, score=0, prev=-2;
  for(var si=0; si<str.length && qi<q.length; si++){
    if(str.charAt(si)===q.charAt(qi)){
      score += (si===prev+1) ? 6 : 1;
      if(si===0) score += 10;
      prev=si; qi++;
    }
  }
  return qi<q.length ? -1 : score;
}
/* Highlight the characters of `str` that matched `q` (substring or subsequence). */
function gsFuzzyHighlight(q, str){
  q=(q||'').toLowerCase(); var low=str.toLowerCase();
  var esc=function(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  if(!q) return esc(str);
  var idx=low.indexOf(q);
  if(idx>=0){ return esc(str.slice(0,idx))+'<b>'+esc(str.slice(idx,idx+q.length))+'</b>'+esc(str.slice(idx+q.length)); }
  var out='', qi=0;
  for(var i=0;i<str.length;i++){
    if(qi<q.length && low.charAt(i)===q.charAt(qi)){ out+='<b>'+esc(str.charAt(i))+'</b>'; qi++; }
    else out+=esc(str.charAt(i));
  }
  return out;
}
/* Collect candidate strings for a toolbar's table. */
function gsAcCandidates(input){
  var scope=input.closest('.grp-body,.landing-tab-panel,.grp,.main')||document;
  var table=scope.querySelector('table.tbl');
  if(!table) return [];
  var set=Object.create(null), out=[];
  function add(v){
    v=(v||'').trim();
    if(v.length<2) return;
    if(/^[\d.,%\/—\-\s]+$/.test(v)) return;   // pure numbers / dashes / symbols
    var k=v.toLowerCase(); if(set[k]) return; set[k]=1; out.push(v);
  }
  var id=table.id||'';
  if(id.indexOf('pt-table-')===0 && typeof __pt!=='undefined'){
    var sc=id.replace('pt-table-',''), st=__pt[sc];
    if(st && st.data){
      var fields=(st.opts&&st.opts.searchFields)||[];
      for(var r=0;r<st.data.length;r++){ for(var f=0;f<fields.length;f++){ add(String(st.data[r][fields[f]]==null?'':st.data[r][fields[f]])); } }
    }
  }
  if(!out.length){
    var body=table.tBodies[0]; if(body){
      Array.prototype.forEach.call(body.rows,function(row){
        Array.prototype.forEach.call(row.cells,function(c){
          if(c.querySelector('button,input')) return;   // skip action / control cells
          add(c.textContent);
        });
      });
    }
  }
  return out;
}
function gsAcAttach(input){
  if(input._gsAc) return; input._gsAc=true;
  var wrap=input.closest('.search-wrap')||input.parentNode;
  if(getComputedStyle(wrap).position==='static') wrap.style.position='relative';
  var menu=document.createElement('div'); menu.className='gs-ac'; wrap.appendChild(menu);
  var items=[], active=-1, suppress=false;
  function close(){ menu.classList.remove('on'); menu.innerHTML=''; items=[]; active=-1; }
  function pick(v){
    suppress=true;
    var setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(input, v);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    close(); suppress=false; input.focus();
  }
  function render(q){
    var cands=gsAcCandidates(input);
    var scored=[];
    for(var i=0;i<cands.length;i++){ var s=gsFuzzyScore(q,cands[i]); if(s>=0) scored.push({v:cands[i],s:s}); }
    scored.sort(function(a,b){ return b.s-a.s || a.v.length-b.v.length; });
    items=scored.slice(0,8).map(function(o){return o.v;});
    if(!items.length){ close(); return; }
    menu.innerHTML=items.map(function(v,i){
      return '<div class="gs-ac-opt'+(i===active?' active':'')+'" data-i="'+i+'">'+
        '<svg class="gs-ac-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'+
        '<span>'+gsFuzzyHighlight(q,v)+'</span></div>';
    }).join('');
    menu.classList.add('on');
    Array.prototype.forEach.call(menu.querySelectorAll('.gs-ac-opt'),function(el){
      el.addEventListener('mousedown',function(e){ e.preventDefault(); pick(items[+el.getAttribute('data-i')]); });
      el.addEventListener('mouseenter',function(){ active=+el.getAttribute('data-i'); paint(); });
    });
  }
  function paint(){ Array.prototype.forEach.call(menu.querySelectorAll('.gs-ac-opt'),function(el,i){ el.classList.toggle('active',i===active); }); }
  input.addEventListener('input',function(){
    if(suppress) return;
    var q=input.value.trim();
    if(q.length<1){ close(); return; }
    active=-1; render(q);
  });
  input.addEventListener('keydown',function(e){
    if(!menu.classList.contains('on')) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(items.length-1,active+1); paint(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(0,active-1); paint(); }
    else if(e.key==='Enter'){ if(active>=0){ e.preventDefault(); pick(items[active]); } }
    else if(e.key==='Escape'){ close(); }
  });
  input.addEventListener('blur',function(){ setTimeout(close,120); });
}
function gsInitAutocomplete(){
  document.querySelectorAll('.filter-toolbar input.fi-search, .filter-toolbar input[type="text"], .filter-toolbar input:not([type])').forEach(function(inp){
    if(inp.type==='checkbox'||inp.type==='radio') return;
    try{ gsAcAttach(inp); }catch(e){}
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ID display enhancement — monospace + identicon + shared-prefix dimming.
   Ported from retailer-admin.js. Cells tagged `.gs-id-cell` become:
     [identicon] <dim shared-prefix><bold distinguishing key>
   pt-tables self-enhance in ptRender; static tables enhance on load. Idempotent.
   ═══════════════════════════════════════════════════════════════════════════ */
function gsHashStr(s){ var h=5381; for(var i=0;i<s.length;i++){ h=((h*33) ^ s.charCodeAt(i)) >>> 0; } return h>>>0; }
function gsIdenticon(id, size){
  size = size||16;
  var h = gsHashStr(id), hue = h % 360, color = 'hsl('+hue+',55%,55%)';
  var n=5, cell=size/n, v=h||1, rects='';
  for(var x=0;x<3;x++){ for(var y=0;y<n;y++){
    v = (v*1103515245 + 12345) & 0x7fffffff;
    if((v>>8) & 1){
      rects += '<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'"/>';
      if(x<2) rects += '<rect x="'+((4-x)*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'"/>';
    }
  } }
  return '<svg class="gs-identicon" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true" style="fill:'+color+'">'+rects+'</svg>';
}
function gsIdLCP(arr){ if(!arr.length) return ''; var p=arr[0]; for(var i=1;i<arr.length;i++){ while(arr[i].lastIndexOf(p,0)!==0){ p=p.slice(0,-1); if(!p) return ''; } } return p; }
function gsEnhanceIds(root, selector){
  root = root || document;
  var els = [].slice.call(root.querySelectorAll(selector || '.gs-id-cell'));
  if(!els.length) return;
  var esc = function(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var ids = els.map(function(el){ var raw=el.getAttribute('data-gsid'); if(raw==null){ raw=(el.textContent||'').trim(); el.setAttribute('data-gsid', raw); } return raw; });
  var cp = gsIdLCP(ids), m = cp.match(/^.*[-_.\/\s]/); cp = m ? m[0] : '';
  els.forEach(function(el, i){
    var id = ids[i]; if(!id) return;
    var dim = id.slice(0, cp.length), key = id.slice(cp.length);
    if(!key){ key = id; dim = ''; }
    el.classList.add('gs-id');
    el.innerHTML = '<span class="gs-id-ic">'+gsIdenticon(id,16)+'</span><span class="gs-id-text">'+(dim?'<span class="gs-id-dim">'+esc(dim)+'</span>':'')+'<span class="gs-id-key">'+esc(key)+'</span></span>';
  });
}
try{ window.gsIdenticon=gsIdenticon; window.gsEnhanceIds=gsEnhanceIds; }catch(_){ }
(function(){
  function run(){ try{ if(typeof gsEnhanceIds==='function') gsEnhanceIds(document, '.gs-id-cell'); }catch(_){ } }
  if(document.readyState!=='loading') setTimeout(run,0);
  else document.addEventListener('DOMContentLoaded', run);
})();
