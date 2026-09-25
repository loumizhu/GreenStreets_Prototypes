/* ═══════════════════════════════════════════════════════════════════════════
   rs-chooser.js — the post-sign-in portal picker (login/Choose-Portal[-Light])

   One click on a choice opens that portal (no separate Continue step). If
   "Always open the portal I choose" is ticked, the choice is saved as the
   default and Login skips this screen next time (rs-login.js reads it; the
   avatar menu inside the portals can turn it off). ←/→ move between choices.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var LIGHT = /-Light\.html$/i.test(location.pathname);
  var sfx = LIGHT ? '-Light' : '';
  var PAGES = {
    retailer: '../retailer/02-Greenstreets_retailer_admin_Products' + sfx + '.html',
    supplier: '../supplier/04-greenstreets_supplier_portal_Products' + sfx + '.html'
  };
  var NAMES = { retailer: 'Retailer', supplier: 'Supplier' };

  var wrap    = document.querySelector('.rs-choices');
  var choices = [].slice.call(document.querySelectorAll('.rs-choice'));
  var always  = document.getElementById('rsAlways');
  var live    = document.getElementById('rsPickLive');
  if(!wrap || !choices.length) return;

  /* the "sign in with another account" link stays in the same theme */
  var out = document.querySelector('.rs-pick-out');
  if(out) out.setAttribute('href', 'Login' + sfx + '.html');

  function choose(btn){
    if(wrap.classList.contains('rs-picking')) return;
    var key = btn.getAttribute('data-portal');
    try{
      if(always && always.checked) localStorage.setItem('rsDefaultPortal', key);
      else localStorage.removeItem('rsDefaultPortal');
      sessionStorage.setItem('rsArrived', JSON.stringify({kind:'login', to:key, t:Date.now(), saved:!!(always && always.checked)}));
    }catch(e){}
    wrap.classList.add('rs-picking');
    choices.forEach(function(c){ c.classList.add(c === btn ? 'rs-chosen' : 'rs-dim'); });
    if(live) live.textContent = 'Opening the ' + NAMES[key] + ' portal';
    setTimeout(function(){ location.href = PAGES[key]; }, 420);
  }

  choices.forEach(function(c, i){
    c.addEventListener('click', function(){ choose(c); });
    c.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); choices[(i+1) % choices.length].focus(); }
      if(e.key === 'ArrowLeft'  || e.key === 'ArrowUp'){   e.preventDefault(); choices[(i-1+choices.length) % choices.length].focus(); }
    });
  });

  /* reflect a saved preference if the user lands here again */
  try{ if(always && localStorage.getItem('rsDefaultPortal')) always.checked = true; }catch(e){}

  /* Back from a portal restores this page from the bfcache mid-transition */
  window.addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    wrap.classList.remove('rs-picking');
    choices.forEach(function(c){ c.classList.remove('rs-chosen', 'rs-dim'); });
  });
})();
