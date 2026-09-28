/* ══════════════════════════════════════════════════════════════════════════
   supplier-shell.js — LEFT PANE navigation for the Supplier Portal.

   The portal used to navigate from a top bar: the three section tabs lived
   inside the page header (.ph, rendered by gsBuildBreadcrumb) next to the
   settings gear.  This file converts that into the same left pane every other
   portal uses — it reuses the shared sidebar components from
   css/greenstreets-theme.css (.sidebar / .sb-logo-zone / .sb-section /
   .nav-item / .sb-divider / .sb-notif-row / .sb-user), exactly as the Super
   Admin portal's super-admin-shell.js does.

   Page content is untouched: the sidebar is injected as a sibling of .pshell
   inside a flex row (.sp-app, styled in css/supplier-portal.css), so .ph and
   .pbody keep their markup.  The light twins keep working because nav uses
   go(id) — greenstreets-light.js re-wraps go() to resolve the -Light page.

   Skipped: Login (no chrome) and the Component Wizard (a focused flow that
   already owns its own left pane, .snav).
   ══════════════════════════════════════════════════════════════════════════ */
(function(){

  var ICON = {
    products:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
    packaging: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    docs:      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    settings:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
    bell:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    logout:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };

  /* The three sections the old header tabs carried, in the same order. */
  var SP_NAV = [
    {key:'products',  id:'sp2',      label:'Products',             icon:ICON.products},
    {key:'packaging', id:'sp2_pkg',  label:'Packaging Components', icon:ICON.packaging},
    {key:'docs',      id:'sp2_docs', label:'Supporting Documents', icon:ICON.docs}
  ];

  /* Which nav item is current, keyed off the page file name (each screen is a
     standalone document since the portal split). -Light twins share the stem. */
  function currentKey(){
    var f = (location.pathname.split('/').pop() || '').replace(/-Light\.html$/i, '.html');
    f = f.replace(/^04-greenstreets_supplier_portal_/, '').replace(/\.html$/i, '');
    if(/^Settings$/i.test(f))                  return 'settings';
    if(/^Products$|^Product-Detail$/i.test(f)) return 'products';
    if(/^Documents$/i.test(f))                 return 'docs';
    if(/^Packaging/i.test(f))                  return 'packaging';
    /* the AI import flow and the wizard are launched from Packaging Components */
    if(/^AI-|^Confirmation$|^Component-Wizard$/i.test(f)) return 'packaging';
    return '';
  }

  var NOTIFS = [
    {t:'Packaging data due in 12 days',        s:'Primark Stores Ltd · 26 Jul 2026',    c:'amber'},
    {t:'3 components need review',             s:'AI-imported values awaiting your check',   c:'blue'},
    {t:'Declaration of Conformity requested',  s:'Swing tag · supporting document',     c:'green'}
  ];

  function sidebarHtml(active){
    var items = SP_NAV.map(function(n){
      return '<a class="nav-item' + (n.key === active ? ' active' : '') + '" onclick="go(\'' + n.id + '\')">' + n.icon + n.label + '</a>';
    }).join('');
    var pop = NOTIFS.map(function(n){
      return '<div class="sb-notif-item"><span class="sb-notif-dot ' + n.c + '"></span>' +
             '<div><div class="sb-notif-t">' + n.t + '</div><div class="sb-notif-s">' + n.s + '</div></div></div>';
    }).join('');
    return '' +
      '<div class="sb-logo-zone"><img class="gs-logo-img sb-logo" src="img/Logo-WG.png" alt="Greenstreets"></div>' +
      '<div class="sb-section">Supplier Portal</div>' +
      items +
      '<div class="sb-divider"></div>' +
      '<a class="nav-item' + (active === 'settings' ? ' active' : '') + '" onclick="go(\'sp_settings\')">' + ICON.settings + 'Settings</a>' +
      '<div class="sb-notif-wrap-sb">' +
        '<div class="sb-notif-row" onclick="gsSpToggleNotifs(event)" title="Notifications">' +
          '<div class="sb-bell-btn">' + ICON.bell + '<span class="bell-badge">3</span></div>' +
          '<span class="sb-notif-label">Notifications</span>' +
        '</div>' +
        '<div class="sb-notif-pop" id="spNotifPop" hidden><div class="sb-notif-pop-hdr">Notifications</div>' + pop + '</div>' +
      '</div>' +
      '<div class="sb-user" style="cursor:pointer" onclick="go(\'sp_settings\')" title="Account settings">' +
        '<div class="sb-avatar">LP</div>' +
        '<div class="sb-user-info"><div class="sb-user-name">Luntai Packaging Co.</div>' +
        '<div class="sb-user-role">Supplier · <span style="color:var(--gs)">Primark</span></div></div>' +
        '<button class="sb-logout" onclick="event.stopPropagation();go(\'sp1\')" title="Log out">' + ICON.logout + '</button>' +
      '</div>';
  }

  window.gsSpToggleNotifs = function(ev){
    if(ev) ev.stopPropagation();
    var p = document.getElementById('spNotifPop'); if(!p) return;
    p.hidden = !p.hidden;
  };
  document.addEventListener('click', function(e){
    var p = document.getElementById('spNotifPop');
    if(p && !p.hidden && p.parentNode && !p.parentNode.contains(e.target)) p.hidden = true;
  });

  function mount(){
    var shell = document.querySelector('.pshell');
    if(!shell || document.querySelector('.sidebar')) return;

    var row = document.createElement('div');
    row.className = 'sp-app';
    shell.parentNode.insertBefore(row, shell);

    var sb = document.createElement('div');
    sb.className = 'sidebar';
    sb.innerHTML = sidebarHtml(currentKey());
    row.appendChild(sb);
    row.appendChild(shell);

    /* Settings now lives in the left pane — drop the header gear it duplicates. */
    var gear = shell.querySelector('.ph button[onclick*="sp_settings"]');
    if(gear) gear.remove();
    /* The in-page section tabs are the nav we just moved — remove the leftover. */
    var lt = shell.querySelector('.landing-tabs');
    if(lt) lt.remove();
  }

  if(document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
