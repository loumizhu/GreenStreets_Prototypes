/* ==========================================================================
   retailer-admin.js  --  shared behaviour for the split Retailer Admin pages.
   Extracted verbatim from 02-Greenstreets_retailer_admin_v1.html, except:
     - go(id) now NAVIGATES to the matching page instead of toggling a .screen
     - the logo/swoosh/background are loaded from img/ files (no base64 blob)
   All init code is guarded (checks the element exists) so this one file can
   safely load on every page.  Loaded BEFORE js/greenstreets-theme.js.
   ========================================================================== */

/* id -> page filename.  Keeps every existing onclick="go('raX')" working, now
   as real page navigation. */
var GS_PAGES = {
  'ra_login':        '02-Greenstreets_retailer_admin_Login.html',
  'ra_onboard1':     '02-Greenstreets_retailer_admin_Setup-1.html',
  'ra_onboard2':     '02-Greenstreets_retailer_admin_Setup-2.html',
  'ra_onboard3':     '02-Greenstreets_retailer_admin_Setup-3.html',
  'ra1':             '02-Greenstreets_retailer_admin_Dashboard.html',
  'ra4':             '02-Greenstreets_retailer_admin_Suppliers.html',
  'ra_addsup':       '02-Greenstreets_retailer_admin_Add-Supplier.html',
  'ra4_validate':    '02-Greenstreets_retailer_admin_Validate-Import.html',
  'ra6':             '02-Greenstreets_retailer_admin_Products.html',
  'ra5':             '02-Greenstreets_retailer_admin_Packagings.html',
  'ra_product':      '02-Greenstreets_retailer_admin_Product-Detail.html',
  'ra7':             '02-Greenstreets_retailer_admin_Users.html',
  'ra8':             '02-Greenstreets_retailer_admin_Send-Invites.html',
  'ra9':             '02-Greenstreets_retailer_admin_Tracker.html',
  'ra10':            '02-Greenstreets_retailer_admin_DoC-Request.html',
  'ra11':            '02-Greenstreets_retailer_admin_Compliance.html',
  'ra12':            '02-Greenstreets_retailer_admin_Generate-DoC.html',
  'ra13':            '02-Greenstreets_retailer_admin_Documents.html',
  'ra14':            '02-Greenstreets_retailer_admin_EPR-Reports.html',
  'ra15':            '02-Greenstreets_retailer_admin_Audit-Log.html',
  'ra16':            '02-Greenstreets_retailer_admin_Notifications.html',
  'ra_config':       '02-Greenstreets_retailer_admin_Settings.html',
  'ra_custom_invite': '02-Greenstreets_retailer_admin_Custom-Invite.html'
};
function go(id){ var u = GS_PAGES[id]; if(u) window.location.href = u; }

/* ===== supplier contact rows (Add-Supplier) ===== */
(function(){
  window.addSupContact = function(){
    var wrap = document.getElementById('sup-contacts');
    if(!wrap) return;
    var first = wrap.children.length === 0;
    var row = document.createElement('div');
    row.className = 'sup-contact';
    row.style.cssText = 'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:12px;margin-bottom:10px';
    row.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'+
        '<div class="flbl sup-c-title" style="margin:0"></div>'+
        '<button class="btn-g-sm sup-c-remove" onclick="removeSupContact(this)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Remove</button>'+
      '</div>'+
      '<div class="fg2">'+
        '<div class="fgrp"><label class="flbl">Full name</label><input class="fi" placeholder="Contact name"></div>'+
        '<div class="fgrp"><label class="flbl">Job title</label><input class="fi" placeholder="e.g. Compliance Manager"></div>'+
      '</div>'+
      '<div class="fg2">'+
        '<div class="fgrp"><label class="flbl">Email <span class="req">*</span></label><input class="fi" type="email" placeholder="name@supplier.com"></div>'+
        '<div class="fgrp"><label class="flbl">Phone</label><input class="fi" placeholder="Optional"></div>'+
      '</div>'+
      '<div class="tgl-row" style="border-bottom:none;padding:4px 0 0">'+
        '<div class="tgl-info">Primary contact<small>Receives the invitation &amp; reminders</small></div>'+
        '<div class="tgl sup-c-primary'+(first?' on':'')+'" onclick="setSupPrimary(this)"></div>'+
      '</div>';
    wrap.appendChild(row);
    if(window.GSEnhanceSelects) window.GSEnhanceSelects(row);
    renumberSupContacts();
  };
  window.removeSupContact = function(btn){
    var wrap = document.getElementById('sup-contacts');
    if(!wrap || wrap.children.length <= 1) return;
    var row = btn.closest('.sup-contact');
    var wasPrimary = row.querySelector('.sup-c-primary').classList.contains('on');
    row.remove();
    if(wasPrimary){ var f = wrap.querySelector('.sup-c-primary'); if(f) f.classList.add('on'); }
    renumberSupContacts();
  };
  window.setSupPrimary = function(tgl){
    document.querySelectorAll('#sup-contacts .sup-c-primary').forEach(function(t){ t.classList.remove('on'); });
    tgl.classList.add('on');
  };
  function renumberSupContacts(){
    var wrap = document.getElementById('sup-contacts');
    var rows = wrap.querySelectorAll('.sup-contact');
    rows.forEach(function(r,i){
      r.querySelector('.sup-c-title').textContent = 'Contact ' + (i+1);
      r.querySelector('.sup-c-remove').style.visibility = rows.length > 1 ? 'visible' : 'hidden';
    });
  }
  if(document.readyState !== 'loading') addSupContact();
  else document.addEventListener('DOMContentLoaded', addSupContact);
})();

/* ===== notifications filter (Notifications) ===== */
window.gsNotifFilter = window.gsNotifFilter || function(btn, type) {
  var screen = btn.closest('.screen');
  screen.querySelectorAll('.notif-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  screen.querySelectorAll('.notif-item').forEach(function(item){
    item.classList.toggle('notif-hidden', type !== 'all' && item.dataset.type !== type);
  });
};

/* ===== packaging modal + paginated table engine + data ===== */

/* ── Add-packaging modal ── */
function openPkgModal(scope){
  var overlay = document.getElementById('pkg-modal-'+scope);
  if(!overlay) return;
  overlay.classList.add('open');
  pkgModalBackToList(scope);
  var search = document.getElementById('pkg-modal-search-'+scope);
  if(search) search.value = '';
  filterPkgModal(scope, '');
}
function closePkgModal(scope){
  var overlay = document.getElementById('pkg-modal-'+scope);
  if(overlay) overlay.classList.remove('open');
}
function filterPkgModal(scope, val){
  var q = (val||'').toLowerCase();
  var list = document.getElementById('pkg-modal-list-'+scope);
  if(!list) return;
  var items = PKG_LIBRARY.filter(function(p){ return !q || p.name.toLowerCase().indexOf(q) !== -1; });
  list.innerHTML = items.length ? items.map(function(p){
    var lvlColor = p.level==='Primary' ? '#5b9cf6' : (p.level==='Secondary' ? '#4ebb81' : 'rgba(255,255,255,.5)');
    return '<div class="pkg-modal-item" onclick="pkgModalAdd(\''+scope+'\',\''+p.name.replace(/'/g,"\\'")+'\')"><span class="pkg-modal-name">'+p.name+'</span><span class="pill" style="background:transparent;border:1px solid '+lvlColor+';color:'+lvlColor+'">'+p.level+'</span></div>';
  }).join('') : '<div style="padding:20px;text-align:center;color:var(--tw3);font-size:12px">No components match your search.</div>';
}
function pkgModalShowCreate(scope){
  document.getElementById('pkg-modal-search-wrap-'+scope).style.display = 'none';
  document.getElementById('pkg-modal-list-'+scope).style.display = 'none';
  document.getElementById('pkg-modal-create-'+scope).style.display = 'block';
  document.getElementById('pkg-modal-footer-'+scope).innerHTML = '<button class="pkg-modal-create-btn" style="border-style:solid;background:var(--gs);color:#fff;border-color:var(--gs)" onclick="pkgModalCreateSubmit(\''+scope+'\')">Add component</button>';
}
function pkgModalBackToList(scope){
  document.getElementById('pkg-modal-search-wrap-'+scope).style.display = '';
  document.getElementById('pkg-modal-create-'+scope).style.display = 'none';
  document.getElementById('pkg-modal-list-'+scope).style.display = '';
  document.getElementById('pkg-modal-footer-'+scope).innerHTML = '<button class="pkg-modal-create-btn" onclick="pkgModalShowCreate(\''+scope+'\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create a new component</button>';
}
function pkgModalAdd(scope, name){
  var item = PKG_LIBRARY.filter(function(p){ return p.name===name; })[0];
  insertPkgRow(scope, item ? item.name : name, item ? item.level : 'Primary', item ? item.material : '—');
  closePkgModal(scope);
}
function pkgModalCreateSubmit(scope){
  var nameEl = document.getElementById('pkg-modal-newname-'+scope);
  var levelEl = document.getElementById('pkg-modal-newlevel-'+scope);
  var name = (nameEl.value||'').trim();
  if(!name){ nameEl.focus(); return; }
  insertPkgRow(scope, name, levelEl.value, '—');
  nameEl.value = '';
  closePkgModal(scope);
}
function insertPkgRow(targetScope, name, level, material){
  var tbody = document.getElementById('pkg-tbody-'+targetScope);
  if(!tbody) return;
  var lvlPill = level === 'Primary' ? 'pill-blue' : 'pill-grey';
  var tr = document.createElement('tr');
  tr.style.background = 'rgba(78,187,129,.08)';
  tr.innerHTML = '<td class="tbl-name">'+name+'</td><td><span class="pill '+lvlPill+'">'+level+'</span></td><td class="tbl-muted">'+material+'</td><td class="tbl-muted">—</td><td class="tbl-muted">—</td><td><span class="pill pill-grey">Pending</span></td><td style="display:flex;gap:4px;padding:6px 11px"><button class="btn-g-sm">Edit</button><button class="btn-g-sm" onclick="this.closest(\'tr\').remove()">Remove</button></td>';
  tbody.appendChild(tr);
}

/* ── Generic paginated/sortable/filterable table engine ── */
var __pt = {};
function ptInit(scope, data, opts){
  __pt[scope] = {data:data, page:0, pageSize:(opts.pageSize||20), sortCol:null, sortDir:1, search:'', filters:{}, opts:opts};
  ptRender(scope);
}
function ptFiltered(scope){
  var st = __pt[scope];
  var rows = st.data.filter(function(r){
    if (st.search){
      var hay = (st.opts.searchFields||[]).map(function(f){ return r[f]; }).join(' ').toLowerCase();
      if (hay.indexOf(st.search) === -1) return false;
    }
    for (var k in st.filters){
      var v = st.filters[k];
      if (v && v !== 'all' && String(r[k]) !== v) return false;
    }
    return true;
  });
  if (st.sortCol){
    rows = rows.slice().sort(function(a,b){
      var av = a[st.sortCol], bv = b[st.sortCol];
      if (typeof av === 'string') return av.localeCompare(bv) * st.sortDir;
      return ((av||0) - (bv||0)) * st.sortDir;
    });
  }
  return rows;
}
function ptRender(scope){
  var st = __pt[scope];
  var rows = ptFiltered(scope);
  var total = rows.length;
  var totalPages = Math.max(1, Math.ceil(total/st.pageSize));
  if (st.page >= totalPages) st.page = totalPages-1;
  if (st.page < 0) st.page = 0;
  var start = st.page*st.pageSize;
  var pageRows = rows.slice(start, start+st.pageSize);
  var tbody = document.getElementById('pt-tbody-'+scope);
  if (tbody) tbody.innerHTML = pageRows.length ? pageRows.map(st.opts.rowHtml).join('') : '<tr><td colspan="'+st.opts.cols+'" style="padding:22px;text-align:center;color:var(--tw3);font-size:12px">No matches — try clearing filters.</td></tr>';
  var countEl = document.getElementById('pt-count-'+scope);
  if (countEl){
    var from = total===0?0:start+1, to = Math.min(total, start+st.pageSize);
    countEl.textContent = 'Showing '+from+'–'+to+' of '+total+' '+(st.opts.noun||'items');
  }
  var pi = document.getElementById('pt-pageinfo-'+scope);
  if (pi) pi.textContent = 'Page '+(total===0?0:st.page+1)+' of '+totalPages;
  var jump = document.getElementById('pt-jump-'+scope);
  if (jump){
    if (jump.options.length!==totalPages){ jump.innerHTML=''; for(var p=1;p<=totalPages;p++){var o=document.createElement('option');o.value=p;o.textContent='Page '+p;jump.appendChild(o);} }
    jump.value=st.page+1;
    var jw=jump.closest('.cs-wrap'); if(jw){var cv=jw.querySelector('.cs-val'); if(cv)cv.textContent='Page '+(st.page+1);}
  }
  var prev = document.getElementById('pt-prev-'+scope);
  if (prev) prev.disabled = st.page<=0;
  var next = document.getElementById('pt-next-'+scope);
  if (next) next.disabled = st.page>=totalPages-1;
}
function ptSearch(scope, val){ __pt[scope].search=(val||'').toLowerCase(); __pt[scope].page=0; ptRender(scope); }
function ptFilter(scope, key, val){ __pt[scope].filters[key]=val; __pt[scope].page=0; ptRender(scope); }
function ptPageSize(scope, val){ __pt[scope].pageSize=parseInt(val,10)||20; __pt[scope].page=0; ptRender(scope); }
function ptGoPage(scope, delta){ __pt[scope].page += delta; ptRender(scope); }
function ptJump(scope, val){ __pt[scope].page=(parseInt(val,10)||1)-1; ptRender(scope); }
function ptSort(scope, col){
  var st = __pt[scope];
  if (st.sortCol===col) st.sortDir*=-1; else { st.sortCol=col; st.sortDir=1; }
  ptRender(scope);
  var table = document.getElementById('pt-table-'+scope);
  if (table) table.querySelectorAll('th[data-col]').forEach(function(th){
    var arrow = th.querySelector('.sort-arrow');
    if (!arrow) return;
    arrow.textContent = th.getAttribute('data-col')===col ? (st.sortDir===1?'↑':'↓') : '↕';
  });
}

/* ── Product catalogue dataset (Products screen) ── */
var PRODUCTS_RA = (function(){
  var cats = ['Tops','Bottoms','Dresses','Outerwear','Footwear','Accessories'];
  var suppliers = ['Indotex Manufacturing','Luntai Packaging Co.','EcoPack GmbH'];
  var adjs = ['Black','Blue','Red','Khaki','White','Grey','Navy','Olive','Beige','Pink','Green','Cream','Charcoal','Rust','Teal'];
  var items = ['Crew Neck Sweatshirt','Slim Fit Jeans','Midi Dress','Utility Jacket','Essential T-Shirt','Zip Hoodie','Chino Trousers','Puffer Coat','Knit Jumper','Cargo Shorts','Pleated Skirt','Denim Jacket','Trainers','Canvas Belt','Wool Scarf'];
  var statuses = ['Complete','Incomplete','Incomplete','Pending'];
  var pills = {Complete:'pill-green', Incomplete:'pill-amber', Pending:'pill-grey'};
  var list = [];
  for (var i=0;i<64;i++){
    var cat = cats[i % cats.length];
    var adj = adjs[i % adjs.length];
    var item = items[i % items.length];
    var status = statuses[i % statuses.length];
    var comps = 2 + (i % 4);
    var done = status==='Complete' ? comps : (status==='Incomplete' ? Math.max(0, comps - 1 - (i % comps)) : 0);
    var pkgText = status==='Complete' ? (comps+' components') : (status==='Pending' ? 'Not started' : (done+' of '+comps+' done'));
    var pill = pills[status];
    if (status==='Incomplete' && done===0) pill = 'pill-red';
    list.push({
      sku: 'PRK-'+String(i+1).padStart(3,'0')+'-'+adj.slice(0,3).toUpperCase(),
      desc: adj+' '+item,
      cat: cat,
      supplier: suppliers[i % suppliers.length],
      pkg: pkgText,
      status: status,
      pill: pill
    });
  }
  return list;
})();
ptInit('ra', PRODUCTS_RA, {
  cols: 7,
  pageSize: 20,
  noun: 'products',
  searchFields: ['sku','desc'],
  rowHtml: function(r){
    return '<tr><td><div class="tbl-name">'+r.sku+'</div></td><td class="tbl-muted">'+r.desc+'</td><td class="tbl-muted">'+r.cat+'</td><td class="tbl-muted">'+r.supplier+'</td><td class="tbl-muted">'+r.pkg+'</td><td><span class="pill '+r.pill+'">'+r.status+'</span></td><td style="padding:6px 11px"><a class="bc-link" style="font-size:11px" onclick="go(\'ra_product\')">View →</a></td></tr>';
  }
});

/* ── Packaging library (Add packaging picker) ── */
var PKG_LIBRARY = [
  {name:'Swing Tag', level:'Primary', material:'Recycled card', recyclability:'Widely recyclable'},
  {name:'Poly Bag', level:'Primary', material:'LDPE plastic', recyclability:'Check locally'},
  {name:'Box / Carton', level:'Secondary', material:'Corrugated card', recyclability:'Widely recyclable'},
  {name:'Hanger', level:'Primary', material:'Recycled plastic', recyclability:'Check locally'},
  {name:'Tissue Paper', level:'Primary', material:'FSC paper', recyclability:'Widely recyclable'},
  {name:'Header Card', level:'Primary', material:'Recycled card', recyclability:'Widely recyclable'},
  {name:'Void Fill', level:'Secondary', material:'Recycled paper', recyclability:'Widely recyclable'},
  {name:'Blister Pack', level:'Primary', material:'PET plastic', recyclability:'Check locally'},
  {name:'Shipping Carton', level:'Tertiary', material:'Corrugated card', recyclability:'Widely recyclable'},
  {name:'Pallet', level:'Tertiary', material:'Wood', recyclability:'Widely recyclable'},
  {name:'Pallet Wrap', level:'Tertiary', material:'LDPE film', recyclability:'Not currently recyclable'},
  {name:'Care Label', level:'Primary', material:'Woven polyester', recyclability:'Not currently recyclable'},
  {name:'Barcode Sticker', level:'Primary', material:'Paper adhesive', recyclability:'Widely recyclable'},
  {name:'Adhesive Tape', level:'Secondary', material:'BOPP plastic', recyclability:'Not currently recyclable'},
  {name:'Insert Card', level:'Primary', material:'Recycled card', recyclability:'Widely recyclable'},
  {name:'Garment Bag', level:'Primary', material:'LDPE plastic', recyclability:'Check locally'},
  {name:'Dust Bag', level:'Primary', material:'Cotton', recyclability:'Widely recyclable'},
  {name:'Gift Box', level:'Secondary', material:'Card', recyclability:'Widely recyclable'},
  {name:'Ribbon', level:'Primary', material:'Polyester', recyclability:'Not currently recyclable'},
  {name:'Bubble Wrap', level:'Secondary', material:'LDPE plastic', recyclability:'Check locally'},
  {name:'Foam Insert', level:'Secondary', material:'EPE foam', recyclability:'Not currently recyclable'},
  {name:'Mailer Bag', level:'Secondary', material:'Recycled LDPE', recyclability:'Check locally'},
  {name:'Zip-lock Bag', level:'Primary', material:'LDPE plastic', recyclability:'Check locally'},
  {name:'Desiccant Pack', level:'Primary', material:'Silica gel + Tyvek', recyclability:'Not currently recyclable'},
  {name:'Corrugated Divider', level:'Secondary', material:'Corrugated card', recyclability:'Widely recyclable'},
  {name:'Shoe Box', level:'Secondary', material:'Card', recyclability:'Widely recyclable'}
];

/* Load brand imagery from img/ files (was an inline base64 blob). */
(function(){
  document.querySelectorAll('.gs-logo-img').forEach(function(el){ el.src = 'img/greenstreets-logo.png'; });
  document.querySelectorAll('[data-sw]').forEach(function(el){ el.src = 'img/swoosh.png'; });
  var lw = document.querySelector('.login-wrap');
  if(lw) lw.style.backgroundImage = "url('img/BackgroundGreenStreets.jpg')";
})();


function toggleDropdown(btn) {
  var dd = btn.nextElementSibling;
  if (!dd || !dd.classList.contains('reminder-dropdown')) return;
  // close all others first
  document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){
    if(d !== dd) d.classList.remove('open');
  });
  dd.classList.toggle('open');
}
function sendReminder(btn) {
  var row = btn.closest('tr');
  var name = row ? row.querySelector('.tbl-name') : null;
  var label = name ? name.textContent.trim() : 'supplier';
  // visual feedback
  btn.textContent = '✓ Sent';
  btn.style.background = 'rgba(78,187,129,.15)';
  btn.style.borderColor = 'rgba(78,187,129,.3)';
  btn.style.color = '#4ebb81';
  setTimeout(function(){ 
    btn.innerHTML = 'Send reminder <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px;vertical-align:middle"><path d="M6 9l6 6 6-6"/></svg>';
    btn.style.background = '';btn.style.borderColor = '';btn.style.color = '';
  }, 2000);
}
// Close dropdowns on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.reminder-btn-wrap')) {
    document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
  }
});
// view toggle for packagings
function setView(view) {
  var listEl = document.getElementById('pkg-list-view');
  var gridEl = document.getElementById('pkg-grid-view');
  var listBtn = document.getElementById('btn-list-view');
  var gridBtn = document.getElementById('btn-grid-view');
  if (!listEl || !gridEl) return;
  if (view === 'list') {
    listEl.style.display = 'block'; gridEl.style.display = 'none';
    if(listBtn) listBtn.classList.add('active');
    if(gridBtn) gridBtn.classList.remove('active');
  } else {
    listEl.style.display = 'none'; gridEl.style.display = 'block';
    if(listBtn) listBtn.classList.remove('active');
    if(gridBtn) gridBtn.classList.add('active');
  }
}


function filterCountriesList(val) {
  var items = document.querySelectorAll('#country-list .country-item');
  var groups = document.querySelectorAll('#country-list div[style*="padding:5px"]');
  var q = val.toLowerCase();
  items.forEach(function(item) {
    var name = item.querySelector('.country-name');
    item.style.display = (!q || (name && name.textContent.toLowerCase().indexOf(q) > -1)) ? '' : 'none';
  });
}
