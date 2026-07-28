/* super-admin-shell.js — operator sidebar + display prefs for the Supplier-Portal-engine
   detail pages (which load supplier-portal.js, not super-admin.js). Provides the LEFT PANE. */
var SIDEBAR_NAV=[
  {id:'s2',label:'Retailers',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'},
  {id:'s3',label:'Suppliers',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'},
  {id:'s7',label:'Users',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},
  {id:'s11',label:'Products',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>'},
  {id:'s8',label:'Packagings',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'},
  {id:'s9',label:'Reports',icon:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'}
];
function sidebarHtml(activeId){
  var items=SIDEBAR_NAV.map(function(n){
    return '<a class="nav-item'+(n.id===activeId?' active':'')+'" onclick="go(\''+n.id+'\')">'+n.icon+n.label+'</a>';
  }).join('');
  return '<div class="sb-logo-zone"><img class="sb-logo" src="https://greenstreets.ie/wp-content/uploads/sites/2/2026/04/Logo-WG.png" alt="Greenstreets"></div>'+
    '<div class="sb-section">Operator</div>'+items+
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
if(document.readyState!=='loading') mountSidebars(); else document.addEventListener('DOMContentLoaded', mountSidebars);
/* carry the Settings > Appearance display prefs (text size / motion / density) onto detail pages */
(function(){
  try{
    var s=JSON.parse(localStorage.getItem('gs_superadmin_appearance'))||{};
    var scale=s.textScale||1;
    var cs=document.querySelectorAll('.app-body,.pbody,.pshell');
    for(var i=0;i<cs.length;i++) cs[i].style.zoom=(scale===1?'':scale);
    var cl=document.documentElement.classList;
    if(s.density==='compact') cl.add('gs-density-compact'); else if(s.density==='comfortable') cl.add('gs-density-comfortable');
    if(s.reduceMotion) cl.add('gs-reduce-motion');
  }catch(e){}
})();
