/* ═══════════════════════════════════════════════════════════════════════════
   Super Admin — Suppliers & Outreach group (sa-suppliers.js)
   SA ports of the Retailer Admin supplier helpers (retailer-admin.js: raOpenSupplier,
   raSupplierUsers/Products/Packaging, openPackagingRA). SA is cross-retailer, so every
   supplier also carries the retailer it belongs to (SA_SUPPLIERS), which the detail page
   shows in its breadcrumb + header.
   Loaded AFTER super-admin.js (uses go(), suGoFiltered()).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  var SA_SUPPLIERS = {
    'Indotex Manufacturing': {retailer:'Primark Stores Ltd', status:'Retailer Approved', pill:'pill-green', tier:'Tier 1', region:'APAC', email:'indotex@supplier.ie'},
    'Luntai Packaging Co.':  {retailer:'Primark Stores Ltd', status:'Overdue',            pill:'pill-red',   tier:'Tier 2', region:'APAC', email:'luntai@pack.cn'},
    'EcoPack GmbH':          {retailer:'H&M Group',          status:'Supplier Complete',  pill:'pill-blue',  tier:'Tier 1', region:'EU',   email:'ops@ecopack.de'},
    'Hangzhou TextilePack':  {retailer:'Next plc',           status:'In Progress',        pill:'pill-amber', tier:'Tier 1', region:'APAC', email:'hzpack@textile.cn'},
    'Nordic Materials AB':   {retailer:'Zara / Inditex',     status:'Bounced',            pill:'pill-red',   tier:'Tier 2', region:'EU',   email:'nordic@materials.se'},
    'Verdepak S.A.':         {retailer:'Dunnes Stores',      status:'Not invited',        pill:'pill-grey',  tier:'Tier 2', region:'EU',   email:'contact@verdepak.ie'},
    'Nordic Fibre AB':       {retailer:'M&S Group',          status:'In Progress',        pill:'pill-blue',  tier:'Tier 1', region:'EU',   email:'hello@nordicfibre.se'},
    'Shanghai WovenCo':      {retailer:'New Look',           status:'Pending',            pill:'pill-grey',  tier:'Tier 2', region:'APAC', email:'contact@wovenco.cn'}
  };
  /* tolerate display variants ("Luntai Packaging" vs "Luntai Packaging Co.", "Indotex Mfg") */
  function lookup(name){
    if(!name) return null;
    if(SA_SUPPLIERS[name]) return {key:name, m:SA_SUPPLIERS[name]};
    var first=name.split(/\s+/)[0].toLowerCase();
    for(var k in SA_SUPPLIERS){ if(k.split(/\s+/)[0].toLowerCase()===first) return {key:k, m:SA_SUPPLIERS[k]}; }
    return null;
  }
  window.SA_SUPPLIERS = SA_SUPPLIERS;
  window.saSupplierMeta = lookup;

  /* Open Users / Products / Packagings pre-filtered to the supplier (same banner as suRowCtx). */
  function goFiltered(name, pageId){
    var f={label:name, term:name.split(/\s+/)[0]||name};
    if(typeof suGoFiltered==='function') suGoFiltered(pageId, f); else go(pageId);
  }
  window.saSupplierUsers     = function(name){ goFiltered(name,'s7'); };
  window.saSupplierProducts  = function(name){ goFiltered(name,'s11'); };
  window.saSupplierPackaging = function(name){ goFiltered(name,'s8'); };
  window.saOpenSupplier = function(name){
    var l=lookup(name);
    try{ sessionStorage.setItem('sa_supdetail', l?l.key:name); }catch(e){}
    go('s10');
  };

  /* Packaging component → existing SA packaging detail page (per type); falls back to the listing. */
  var PKG_PAGES = {
    'swing tag':'Swing-Tag', 'hanger':'Hanger', 'poly bag':'Poly-Bag', 'tissue paper':'Tissue-Paper',
    'shipping carton':'Shipping-Carton', 'box / carton':'Shipping-Carton'
  };
  window.saSupOpenPackaging = function(el){
    var tr = el && el.closest ? el.closest('tr') : null;
    var nm = tr && tr.querySelector('.tbl-name') ? tr.querySelector('.tbl-name').textContent.trim().toLowerCase() : '';
    var sku = tr ? ((tr.querySelector('.gs-id-cell')||tr.children[1]||{}).textContent||'').trim() : '';
    try{ sessionStorage.setItem('sa_pkg', sku); }catch(e){}
    var slug = PKG_PAGES[nm];
    if(slug){
      var f='01-greenstreets_super_admin_Packaging-'+slug+(document.body.classList.contains('lt')?'-Light':'')+'.html';
      window.location.href=f; return;
    }
    go('s8');
  };

  /* Supplier-Detail: fill the header/breadcrumb from the row that was clicked. */
  function fillDetail(){
    var nameEl=document.getElementById('sa-sup-name'); if(!nameEl) return;
    var name; try{ name=sessionStorage.getItem('sa_supdetail'); }catch(e){}
    if(!name) return;
    var l=lookup(name), m=l?l.m:null;
    function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
    setTxt('sa-sup-name', name); setTxt('sa-sup-crumb', name);
    if(m){
      var st=document.getElementById('sa-sup-status'); if(st){ st.textContent=m.status; st.className='pill '+m.pill; }
      setTxt('sa-sup-tier', m.tier); setTxt('sa-sup-region', m.region); setTxt('sa-sup-email', m.email);
      setTxt('sa-sup-retailer', m.retailer); setTxt('sa-sup-retailer-crumb', m.retailer);
    }
    try{ sessionStorage.removeItem('sa_supdetail'); }catch(e){}
  }
  if(document.readyState!=='loading') fillDetail(); else document.addEventListener('DOMContentLoaded', fillDetail);
})();
