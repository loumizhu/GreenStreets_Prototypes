/* ═══════════════════════════════════════════════════════════════════════════
   GreenStreets Retailer User — light-preview glue  (greenstreets-light.js)
   ═══════════════════════════════════════════════════════════════════════════
   Loaded ONLY by the *-Light.html pages, after retailer-user.js + the theme JS.
   It makes the whole light set work together as one preview:
     1. swaps every logo to the light-theme logo,
     2. routes go(id) to the LIGHT twin of its target page,
     3. rewrites in-page navigation (anchor href + inline onclick="location.href=…")
        to the light twin, so listing rows / detail links stay in the light set,
   Links/handlers flagged data-nolight are left alone. There is nothing per-page
   to wire — a light page just needs body.lt + the light CSS + this script.
   Mirror of the Retailer Admin greenstreets-light.js (RU filenames + RU logo).
   ═════════════════════════════════════════════════════════════════════════ */
(function(){
  var LOGO='img/GreenStreet-Light-Theme.png';
  var FILE_RX=/greenstreets_retailer_user_[A-Za-z0-9-]+?\.html/;

  /* darkfile.html → darkfile-Light.html (leaves query/hash intact, skips already-light) */
  function toLight(href){
    return href.replace(/(greenstreets_retailer_user_[A-Za-z0-9-]+?)(\.html)/g,function(m,p1,p2){
      return /-Light$/.test(p1) ? m : p1+'-Light'+p2;
    });
  }

  /* 1 — light logo everywhere (sidebar + login) */
  function swapLogos(){
    document.querySelectorAll('.sb-logo,.gs-logo-img,.login-logo,.onb-logo,img[alt="Greenstreets"]').forEach(function(im){
      if((im.getAttribute('src')||'').indexOf(LOGO)<0) im.src=LOGO;
    });
  }

  /* 2 — route go(id) to the light twin of its target page */
  var _origGo=window.go;
  window.go=function(id){
    var map=window.GS_PAGES||{}, f=map[id];
    if(f){ window.location.href=toLight(f); return; }
    if(typeof _origGo==='function') return _origGo(id);
  };

  /* 3a — rewrite anchor hrefs to the light twin */
  function rewriteLinks(root){
    (root||document).querySelectorAll('a[href]').forEach(function(a){
      if(a.hasAttribute('data-nolight')) return;
      var h=a.getAttribute('href')||'';
      if(FILE_RX.test(h) && h.indexOf('-Light.html')<0) a.setAttribute('href',toLight(h));
    });
  }
  /* 3b — rewrite inline onclick="location.href='…'" navigation */
  function rewriteInlineNav(root){
    (root||document).querySelectorAll('[onclick]').forEach(function(el){
      var oc=el.getAttribute('onclick');
      if(!oc || oc.indexOf('greenstreets_retailer_user_')<0) return;
      var nu=toLight(oc);
      if(nu!==oc) el.setAttribute('onclick',nu);
    });
  }

  function run(){ swapLogos(); rewriteLinks(); rewriteInlineNav(); }
  run();
  window.addEventListener('load',run);
  /* sidebar + listings render after load — keep re-applying (debounced) */
  var t;
  new MutationObserver(function(){ clearTimeout(t); t=setTimeout(function(){
    swapLogos(); rewriteLinks(); rewriteInlineNav();
  },80); }).observe(document.body,{childList:true,subtree:true});
})();
