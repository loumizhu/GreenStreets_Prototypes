/* ═══════════════════════════════════════════════════════════════════════════
   rs-switcher.js — Retailer ⇄ Supplier mode switcher (demo)

   One person, one sign-in, two workspaces. Loaded LAST by the four demo pages
   (retailer/ + supplier/, dark + -Light). Everything the demo shows is in CFG.

   Entry points (both do the same switch):
     1. Sidebar logo (top-left). On hover the logo gives way to
        "Switch to / <Other> Mode →" and the cursor becomes a revolving door.
        Click → switch.
     2. Account block (bottom-left: avatar, name, role). Click → Slack-style workspace menu: who you are,
        the CURRENT portal (icon + mode + "Active") and the OTHER portal
        (icon + mode + pending work). Pick it → switch. Esc / outside click
        closes; ↑/↓ move between items.

   A switch keeps the theme (dark → dark, -Light → -Light), plays a short
   transition, and the arriving page shows a "Now in <mode> mode · Switch back"
   toast (announced to screen readers).

   The demo pages link the REAL portal CSS/JS, so GS_PAGES is re-pointed at the
   real portal folders — every sidebar link still works; only Products is local.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var CFG = {
    person: { name: "Keith O'Sullivan", initials: 'KO' },
    workspaces: {
      retailer: {
        mode: 'Retailer', org: 'Primark', role: 'Retailer Admin',
        page: '../retailer/02-Greenstreets_retailer_admin_Products',
        portal: '../../Retailer_Admin_Portal/', localId: 'ra6',
        pending: '4 new notifications', pendingCount: 4
      },
      supplier: {
        mode: 'Supplier', org: 'Luntai Packaging Co.', role: 'Supplier Admin',
        page: '../supplier/04-greenstreets_supplier_portal_Products',
        portal: '../../Supplier_Portal/', localId: 'sp2',
        pending: '3 requests · due 26 Jul', pendingCount: 3
      }
    }
  };

  var CUR   = /supplier_portal/i.test(location.pathname) ? 'supplier' : 'retailer';
  var OTHER = CUR === 'retailer' ? 'supplier' : 'retailer';
  var LIGHT = /-Light\.html$/i.test(location.pathname);
  var W = CFG.workspaces;

  /* ── icons ─────────────────────────────────────────────────────────────── */
  function svg(w, body, sw){
    return '<svg width="'+w+'" height="'+w+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
  }
  /* revolving door: two arcs turning around each other (no centre bar) */
  var DOOR = '<path d="M5.2 10A7 7 0 0 1 17.6 7.6"/><path d="M18.2 4.2v3.9h-3.9"/><path d="M18.8 14A7 7 0 0 1 6.4 16.4"/><path d="M5.8 19.8v-3.9h3.9"/>';
  var ICON = {
    door:     function(w){ return svg(w||16, DOOR, 1.9); },
    arrow:    function(w){ return svg(w||14, '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>', 2.1); },
    check:    function(w){ return svg(w||12, '<path d="M5 12.5l4.2 4.2L19 7"/>', 2.4); },
    /* retailer = storefront, supplier = factory */
    retailer: function(w){ return svg(w||16, '<path d="M3 9l1.6-5h14.8L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 11.5V20h14v-8.5"/><path d="M10 20v-5h4v5"/>'); },
    supplier: function(w){ return svg(w||16, '<path d="M3 20V10l5 3V10l5 3V10l5 3V4h3v16z"/><path d="M7 17h2M12 17h2M17 17h1"/>'); },
    newtab:   function(w){ return svg(w||14, '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'); },
    settings: function(w){ return svg(w||14, '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>', 1.6); },
    logout:   function(w){ return svg(w||14, '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>', 1.8); }
  };
  function tile(mode, w){ return '<span class="rs-tile" data-mode="'+mode+'">'+ICON[mode](w||16)+'</span>'; }

  /* the cursor over the logo: the revolving door in a round badge */
  function doorCursor(){
    var ring = OTHER === 'retailer' ? '#9dc4ff' : '#8fe3b6';
    var fill = LIGHT ? '#ffffff' : (OTHER === 'retailer' ? '#15294a' : '#163a2b');
    var ink  = LIGHT ? (OTHER === 'retailer' ? '#2c5fae' : '#1f7a4c') : ring;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'+
      '<circle cx="16" cy="16" r="14" fill="'+fill+'" stroke="'+ring+'" stroke-width="2"/>'+
      '<g transform="translate(6 6) scale(.8333)" fill="none" stroke="'+ink+'" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">'+DOOR+'</g></svg>';
    return 'url("data:image/svg+xml,'+encodeURIComponent(s)+'") 16 16, pointer';
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function targetUrl(key){ return W[key].page + (LIGHT ? '-Light' : '') + '.html'; }

  /* ── keep the real portal's sidebar links working from the demo folder ── */
  function repointPages(){
    var map = window.GS_PAGES; if(!map) return;
    var ws = W[CUR];
    Object.keys(map).forEach(function(id){
      if(id === ws.localId) return;                      // Products stays local
      if(map[id].indexOf('/') < 0) map[id] = ws.portal + map[id];
    });
  }

  /* ── the switch itself ─────────────────────────────────────────────────── */
  var switching = false;
  function switchTo(key, newTab){
    if(key === CUR || switching) return;
    var url = targetUrl(key);
    if(newTab){ window.open(url, '_blank', 'noopener'); closeMenu(); return; }
    switching = true;
    closeMenu();
    try{ sessionStorage.setItem('rsArrived', JSON.stringify({from: CUR, to: key, t: Date.now()})); }catch(e){}
    var ov = document.createElement('div');
    ov.className = 'rs-transit';
    ov.setAttribute('role', 'status');
    ov.innerHTML = '<div class="rs-transit-card">'+tile(key, 26)+
      '<div class="rs-transit-t">Switching to '+W[key].mode+' mode…</div>'+
      '<div class="rs-transit-s">'+esc(W[key].org)+' · '+esc(W[key].role)+' · no sign-in needed</div></div>';
    document.body.appendChild(ov);
    setTimeout(function(){ location.href = url; }, 560);
  }

  /* ── 1. logo hover switch (top-left) ───────────────────────────────────── */
  function mountLogo(zone){
    if(zone.querySelector('.rs-logo-switch')) return;
    zone.classList.add('rs-has-switch');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rs-logo-switch';
    b.setAttribute('data-to', OTHER);
    b.setAttribute('aria-label', 'Switch to '+W[OTHER].mode+' mode — '+W[OTHER].org);
    b.title = 'Switch to '+W[OTHER].mode+' mode · '+W[OTHER].org;
    b.innerHTML = '<span class="rs-lbl"><span class="rs-lbl-1">Switch to</span>'+
      '<b class="rs-lbl-2">'+W[OTHER].mode+' Mode</b></span>'+
      '<span class="rs-arrow">'+ICON.arrow(24)+'</span>';
    b.style.cursor = doorCursor();
    b.addEventListener('click', function(e){ e.stopPropagation(); switchTo(OTHER); });
    zone.appendChild(b);
  }

  /* ── 2. avatar workspace menu (bottom-left) ────────────────────────────── */
  var menu, avatar, userRow;
  function personalise(user){
    var name = user.querySelector('.sb-user-name');
    var role = user.querySelector('.sb-user-role');
    if(name) name.textContent = CFG.person.name;
    if(role) role.innerHTML = esc(W[CUR].mode)+' mode · <span style="color:var(--gs)">'+esc(W[CUR].org)+'</span>';
    /* the WHOLE account block opens the switcher (Slack-style) — its old
       onclick went to the real portal's Settings page, which read as
       "switched to the wrong page". Settings is in the menu instead. */
    user.removeAttribute('onclick');
    user.title = 'Switch portal';
    user.addEventListener('click', function(e){
      if(e.target.closest('.sb-logout')) return;           // log out keeps its own action
      e.stopPropagation(); toggleMenu();
    });
  }

  function mountAvatar(user){
    userRow = user;
    avatar = user.querySelector('.sb-avatar');
    if(!avatar || avatar.classList.contains('rs-avatar')) return;
    personalise(user);
    avatar.classList.add('rs-avatar');
    avatar.textContent = CFG.person.initials;
    avatar.insertAdjacentHTML('beforeend',
      '<span class="rs-av-mode" data-mode="'+CUR+'">'+ICON[CUR](10)+'</span>');
    /* no pending-count dot on the avatar: the Notifications row right above
       already carries a badge — the other portal's pending work shows in the menu */
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-haspopup', 'menu');
    avatar.setAttribute('aria-expanded', 'false');
    avatar.setAttribute('aria-label', 'Switch portal. Now in '+W[CUR].mode+' mode, '+W[CUR].org+'. '+W[OTHER].mode+' mode has '+W[OTHER].pending+'.');
    avatar.title = 'Switch portal';
    avatar.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp'){ e.preventDefault(); e.stopPropagation(); openMenu(true); }
    });
    buildMenu();
  }

  function buildMenu(){
    menu = document.createElement('div');
    menu.className = 'rs-menu';
    menu.id = 'rsMenu';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Switch portal');
    var c = W[CUR], o = W[OTHER];
    menu.innerHTML =
      '<div class="rs-m-who"><span class="rs-m-av">'+esc(CFG.person.initials)+'</span>'+
        '<div><div class="rs-m-name">'+esc(CFG.person.name)+'</div>'+
        '<div class="rs-m-meta">One sign-in · 2 portals</div></div></div>'+
      '<div class="rs-m-sec" aria-hidden="true">Current portal</div>'+
      '<div class="rs-m-item rs-current" data-mode="'+CUR+'" role="menuitemradio" aria-checked="true" tabindex="-1">'+
        tile(CUR)+
        '<span class="rs-m-txt"><span class="rs-m-org" style="display:block">'+esc(c.org)+'</span>'+
        '<span class="rs-m-mode" style="display:block"><b>'+c.mode+' mode</b> · '+esc(c.role)+'</span></span>'+
        '<span class="rs-m-active">'+ICON.check(12)+'Active</span></div>'+
      '<div class="rs-m-sec" aria-hidden="true">Switch to</div>'+
      '<button type="button" class="rs-m-item" data-mode="'+OTHER+'" data-switch="'+OTHER+'" role="menuitemradio" aria-checked="false" tabindex="-1">'+
        tile(OTHER)+
        '<span class="rs-m-txt"><span class="rs-m-org" style="display:block">'+esc(o.org)+'</span>'+
        '<span class="rs-m-mode" style="display:block"><b>'+o.mode+' mode</b> · '+esc(o.role)+'</span>'+
        (o.pending ? '<span class="rs-m-pend">'+esc(o.pending)+'</span>' : '')+'</span>'+
        '<span class="rs-m-go">'+ICON.door(16)+'</span></button>'+
      '<div class="rs-m-div" role="separator"></div>'+
      '<button type="button" class="rs-m-link" data-newtab="'+OTHER+'" role="menuitem" tabindex="-1">'+ICON.newtab()+'Open '+o.mode+' mode in a new tab</button>'+
      '<button type="button" class="rs-m-link" data-act="settings" role="menuitem" tabindex="-1">'+ICON.settings()+'Account settings</button>'+
      '<button type="button" class="rs-m-link" data-act="logout" role="menuitem" tabindex="-1">'+ICON.logout()+'Log out</button>';
    document.body.appendChild(menu);

    menu.addEventListener('click', function(e){
      e.stopPropagation();
      var t = e.target.closest('[data-switch],[data-newtab],[data-act]'); if(!t) return;
      if(t.hasAttribute('data-switch')) return switchTo(t.getAttribute('data-switch'));
      if(t.hasAttribute('data-newtab')) return switchTo(t.getAttribute('data-newtab'), true);
      closeMenu();
      var act = t.getAttribute('data-act');
      if(typeof window.go === 'function') window.go(act === 'settings' ? (CUR === 'retailer' ? 'ra_config' : 'sp_settings') : (CUR === 'retailer' ? 'ra_login' : 'sp1'));
    });
    menu.addEventListener('keydown', function(e){
      var items = [].slice.call(menu.querySelectorAll('[role^="menuitem"]'));
      var i = items.indexOf(document.activeElement);
      if(e.key === 'ArrowDown'){ e.preventDefault(); items[(i+1) % items.length].focus(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); items[(i-1+items.length) % items.length].focus(); }
      else if(e.key === 'Home'){ e.preventDefault(); items[0].focus(); }
      else if(e.key === 'End'){ e.preventDefault(); items[items.length-1].focus(); }
      else if(e.key === 'Escape'){ e.preventDefault(); closeMenu(true); }
      else if(e.key === 'Tab'){ closeMenu(); }
    });
  }

  function place(){
    var r = (userRow || avatar).getBoundingClientRect();
    var h = menu.offsetHeight;
    menu.style.left = Math.max(12, r.left - 4) + 'px';
    menu.style.top  = Math.max(12, r.top - h - 12) + 'px';
  }
  function openMenu(focusFirst){
    if(!menu) return;
    menu.hidden = false;
    place();
    avatar.setAttribute('aria-expanded', 'true');
    /* focus the thing you came here for: the other portal */
    var target = menu.querySelector('[data-switch]');
    if(focusFirst !== false && target) target.focus({preventScroll: true});
  }
  function closeMenu(returnFocus){
    if(!menu || menu.hidden) return;
    menu.hidden = true;
    avatar.setAttribute('aria-expanded', 'false');
    if(returnFocus) avatar.focus();
  }
  function toggleMenu(){ menu.hidden ? openMenu(true) : closeMenu(); }
  document.addEventListener('click', function(e){ if(menu && !menu.hidden && !menu.contains(e.target)) closeMenu(); });
  window.addEventListener('resize', function(){ if(menu && !menu.hidden) place(); });

  /* ── 3. arrival toast ──────────────────────────────────────────────────── */
  function arrivalToast(){
    var d; try{ d = JSON.parse(sessionStorage.getItem('rsArrived') || 'null'); sessionStorage.removeItem('rsArrived'); }catch(e){}
    if(!d || d.to !== CUR || Date.now() - d.t > 15000) return;
    var t = document.createElement('div');
    t.className = 'rs-toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.innerHTML = tile(CUR, 15)+
      '<div><div class="rs-toast-t">Now in '+W[CUR].mode+' mode</div>'+
      '<div class="rs-toast-s">'+esc(W[CUR].org)+' · '+esc(W[CUR].role)+'</div></div>'+
      '<button type="button" class="rs-toast-back">Switch back</button>';
    var sb = document.querySelector('.sidebar');
    if(sb) t.style.left = (sb.getBoundingClientRect().right + 16) + 'px';
    document.body.appendChild(t);
    t.querySelector('.rs-toast-back').addEventListener('click', function(){ switchTo(d.from); });
    setTimeout(function(){ t.classList.add('rs-out'); setTimeout(function(){ t.remove(); }, 250); }, 5200);
  }

  /* ── boot: the Supplier sidebar is injected by supplier-shell.js, so wait for it ── */
  function boot(tries){
    var zone = document.querySelector('.sidebar .sb-logo-zone');
    var user = document.querySelector('.sidebar .sb-user');
    if(!zone || !user){ if(tries < 40) setTimeout(function(){ boot(tries+1); }, 50); return; }
    repointPages();
    mountLogo(zone);
    mountAvatar(user);
    arrivalToast();
  }
  /* Back button restores this page from the bfcache with the transition still up */
  window.addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    switching = false;
    document.querySelectorAll('.rs-transit').forEach(function(n){ n.remove(); });
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ boot(0); });
  else boot(0);
})();
