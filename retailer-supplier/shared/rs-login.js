/* ═══════════════════════════════════════════════════════════════════════════
   rs-login.js — sign-in routing for the dual-role demo (login/Login[-Light].html)

   One front door for both portals. After sign-in:
     · a saved default portal ("Always open this portal") → straight into it
     · otherwise → Choose-Portal, the one-screen portal picker
   Loaded last, so it replaces the Retailer Admin tour's gsRaSignIn.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var LIGHT = /-Light\.html$/i.test(location.pathname);
  var sfx = LIGHT ? '-Light' : '';
  var PAGES = {
    retailer: '../retailer/02-Greenstreets_retailer_admin_Products' + sfx + '.html',
    supplier: '../supplier/04-greenstreets_supplier_portal_Products' + sfx + '.html'
  };

  function signIn(){
    var def = null;
    try{ def = localStorage.getItem('rsDefaultPortal'); }catch(e){}
    if(def && PAGES[def]){
      try{ sessionStorage.setItem('rsArrived', JSON.stringify({kind:'login', to:def, t:Date.now()})); }catch(e){}
      location.href = PAGES[def];
    }else{
      location.href = 'Choose-Portal' + sfx + '.html';
    }
  }
  window.gsRaSignIn = signIn;

  /* Google / Microsoft are the same front door */
  document.querySelectorAll('.login-form-zone .btn-g').forEach(function(b){
    b.addEventListener('click', signIn);
  });
  /* Enter in either field signs in */
  document.querySelectorAll('.login-form-zone .fi').forEach(function(f){
    f.addEventListener('keydown', function(e){ if(e.key === 'Enter') signIn(); });
  });

  /* The subtitle states who this door is for */
  var sub = document.querySelector('.login-title + div');
  if(sub) sub.textContent = 'One sign-in for your retailer and supplier portals';
})();
