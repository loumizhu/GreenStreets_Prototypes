/* ==========================================================================
   retailer-user.js  --  shared behaviour for the split Retailer User pages.
   Extracted from 03-greenstreets_retailer_user_v1.html, except:
     - go(id) NAVIGATES to the matching page instead of toggling a .screen
     - logo/swoosh/background load from img/ files (no base64 blob)
   All init is guarded, so this one file loads safely on every page.
   Loaded BEFORE js/greenstreets-theme.js.
   ========================================================================== */

var GS_PAGES = {
  'ru_login':      '03-greenstreets_retailer_user_Login.html',
  'ru_welcome':    '03-greenstreets_retailer_user_Welcome.html',
  'ru1':           '03-greenstreets_retailer_user_Dashboard.html',
  'ru3':           '03-greenstreets_retailer_user_Suppliers.html',
  'ru4':           '03-greenstreets_retailer_user_Supplier-Detail.html',
  'ru5':           '03-greenstreets_retailer_user_DoC-Request.html',
  'ru6':           '03-greenstreets_retailer_user_Products.html',
  'ru6_detail':    '03-greenstreets_retailer_user_Product-Detail.html',
  'ru7':           '03-greenstreets_retailer_user_Documents.html',
  'ru8':           '03-greenstreets_retailer_user_Notifications.html',
  'ru9':           '03-greenstreets_retailer_user_Settings.html',
  'ru10':          '03-greenstreets_retailer_user_Packagings.html',
  'ru11':          '03-greenstreets_retailer_user_Audit-Log.html'
};
function go(id){ var u = GS_PAGES[id]; if(u) window.location.href = u; }

/* ── Send-reminder action (Retailer User may chase suppliers — US-3.9) ── */
function ruToast(msg){
  var t = document.createElement('div');
  t.className = 'ru-toast';
  t.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>'+msg+'</span>';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('in'); });
  setTimeout(function(){ t.classList.remove('in'); setTimeout(function(){ try{ t.remove(); }catch(_){ } }, 300); }, 2600);
}
function ruSendReminder(ev, sku){
  if(ev){ ev.stopPropagation(); if(ev.preventDefault) ev.preventDefault(); }
  ruToast('Reminder sent to the supplier for ' + sku);
}

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
  tr.innerHTML = '<td class="tbl-name">'+name+'</td><td><span class="pill '+lvlPill+'">'+level+'</span></td><td class="tbl-muted">'+material+'</td><td class="tbl-muted">—</td><td class="tbl-muted">—</td><td><span class="pill pill-grey">Pending</span></td><td style="display:flex;gap:4px;padding:6px 11px"><button class="btn-g-sm" onclick="go(\'ru5\')">Edit</button><button class="btn-g-sm" onclick="this.closest(\'tr\').remove()">Remove</button></td>';
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
  if (tbody && typeof gsEnhanceIds==='function') gsEnhanceIds(tbody, '.gs-id-cell');
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
var PRODUCTS_RU = (function(){
  var cats = ['Tops','Bottoms','Dresses','Outerwear','Footwear','Accessories'];
  var suppliers = ['Luntai Packaging Co.','Indotex Manufacturing','EcoPack GmbH'];
  var adjs = ['Black','Blue','Red','Khaki','White','Grey','Navy','Olive','Beige','Pink','Green','Cream','Charcoal','Rust','Teal'];
  var items = ['Crew Neck Sweatshirt','Slim Fit Jeans','Midi Dress','Utility Jacket','Essential T-Shirt','Zip Hoodie','Chino Trousers','Puffer Coat','Knit Jumper','Cargo Shorts','Pleated Skirt','Denim Jacket','Trainers','Canvas Belt','Wool Scarf'];
  var statuses = ['Complete','Incomplete','Incomplete','Pending'];
  var pills = {Complete:'pill-green', Incomplete:'pill-amber', Pending:'pill-grey'};
  var missingPool = ['2 fields missing','3 mandatory fields missing','Supplier data not submitted','1 field missing','Material data missing'];
  var list = [];
  for (var i=0;i<64;i++){
    var cat = cats[i % cats.length];
    var adj = adjs[i % adjs.length];
    var item = items[i % items.length];
    var status = statuses[i % statuses.length];
    var comps = 2 + (i % 4);
    var pill = pills[status];
    var severe = status==='Incomplete' && (i % missingPool.length) < 2;
    if (severe) pill = 'pill-red';
    var compsText = status==='Complete' ? String(comps) : '—';
    var missing = status==='Complete' ? '—' : (status==='Pending' ? 'Not started' : missingPool[i % missingPool.length]);
    list.push({
      sku: 'PRK-'+String(i+1).padStart(3,'0')+'-'+adj.slice(0,3).toUpperCase(),
      desc: adj+' '+item,
      cat: cat,
      supplier: suppliers[i % suppliers.length],
      comps: compsText,
      status: status,
      pill: pill,
      missing: missing,
      missingColor: severe ? '#ff9c96' : '#ffcd7a'
    });
  }
  return list;
})();
ptInit('ru', PRODUCTS_RU, {
  cols: 7,
  pageSize: 20,
  noun: 'products',
  searchFields: ['sku','desc'],
  rowHtml: function(r){
    var missingCell = r.status==='Complete'
      ? '<td class="tbl-muted">—</td>'
      : '<td style="font-size:11px;color:'+r.missingColor+';font-weight:500">'+r.missing+'</td>';
    // products missing supplier input get a "Send reminder" action in its own column (US-3.9 — Retailer Users can remind)
    var actionCell = r.status==='Complete'
      ? '<td></td>'
      : '<td style="text-align:right"><button class="ru-remind-btn" title="Remind the supplier to submit this product\'s data" onclick="ruSendReminder(event,\''+r.sku+'\')">'+
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Send reminder</button></td>';
    return '<tr onclick="go(\'ru6_detail\')" style="cursor:pointer"><td><span class="gs-id-cell">'+r.sku+'</span></td><td>'+r.desc+'</td><td class="tbl-muted">'+r.cat+'</td><td>'+r.comps+'</td><td><span class="pill '+r.pill+'">'+r.status+'</span></td>'+missingCell+actionCell+'</tr>';
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

/* ===== notifications filter (Notifications) ===== */
window.gsNotifFilter = window.gsNotifFilter || function(btn, type){
  var screen = btn.closest('.screen');
  screen.querySelectorAll('.notif-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  screen.querySelectorAll('.notif-item').forEach(function(item){
    item.classList.toggle('notif-hidden', type !== 'all' && item.dataset.type !== type);
  });
};

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
    btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>';
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
   ID display enhancement — monospace + identicon + shared-prefix dimming.
   Ported from retailer-admin.js. Any cell tagged `.gs-id-cell` (holding a raw
   ID string) becomes: [identicon] <dim shared-prefix><bold distinguishing key>.
   Call gsEnhanceIds(root, selector) after rendering a list. Idempotent.
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
      v = (v*1103515245 + 12345) & 0x7fffffff;
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
  for(var i=1;i<arr.length;i++){ while(arr[i].lastIndexOf(p,0)!==0){ p=p.slice(0,-1); if(!p) return ''; } }
  return p;
}
function gsEnhanceIds(root, selector){
  root = root || document;
  var els = [].slice.call(root.querySelectorAll(selector || '.gs-id-cell'));
  if(!els.length) return;
  var esc = function(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var ids = els.map(function(el){
    var raw = el.getAttribute('data-gsid');
    if(raw==null){ raw=(el.textContent||'').trim(); el.setAttribute('data-gsid', raw); }
    return raw;
  });
  var cp = gsIdLCP(ids);
  var m = cp.match(/^.*[-_.\/\s]/);
  cp = m ? m[0] : '';
  els.forEach(function(el, i){
    var id = ids[i];
    if(!id) return;
    var dim = id.slice(0, cp.length), key = id.slice(cp.length);
    if(!key){ key = id; dim = ''; }
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
(function(){
  function run(){ try{ if(typeof gsEnhanceIds==='function') gsEnhanceIds(document, '.gs-id-cell'); }catch(_){ } }
  if(document.readyState!=='loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();

/* ── Dashboard header notification menu (mirrors the RA header bell) ── */
function ruToggleNotif(e){ if(e){ e.stopPropagation(); } var m=document.getElementById('ru-notif-menu'); if(m) m.classList.toggle('open'); }
document.addEventListener('click', function(e){
  var m=document.getElementById('ru-notif-menu');
  if(m && m.classList.contains('open') && !e.target.closest('#ru-notif-menu') && !e.target.closest('[onclick*="ruToggleNotif"]')) m.classList.remove('open');
});
