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
  'ra_welcome':      '02-Greenstreets_retailer_admin_Welcome.html',
  'ra_onboard1':     '02-Greenstreets_retailer_admin_Setup-1.html',
  'ra_onboard2':     '02-Greenstreets_retailer_admin_Setup-2.html',
  'ra_onboard3':     '02-Greenstreets_retailer_admin_Setup-3.html',
  'ra1':             '02-Greenstreets_retailer_admin_Dashboard.html',
  'ra4':             '02-Greenstreets_retailer_admin_Suppliers.html',
  'ra_suphub':       '02-Greenstreets_retailer_admin_Suppliers-Hub.html',
  'ra_addsup':       '02-Greenstreets_retailer_admin_Add-Supplier.html',
  'ra4_validate':    '02-Greenstreets_retailer_admin_Validate-Import.html',
  'ra4_importdone':  '02-Greenstreets_retailer_admin_Import-Suppliers-Done.html',
  'ra6':             '02-Greenstreets_retailer_admin_Products.html',
  'ra_addproduct':   '02-Greenstreets_retailer_admin_Add-Product.html',
  'ra_importproducts':  '02-Greenstreets_retailer_admin_Import-Products.html',
  'ra6_validate':    '02-Greenstreets_retailer_admin_Validate-Products-Import.html',
  'ra6_importdone':  '02-Greenstreets_retailer_admin_Import-Products-Done.html',
  'ra_importsuppliers': '02-Greenstreets_retailer_admin_Import-Suppliers.html',
  'ra5':             '02-Greenstreets_retailer_admin_Packagings.html',
  'ra_product':      '02-Greenstreets_retailer_admin_Product-Detail.html',
  'ra_packaging':    '02-Greenstreets_retailer_admin_Packaging-Detail.html',
  'ra_supdetail':    '02-Greenstreets_retailer_admin_Supplier-Detail.html',
  'ra7':             '02-Greenstreets_retailer_admin_Users.html',
  'ra_importusers':  '02-Greenstreets_retailer_admin_Import-Users.html',
  'ra7_validate':    '02-Greenstreets_retailer_admin_Validate-Users-Import.html',
  'ra7_importdone':  '02-Greenstreets_retailer_admin_Import-Users-Done.html',
  'ra8':             '02-Greenstreets_retailer_admin_Send-Invites.html',
  'ra9':             '02-Greenstreets_retailer_admin_Tracker.html',
  'ra10':            '02-Greenstreets_retailer_admin_DoC-Request.html',
  'ra11':            '02-Greenstreets_retailer_admin_Compliance.html',
  'ra12':            '02-Greenstreets_retailer_admin_Generate-DoC.html',
  'ra13':            '02-Greenstreets_retailer_admin_Documents.html',
  'ra_docdetail':    '02-Greenstreets_retailer_admin_Document-Detail.html',
  'ra15':            '02-Greenstreets_retailer_admin_Audit-Log.html',
  'ra16':            '02-Greenstreets_retailer_admin_Notifications.html',
  'ra_config':       '02-Greenstreets_retailer_admin_Settings.html',
  'ra_custom_invite': '02-Greenstreets_retailer_admin_Custom-Invite.html'
};
function go(id){ var u = GS_PAGES[id]; if(u) window.location.href = u; }

/* Open the document detail page for a given document id, optionally deep-linking to one
   of its action sections ('evidence'|'versions'|'audit'|'export') — round-trips via sessionStorage. */
function openDocumentRA(docId, section){
  try{
    sessionStorage.setItem('ra_di', docId);
    if (section) sessionStorage.setItem('ra_di_section', section); else sessionStorage.removeItem('ra_di_section');
  }catch(e){}
  go('ra_docdetail');
}

/* Open the product detail page for a given SKU (round-trips via sessionStorage). */
function openProductRA(sku){ try{ sessionStorage.setItem('ra_pi', sku); }catch(e){} go('ra_product'); }

/* Open the packaging detail page for a given packaging id (round-trips via sessionStorage). */
function openPackagingRA(id){ try{ sessionStorage.setItem('ra_pkg', id); }catch(e){} go('ra_packaging'); }

/* ===== deep-link to a listing with a filter pre-applied =====
   goFilter('ra9', {search:'Overdue'})            -> navigate + prefill the search box
   goFilter('ra6', {selectValue:'Incomplete'})    -> navigate + set the matching <select> filter
   The intent is stashed in sessionStorage and consumed once on the target page. */
function goFilter(pageId, intent){
  try{ sessionStorage.setItem('ra_filter', JSON.stringify(intent||{})); }catch(e){}
  go(pageId);
}
function applyRaFilter(f){
  if(!f) return;
  if(f.search){
    var s = document.querySelector('input.fi-search');
    if(s){ s.value = f.search; s.dispatchEvent(new Event('input', {bubbles:true})); }
  }
  if(f.selectValue){
    var target = null;
    document.querySelectorAll('select.fi').forEach(function(sel){
      if(target) return;
      for(var i=0;i<sel.options.length;i++){
        var o = sel.options[i];
        if(o.value === f.selectValue || (o.text||'').trim() === f.selectValue){ target = sel; sel.selectedIndex = i; break; }
      }
    });
    if(target){ target.dispatchEvent(new Event('change', {bubbles:true})); }
  }
}
(function(){
  function run(){
    var raw; try{ raw = sessionStorage.getItem('ra_filter'); }catch(e){}
    if(!raw) return;
    try{ sessionStorage.removeItem('ra_filter'); }catch(e){}
    var f; try{ f = JSON.parse(raw); }catch(e){ return; }
    /* wait for the custom-select / data-grid enhancers to wire up first */
    setTimeout(function(){ try{ applyRaFilter(f); }catch(e){} }, 140);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

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
  __pt[scope] = {data:data, page:0, pageSize:(opts.pageSize||20), sortCol:(opts.sortCol||null), sortDir:(opts.sortDir||1), search:'', filters:{}, opts:opts};
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
  if (tbody && typeof gsEnhanceIds==='function') gsEnhanceIds(tbody, '.gs-id-cell');
  if (typeof st.opts.afterRender === 'function') { try { st.opts.afterRender(scope, pageRows, rows); } catch(e){} }
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
/* selection state — declared before ptInit so the first render's rowHtml can read it */
var raProdSel = new Set();
var raProdFiltered = [];   /* last filtered (all-pages) row set — used by select-all */
ptInit('ra', PRODUCTS_RA, {
  cols: 9,
  pageSize: 20,
  noun: 'products',
  searchFields: ['sku','desc'],
  afterRender: function(scope, pageRows, allRows){ raProdSyncSelection(pageRows, allRows); },
  rowHtml: function(r){
    var isComplete = r.status === 'Complete';
    var checked = raProdSel.has(r.sku) ? ' checked' : '';
    var cbCell = '<td class="raprod-cb-cell gs-check-col" onclick="event.stopPropagation()" style="vertical-align:middle;text-align:center">'+
      '<input type="checkbox" class="raprod-cb" aria-label="Select '+r.sku+'"'+checked+' onclick="event.stopPropagation();raProdToggleRow(this,\''+r.sku+'\')"></td>';
    var docBtn = isComplete
      ? '<button class="btn-p" title="Generate Declaration of Conformity" onclick="event.stopPropagation();raDownloadDoc(\''+r.sku+'\')" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;font-size:11px;padding:0 10px;margin-right:6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:4px;position:relative;top:-1px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>DoC</button>'
      : '';
    var approveBtn = r.status === 'Incomplete'
      ? '<button class="act-mini" title="Approve product" onclick="event.stopPropagation();raApproveProduct(\''+r.sku+'\',this)" tabindex="-1" data-approved="false" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box">Approve</button>'
      : '';
    var reminderBtn = (r.status === 'Incomplete' || r.status === 'Pending')
      ? '<button class="act-mini" title="Send reminder" onclick="event.stopPropagation();raSendReminder(\''+r.sku+'\')" tabindex="-1" style="height:24px;display:inline-flex;align-items:center;vertical-align:middle;box-sizing:border-box;margin-right:6px">Send reminder</button>'
      : '';
    return '<tr class="raprod-row'+(checked?' raprod-row-sel':'')+'" style="cursor:pointer" data-sku="'+r.sku+'" onclick="openProductRA(\''+r.sku+'\')">'+
      cbCell +
      '<td><div class="tbl-name gs-id-cell">'+r.sku+'</div></td>'+
      '<td class="tbl-muted">'+r.desc+'</td>'+
      '<td class="tbl-muted">'+r.cat+'</td>'+
      '<td class="tbl-muted">'+r.supplier+'</td>'+
      '<td class="tbl-muted">'+r.pkg+'</td>'+
      '<td><span class="pill '+r.pill+'">'+r.status+'</span></td>'+
      '<td class="act-cell" style="white-space:nowrap;vertical-align:middle" onclick="event.stopPropagation()">'+
        docBtn + reminderBtn + approveBtn +
      '</td>'+
      '<td class="chev-cell" style="vertical-align:middle"><div class="chev-btn" style="height:24px;width:24px;border-radius:6px;vertical-align:middle;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"></path></svg></div></td>'+
    '</tr>';
  }
});

/* ── Products bulk multi-select ──
   Checkbox column + floating bulk-action bar for the Products listing (scope 'ra').
   Selection is tracked by SKU (a Set) so it survives pagination / sort / filter
   re-renders; raProdSyncSelection() re-applies checkbox state after every ptRender.
   raProdSel / raProdFiltered are declared above (before ptInit). */
function raProdMiniToast(msg) {
  var t = document.getElementById('ra-toast');
  if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = 'show';
  clearTimeout(raProdMiniToast._t);
  raProdMiniToast._t = setTimeout(function(){ t.className=''; }, 2600);
}

function raProdToggleRow(cb, sku) {
  if (cb.checked) raProdSel.add(sku); else raProdSel.delete(sku);
  var tr = cb.closest('tr'); if (tr) tr.classList.toggle('raprod-row-sel', cb.checked);
  raProdUpdateBar();
  raProdSyncSelectAll();
}

function raProdToggleAll(cb) {
  raProdFiltered.forEach(function(r){
    if (cb.checked) raProdSel.add(r.sku); else raProdSel.delete(r.sku);
  });
  /* reflect on the visible page's checkboxes + rows */
  document.querySelectorAll('#pt-tbody-ra .raprod-cb').forEach(function(x){
    x.checked = cb.checked;
    var tr = x.closest('tr'); if (tr) tr.classList.toggle('raprod-row-sel', cb.checked);
  });
  raProdUpdateBar();
}

/* keep the header select-all in sync with the current filtered set */
function raProdSyncSelectAll() {
  var head = document.getElementById('raprod-selectall'); if (!head) return;
  var n = raProdFiltered.length;
  var selN = raProdFiltered.reduce(function(a,r){ return a + (raProdSel.has(r.sku)?1:0); }, 0);
  head.checked = n > 0 && selN === n;
  head.indeterminate = selN > 0 && selN < n;
}

/* called from ptRender's afterRender hook on every re-render.
   Only the Products page has #raprod-selectall — bail on other pages. */
function raProdSyncSelection(pageRows, allRows) {
  if (!document.getElementById('raprod-selectall')) return;
  raProdFiltered = allRows || [];
  raProdSyncSelectAll();
  raProdUpdateBar();
}

function raProdClearSel() {
  raProdSel.clear();
  document.querySelectorAll('#pt-tbody-ra .raprod-cb').forEach(function(x){
    x.checked = false; var tr = x.closest('tr'); if (tr) tr.classList.remove('raprod-row-sel');
  });
  raProdUpdateBar();
  raProdSyncSelectAll();
}

/* one-time styles for checkbox column + floating bar */
function raProdInjectCss() {
  if (document.getElementById('raprod-css')) return;
  var st = document.createElement('style'); st.id = 'raprod-css';
  st.textContent =
    '.raprod-cb,#raprod-selectall{cursor:pointer;vertical-align:middle;margin:0}' +
    '#pt-table-ra tr.raprod-row-sel td{background:rgba(78,187,129,.09)}' +
    '#pt-table-ra tr.raprod-row-sel td:first-child{box-shadow:inset 3px 0 0 var(--gs)}' +
    '#raprod-bulkbar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(24px);display:flex;align-items:center;gap:10px;padding:9px 12px;background:#0f2338;border:1px solid var(--line-2,rgba(148,180,230,.28));border-radius:12px;box-shadow:0 16px 40px -10px rgba(0,0,0,.6);z-index:9997;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}' +
    '#raprod-bulkbar.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}' +
    '.raprod-bb-count{font-size:12.5px;color:var(--tw2);white-space:nowrap;padding:0 4px}' +
    '.raprod-bb-count b{color:#fff;font-size:13px}' +
    '.raprod-bb-sep{width:1px;height:20px;background:var(--bw,rgba(255,255,255,.14))}' +
    '.raprod-bb-btn{display:inline-flex;align-items:center;gap:5px;font-family:inherit;font-size:11.5px;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--tw2);transition:background .12s,border-color .12s,color .12s;white-space:nowrap}' +
    '.raprod-bb-btn:hover{background:rgba(255,255,255,.12);color:#fff}' +
    '.raprod-bb-approve{background:rgba(78,187,129,.14);border-color:rgba(78,187,129,.4);color:#4ebb81}' +
    '.raprod-bb-approve:hover{background:rgba(78,187,129,.26);border-color:var(--gs);color:#fff}' +
    '.raprod-bb-clear{background:transparent;border-color:transparent;color:var(--tw3)}' +
    '.raprod-bb-clear:hover{background:rgba(255,255,255,.08);color:#fff}';
  document.head.appendChild(st);
}

/* floating bulk-action bar */
function raProdEnsureBar() {
  raProdInjectCss();
  var bar = document.getElementById('raprod-bulkbar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'raprod-bulkbar';
  bar.innerHTML =
    '<span class="raprod-bb-count"><b id="raprod-bb-n">0</b> selected</span>' +
    '<span class="raprod-bb-sep"></span>' +
    '<button type="button" class="raprod-bb-btn raprod-bb-approve" onclick="raProdBulkApprove()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>Approve</button>' +
    '<button type="button" class="raprod-bb-btn" onclick="raProdBulkRemind()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Send reminder</button>' +
    '<button type="button" class="raprod-bb-btn" onclick="raProdBulkExport()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export CSV</button>' +
    '<button type="button" class="raprod-bb-btn" onclick="raProdBulkDownloadDoc()">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>Generate DoC</button>' +
    '<button type="button" class="raprod-bb-btn raprod-bb-clear" onclick="raProdClearSel()" aria-label="Clear selection">Clear</button>';
  document.body.appendChild(bar);
  return bar;
}

function raProdUpdateBar() {
  var bar = raProdEnsureBar();
  var n = raProdSel.size;
  document.getElementById('raprod-bb-n').textContent = n;
  bar.classList.toggle('show', n > 0);
}

function raProdSelectedRows() {
  var bySku = {}; (window.PRODUCTS_RA || []).forEach(function(r){ bySku[r.sku] = r; });
  var out = []; raProdSel.forEach(function(sku){ if (bySku[sku]) out.push(bySku[sku]); });
  return out;
}

function raProdBulkApprove() {
  var rows = raProdSelectedRows();
  var eligible = rows.filter(function(r){ return r.status !== 'Complete'; });
  rows.forEach(function(r){ if (r.status !== 'Complete'){ r.status = 'Complete'; r.pill = 'pill-green'; r.pkg = 'Approved'; } });
  ptRender('ra');
  raProdClearSel();
  raProdMiniToast(eligible.length ? eligible.length + ' product' + (eligible.length>1?'s':'') + ' approved' : 'Selected products are already complete');
}

function raProdBulkRemind() {
  var rows = raProdSelectedRows();
  var n = rows.filter(function(r){ return r.status !== 'Complete'; }).length;
  raProdMiniToast(n ? 'Reminder sent for ' + n + ' product' + (n>1?'s':'') : 'No outstanding products in selection');
}

function raProdBulkExport() {
  var rows = raProdSelectedRows();
  if (!rows.length) return;
  var head = ['SKU','Description','Category','Supplier','Packaging','Status'];
  var esc = function(v){ v = String(v==null?'':v); return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; };
  var lines = [head.join(',')];
  rows.forEach(function(r){ lines.push([r.sku,r.desc,r.cat,r.supplier,r.pkg,r.status].map(esc).join(',')); });
  var blob = new Blob([lines.join('\n')], {type:'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products-selection.csv';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 100);
  raProdMiniToast('Exported ' + rows.length + ' product' + (rows.length>1?'s':'') + ' to CSV');
}

function raProdBulkDownloadDoc() {
  var rows = raProdSelectedRows();
  if (!rows.length) return;
  try { sessionStorage.setItem('ra_doc_sku', rows[0].sku); } catch (e) {}
  go('ra12');
}

/* DoC actions never "download" in the prototype — they open the Generate DoC page (ra12),
   stashing the sku the way openProductRA does so that page can pick it up later. */
function raDownloadDoc(sku) {
  try { sessionStorage.setItem('ra_doc_sku', sku); } catch (e) {}
  go('ra12');
}
function raApproveProduct(sku, btn) {
  var t = document.getElementById('ra-toast');
  if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
  var rec = (window.PRODUCTS_RA || []).filter(function(r){ return r.sku === sku; })[0];
  var already = rec ? rec.status === 'Complete' : (btn && btn.getAttribute('data-approved') === 'true');
  t.textContent = already ? 'Product '+sku+' is already approved' : 'Product ' + sku + ' approved — DoC now available';
  t.className = 'show';
  if (!already && rec) {
    rec.status = 'Complete'; rec.pill = 'pill-green'; rec.pkg = 'Approved';
    if (typeof ptRender === 'function') ptRender('ra');
  } else if (!already && btn) {
    btn.setAttribute('data-approved', 'true');
    btn.textContent = 'Approved';
    btn.style.background = 'var(--gs)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'transparent';
  }
  clearTimeout(raApproveProduct._t);
  raApproveProduct._t = setTimeout(function(){ t.className=''; }, 2600);
}
function raSendReminder(sku) {
  var t = document.getElementById('ra-toast');
  if (!t) { t = document.createElement('div'); t.id = 'ra-toast'; document.body.appendChild(t); }
  t.textContent = 'Reminder sent for ' + sku;
  t.className = 'show';
  clearTimeout(raSendReminder._t);
  raSendReminder._t = setTimeout(function(){ t.className=''; }, 2600);
}

/* ── Packaging catalogue dataset (Packagings screen) ──
   One row per packaging component, linked to a product SKU + supplier. Mirrors
   the GreenStreets (super) admin Packagings table so the retailer sees the same
   columns/filters. Drives the pt-table on the Packagings page (scope 'rapkg')
   and the editable Packaging detail page (ra-packaging.js reads it by id). */
var PACKAGINGS_RA = (function(){
  var products = [
    {sku:'PRK-001-BLK', desc:'Black Crew Sweatshirt', supplier:'Indotex Manufacturing'},
    {sku:'PRK-002-BLU', desc:'Blue Slim Jeans',        supplier:'Luntai Packaging Co.'},
    {sku:'PRK-003-RED', desc:'Red Midi Dress',         supplier:'Indotex Manufacturing'},
    {sku:'PRK-004-KHK', desc:'Khaki Utility Jacket',   supplier:'EcoPack GmbH'},
    {sku:'PRK-005-WHT', desc:'White T-Shirt',          supplier:'Indotex Manufacturing'},
    {sku:'PRK-006-GRY', desc:'Grey Zip Hoodie',        supplier:'Luntai Packaging Co.'},
    {sku:'PRK-007-NVY', desc:'Navy Chino Trousers',    supplier:'EcoPack GmbH'},
    {sku:'PRK-008-OLV', desc:'Olive Puffer Coat',      supplier:'Luntai Packaging Co.'},
    {sku:'PRK-009-BEI', desc:'Beige Knit Jumper',      supplier:'Indotex Manufacturing'},
    {sku:'PRK-010-PNK', desc:'Pink Pleated Skirt',     supplier:'EcoPack GmbH'}
  ];
  var comps = [
    {type:'Swing tag',       level:'Primary',   matGroup:'paper',      material:'Paper / card'},
    {type:'Box / carton',    level:'Secondary', matGroup:'corrugated', material:'Corrugated card'},
    {type:'Poly bag',        level:'Primary',   matGroup:'plastic',    material:'LDPE plastic'},
    {type:'Hanger',          level:'Primary',   matGroup:'plastic',    material:'Recycled plastic'},
    {type:'Tissue paper',    level:'Primary',   matGroup:'paper',      material:'FSC paper'},
    {type:'Shipping carton', level:'Tertiary',  matGroup:'corrugated', material:'Corrugated card'}
  ];
  var statuses = ['Retailer Approved','Incomplete','Pending'];
  var pillMap  = {'Retailer Approved':'pill-green','Incomplete':'pill-amber','Pending':'pill-grey'};
  var recGrades = ['A','B','A','C'];
  var list = [], id = 1;
  for (var p=0; p<products.length; p++){
    var n = 2 + (p % 3);                 /* 2–4 components per product */
    for (var c=0; c<n; c++){
      var comp = comps[(p+c) % comps.length];
      var status = statuses[(p+c) % statuses.length];
      var provided = status === 'Retailer Approved';
      var shownMat = (status === 'Pending') ? '' : comp.material;
      list.push({
        id:       'pk-' + String(id).padStart(3,'0'),
        type:     comp.type,
        level:    comp.level,
        matGroup: comp.matGroup,
        sku:      products[p].sku,
        desc:     products[p].desc,
        supplier: products[p].supplier,
        material: shownMat,
        weight:   provided ? (1.5 + c*4).toFixed(1) : '',
        pcr:      provided ? String(40 + (c*15)%60) : '',
        recycle:  provided ? recGrades[(p+c)%recGrades.length] : '',
        status:   status,
        pill:     pillMap[status]
      });
      id++;
    }
  }
  return list;
})();

if (typeof ptInit === 'function') ptInit('rapkg', PACKAGINGS_RA, {
  cols: 10,
  pageSize: 20,
  noun: 'packaging components',
  searchFields: ['type','sku','desc','supplier','material'],
  sortCol: 'status',
  sortDir: 1,
  rowHtml: function(r){
    var mat = r.material || '—';
    var wt  = r.weight   || '—';
    var pcr = r.pcr ? (r.pcr + '%') : '—';
    var rec = r.recycle ? '<span class="pill pill-green">'+r.recycle+'</span>' : '<span class="tbl-muted">—</span>';
    return '<tr class="gs-row-check-row" style="cursor:pointer" onclick="openPackagingRA(\''+r.id+'\')">' +
      '<td class="gs-check-col" onclick="event.stopPropagation()"><input type="checkbox" class="rapkg-cb" data-id="'+r.id+'" onchange="rapkgCheckChange()"></td>' +
      '<td><div class="tbl-name">'+r.type+'</div></td>' +
      '<td class="tbl-muted"><span class="gs-id-cell">'+r.sku+'</span> · '+r.desc+'</td>' +
      '<td class="tbl-muted">'+r.supplier+'</td>' +
      '<td class="tbl-muted">'+mat+'</td>' +
      '<td'+(r.weight?'':' class="tbl-muted"')+'>'+wt+'</td>' +
      '<td'+(r.pcr?'':' class="tbl-muted"')+'>'+pcr+'</td>' +
      '<td>'+rec+'</td>' +
      '<td><span class="pill '+r.pill+'">'+r.status+'</span></td>' +
      '<td class="act-cell" onclick="event.stopPropagation()" style="white-space:nowrap">' +
        '<button class="act-mini act-view" onclick="openPackagingRA(\''+r.id+'\')">→ Edit</button> ' +
        '<button class="act-mini act-remove" onclick="raRemovePackaging(\''+r.id+'\');">Remove</button>' +
      '</td>' +
    '</tr>';
  }
});

/* Remove a packaging row from the catalogue and re-render the table. */
function raRemovePackaging(id){
  for (var i=0;i<PACKAGINGS_RA.length;i++){ if(PACKAGINGS_RA[i].id===id){ PACKAGINGS_RA.splice(i,1); break; } }
  if (typeof ptRender === 'function') ptRender('rapkg');
}

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
  var dd = btn._gsDropdown || btn.nextElementSibling;
  if (!dd || !dd.classList.contains('reminder-dropdown')) return;
  btn._gsDropdown = dd;
  // close all others first
  document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){
    if(d !== dd) d.classList.remove('open');
  });
  var opening = !dd.classList.contains('open');
  dd.classList.toggle('open');
  if (opening) {
    /* .reminder-dropdown is position:fixed so it can escape a clipping ancestor (e.g. a
       table's overflow:hidden .tbl-wrap) — but a glass card ancestor with backdrop-filter/
       filter creates its own containing block for fixed descendants, which silently breaks
       viewport-relative fixed positioning. Reparent to <body> once so it truly floats above
       everything, using btn._gsDropdown (not nextElementSibling) to keep finding it afterward. */
    if (dd.parentElement !== document.body) document.body.appendChild(dd);
    positionDropdown(btn, dd);
  }
}
function positionDropdown(btn, dd) {
  var r = btn.getBoundingClientRect();
  var menuW = dd.offsetWidth || 200, menuH = dd.offsetHeight || 0;
  var left = Math.max(4, Math.min(r.right - menuW, window.innerWidth - menuW - 4));
  var top = r.bottom + 4;
  if (top + menuH > window.innerHeight) top = r.top - menuH - 4;
  dd.style.left = left + 'px';
  dd.style.top = top + 'px';
}
window.addEventListener('scroll', function(){
  document.querySelectorAll('.reminder-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
}, true);
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
// Close dropdowns on outside click (dropdown itself may be reparented to <body>, so check both)
document.addEventListener('click', function(e) {
  if (!e.target.closest('.reminder-btn-wrap') && !e.target.closest('.reminder-dropdown')) {
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

/* ── Collapsible sidebar ──────────────────────────────────────────────────────
   Turns the sidebar into a collapsible icon-only rail. Injects a toggle button
   under the logo and a clickable right-edge hotspot (col-resize cursor hints at
   it); collapsed state is remembered in localStorage. Idempotent + guarded so it
   no-ops on pages without a sidebar (e.g. login). */
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

/* ═══════════════════════════════════════════════════════════════════════════
   ID display enhancement — monospace + identicon + "changed part" highlight.
   Any list cell tagged `.gs-id-cell` (holding a raw ID string) is upgraded to:
     [identicon]  <dim shared-prefix><bold+coloured distinguishing suffix>
   The shared prefix is the longest common prefix across the sibling IDs in the
   same list, trimmed back to a token boundary (- _ . / space). GitHub-style
   identicon is a deterministic 5×5 mirror grid hashed from the full ID.
   Call gsEnhanceIds(rootEl, selector) after rendering a list. Idempotent.
   ═══════════════════════════════════════════════════════════════════════════ */
function gsHashStr(s){ var h=5381; for(var i=0;i<s.length;i++){ h=((h*33) ^ s.charCodeAt(i)) >>> 0; } return h>>>0; }

function gsIdenticon(id, size){
  size = size||16;
  var h = gsHashStr(id);
  var hue = h % 360;
  var color = 'hsl('+hue+',55%,55%)';
  var n=5, cell=size/n, v=h||1, rects='';
  for(var x=0;x<3;x++){
    for(var y=0;y<n;y++){
      v = (v*1103515245 + 12345) & 0x7fffffff;      /* LCG → next pseudo-bit */
      if((v>>8) & 1){
        rects += '<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'"/>';
        if(x<2) rects += '<rect x="'+((4-x)*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'"/>';
      }
    }
  }
  return '<svg class="gs-identicon" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true" style="fill:'+color+'">'+rects+'</svg>';
}

function gsIdLCP(arr){
  if(!arr.length) return '';
  var p=arr[0];
  for(var i=1;i<arr.length;i++){
    while(arr[i].lastIndexOf(p,0)!==0){ p=p.slice(0,-1); if(!p) return ''; }
  }
  return p;
}

function gsEnhanceIds(root, selector){
  root = root || document;
  var els = [].slice.call(root.querySelectorAll(selector || '.gs-id-cell'));
  if(!els.length) return;
  var esc = function(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  /* raw ID persists in data-gsid so repeated passes stay stable */
  var ids = els.map(function(el){
    var raw = el.getAttribute('data-gsid');
    if(raw==null){ raw=(el.textContent||'').trim(); el.setAttribute('data-gsid', raw); }
    return raw;
  });
  var cp = gsIdLCP(ids);
  var m = cp.match(/^.*[-_.\/\s]/);       /* trim prefix back to a token boundary */
  cp = m ? m[0] : '';
  els.forEach(function(el, i){
    var id = ids[i];
    if(!id) return;
    var dim = id.slice(0, cp.length), key = id.slice(cp.length);
    if(!key){ key = id; dim = ''; }        /* never dim the whole thing */
    el.classList.add('gs-id');
    el.innerHTML =
      '<span class="gs-id-ic">'+gsIdenticon(id,16)+'</span>' +
      '<span class="gs-id-text">' +
        (dim ? '<span class="gs-id-dim">'+esc(dim)+'</span>' : '') +
        '<span class="gs-id-key">'+esc(key)+'</span>' +
      '</span>';
  });
}
try{ window.gsIdenticon=gsIdenticon; window.gsEnhanceIds=gsEnhanceIds; }catch(_){ }

/* ── Roll out the ID chip (identicon + monospace + changed-part) to any static
   listing that tags its ID cells `.gs-id-cell`; pt-tables self-enhance on
   render. Runs once on load. ─────────────────────────────────────────────── */
(function(){
  function run(){ try{ if(typeof gsEnhanceIds==='function') gsEnhanceIds(document, '.gs-id-cell'); }catch(_){ } }
  if(document.readyState!=='loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();

/* ── Supplier row actions → open Products / Packagings pre-filtered by that
   supplier. The button stashes the supplier name; the target page applies it
   to its data-grid filter on load. ──────────────────────────────────────── */
function raSupplierProducts(name){ try{ sessionStorage.setItem('ra_supfilter', name); }catch(e){} go('ra6'); }
function raSupplierPackaging(name){ try{ sessionStorage.setItem('ra_supfilter', name); }catch(e){} go('ra5'); }
function raSupplierUsers(name){ try{ sessionStorage.setItem('ra_supfilter', name); }catch(e){} go('ra7'); }
function raOpenSupplier(name){ try{ sessionStorage.setItem('ra_supdetail', name); }catch(e){} go('ra_supdetail'); }
(function(){
  function apply(){
    var name; try{ name = sessionStorage.getItem('ra_supfilter'); }catch(e){}
    if(!name) return;
    try{ sessionStorage.removeItem('ra_supfilter'); }catch(e){}
    var scope = (typeof __pt!=='undefined' && __pt['ra']) ? 'ra' : ((typeof __pt!=='undefined' && __pt['rapkg']) ? 'rapkg' : null);
    if(!scope) return;
    __pt[scope].filters.supplier = name; __pt[scope].page = 0;
    if(typeof ptRender==='function') ptRender(scope);
    /* sync the supplier <select> + its themed label so the UI reflects it */
    var sel = document.querySelector('select[onchange*="\'supplier\'"]');
    if(sel){
      var has=false; for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===name || sel.options[i].text===name){ sel.selectedIndex=i; has=true; break; } }
      if(has){ var wrap=sel.closest('.cs-wrap'); if(wrap){ var cv=wrap.querySelector('.cs-val'); if(cv) cv.textContent=sel.options[sel.selectedIndex].text; } }
    }
  }
  if(document.readyState!=='loading') setTimeout(apply,0);
  else document.addEventListener('DOMContentLoaded', apply);
})();
