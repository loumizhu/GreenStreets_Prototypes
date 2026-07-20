
/* Download a blank packaging spec-sheet template (prototype: builds a CSV client-side, no backend). */
function downloadSpecTemplate(){
  var cols=['Section','Field','Value','Unit','Notes'];
  var rows=[
    ['1. Product','Department','','',''],
    ['1. Product','Style ORIN','','',''],
    ['2. Case & Palletisation','Packing method','','',''],
    ['2. Case & Palletisation','Singles per case','','pcs',''],
    ['3. Components','Component name','','',''],
    ['3. Components','Material','','',''],
    ['3. Components','Weight','','g',''],
    ['3. Components','Recycled content','','%','']
  ];
  var csv=[cols.join(',')].concat(rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');})).join('\n');
  var blob=new Blob([csv],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='packaging-spec-sheet-template.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
var IDS=['sp1', 'sp2', 's_1_0', 's_2_0', 's_3_0', 's_4_0', 's_5_0', 's_6_0', 's_7_0', 's_8_0', 's_9_0', 's_10_0', 's_11_0', 's_review_0', 's_1_1', 's_1_2', 's_1_3', 's_upload_0', 'sp_ai', 'sp_ai_review', 'sp9', 'wiz5', 'proddetail'];
var COMPONENT_LIBRARY_JS=[{"key": "swing_tag", "name": "Swing Tag", "pkg_type": "Swing Tag", "material": "Paper GC1 - Coated FBB", "weight": "2.4 g", "recycled": "80% PCR", "colour": "Natural", "cert": "FSC", "level": "primary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0182"}, {"key": "hanger", "name": "Hanger", "pkg_type": "Hanger (Plastic Hanger)", "material": "Plastic LDPE", "weight": "14 g", "recycled": "30% PCR", "colour": "Clear", "cert": "None", "level": "primary", "img": "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0190"}, {"key": "poly_bag", "name": "Poly Bag", "pkg_type": "Bag (Poly)", "material": "Plastic LDPE", "weight": "8.1 g", "recycled": "0% PCR", "colour": "Clear", "cert": "None", "level": "primary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0145"}, {"key": "display_box", "name": "Display Box", "pkg_type": "Box/Carton", "material": "Cardboard_CartonBoard", "weight": "45 g", "recycled": "65% PCR", "colour": "Brown", "cert": "FSC Recycled", "level": "primary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0177"}, {"key": "wrap_band", "name": "Wrap Band", "pkg_type": "Band", "material": "Paper Kraft", "weight": "1.2 g", "recycled": "100% PCR", "colour": "Natural", "cert": "FSC", "level": "primary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0156"}, {"key": "tissue_paper", "name": "Tissue Paper", "pkg_type": "Tissue Paper", "material": "Paper SUB", "weight": "3.5 g", "recycled": "50% PCR", "colour": "White", "cert": "FSC Mixed", "level": "primary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0163"}, {"key": "shipping_carton", "name": "Shipping Carton", "pkg_type": "Box/Carton", "material": "Corrugate", "weight": "180 g", "recycled": "65% PCR", "colour": "Brown", "cert": "FSC Recycled", "level": "secondary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0171"}, {"key": "shelf_tray", "name": "Shelf-Ready Tray", "pkg_type": "Box/Carton", "material": "Corrugate_Microflute", "weight": "95 g", "recycled": "70% PCR", "colour": "Brown", "cert": "FSC", "level": "secondary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0184"}, {"key": "carton_divider", "name": "Carton Divider", "pkg_type": "Box/Carton", "material": "Cardboard_CartonBoard", "weight": "22 g", "recycled": "55% PCR", "colour": "Natural", "cert": "FSC", "level": "secondary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0188"}, {"key": "padding", "name": "Padding", "pkg_type": "Bag (Poly)", "material": "Plastic LDPE", "weight": "12 g", "recycled": "20% PCR", "colour": "Clear", "cert": "None", "level": "secondary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0192"}, {"key": "goh_polybag", "name": "GOH Polybag", "pkg_type": "Bag (Poly)", "material": "Plastic LDPE", "weight": "16 g", "recycled": "25% PCR", "colour": "Clear", "cert": "None", "level": "secondary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0149"}, {"key": "cdu", "name": "CDU Display Unit", "pkg_type": "Display Unit CDU", "material": "Corrugate", "weight": "640 g", "recycled": "60% PCR", "colour": "White", "cert": "FSC", "level": "secondary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0199"}, {"key": "pallet", "name": "Pallet", "pkg_type": "Pallet", "material": "Wood", "weight": "22 kg", "recycled": "0% PCR", "colour": "Natural", "cert": "PEFC", "level": "tertiary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0203"}, {"key": "pallet_wrap", "name": "Pallet Wrap / Stretch", "pkg_type": "Wrap", "material": "Plastic LDPE", "weight": "320 g", "recycled": "15% PCR", "colour": "Clear", "cert": "None", "level": "tertiary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0207"}, {"key": "pallet_label", "name": "Pallet Label", "pkg_type": "Self Adhesive Label (Single)", "material": "Paper GC1 - Coated FBB", "weight": "1.8 g", "recycled": "40% PCR", "colour": "White", "cert": "None", "level": "tertiary", "img": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0211"}, {"key": "fastener", "name": "Fastener (cable tie / tape)", "pkg_type": "Attacher/Tie (Cable tie)", "material": "Plastic PP", "weight": "3.1 g", "recycled": "0% PCR", "colour": "Black", "cert": "None", "level": "tertiary", "img": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=80&h=80&fit=crop", "doc_ref": "DOC-2026-0215"}];
var PRODUCTS_JS=[["PRK-003-DRS-RED", "Red Midi Dress"], ["PRK-004-JKT-KHK", "Khaki Utility Jacket"], ["PRK-002-JN-BLU", "Blue Slim Fit Jeans"], ["PRK-001-SW-BLK", "Black Crew Neck Sweatshirt"], ["PRK-005-TOP-WHT", "White Cropped Top"]];
function go(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on')});
  document.querySelectorAll('.pnb').forEach(function(b){b.classList.remove('on')});
  var el=document.getElementById(id);
  if(el){el.classList.add('on');window.scrollTo(0,0);}
  var i=IDS.indexOf(id);
  var btns=document.querySelectorAll('.pnb');
  if(i>=0&&btns[i])btns[i].classList.add('on');
  if(/^s_\d+_0$/.test(id) && typeof decorateWizard==='function') decorateWizard(id);
}
(function(){
  document.querySelectorAll('[data-sw]').forEach(function(el){el.src='img/swoosh.png'});
})();

function togglePkgEditMode(key) {
  var body = document.getElementById('pkgdetail-body-' + key);
  if(!body) return;
  var btn = document.getElementById('pkg-edit-toggle');
  var inputs = body.querySelectorAll('.pkg-detail-feat-input');
  var nowEditing = body.classList.toggle('pkg-edit-mode');
  inputs.forEach(function(inp){ inp.readOnly = !nowEditing; });
  if(btn){
    btn.innerHTML = nowEditing
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save changes'
      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit';
    btn.classList.toggle('pkg-edit-toggle-active', nowEditing);
  }
}

function duplicatePackaging(key) {
  var comp = COMPONENT_LIBRARY_JS.find(function(c){ return c.key === key; });
  if(!comp) return;
  var newName = comp.name + ' (copy)';
  alert('Duplicated "' + comp.name + '" as a new variation: "' + newName + '". You can now edit the copy independently.');
  // In production this would create a new saved component entry pre-filled from this one,
  // and navigate to its own detail/edit screen.
}

var PRODUCTS = [
 {id:0, code:"PRK-003-DRS-RED", name:"Red Midi Dress",            category:"Dresses",     status:"incomplete", type:"incomplete", packing:"Flat", uc:35,  cp:null, comps:["Swing Tag","Box / Carton","Tissue Paper"],           expected:["Swing Tag","Poly Bag","Shipping Carton","Pallet","Pallet Wrap","Pallet Label"]},
 {id:1, code:"PRK-004-JKT-KHK", name:"Khaki Utility Jacket",      category:"Jackets",     status:"incomplete", type:"incomplete", packing:"GOH",  uc:50,  cp:40,   comps:["Hanger","Garment Bag"],                              expected:["Hanger","GOH Polybag","Swing Tag","Shipping Carton","Pallet","Pallet Wrap"]},
 {id:2, code:"PRK-002-JN-BLU",  name:"Blue Slim Fit Jeans",       category:"Jeans",       status:"complete",   type:"submitted",  packing:"Flat", uc:100, cp:null, comps:["Poly Bag","Wrap Band"],                              expected:["Poly Bag","Wrap Band","Swing Tag","Shipping Carton","Pallet"]},
 {id:3, code:"PRK-001-SW-BLK",  name:"Black Crew Neck Sweatshirt",category:"Sweatshirts", status:"none",       type:"none",       packing:"—", uc:null, cp:null, comps:[],                                                    expected:["Swing Tag","Poly Bag","Shipping Carton","Pallet","Pallet Wrap"]},
 {id:4, code:"PRK-005-TOP-WHT", name:"White Cropped Top",         category:"Tops",        status:"delisted",   type:"delisted",   packing:"Flat", uc:35,  cp:null, comps:["Swing Tag","Shipping Carton"],                       expected:["Swing Tag","Tissue Paper","Shipping Carton","Pallet"]},
 {id:5, code:"PRK-006-SKT-NVY", name:"Navy Pleated Skirt",        category:"Skirts",      status:"complete",   type:"complete",   packing:"Flat", uc:60,  cp:30,   comps:["Swing Tag","Poly Bag","Shipping Carton"],            expected:["Swing Tag","Poly Bag","Shipping Carton","Pallet"]},
 {id:6, code:"PRK-007-SHT-STR", name:"Striped Oxford Shirt",      category:"Shirts",      status:"complete",   type:"submitted",  packing:"Boxed",uc:40,  cp:45,   comps:["Swing Tag","Tissue Paper","Shipping Carton"],        expected:["Swing Tag","Tissue Paper","Shipping Carton","Pallet"]},
 {id:7, code:"PRK-008-SHO-BEG", name:"Beige Chino Shorts",        category:"Shorts",      status:"incomplete", type:"incomplete", packing:"Flat", uc:80,  cp:25,   comps:["Poly Bag"],                                          expected:["Poly Bag","Swing Tag","Shipping Carton","Pallet"]},
 {id:8, code:"PRK-009-CO-CAM",  name:"Camel Wool Coat",           category:"Coats",       status:"incomplete", type:"incomplete", packing:"GOH",  uc:20,  cp:30,   comps:["Hanger"],                                            expected:["Hanger","GOH Polybag","Swing Tag","Shipping Carton","Pallet","Pallet Wrap"]},
 {id:9, code:"PRK-010-KNT-GRY", name:"Grey Cable Knit Jumper",    category:"Knitwear",    status:"none",       type:"none",       packing:"—", uc:null, cp:null, comps:[],                                                    expected:["Swing Tag","Poly Bag","Shipping Carton","Pallet"]},
 {id:10,code:"PRK-011-ACT-BLK", name:"Black Leggings",            category:"Activewear",  status:"complete",   type:"submitted",  packing:"Flat", uc:120, cp:20,   comps:["Poly Bag","Wrap Band","Shipping Carton"],            expected:["Poly Bag","Wrap Band","Swing Tag","Shipping Carton","Pallet"]},
 {id:11,code:"PRK-012-UNW-WHT", name:"White Cotton Briefs 3pk",   category:"Underwear",   status:"complete",   type:"complete",   packing:"Boxed",uc:200, cp:15,   comps:["Display Box","Header Card"],                         expected:["Display Box","Header Card","Shipping Carton","Pallet"]},
 {id:12,code:"PRK-013-ACC-TAN", name:"Tan Leather Belt",          category:"Accessories", status:"incomplete", type:"incomplete", packing:"Boxed",uc:50,  cp:40,   comps:["Header Card"],                                       expected:["Header Card","Poly Bag","Shipping Carton"]},
 {id:13,code:"PRK-014-FW-BRN",  name:"Brown Chelsea Boots",       category:"Footwear",    status:"complete",   type:"submitted",  packing:"Boxed",uc:12,  cp:60,   comps:["Display Box","Tissue Paper","Shipping Carton"],      expected:["Display Box","Tissue Paper","Shipping Carton","Pallet"]},
 {id:14,code:"PRK-015-SCF-RED", name:"Red Wool Scarf",            category:"Scarves",     status:"delisted",   type:"delisted",   packing:"Flat", uc:100, cp:20,   comps:["Swing Tag","Poly Bag"],                              expected:["Swing Tag","Poly Bag","Shipping Carton"]}
];

var prodState = {filter:"all", cat:"all", q:"", sortKey:"status", sortDir:1, page:0, size:10};

/* ── Wizard step completion model ──────────────────────────────────────────
   Drives the canonical stepbar shown on every s_N_0 wizard screen: done steps
   render green with an animated tick, incomplete ones render red with a pulsing
   "missing info" badge. Overwrites each screen's hand-authored .stepbar on nav. */
var WIZ_STEPS = [
  {label:'Product',    scr:'s_1_0',  done:true},
  {label:'Packaging',  scr:'s_2_0',  done:true},
  {label:'Level',      scr:'s_3_0',  done:true},
  {label:'Source',     scr:'s_4_0',  miss:2},
  {label:'Materials',  scr:'s_5_0',  miss:3},
  {label:'Recycled',   scr:'s_6_0',  done:true},
  {label:'Colour',     scr:'s_7_0',  miss:1},
  {label:'Weight',     scr:'s_8_0',  done:true},
  {label:'Dimensions', scr:'s_9_0',  miss:2},
  {label:'Add.Info',   scr:'s_10_0', done:true},
  {label:'Compliance', scr:'s_11_0', miss:1}
];
var _wizRippleTarget = null;

function decorateWizard(id){
  var scr = document.getElementById(id); if(!scr) return;
  var bar = scr.querySelector('.stepbar'); if(!bar) return;
  var html = '';
  WIZ_STEPS.forEach(function(s,i){
    var isCurr = s.scr === id;
    var done   = !!s.done;
    var todo   = !done && s.miss > 0;
    if(i>0){
      var prevDone = !!WIZ_STEPS[i-1].done;
      html += '<div class="sp-line" style="background:'+(prevDone?'var(--gs)':'rgba(255,255,255,.1)')+'"></div>';
    }
    var dotCls = 'sp-dot'
      + (done ? ' done' : '')
      + (todo ? ' todo' : '')
      + (isCurr ? ' curr sp-ripple' : '');
    var inner = done
      ? '<svg class="sp-check" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg>'
      : (i+1);
    var badge = todo ? '<span class="sp-badge" title="'+s.miss+' field'+(s.miss>1?'s':'')+' missing">'+s.miss+'</span>' : '';
    var lblCls = 'sp-lbl' + (done?' done':'') + (todo?' todo':'') + (isCurr?' curr':'');
    html += '<div class="sp-step'+(isCurr?' sp-curr':'')+'">'
      + '<div class="'+dotCls+'" style="cursor:pointer" onclick="go(\''+s.scr+'\')">'+inner+badge+'</div>'
      + '<div class="'+lblCls+'">'+s.label+'</div></div>';
  });
  bar.innerHTML = html;
  focusFirstField(id);
}

/* Auto-focus the first empty, editable field on the current wizard step. */
function focusFirstField(scr){
  var root = document.getElementById(scr); if(!root) return;
  setTimeout(function(){
    var els = root.querySelectorAll('.pbody input:not([type=hidden]):not([readonly]):not([disabled]), .pbody textarea:not([readonly]):not([disabled])');
    for(var i=0;i<els.length;i++){
      var e = els[i];
      if(e.offsetParent===null) continue;            // skip hidden
      if((e.value||'').trim()!=='') continue;         // skip already-filled
      try{ e.focus(); }catch(_){}
      break;
    }
  }, 60);
}

var IC_box    = '<svg class="prod-num-ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>';
var IC_pallet = '<svg class="prod-num-ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
var IC_stack  = '<svg class="prod-num-ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>';
var IC_comp   = '<svg class="prod-num-ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><use href="#gsi-1"/></svg>';

function prodNum(v){ return (v===null||v===undefined||v==="") ? "—" : v; }

function prodTip(title, items, cls){
  var box = '<div class="prod-tooltip-box'+(cls?(' '+cls):'')+'"><div class="prod-tooltip-title">'+title+'</div>';
  if(items && items.length){
    box += '<ul class="prod-tooltip-list">'+items.map(function(i){return '<li>'+i+'</li>';}).join('')+'</ul>';
  } else {
    box += '<div style="font-size:11px;color:rgba(255,255,255,.55)">None added yet</div>';
  }
  return box + '</div>';
}

function prodStatusMeta(t){
  return ({
    incomplete:{cls:"prod-status-incomplete", lbl:"Incomplete",   st:"st-incomplete", enabled:false, btn:"Submit"},
    complete:  {cls:"prod-status-complete",   lbl:"Complete",     st:"st-complete",   enabled:true,  btn:"Submit"},
    submitted: {cls:"prod-status-submitted",  lbl:"Submitted",    st:"st-complete",   enabled:true,  btn:"Resubmit"},
    none:      {cls:"prod-status-none",       lbl:"Not started",  st:"st-none",       enabled:false, btn:"Submit"},
    delisted:  {cls:"prod-status-delisted",   lbl:"Delisted",     st:"st-delisted",   enabled:false, btn:"Submit"}
  })[t];
}

function prodUnitsPallet(p){ return (p.uc!=null && p.cp!=null) ? (p.uc*p.cp) : null; }

/* Retailer-suggested number of packaging components required for this product.
   Editable by the supplier (stored on p.req). Complete/submitted products default
   to exactly the number they already have (e.g. "2 / 2"). */
function prodReq(p){
  if(p.req!=null) return p.req;
  return (p.type==='complete'||p.type==='submitted') ? p.comps.length : (p.expected ? p.expected.length : p.comps.length);
}
function prodSetReq(pi,val){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p) return;
  var n = parseInt(val,10); p.req = (isNaN(n)||n<0) ? 0 : n;
  prodRender();
}
/* Row-level "Mark as complete" for incomplete products (mirrors the product-detail action). */
function prodMarkRowComplete(pi){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p) return;
  p.type = 'complete'; p.status = 'complete';
  prodRender();
  if(typeof gsToast==='function') gsToast('“'+p.code+'” marked complete — ready to submit');
}

function prodRowHtml(p){
  var m = prodStatusMeta(p.type);
  var expWrap = '<span class="prod-tooltip-wrap" tabindex="0" onclick="event.stopPropagation()">'
    + '<svg class="prod-tooltip-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#gsi-3"/></svg>'
    + prodTip("Expected packaging", p.expected) + '</span>';
  var compCell = prodCompCell(p);
  return '<tr class="prod-tr ' + m.st + '" data-pi="' + p.id + '" data-status="' + p.status + '" onclick="openProductDetail(' + p.id + ')">'
    + '<td><div class="prod-cell-code">' + p.code + expWrap + '</div><div class="prod-cell-name">' + p.name + '</div></td>'
    + '<td>' + p.category + '</td>'
    + '<td><span class="prod-status-pill ' + m.cls + '">' + m.lbl + '</span></td>'
    + '<td>' + p.packing + '</td>'
    + '<td class="tac"><span class="prod-num">' + IC_box + prodNum(p.uc) + '</span></td>'
    + '<td class="tac"><span class="prod-num">' + IC_pallet + prodNum(p.cp) + '</span></td>'
    + '<td class="tac"><span class="prod-num">' + IC_stack + prodNum(prodUnitsPallet(p)) + '</span></td>'
    + '<td onclick="event.stopPropagation()">' + compCell + '</td>'
    + '<td class="tar"><div class="prod-actions">'
    +   (p.type==='incomplete' ? '<button class="prod-markcomplete-btn" onclick="event.stopPropagation();prodMarkRowComplete('+p.id+')" title="Mark this product complete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>Mark complete</button>' : '')
    +   '<button class="prod-submit-btn"' + (m.enabled?"":" disabled") + ' onclick="event.stopPropagation();submitProduct(' + p.id + ')">' + m.btn + '</button>'
    + '</div></td>'
    + '</tr>';
}

/* Build the wide "Packaging components" cell: a listing of the product's
   components (each removable) plus an add button whose dropdown lets you pick
   a saved component or create a brand-new one via the wizard. */
function prodCompCell(p){
  var X = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var n = p.comps.length;
  var pills = p.comps.map(function(name, idx){
    return '<span class="pcmp-pill"><span class="pcmp-num">'+(idx+1)+'</span><span class="pcmp-txt" title="'+name+'">'+name+'</span>'
      + '<span class="pcmp-x" title="Remove component" onclick="event.stopPropagation();prodRemoveComp('+p.id+','+idx+')">'+X+'</span></span>';
  }).join('');
  var req = prodReq(p);
  var met = req>0 && n>=req;
  var count = '<div class="pcmp-count'+(n?'':' pcmp-count-empty')+(met?' pcmp-count-met':'')+'" onclick="event.stopPropagation()">'
    + '<span class="pcmp-count-num">'+n+'</span> <span class="pcmp-count-lbl">'+(n===1?'component':'components')+'</span>'
    + '<span class="pcmp-count-slash">/</span>'
    + '<input class="pcmp-req-inp" type="number" min="0" step="1" value="'+req+'" title="Components required by the retailer — a suggestion you can change" onclick="event.stopPropagation()" onkeydown="if(event.key===&quot;Enter&quot;)this.blur()" onchange="prodSetReq('+p.id+',this.value)">'
    + '</div>';
  var list = n ? '<div class="pcmp-list">'+pills+'</div>' : '';
  var addWrap = '<span class="pcmp-add">'
    + '<button class="pcmp-add-btn" data-pi="'+p.id+'" title="Add packaging component" onclick="event.stopPropagation();prodToggleCompMenu('+p.id+')">'
    + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Add component</button></span>';
  return '<div class="pcmp-cell">'+count+list+addWrap+'</div>';
}
/* Dropdown is built on demand and appended to <body> so it isn't trapped by the
   transformed .landing-tab-panel (the screen-entrance animation leaves a
   transform that would otherwise become the containing block for position:fixed). */
function compMenuHTML(pi, addFn){
  addFn = addFn || 'prodAddComp';
  var libItems = COMPONENT_LIBRARY_JS.map(function(c){
    var lvl = c.level.charAt(0).toUpperCase()+c.level.slice(1);
    return '<div class="comp-lib-item" data-name="'+c.name.toLowerCase()+'" onclick="event.stopPropagation();'+addFn+'('+pi+',\''+c.key+'\')">'
      + '<img src="'+c.img+'" alt="" class="comp-lib-img">'
      + '<div class="comp-lib-info"><div class="comp-lib-name">'+c.name+'</div><div class="comp-lib-ref">'+lvl+'</div></div></div>';
  }).join('');
  return '<div class="product-card-menu-hdr">Add a saved component</div>'
    + '<div class="comp-menu-search-wrap"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="comp-menu-search" placeholder="Search components..." onclick="event.stopPropagation()" oninput="filterCompMenu(this)"></div>'
    + '<div class="comp-menu-items">'+libItems+'</div>'
    + '<button class="comp-menu-create-new" onclick="event.stopPropagation();openNewCompWizard('+pi+')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Create a new component</button>';
}
/* Position a floating menu next to a trigger button (fixed, viewport-clamped, flips up). */
function positionCompMenu(btn, menu){
  var r = btn.getBoundingClientRect();
  var mw = 240, top;
  var left = Math.max(12, Math.min(r.right - mw, window.innerWidth - mw - 12));
  var spaceBelow = window.innerHeight - r.bottom - 12;
  var spaceAbove = r.top - 12;
  var cap = Math.round(window.innerHeight * 0.82); // let the menu use most of the view height
  // Open below when it fits the full cap or below has at least as much room as
  // above; otherwise flip above so the list gets the taller side of the trigger.
  if(spaceBelow >= cap || spaceBelow >= spaceAbove){
    menu.style.maxHeight = Math.max(160, Math.min(cap, spaceBelow)) + 'px';
    top = r.bottom + 6;
  } else {
    var h = Math.max(160, Math.min(cap, spaceAbove));
    menu.style.maxHeight = h + 'px';
    top = r.top - 6 - h;
  }
  menu.style.left = left + 'px';
  menu.style.top = Math.max(12, top) + 'px';
}
function openCompMenuAt(btn, pi, addFn){
  var menu = document.createElement('div');
  menu.className = 'pcmp-menu pcmp-open';
  menu.setAttribute('data-pi', pi);
  menu.innerHTML = compMenuHTML(pi, addFn);
  document.body.appendChild(menu);
  positionCompMenu(btn, menu);
}
function prodAddComp(pi, key){
  closeAllCompMenus();
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  var comp = COMPONENT_LIBRARY_JS.find(function(c){return c.key===key;});
  if(p && comp){ p.comps.push(comp.name); if(p._pkgs) p._pkgs.push(buildPkgData(comp.name)); prodRender(); if(_pdOpen===pi) renderProductDetail(pi); }
}
function prodRemoveComp(pi, idx){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  if(p && idx>=0 && idx<p.comps.length){ p.comps.splice(idx,1); if(p._pkgs) p._pkgs.splice(idx,1); prodRender(); if(_pdOpen===pi) renderProductDetail(pi); }
}
function closeAllCompMenus(){
  document.querySelectorAll('.pcmp-menu').forEach(function(m){ m.remove(); });
}
function prodToggleCompMenu(pi){
  var existing = document.querySelector('.pcmp-menu[data-pi="'+pi+'"]');
  closeAllCompMenus();
  if(existing) return;              // it was open → toggle closed
  var btn = document.querySelector('.pcmp-add-btn[data-pi="'+pi+'"]');
  if(!btn) return;
  openCompMenuAt(btn, pi, 'prodAddComp');
}
/* ══════════════════════════════════════════════════════════════════════════
   Product detail page — one product, its packing/palletisation, and the many
   packaging components beneath it. Every field is editable inline, on the fly.
   Field taxonomy mirrors the client spreadsheet (sections 1–11).
   ══════════════════════════════════════════════════════════════════════════ */
var _pdOpen = null;
function pdEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function pdLevelColor(l){ return {Primary:'#3aa8d8',Secondary:'#6bbf59',Tertiary:'#d65fc4'}[l] || '#3aa8d8'; }
function pdStatusCls(s){ return s==='Compliant'?'compliant':(s==='Incomplete'?'incomplete':'review'); }
function fval(pkg, label){ for(var g=0;g<pkg.groups.length;g++){var fs=pkg.groups[g].fields;for(var f=0;f<fs.length;f++){ if(fs[f].k===label) return fs[f].v; }} return ''; }
function pkgStatus(pkg){
  var mat=fval(pkg,'Base Material'), cert=fval(pkg,'Certification'), rec=fval(pkg,'Recycled Content');
  if(!String(mat).trim()) return 'Incomplete';
  if(cert && cert!=='None' && rec==='Yes') return 'Compliant';
  return 'Review needed';
}
/* Build the full editable field model for a packaging component (spreadsheet sections 3–11). */
function buildPkgData(name){
  var c = COMPONENT_LIBRARY_JS.find(function(x){return x.name.toLowerCase()===String(name).toLowerCase();}) || {};
  var lvl = c.level ? (c.level.charAt(0).toUpperCase()+c.level.slice(1)) : 'Primary';
  var mat = c.material || '';
  var wt = c.weight ? String(c.weight).replace(/[^0-9.]/g,'') : '';
  var pcrM = String(c.recycled||'').match(/(\d+)/); var pcr = pcrM ? pcrM[1] : '0';
  var rec = (pcr && pcr!=='0') ? 'Yes' : 'No';
  return { name:name, img:c.img||'', groups:[
    {title:'Level & format', fields:[
      {k:'Packaging Level', v:lvl, type:'select', opt:['Primary','Secondary','Tertiary']},
      {k:'Packaging Type', v:c.pkg_type||name, type:'text'},
      {k:'Other Type Description', v:'', type:'text'} ]},
    {title:'Source', fields:[
      {k:'Packaging Source Type', v:'Supplier-manufactured', type:'select', opt:['Supplier-manufactured','Third-party converter','Primark-nominated']} ]},
    {title:'Material information', fields:[
      {k:'Base Material', v:mat, type:'text'},
      {k:'No. of materials', v:'1', type:'select', opt:['1','2','3','4']},
      {k:'Material 1 Name', v:mat, type:'text'},
      {k:'% Material 1', v:'100', type:'number'},
      {k:'Total %', v:'100', type:'number'} ]},
    {title:'Recycled content', fields:[
      {k:'Recycled Content', v:rec, type:'select', opt:['Yes','No']},
      {k:'Post-Consumer %', v:pcr, type:'number'},
      {k:'Post-Industrial %', v:'0', type:'number'},
      {k:'Supporting Evidence', v:c.doc_ref||'', type:'text'},
      {k:'Comments', v:'', type:'textarea'} ]},
    {title:'Colour & decoration', fields:[
      {k:'Material Colour', v:c.colour||'', type:'text'},
      {k:'Opacity', v:'Opaque', type:'select', opt:['Transparent','Translucent','Opaque']},
      {k:'Decoration', v:'None', type:'select', opt:['None','1-colour print','2-colour print','Full print']} ]},
    {title:'Weight & grammage', fields:[
      {k:'Weight (g)', v:wt, type:'number'},
      {k:'Grammage (gsm)', v:'', type:'number'},
      {k:'Gauge (µm)', v:'', type:'number'} ]},
    {title:'Dimensions (mm)', fields:[
      {k:'Length', v:'', type:'number'},
      {k:'Width', v:'', type:'number'},
      {k:'Height / Depth', v:'', type:'number'} ]},
    {title:'Additional information', fields:[
      {k:'Certification', v:c.cert||'None', type:'select', opt:['GRS','RCS','FSC','FSC Recycled','FSC Mixed','PEFC','None','Other']},
      {k:'Packaging Supplier Name', v:'Windy Apparels Ltd', type:'text'},
      {k:'Packaging Supplier Address', v:'Dhaka, Bangladesh', type:'text'} ]},
    {title:'Material compliance', fields:[
      {k:'Compliance Standard', v:'EU PPWR / REACH', type:'select', opt:['EU PPWR / REACH','UK Packaging Regs','Both EU & UK']},
      {k:'Mineral oils above limits?', v:'No', type:'select', opt:['Yes','No']},
      {k:'BPA above limits?', v:'No', type:'select', opt:['Yes','No']},
      {k:'Contains PFAs?', v:'No', type:'select', opt:['Yes','No']},
      {k:'Chlorine used?', v:'No', type:'select', opt:['Yes','No']} ]}
  ]};
}
function openProductDetail(pi){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p) return;
  if(!p._pkgs) p._pkgs = p.comps.map(function(n){ return buildPkgData(n); });
  _pdOpen = pi;
  renderProductDetail(pi);
  go('proddetail');
}
function pdFieldHTML(pi,pk,gi,fi,field){
  var h = 'pdEditField('+pi+','+pk+','+gi+','+fi+',this.value)';
  var lbl = '<div class="pd-flabel">'+pdEsc(field.k)+'</div>';
  var ctrl;
  if(field.type==='select'){
    ctrl = '<select class="pd-input" onchange="'+h+'">'+field.opt.map(function(o){return '<option'+(o===field.v?' selected':'')+'>'+pdEsc(o)+'</option>';}).join('')+'</select>';
  } else if(field.type==='textarea'){
    ctrl = '<textarea class="pd-input pd-textarea" rows="2" oninput="'+h+'" placeholder="—">'+pdEsc(field.v)+'</textarea>';
  } else {
    ctrl = '<input type="'+(field.type==='number'?'number':'text')+'" class="pd-input" value="'+pdEsc(field.v)+'" oninput="'+h+'" placeholder="—">';
  }
  return '<div class="pd-field">'+lbl+ctrl+'</div>';
}
function pdCardHeadInner(pi,pk){
  var pkg = PRODUCTS.filter(function(x){return x.id===pi;})[0]._pkgs[pk];
  var lvl = fval(pkg,'Packaging Level')||'Primary';
  var col = pdLevelColor(lvl);
  var st = pkgStatus(pkg), scls = pdStatusCls(st);
  function chip(l,v){ return '<div class="pd-chip"><div class="pd-chip-l">'+l+'</div><div class="pd-chip-v">'+pdEsc(v||'—')+'</div></div>'; }
  var dims = [fval(pkg,'Length'),fval(pkg,'Width'),fval(pkg,'Height / Depth')].filter(function(x){return String(x).trim();}).join(' × ');
  var wt = fval(pkg,'Weight (g)'); wt = wt?wt+' g':'—';
  var rec = fval(pkg,'Recycled Content')==='Yes' ? (fval(pkg,'Post-Consumer %')||'0')+'% PCR' : 'None';
  var sum = chip('Type', fval(pkg,'Packaging Type'))
    + chip('Material', fval(pkg,'Base Material'))
    + chip('Weight', wt)
    + chip('Dimensions', dims||'—')
    + chip('Recycled', rec)
    + chip('Colour', fval(pkg,'Material Colour'));
  return '<span class="pkg-level-pill-sm" style="background:'+col+'22;color:'+col+';border:1px solid '+col+'55">'+pdEsc(lvl)+'</span>'
    + '<div class="pd-card-name">'+pdEsc(pkg.name)+'</div>'
    + '<div class="pd-sum">'+sum+'</div>'
    + '<span class="pkg-status-pill '+scls+'">'+st+'</span>'
    + '<svg class="pd-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>';
}
function renderProductDetail(pi){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p) return;
  var m = prodStatusMeta(p.type);
  var up = (p.uc!=null && p.cp!=null) ? (p.uc*p.cp) : '—';
  var packOpts = ['Flat','Boxed','GOH','Hanging','—'];
  var head = ''
    + '<div class="pd-back-row"><button class="pd-back" onclick="go(\'sp2\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5m0 0 6 6m-6-6 6-6"/></svg>Back to products</button></div>'
    + '<div class="pd-phead">'
    +   '<div class="pd-phead-top"><div><div class="pd-eyebrow">Product</div><div class="pd-code">'+pdEsc(p.code)+'</div><div class="pd-name">'+pdEsc(p.name)+' · '+pdEsc(p.category)+'</div></div>'
    +     '<div class="pd-status-actions">'
    +       '<span class="pkg-status-pill '+m.cls.replace('prod-status-','')+' pd-prod-status" id="pd-status-'+pi+'">'+m.lbl+'</span>'
    +       '<button class="pd-mark-complete" id="pd-markcomplete-'+pi+'" onclick="pdMarkComplete('+pi+')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>Mark as Complete</button>'
    +       '<button class="pd-mark-incomplete" id="pd-markincomplete-'+pi+'" style="display:none" onclick="pdMarkIncomplete('+pi+')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-1"/></svg>Mark as Incomplete</button>'
    +       '<button class="pd-submit" id="pd-submit-'+pi+'" style="display:none" onclick="pdSubmitProduct('+pi+')">Submit</button>'
    +     '</div></div>'
    +   '<div class="pd-group-t">Packing &amp; palletisation</div>'
    +   '<div class="pd-fgrid">'
    +     '<div class="pd-field"><div class="pd-flabel">Packing Method</div><select class="pd-input" onchange="pdEditProduct('+pi+',\'packing\',this.value)">'+packOpts.map(function(o){return '<option'+(o===p.packing?' selected':'')+'>'+o+'</option>';}).join('')+'</select></div>'
    +     '<div class="pd-field"><div class="pd-flabel">Singles / Each per Case</div><input type="number" class="pd-input" value="'+(p.uc==null?'':p.uc)+'" oninput="pdEditProduct('+pi+',\'uc\',this.value)" placeholder="—"></div>'
    +     '<div class="pd-field"><div class="pd-flabel">Cases / Boxes per Pallet</div><input type="number" class="pd-input" value="'+(p.cp==null?'':p.cp)+'" oninput="pdEditProduct('+pi+',\'cp\',this.value)" placeholder="—"></div>'
    +     '<div class="pd-field"><div class="pd-flabel">Units per Pallet</div><div class="pd-input pd-readonly" id="pd-up-'+pi+'">'+up+'</div></div>'
    +   '</div>'
    + '</div>';

  var cards = p._pkgs.map(function(pkg,pk){
    var body = pkg.groups.map(function(grp,gi){
      var fields = grp.fields.map(function(fld,fi){ return pdFieldHTML(pi,pk,gi,fi,fld); }).join('');
      return '<div class="pd-group"><div class="pd-group-t">'+pdEsc(grp.title)+'</div><div class="pd-fgrid">'+fields+'</div></div>';
    }).join('');
    return '<div class="pd-card" id="pd-card-'+pi+'-'+pk+'">'
      + '<div class="pd-card-head" id="pd-head-'+pi+'-'+pk+'" onclick="pdToggleCard('+pi+','+pk+')">'+pdCardHeadInner(pi,pk)+'</div>'
      + '<div class="pd-card-body">'+body
      +   '<div class="pd-card-foot"><button class="pd-remove" onclick="pdRemoveComp('+pi+','+pk+')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/></svg>Remove packaging</button>'
      +   '<button class="pd-collapse" onclick="pdToggleCard('+pi+','+pk+')">Collapse ▲</button></div>'
      + '</div></div>';
  }).join('');
  if(!p._pkgs.length) cards = '<div class="pd-empty">No packaging components yet — add the first one.</div>';

  var comp = '<div class="pd-comp-hdr"><div class="pd-comp-title">Packaging components <span class="pd-comp-count">'+p._pkgs.length+'</span></div></div>'
    + '<div class="pd-hint">Tap a component to expand — every field can be edited on the spot.</div>'
    + '<div class="pd-comp-list">'+cards+'</div>'
    + '<button class="pd-add-card" id="pd-addcard-'+pi+'" onclick="event.stopPropagation();pdToggleAddMenu(this,'+pi+')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add packaging component</button>';

  document.getElementById('pd-body').innerHTML = '<div class="pd-wrap">'+head+comp+'</div>';
}
function pdEditField(pi,pk,gi,fi,val){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p||!p._pkgs) return;
  p._pkgs[pk].groups[gi].fields[fi].v = val;
  var head = document.getElementById('pd-head-'+pi+'-'+pk);
  if(head) head.innerHTML = pdCardHeadInner(pi,pk);
}
function pdEditProduct(pi,field,val){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0]; if(!p) return;
  if(field==='uc'||field==='cp'){ var n=parseInt(val,10); p[field] = (val===''||isNaN(n))?null:n; }
  else p[field] = val;
  var upEl = document.getElementById('pd-up-'+pi);
  if(upEl) upEl.textContent = (p.uc!=null && p.cp!=null) ? (p.uc*p.cp) : '—';
  prodRender();
}
function pdToggleCard(pi,pk){
  var card = document.getElementById('pd-card-'+pi+'-'+pk);
  if(card) card.classList.toggle('open');
}
function pdMarkComplete(pi){
  closeAllCompMenus();
  // highlight each packaging component row top → bottom
  var cards = document.querySelectorAll('#pd-body .pd-comp-list .pd-card');
  cards.forEach(function(c,i){ c.classList.remove('pd-hl'); setTimeout(function(){ c.classList.add('pd-hl'); }, i*220); });
  // remove the "Add packaging component" button
  var add = document.getElementById('pd-addcard-'+pi); if(add) add.style.display='none';
  // hide the Incomplete pill + Mark-complete button, reveal Submit
  var mc = document.getElementById('pd-markcomplete-'+pi); if(mc) mc.style.display='none';
  var st = document.getElementById('pd-status-'+pi); if(st) st.style.display='none';
  var delay = Math.max(0,(cards.length-1)*220)+300;
  var sub = document.getElementById('pd-submit-'+pi);
  if(sub) setTimeout(function(){ sub.style.display='inline-flex'; }, delay);
  var mi = document.getElementById('pd-markincomplete-'+pi);
  if(mi) setTimeout(function(){ mi.style.display='inline-flex'; }, delay);
}
/* Revert everything pdMarkComplete did, back to the editable "Incomplete" state. */
function pdMarkIncomplete(pi){
  var cards = document.querySelectorAll('#pd-body .pd-comp-list .pd-card');
  cards.forEach(function(c){ c.classList.remove('pd-hl'); });
  var add = document.getElementById('pd-addcard-'+pi); if(add) add.style.display='';
  var mc = document.getElementById('pd-markcomplete-'+pi); if(mc) mc.style.display='inline-flex';
  var st = document.getElementById('pd-status-'+pi); if(st) st.style.display='';
  var sub = document.getElementById('pd-submit-'+pi); if(sub) sub.style.display='none';
  var mi = document.getElementById('pd-markincomplete-'+pi); if(mi) mi.style.display='none';
}
function pdSubmitProduct(pi){
  if(typeof gsToast==='function') gsToast('Product submitted for review');
}
function pdAddComp(pi,key){
  closeAllCompMenus();
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  var comp = COMPONENT_LIBRARY_JS.find(function(c){return c.key===key;});
  if(p && comp){ p.comps.push(comp.name); if(!p._pkgs)p._pkgs=[]; p._pkgs.push(buildPkgData(comp.name)); prodRender(); renderProductDetail(pi); }
}
function pdRemoveComp(pi,pk){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  if(p && p._pkgs && pk>=0 && pk<p._pkgs.length){ p._pkgs.splice(pk,1); p.comps.splice(pk,1); prodRender(); renderProductDetail(pi); }
}
function pdToggleAddMenu(btn,pi){
  var existing = document.querySelector('.pcmp-menu[data-pi="'+pi+'"]');
  closeAllCompMenus();
  if(existing) return;
  openCompMenuAt(btn, pi, 'pdAddComp');
}

/* "Create a new component" → open the multi-step wizard, carrying the product
   name/code so it shows in the wizard's sticky header. */
function openNewCompWizard(pi){
  closeAllCompMenus();
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  if(p){ launchWizard(p.code, p.name, 'products', pi); }
}
/* Remembers how the wizard was entered so the save screen can return to the
   right listing and flash the newly-added component. */
var _wizCtx = { origin:'products', pi:null };
/* Hydrate the isolated wizard iframe from the inline template, injecting the
   product name/code so the wizard's sticky header shows the product. */
function launchWizard(code, name, origin, pi){
  var tpl = document.getElementById('wiz5tpl');
  if(!tpl) return;
  origin = (origin==='packaging') ? 'packaging' : 'products';
  _wizCtx = { origin:origin, pi:(pi==null?null:pi) };
  // No product context (launched from the packaging-components listing rather than
  // a specific product) → keep the header (so the packaging name still shows there)
  // but drop the product-specific "for <code> · <name>" line and SKU chip.
  var standalone = !name;
  var backLabel = origin==='packaging' ? 'Back to packaging components' : 'Back to products';
  var html = tpl.textContent
    .split('%%ENDSCRIPT%%').join('</'+'script>')
    .split('%%CODE%%').join(code || '')
    .split('%%NAME%%').join(name || 'New packaging component')
    .split('%%ORIGIN%%').join(origin)
    .split('%%BACKLABEL%%').join(backLabel);
  if(standalone){
    html = html.replace(/<div class="ph-forprod">[\s\S]*?<\/div>/, '')
               .replace(/<span class="ph-sku"[^>]*>[\s\S]*?<\/span>/, '');
  }
  var f = document.getElementById('wiz5-frame');
  if(f) f.srcdoc = html;
  go('wiz5');
}
/* Add a packaging component from the packaging-components listing (no product). */
function openStandaloneCompWizard(){ launchWizard('', '', 'packaging', null); }
/* Called by the wizard's success screen. Returns to the listing the user came
   from and flashes the newly-saved component. */
function gsWizardDone(origin, name, id){
  origin = (origin==='packaging') ? 'packaging' : 'products';
  go('sp2');
  if(typeof switchLandingTab==='function') switchLandingTab(origin==='packaging' ? 'packaging' : 'products');
  if(origin==='packaging'){
    gsFlashNewPackaging(name, id);
  } else {
    gsFlashProductRow(_wizCtx.pi);
    if(name && typeof gsToast==='function') gsToast('Component “'+name+'” added');
  }
}
/* Insert the new component at the top of the packaging-components table and
   play a brief highlight animation on it. */
function gsFlashNewPackaging(name, id){
  var tbody = document.getElementById('pkg-lib-tbody');
  if(!tbody) return;
  name = name || 'New component'; id = id || '';
  var tr = document.createElement('tr');
  tr.className = 'gs-row-flash';
  tr.style.cursor = 'pointer';
  tr.innerHTML =
    '<td class="pkg-tbl-name">'+name+(id?' <span style="font-size:10px;color:rgba(255,255,255,.45);font-weight:600">'+id+'</span>':'')+'</td>'
    + '<td><span class="pkg-level-pill-sm" style="background:#3aa8d822;color:#3aa8d8;border:1px solid #3aa8d855">Primary</span></td>'
    + '<td class="pkg-tbl-secondary">'+name+'</td>'
    + '<td class="pkg-tbl-secondary">—</td><td class="pkg-tbl-secondary">—</td><td class="pkg-tbl-secondary">—</td><td class="pkg-tbl-secondary">—</td>'
    + '<td><span class="pkg-status-pill incomplete">Incomplete</span></td>'
    + '<td class="pkg-tbl-actions" onclick="event.stopPropagation()"></td>';
  tbody.insertBefore(tr, tbody.firstChild);
  tr.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(function(){ tr.classList.remove('gs-row-flash'); }, 2000);
}
/* Flash the row of the product the wizard was launched from. */
function gsFlashProductRow(pi){
  if(pi==null) return;
  var tb = document.getElementById('prod-tbody');
  if(!tb) return;
  var row = tb.querySelector('tr[data-pi="'+pi+'"]') || tb.querySelector('tr[onclick*="openProductDetail('+pi+')"]');
  if(row){ row.classList.add('gs-row-flash'); row.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(function(){ row.classList.remove('gs-row-flash'); }, 2000); }
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.pcmp-menu') && !e.target.closest('.pcmp-add-btn')) closeAllCompMenus();
});
window.addEventListener('scroll', function(e){
  // Don't close when the scroll happens inside the menu itself (e.g. scrolling
  // the component list or dragging its scrollbar) — only on page/other scrolls.
  if(e.target && e.target.closest && e.target.closest('.pcmp-menu')) return;
  closeAllCompMenus();
}, true);
window.addEventListener('resize', closeAllCompMenus);

function prodMatches(p){
  if(prodState.filter!=="all" && p.status!==prodState.filter) return false;
  if(prodState.cat!=="all" && p.category!==prodState.cat) return false;
  if(prodState.q){
    var s = (p.code+" "+p.name+" "+p.category+" "+p.packing).toLowerCase();
    if(s.indexOf(prodState.q)<0) return false;
  }
  return true;
}

function prodSortVal(p,k){
  if(k==="comps") return p.comps.length;
  if(k==="uc") return (p.uc==null?-1:p.uc);
  if(k==="cp") return (p.cp==null?-1:p.cp);
  if(k==="up"){ var u=prodUnitsPallet(p); return (u==null?-1:u); }
  if(k==="status") return ({incomplete:0,none:1,complete:2,delisted:3})[p.status];
  if(k==="code") return p.code.toLowerCase();
  if(k==="category") return p.category.toLowerCase();
  if(k==="packing") return (p.packing||"").toLowerCase();
  return "";
}

function prodSort(key){
  if(prodState.sortKey===key){ prodState.sortDir = -prodState.sortDir; }
  else { prodState.sortKey = key; prodState.sortDir = 1; }
  prodState.page = 0;
  prodRender();
}

function prodGoto(cmd){
  var all = PRODUCTS.filter(prodMatches);
  var pages = Math.max(1, Math.ceil(all.length/prodState.size));
  if(cmd==="first") prodState.page = 0;
  else if(cmd==="prev") prodState.page = Math.max(0, prodState.page-1);
  else if(cmd==="next") prodState.page = Math.min(pages-1, prodState.page+1);
  else if(cmd==="last") prodState.page = pages-1;
  else { var n = parseInt(cmd,10); if(!isNaN(n)) prodState.page = n; }
  prodRender();
}

function updateProdArrows(){
  document.querySelectorAll('.prod-tbl thead th.prod-sortable').forEach(function(th){
    var arrow = th.querySelector('.prod-sort-arrow');
    if(th.getAttribute('data-sort')===prodState.sortKey){
      th.classList.add('sorted');
      if(arrow) arrow.textContent = prodState.sortDir===1 ? '▲' : '▼';
    } else {
      th.classList.remove('sorted');
      if(arrow) arrow.textContent = '↕';
    }
  });
}

function prodRender(){
  var tb = document.getElementById('prod-tbody');
  if(!tb) return;
  var all = PRODUCTS.filter(prodMatches);
  var key = prodState.sortKey, dir = prodState.sortDir;
  all.sort(function(a,b){
    var x = prodSortVal(a,key), y = prodSortVal(b,key);
    if(x<y) return -1*dir; if(x>y) return 1*dir;
    return a.id-b.id;
  });
  var total = all.length;
  var pages = Math.max(1, Math.ceil(total/prodState.size));
  if(prodState.page>=pages) prodState.page = pages-1;
  if(prodState.page<0) prodState.page = 0;
  var start = prodState.page*prodState.size;
  var slice = all.slice(start, start+prodState.size);

  tb.innerHTML = "";
  if(!slice.length){
    tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:26px;color:rgba(255,255,255,.4)">No matching products</td></tr>';
  } else {
    slice.forEach(function(p){ tb.insertAdjacentHTML('beforeend', prodRowHtml(p)); });
  }

  var from = total ? start+1 : 0;
  var to = Math.min(start+prodState.size, total);
  var cnt = document.getElementById('prod-count');
  if(cnt) cnt.innerHTML = 'Showing <strong>'+from+'–'+to+'</strong> of <strong>'+total+'</strong> products';

  var sel = document.getElementById('prod-page-jump');
  if(sel){
    sel.innerHTML = "";
    for(var i=0;i<pages;i++){
      var o = document.createElement('option');
      o.value = i; o.textContent = (i+1);
      if(i===prodState.page) o.selected = true;
      sel.appendChild(o);
    }
  }
  var pof = document.getElementById('prod-page-of'); if(pof) pof.textContent = 'of '+pages;
  var atFirst = prodState.page<=0, atLast = prodState.page>=pages-1;
  var b;
  if((b=document.getElementById('prod-first'))) b.disabled = atFirst;
  if((b=document.getElementById('prod-prev')))  b.disabled = atFirst;
  if((b=document.getElementById('prod-next')))  b.disabled = atLast;
  if((b=document.getElementById('prod-last')))  b.disabled = atLast;

  updateProdArrows();
}

var prodActiveFilter = 'all';
function setProductFilter(filter, btn){
  prodState.filter = filter; prodActiveFilter = filter; prodState.page = 0;
  document.querySelectorAll('.prod-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  prodRender();
}
function prodSetCategory(v){ prodState.cat = v; prodState.page = 0; prodRender(); }
function filterProductRows(){
  var el = document.getElementById('prod-search-input');
  prodState.q = (el && el.value ? el.value : "").toLowerCase().trim();
  prodState.page = 0;
  prodRender();
}
function submitProduct(pi){
  var p = PRODUCTS.filter(function(x){return x.id===pi;})[0];
  if(p){ p.type = "submitted"; p.status = "complete"; }
  prodRender();
}
if(document.getElementById('prod-tbody')) prodRender();

function downloadDoC(key) {
  var comp = COMPONENT_LIBRARY_JS.find(function(c){ return c.key === key; });
  var docRef = (comp && comp.doc_ref) ? comp.doc_ref : ('DOC-' + key);
  var name = (comp && comp.name) ? comp.name : key;
  var NL = String.fromCharCode(10);
  var content = "DECLARATION OF CONFORMITY" + NL + NL
    + "Reference: " + docRef + NL
    + "Component: " + name + NL
    + "Generated by: Greenstreets PPWR Compliance Platform" + NL
    + "Status: This is a demo download from the prototype." + NL;
  var blob = new Blob([content], {type: 'text/plain'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = docRef + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}


function filterCompMenu(input) {
  var menu = input.closest('.step-chip-menu') || input.closest('.sec-hdr-reuse-menu') || input.closest('.pcmp-menu');
  if(!menu) return;
  var query = input.value.toLowerCase().trim();
  var items = menu.querySelectorAll('.comp-lib-item');
  var anyVisible = false;
  items.forEach(function(item){
    var name = item.getAttribute('data-name') || '';
    var show = !query || name.indexOf(query) > -1;
    item.style.display = show ? '' : 'none';
    if(show) anyVisible = true;
  });
  var emptyMsg = menu.querySelector('.comp-menu-empty');
  if(!anyVisible){
    if(!emptyMsg){
      emptyMsg = document.createElement('div');
      emptyMsg.className = 'comp-menu-empty';
      emptyMsg.textContent = 'No components match your search';
      var itemsWrap = menu.querySelector('.comp-menu-items');
      if(itemsWrap) itemsWrap.appendChild(emptyMsg);
    }
    emptyMsg.style.display = '';
  } else if(emptyMsg){
    emptyMsg.style.display = 'none';
  }
}

// ── New multi-packaging landing page interactions ──────────────
function togglePkgCardMenu(pi, pkgIdx) {
  var menu = document.getElementById('pkgcard-menu-' + pi + '-' + pkgIdx);
  if(!menu) return;
  document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ if(m!==menu) m.classList.remove('open'); });
  menu.classList.toggle('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.pkg-pill-wrap')){
    document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ m.classList.remove('open'); });
  }
});

function assignPackagingComponent(pi, pkgIdx, key) {
  document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ m.classList.remove('open'); });
  var comp = COMPONENT_LIBRARY_JS.find(function(c){ return c.key === key; });
  if(!comp) return;
  var wrap = document.getElementById('pkgcard-' + pi + '-' + pkgIdx);
  if(wrap){
    var labelEl = wrap.querySelector('.pkg-pill-label');
    if(labelEl) labelEl.textContent = comp.name;
  }
}

function removePackaging(pi, pkgIdx) {
  var wrap = document.getElementById('pkgcard-' + pi + '-' + pkgIdx);
  if(!wrap) return;
  var pillBtn = wrap.querySelector('.pkg-pill');
  var removeBtn = wrap.querySelector('.pkg-pill-remove');
  // First click arms a confirm state (red flash + checkmark), second click within 3s actually removes.
  if(!wrap.classList.contains('pkg-pill-confirm-remove')){
    wrap.classList.add('pkg-pill-confirm-remove');
    if(removeBtn) removeBtn.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    if(removeBtn) removeBtn.title = 'Click again to confirm removal';
    wrap.dataset.removeTimer = setTimeout(function(){
      wrap.classList.remove('pkg-pill-confirm-remove');
      if(removeBtn){
        removeBtn.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        removeBtn.title = 'Remove';
      }
    }, 3000);
    return;
  }
  clearTimeout(wrap.dataset.removeTimer);
  wrap.remove();
}

function addPackaging(pi) {
  var row = null;
  document.querySelectorAll('.product-row-card').forEach(function(r){
    if(r.querySelector('.product-row-pills [id^="pkgcard-' + pi + '-"]') || r.querySelector('.product-row-name[onclick*="s_1_' + pi + '"]')) row = r;
  });
  if(!row) {
    // Fallback: find by position if no pills exist yet
    var allRows = document.querySelectorAll('.product-row-card');
    row = allRows[pi];
  }
  if(!row) return;
  var col = row.querySelector('.product-row-pills');
  if(!col) return;
  var addBtn = col.querySelector('.pkg-add-btn-v3');
  var newIdx = col.querySelectorAll('.pkg-pill-wrap').length;
  var wrap = document.createElement('div');
  wrap.className = 'pkg-pill-wrap';
  wrap.id = 'pkgcard-' + pi + '-' + newIdx;
  var menuItems = COMPONENT_LIBRARY_JS.map(function(c){
    return '<div class="comp-lib-item" data-name="' + c.name.toLowerCase() + '" onclick="event.stopPropagation();assignPackagingComponent(' + pi + ',' + newIdx + ',' + String.fromCharCode(39) + c.key + String.fromCharCode(39) + ')">'
      + '<img src="' + c.img + '" alt="' + c.name + '" class="comp-lib-img">'
      + '<div class="comp-lib-info"><div class="comp-lib-name">' + c.name + '</div><div class="comp-lib-ref">' + c.level.charAt(0).toUpperCase()+c.level.slice(1) + '</div></div></div>';
  }).join('');
  wrap.innerHTML = '<button class="pkg-pill" onclick="go(' + String.fromCharCode(39) + 's_2_' + pi + String.fromCharCode(39) + ')" title="Edit this packaging">'
    + '<span class="pkg-pill-label">New packaging</span>'
    + '<span class="pkg-pill-caret" onclick="event.stopPropagation();togglePkgCardMenu(' + pi + ',' + newIdx + ')"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>'
    + '<span class="pkg-pill-remove" onclick="event.stopPropagation();removePackaging(' + pi + ',' + newIdx + ')" title="Remove"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>'
    + '</button>'
    + '<div class="step-chip-menu" id="pkgcard-menu-' + pi + '-' + newIdx + '"><div class="product-card-menu-hdr">Choose a saved component</div>'
    + '<div class="comp-menu-search-wrap"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="comp-menu-search" placeholder="Search components..." onclick="event.stopPropagation()" oninput="filterCompMenu(this)"></div>'
    + '<div class="comp-menu-items">' + menuItems + '</div>'
    + '<button class="comp-menu-create-new" onclick="event.stopPropagation();go(' + String.fromCharCode(39) + 's_2_' + pi + String.fromCharCode(39) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Create a new package</button>'
    + '</div>';
  col.insertBefore(wrap, addBtn);
}

/* ── Packaging component table functions ── */
function togglePkgAddMenu(pi) {
  var menu = document.getElementById('pkg-add-menu-' + pi);
  if (!menu) return;
  document.querySelectorAll('.pkg-table-add-menu.open').forEach(function(m){ if(m!==menu) m.classList.remove('open'); });
  document.querySelectorAll('.step-chip-menu.open,.sec-hdr-reuse-menu.open').forEach(function(m){ m.classList.remove('open'); });
  menu.classList.toggle('open');
}



/* ── Packaging library table ── */
var _pkgTblFilter = 'all';      /* level */
var _pkgTblSearch = '';
var _pkgTblStatus = 'all';
var _pkgTblMaterial = 'all';
var _pkgTblRecycled = 'all';
var _pkgTblSort = { col: -1, dir: 1 };  /* col index, 1 asc / -1 desc */
var _pkgTblPage = 0;
var PKG_PAGE_SIZE = 8;

/* Column indexes: 0 Name,1 Level,2 Description,3 Material,4 Weight,5 Dimensions,6 Recycled,7 Status */
function pkgCellText(row, col) {
  var td = row.children[col];
  return td ? (td.textContent || '').trim() : '';
}
/* Numeric sort helpers: weight normalised to grams, recycled to a percentage. */
function pkgWeightGrams(txt) {
  var m = (txt || '').match(/([\d.]+)\s*(kg|g)?/i);
  if (!m) return 0;
  var v = parseFloat(m[1]) || 0;
  return /kg/i.test(m[2] || '') ? v * 1000 : v;
}
function pkgRecycledPct(txt) { var m = (txt || '').match(/([\d.]+)\s*%/); return m ? parseFloat(m[1]) : 0; }
var PKG_LEVEL_ORDER = { 'Primary': 1, 'Secondary': 2, 'Tertiary': 3 };
var PKG_STATUS_ORDER = { 'Compliant': 1, 'Review needed': 2, 'Incomplete': 3 };

function filterPkgTblSearch() {
  _pkgTblSearch = (document.getElementById('pkg-tbl-search').value || '').toLowerCase();
  _pkgTblPage = 0;
  renderPkgTable();
}
function setPkgTblFilter(level, btn) {
  _pkgTblFilter = level;
  _pkgTblPage = 0;
  document.querySelectorAll('#pkg-tbl-level-filters .pkg-level-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  else { var m = document.querySelector('#pkg-tbl-level-filters [data-level="' + level + '"]'); if (m) m.classList.add('active'); }
  renderPkgTable();
}
function setPkgTblStatus(v) { _pkgTblStatus = v; _pkgTblPage = 0; var s = document.getElementById('pkg-tbl-status'); if (s) s.value = v; renderPkgTable(); }
function setPkgTblMaterial(v) { _pkgTblMaterial = v; _pkgTblPage = 0; var s = document.getElementById('pkg-tbl-material'); if (s) s.value = v; renderPkgTable(); }
function setPkgTblRecycled(v) { _pkgTblRecycled = v; _pkgTblPage = 0; var s = document.getElementById('pkg-tbl-recycled'); if (s) s.value = v; renderPkgTable(); }
function goPage(p) { _pkgTblPage = p; renderPkgTable(); }

/* Click a column header to sort; click again to reverse. */
function sortPkgTable(col) {
  if (_pkgTblSort.col === col) _pkgTblSort.dir *= -1;
  else { _pkgTblSort.col = col; _pkgTblSort.dir = 1; }
  var tbody = document.getElementById('pkg-lib-tbody');
  if (!tbody) return;
  var rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort(function(a, b) {
    var av, bv;
    if (col === 4) { av = pkgWeightGrams(pkgCellText(a, 4)); bv = pkgWeightGrams(pkgCellText(b, 4)); }
    else if (col === 6) { av = pkgRecycledPct(pkgCellText(a, 6)); bv = pkgRecycledPct(pkgCellText(b, 6)); }
    else if (col === 1) { av = PKG_LEVEL_ORDER[pkgCellText(a, 1)] || 99; bv = PKG_LEVEL_ORDER[pkgCellText(b, 1)] || 99; }
    else if (col === 7) { av = PKG_STATUS_ORDER[pkgCellText(a, 7)] || 99; bv = PKG_STATUS_ORDER[pkgCellText(b, 7)] || 99; }
    else { av = pkgCellText(a, col).toLowerCase(); bv = pkgCellText(b, col).toLowerCase(); return av.localeCompare(bv) * _pkgTblSort.dir; }
    return (av - bv) * _pkgTblSort.dir;
  });
  rows.forEach(function(r){ tbody.appendChild(r); });
  document.querySelectorAll('#pkg-lib-table thead th').forEach(function(th, i){
    th.classList.remove('sorted-asc', 'sorted-desc');
    var arrow = th.querySelector('.sort-arrow');
    if (i === col) { th.classList.add(_pkgTblSort.dir === 1 ? 'sorted-asc' : 'sorted-desc'); if (arrow) arrow.textContent = _pkgTblSort.dir === 1 ? '↑' : '↓'; }
    else if (arrow) arrow.textContent = '↕';
  });
  _pkgTblPage = 0;
  renderPkgTable();
}

/* Clicking a Level / Material / Recycled / Status value filters the table by it. */
function pkgInitCellFilters() {
  var tbody = document.getElementById('pkg-lib-tbody');
  if (!tbody) return;
  /* mark the filterable columns so they show the clickable affordance */
  tbody.querySelectorAll('tr').forEach(function(r){
    [1, 3, 6, 7].forEach(function(c){ if (r.children[c]) r.children[c].classList.add('filterable'); });
  });
  tbody.addEventListener('click', function(e){
    var td = e.target.closest('td');
    if (!td) return;
    var col = Array.prototype.indexOf.call(td.parentNode.children, td);
    if (col === 1) { e.stopPropagation(); setPkgTblFilter(td.textContent.trim()); }
    else if (col === 3) { e.stopPropagation(); setPkgTblMaterial(td.textContent.trim()); }
    else if (col === 7) { e.stopPropagation(); setPkgTblStatus(td.textContent.trim()); }
    else if (col === 6) { e.stopPropagation(); var p = pkgRecycledPct(td.textContent); setPkgTblRecycled(p === 0 ? '0' : (p >= 50 ? 'high' : 'low')); }
  }, true);
}

/* Populate the Material dropdown from the distinct materials in the table. */
function pkgInitMaterialFilter() {
  var sel = document.getElementById('pkg-tbl-material');
  var tbody = document.getElementById('pkg-lib-tbody');
  if (!sel || !tbody) return;
  var seen = {};
  tbody.querySelectorAll('tr').forEach(function(r){ var m = pkgCellText(r, 3); if (m && !seen[m]) seen[m] = true; });
  Object.keys(seen).sort().forEach(function(m){ var o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o); });
}

function pkgRecycledMatches(pct) {
  if (_pkgTblRecycled === 'all') return true;
  if (_pkgTblRecycled === '0') return pct === 0;
  if (_pkgTblRecycled === 'low') return pct > 0 && pct < 50;
  if (_pkgTblRecycled === 'high') return pct >= 50;
  return true;
}

function renderPkgActiveFilters() {
  var bar = document.getElementById('pkg-active-filters');
  if (!bar) return;
  var chips = [];
  if (_pkgTblFilter !== 'all') chips.push({ label: 'Level: ' + _pkgTblFilter, clear: "setPkgTblFilter('all')" });
  if (_pkgTblStatus !== 'all') chips.push({ label: 'Status: ' + _pkgTblStatus, clear: "setPkgTblStatus('all')" });
  if (_pkgTblMaterial !== 'all') chips.push({ label: 'Material: ' + _pkgTblMaterial, clear: "setPkgTblMaterial('all')" });
  if (_pkgTblRecycled !== 'all') { var rl = { '0': '0%', 'low': '1–49%', 'high': '50%+' }[_pkgTblRecycled]; chips.push({ label: 'Recycled: ' + rl, clear: "setPkgTblRecycled('all')" }); }
  if (!chips.length) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = chips.map(function(c){
    return '<span class="pkg-filter-chip">' + c.label + '<button title="Remove" onclick="' + c.clear + '">×</button></span>';
  }).join('') + '<button class="pkg-filter-clear-all" onclick="clearPkgFilters()">Clear all</button>';
}
function clearPkgFilters() {
  _pkgTblStatus = 'all'; _pkgTblMaterial = 'all'; _pkgTblRecycled = 'all';
  ['pkg-tbl-status', 'pkg-tbl-material', 'pkg-tbl-recycled'].forEach(function(id){ var s = document.getElementById(id); if (s) s.value = 'all'; });
  setPkgTblFilter('all');
}

function renderPkgTable() {
  var tbody = document.getElementById('pkg-lib-tbody');
  if (!tbody) return;
  var rows = Array.from(tbody.querySelectorAll('tr'));
  var visible = rows.filter(function(r) {
    var name = pkgCellText(r, 0);
    var level = pkgCellText(r, 1);
    var desc = pkgCellText(r, 2);
    var material = pkgCellText(r, 3);
    var status = pkgCellText(r, 7);
    var recycled = pkgRecycledPct(pkgCellText(r, 6));
    var matchesLevel = _pkgTblFilter === 'all' || level === _pkgTblFilter;
    var matchesStatus = _pkgTblStatus === 'all' || status === _pkgTblStatus;
    var matchesMaterial = _pkgTblMaterial === 'all' || material === _pkgTblMaterial;
    var matchesRecycled = pkgRecycledMatches(recycled);
    var matchesSearch = !_pkgTblSearch || (name + ' ' + desc + ' ' + material).toLowerCase().includes(_pkgTblSearch);
    return matchesLevel && matchesStatus && matchesMaterial && matchesRecycled && matchesSearch;
  });
  var totalPages = Math.max(1, Math.ceil(visible.length / PKG_PAGE_SIZE));
  if (_pkgTblPage >= totalPages) _pkgTblPage = 0;
  rows.forEach(function(r){ r.style.display = 'none'; });
  visible.slice(_pkgTblPage * PKG_PAGE_SIZE, (_pkgTblPage + 1) * PKG_PAGE_SIZE).forEach(function(r){ r.style.display = ''; });
  /* update new prev/next/jump pagination */
  var prevBtn = document.getElementById('pkg-pg-prev');
  var nextBtn = document.getElementById('pkg-pg-next');
  var jumpSel = document.getElementById('pkg-pg-jump');
  var ofLbl   = document.getElementById('pkg-pg-of');
  if (prevBtn) prevBtn.disabled = (_pkgTblPage <= 0);
  if (nextBtn) nextBtn.disabled = (_pkgTblPage >= totalPages - 1);
  if (ofLbl)   ofLbl.textContent = 'of ' + totalPages;
  if (jumpSel) {
    jumpSel.innerHTML = '';
    for (var i = 0; i < totalPages; i++) {
      var o = document.createElement('option');
      o.value = i; o.textContent = i + 1;
      if (i === _pkgTblPage) o.selected = true;
      jumpSel.appendChild(o);
    }
  }
  var pgInfo = document.getElementById('pkg-pg-info') || document.getElementById('pg-info');
  if (pgInfo) pgInfo.textContent = visible.length + ' result' + (visible.length !== 1 ? 's' : '');
  var countEl = document.getElementById('pkg-tbl-count');
  if (countEl) countEl.textContent = visible.length + ' component' + (visible.length !== 1 ? 's' : '');
  renderPkgActiveFilters();
}
/* Pkg table pagination helpers */
function pkgGotoPrev() { if (_pkgTblPage > 0) { _pkgTblPage--; renderPkgTable(); } }
function pkgGotoNext() {
  var tbody = document.getElementById('pkg-lib-tbody');
  if (!tbody) return;
  var all = Array.from(tbody.querySelectorAll('tr'));
  var vis = all.filter(function(r){ return r.style.display !== 'none'; });
  var totalPages = Math.max(1, Math.ceil((vis.length + _pkgTblPage * PKG_PAGE_SIZE) / PKG_PAGE_SIZE));
  /* easier: just check against the current page count from the select */
  var jumpSel = document.getElementById('pkg-pg-jump');
  var maxPage = jumpSel ? jumpSel.options.length - 1 : 0;
  if (_pkgTblPage < maxPage) { _pkgTblPage++; renderPkgTable(); }
}
function pkgGotoPage(p) { _pkgTblPage = p; renderPkgTable(); }
/* Run on load */
document.addEventListener('DOMContentLoaded', function(){ pkgInitMaterialFilter(); pkgInitCellFilters(); renderPkgTable(); });


/* ── Per-section edit on detail page ── */
function toggleSectionEdit(sectionEl, btn) {
  var isActive = sectionEl.classList.toggle('pkg-sec-edit-mode');
  btn.classList.toggle('active', isActive);
  /* Make free-text fields actually editable while the section is in edit mode. */
  sectionEl.querySelectorAll('.pkg-detail-feat-input.editable-text').forEach(function(inp){ inp.readOnly = !isActive; });
  btn.innerHTML = isActive
    ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save'
    : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit';
}

/* ── Dynamic materials on the packaging detail page ──
   The Material Information section ships with fixed Material 1–4 slots. These
   helpers let a user add as many materials as needed while editing, and remove
   the ones they don't use. Controls are injected into every detail screen's
   Material section on load and are only visible in section edit mode. */
function pkgMatBuildFeat(n, type) {
  var feat = document.createElement('div');
  feat.className = 'pkg-detail-feat';
  feat.setAttribute('data-mr', n);
  feat.setAttribute('data-mt', type);
  var lbl = document.createElement('div');
  lbl.className = 'pkg-detail-feat-lbl pkg-detail-feat-lbl-row';
  var lblText = document.createElement('span');
  lblText.textContent = (type === 'pct' ? '% Material ' + n : 'Material ' + n + ' Name');
  lbl.appendChild(lblText);
  if (type === 'name') {
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'pkg-mat-remove';
    rm.title = 'Remove this material';
    rm.setAttribute('onclick', 'pkgRemoveMaterial(this)');
    rm.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    lbl.appendChild(rm);
  }
  var inp = document.createElement('input');
  inp.className = 'pkg-detail-feat-input editable-text';
  inp.value = '';
  inp.placeholder = (type === 'pct' ? 'e.g. 20%' : 'Enter material');
  inp.readOnly = false; /* section is in edit mode when Add is clickable */
  if (type === 'name') inp.setAttribute('oninput', "pkgSyncMatCount(this.closest('.pkg-detail-grid'))");
  feat.appendChild(lbl);
  feat.appendChild(inp);
  return feat;
}

function pkgEnterSectionEdit(el) {
  var section = el.closest('.pkg-detail-section');
  if (section && !section.classList.contains('pkg-sec-edit-mode')) {
    var eb = section.querySelector('.sec-edit-btn');
    if (eb) toggleSectionEdit(section, eb);
  }
  return section;
}

function pkgAddMaterial(btn) {
  /* Add is visible in view mode too — make sure we're editing first. */
  pkgEnterSectionEdit(btn);
  var grid = btn.closest('.pkg-detail-grid');
  if (!grid) return;
  var max = 0;
  grid.querySelectorAll('[data-mr]').forEach(function(el){
    var n = parseInt(el.getAttribute('data-mr'), 10);
    if (n > max) max = n;
  });
  var n = max + 1;
  var nameFeat = pkgMatBuildFeat(n, 'name');
  var pctFeat = pkgMatBuildFeat(n, 'pct');
  grid.insertBefore(nameFeat, btn);
  grid.insertBefore(pctFeat, btn);
  pkgSyncMatCount(grid);
  var inp = nameFeat.querySelector('input');
  if (inp) inp.focus();
}

function pkgRemoveMaterial(btn) {
  var feat = btn.closest('[data-mr]');
  if (!feat) return;
  var grid = feat.closest('.pkg-detail-grid');
  var mr = feat.getAttribute('data-mr');
  grid.querySelectorAll('[data-mr="' + mr + '"]').forEach(function(el){ el.remove(); });
  pkgRenumberMaterials(grid);
  pkgSyncMatCount(grid);
}

/* Re-label remaining material rows 1..k in DOM order after a removal. */
function pkgRenumberMaterials(grid) {
  var order = [];
  grid.querySelectorAll('[data-mr]').forEach(function(el){
    var mr = el.getAttribute('data-mr');
    if (order.indexOf(mr) === -1) order.push(mr);
  });
  order.forEach(function(oldMr, i){
    var n = i + 1;
    grid.querySelectorAll('[data-mr="' + oldMr + '"]').forEach(function(el){
      el.setAttribute('data-mr', 'r' + n); /* temp prefix to avoid collisions */
      var type = el.getAttribute('data-mt');
      var lbl = el.querySelector('.pkg-detail-feat-lbl span, .pkg-detail-feat-lbl');
      if (lbl) {
        var target = el.querySelector('.pkg-detail-feat-lbl span') || lbl;
        target.textContent = (type === 'pct' ? '% Material ' + n : 'Material ' + n + ' Name');
      }
    });
  });
  /* strip the temp prefix */
  grid.querySelectorAll('[data-mr^="r"]').forEach(function(el){
    el.setAttribute('data-mr', el.getAttribute('data-mr').slice(1));
  });
}

/* Keep "No. of Materials Used" in sync with how many materials are actually filled in. */
function pkgSyncMatCount(grid) {
  var section = grid.closest('.pkg-detail-section');
  if (!section) return;
  var count = 0;
  grid.querySelectorAll('[data-mr][data-mt="name"] input').forEach(function(inp){
    var v = (inp.value || '').trim();
    if (v && v !== '—') count++;
  });
  var feats = section.querySelectorAll('.pkg-detail-feat');
  for (var i = 0; i < feats.length; i++) {
    var lbl = feats[i].querySelector('.pkg-detail-feat-lbl');
    if (lbl && lbl.textContent.trim().toLowerCase().indexOf('no. of materials used') === 0) {
      var inp = feats[i].querySelector('.pkg-detail-feat-input');
      var sel = feats[i].querySelector('.pkg-detail-feat-select');
      if (inp) inp.value = String(count);
      if (sel) {
        var has = false;
        for (var j = 0; j < sel.options.length; j++) { if (sel.options[j].value === String(count) || sel.options[j].text === String(count)) { has = true; sel.selectedIndex = j; break; } }
        if (!has && count > 0) { var o = document.createElement('option'); o.text = String(count); o.selected = true; sel.appendChild(o); }
      }
      break;
    }
  }
}

/* Inject the "+ Add material" button and per-row remove buttons into every
   Material Information section on the detail screens. */
function pkgInitMaterialControls() {
  document.querySelectorAll('.pkg-detail-section').forEach(function(section){
    var grid = section.querySelector('.pkg-detail-grid');
    if (!grid || !grid.querySelector('[data-mr]')) return;
    if (grid.querySelector('.pkg-mat-add-btn')) return; /* already initialised */

    /* add a remove control to each existing material name row */
    grid.querySelectorAll('[data-mr][data-mt="name"]').forEach(function(feat){
      var nameInp = feat.querySelector('.pkg-detail-feat-input');
      if (nameInp && !nameInp.getAttribute('oninput')) nameInp.setAttribute('oninput', "pkgSyncMatCount(this.closest('.pkg-detail-grid'))");
      var lbl = feat.querySelector('.pkg-detail-feat-lbl');
      if (!lbl || lbl.querySelector('.pkg-mat-remove')) return;
      lbl.classList.add('pkg-detail-feat-lbl-row');
      var txt = lbl.textContent;
      lbl.innerHTML = '';
      var span = document.createElement('span');
      span.textContent = txt;
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'pkg-mat-remove';
      rm.title = 'Remove this material';
      rm.setAttribute('onclick', 'pkgRemoveMaterial(this)');
      rm.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      lbl.appendChild(span);
      lbl.appendChild(rm);
    });

    /* find the "Total of all Materials" row to insert the Add button before it */
    var totalFeat = null;
    grid.querySelectorAll('.pkg-detail-feat').forEach(function(feat){
      if (feat.hasAttribute('data-mr')) return;
      var lbl = feat.querySelector('.pkg-detail-feat-lbl');
      if (lbl && lbl.textContent.trim().toLowerCase().indexOf('total of all') === 0) totalFeat = feat;
    });
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'pkg-mat-add-btn';
    addBtn.setAttribute('onclick', 'pkgAddMaterial(this)');
    addBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> Add material';
    if (totalFeat) grid.insertBefore(addBtn, totalFeat);
    else grid.appendChild(addBtn);
  });
}
document.addEventListener('DOMContentLoaded', pkgInitMaterialControls);

/* Clicking a picklist-backed field in view mode enters edit mode and opens the
   dropdown, so the chevron affordance is actually functional. */
document.addEventListener('click', function(e){
  var inp = e.target.closest && e.target.closest('.pkg-detail-feat-input');
  if (!inp) return;
  var feat = inp.closest('.pkg-detail-feat');
  var sel = feat && feat.querySelector('.pkg-detail-feat-select');
  if (!sel) return;
  var section = inp.closest('.pkg-detail-section');
  if (section && section.classList.contains('pkg-sec-edit-mode')) return; /* already editing */
  pkgEnterSectionEdit(inp);
  if (sel) { try { sel.focus(); } catch(_) {} }
});

function toggleSecHdrMenu(sectionNum, pi) {
  var menu = document.getElementById('sechdr-menu-' + sectionNum + '-' + pi);
  if(!menu) return;
  document.querySelectorAll('.sec-hdr-reuse-menu.open').forEach(function(m){ if(m!==menu) m.classList.remove('open'); });
  menu.classList.toggle('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.pkg-table-add-btn')){
    document.querySelectorAll('.pkg-table-add-menu.open').forEach(function(m){ m.classList.remove('open'); });
  }
});

document.addEventListener('click', function(e){
  if(!e.target.closest('.sec-hdr-reuse-wrap')){
    document.querySelectorAll('.sec-hdr-reuse-menu.open').forEach(function(m){ m.classList.remove('open'); });
  }
});

function reuseComponentInForm(key, sectionNum, pi) {
  // Close the menu
  document.querySelectorAll('.sec-hdr-reuse-menu.open').forEach(function(m){ m.classList.remove('open'); });

  var comp = COMPONENT_LIBRARY_JS.find(function(c){ return c.key === key; });
  if(!comp) return;
  var screen = document.getElementById('s_' + sectionNum + '_' + pi);
  if(!screen) return;

  function setSelectByText(el, text) {
    if(!el) return false;
    for(var i=0;i<el.options.length;i++){
      if(el.options[i].text === text){ el.selectedIndex = i; return true; }
    }
    return false;
  }
  function setRadioByValue(name, value) {
    var radio = screen.querySelector('[name="'+name+'"][value="'+value+'"]');
    if(radio){ radio.checked = true; return true; }
    return false;
  }
  function setNumberField(el, value) {
    if(!el) return false;
    var num = parseFloat(value);
    if(isNaN(num)) return false;
    el.value = num;
    return true;
  }
  function clearAIPending(el) {
    if(el && el.classList) { el.classList.remove('fi-ai-pending'); el.style.paddingRight = ''; }
  }

  var filled = [];

  // Section-specific mapping — only touch fields that actually exist on this section's screen
  var pkgType = screen.querySelector('[id="pkg_type"]');
  if(pkgType && comp.pkg_type){ if(setSelectByText(pkgType, comp.pkg_type)){ clearAIPending(pkgType); filled.push('Packaging Type'); } }

  var baseMat = screen.querySelector('[id="base_mat"]');
  if(baseMat && comp.material){
    // base_mat uses underscore category names — try direct match first
    if(setSelectByText(baseMat, comp.material)){ clearAIPending(baseMat); filled.push('Base Material'); }
  }
  var mat1n = screen.querySelector('[id="mat1n"]');
  if(mat1n && comp.material){ if(setSelectByText(mat1n, comp.material)){ clearAIPending(mat1n); filled.push('Material 1 Name'); } }
  var mat1p = screen.querySelector('[id="mat1p"]');
  if(mat1p){ setNumberField(mat1p, 100); }

  var colourRadio = screen.querySelector('[name="colour"]');
  if(colourRadio && comp.colour){ if(setRadioByValue('colour', comp.colour)) filled.push('Colour'); }

  var weightEl = screen.querySelector('[id="weight"]');
  if(weightEl && comp.weight){
    var weightNum = parseFloat(comp.weight);
    if(!isNaN(weightNum)){ weightEl.value = weightNum; clearAIPending(weightEl); filled.push('Weight'); }
  }

  var certEl = screen.querySelector('[id="cert"]');
  if(certEl && comp.cert){ if(setSelectByText(certEl, comp.cert)){ clearAIPending(certEl); filled.push('Certification'); } }

  var recycledRadio = screen.querySelector('[name="recycled_yn"]');
  if(recycledRadio && comp.recycled){
    var isYes = comp.recycled.indexOf('0%') !== 0;  // "0% PCR" -> No, anything else -> Yes
    setRadioByValue('recycled_yn', isYes ? 'Yes' : 'No');
    filled.push('Recycled content');
    var pcrEl = screen.querySelector('[id="pcr_pct"]');
    if(pcrEl){
      var pctMatch = comp.recycled.match(/(\d+)%/);
      if(pctMatch){ pcrEl.value = pctMatch[1]; filled.push('PCR %'); }
    }
  }

  // Brief visual confirmation on the section card itself
  var card = screen.querySelector('.sec-hdr-reuse-btn');
  if(card){
    var original = card.innerHTML;
    card.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>Applied ' + comp.name + '</span>';
    setTimeout(function(){ card.innerHTML = original; }, 1800);
  }
}

function switchLandingTab(tab) {
  document.querySelectorAll('.landing-tab').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.landing-tab-panel').forEach(function(p){
    p.classList.remove('active');
    p.style.display = 'none';
  });
  var btn = document.getElementById('tab-btn-' + tab);
  var panel = document.getElementById('tab-panel-' + tab);
  if(btn) btn.classList.add('active');
  if(panel){ panel.classList.add('active'); panel.style.display = 'block'; }
}

var pkgActiveLevel = 'all';
function setPkgLevelFilter(level, btn) {
  pkgActiveLevel = level;
  document.querySelectorAll('.pkg-level-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  filterPkgTable();
}
function filterPkgTable() {
  var query = (document.getElementById('pkg-search-input').value || '').toLowerCase().trim();
  var rows = document.querySelectorAll('#pkg-comp-tbody .pkg-row-card');
  var visible = 0;
  rows.forEach(function(row){
    var matchesLevel = (pkgActiveLevel === 'all') || (row.getAttribute('data-level') === pkgActiveLevel);
    var matchesSearch = !query || row.getAttribute('data-name').indexOf(query) > -1;
    var show = matchesLevel && matchesSearch;
    row.style.display = show ? '' : 'none';
    if(show) visible++;
  });
  var footer = document.getElementById('pkg-comp-footer');
  if(footer) footer.textContent = 'Showing ' + visible + ' of ' + rows.length + ' saved components';
}

function acceptAIOnField(btn) {
  // Field already holds the AI value (pre-filled) — just mark it as resolved (remove purple ring + overlay)
  var badge = btn.closest('.ai-onfield');
  if(!badge) return;
  var wrap = badge.closest('.fi-wrap');
  if(wrap){
    var field = wrap.querySelector('.fi-ai-pending');
    if(field){ field.classList.remove('fi-ai-pending'); field.style.paddingRight=''; }
  }
  badge.classList.add('ai-resolved');
}
function dismissAIOnField(btn) {
  // Clear the field value and remove the AI styling — user types fresh
  var badge = btn.closest('.ai-onfield');
  if(!badge) return;
  var wrap = badge.closest('.fi-wrap');
  if(wrap){
    var field = wrap.querySelector('.fi-ai-pending');
    if(field){
      field.classList.remove('fi-ai-pending');
      field.style.paddingRight='';
      if(field.tagName==='SELECT'){ field.selectedIndex=0; } else { field.value=''; }
    }
  }
  badge.classList.add('ai-resolved');
}
function acceptChipAI(btn) {
  // The chip's radio is NOT auto-checked — accepting means: check it now
  var label = btn.closest('label.chip');
  if(!label) return;
  var radio = label.querySelector('input');
  if(radio) radio.checked = true;
  var tag = btn.closest('.chip-ai-tag');
  if(tag) tag.classList.add('chip-ai-resolved');
  label.classList.remove('chip-ai-pending');
}
function dismissChipAI(btn) {
  var label = btn.closest('label.chip');
  if(!label) return;
  var tag = btn.closest('.chip-ai-tag');
  if(tag) tag.classList.add('chip-ai-resolved');
  label.classList.remove('chip-ai-pending');
}

function toggleChipMenu(sectionNum, pi) {
  var menu = document.getElementById('chip-menu-' + sectionNum + '-' + pi);
  if(!menu) return;
  document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ if(m!==menu) m.classList.remove('open'); });
  menu.classList.toggle('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.step-chip-v2-wrap') && !e.target.closest('.step-chip-menu')){
    document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ m.classList.remove('open'); });
  }
});
function reuseComponentInSection(key, sectionNum, pi) {
  // Close the menu
  document.querySelectorAll('.step-chip-menu.open').forEach(function(m){ m.classList.remove('open'); });
  // Mark this chip as complete (green) — do NOT navigate. In production this would also
  // pre-fill the section's fields in the background from the saved component's data.
  var wrapEl = document.getElementById('chipwrap-' + sectionNum + '-' + pi);
  var labelEl = document.getElementById('chip-' + sectionNum + '-' + pi);
  if(wrapEl){
    wrapEl.style.background = 'rgba(78,187,129,.16)';
    wrapEl.style.borderColor = 'rgba(78,187,129,.4)';
    wrapEl.setAttribute('data-reused', key);
  }
  if(labelEl){
    labelEl.style.color = '#4ebb81';
  }
}




/* ── Document picker (used by Supporting Evidence + Supporting Docs sections) ── */
var _pickerTarget = null;
var _LIBRARY_DOCS = [
  {name:'FSC_CoC_Certificate_2026.pdf',           type:'FSC Certification'},
  {name:'REACH_Compliance_Declaration_2026.pdf',  type:'REACH Declaration'},
  {name:'RecycledContent_SupplierDeclaration_Apr2026.pdf', type:'Supplier Declaration'},
  {name:'HeavyMetals_TestReport_Q1_2026.xlsx',    type:'Test Report'},
  {name:'PEFC_WoodCertification_Pallet_2026.pdf', type:'PEFC Certification'},
  {name:'OEKOTEX_Certificate_SwingTag_2026.pdf',  type:'OEKOTEX Certification'}
];

function openPicker(chipsId) {
  _pickerTarget = chipsId;
  var old = document.getElementById('_docpicker');
  if (old) old.remove();

  var items = _LIBRARY_DOCS.map(function(d) {
    var clr = d.name.endsWith('.xlsx') ? '#5b9cf6' : '#e05252';
    return '<div class="dpick-item" onclick="pickerSelect(' + JSON.stringify(d.name) + ')">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + clr + '" stroke-width="2" style="flex-shrink:0">'
      + '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
      + '<polyline points="14 2 14 8 20 8"/></svg>'
      + '<div><div class="dpick-name">' + d.name + '</div>'
      + '<div class="dpick-type">' + d.type + '</div></div>'
      + '</div>';
  }).join('');

  var el = document.createElement('div');
  el.id = '_docpicker';
  el.className = 'dpick-overlay';
  el.innerHTML = '<div class="dpick-box">'
    + '<div class="dpick-hdr">'
    + '<span>Link a supporting document</span>'
    + '<button onclick="closePicker()">&#10005;</button>'
    + '</div>'
    + '<div class="dpick-list">' + items + '</div>'
    + '<div class="dpick-upload">'
    + '<label>'
    + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
    + ' Upload new document'
    + '<input type="file" style="display:none" onchange="pickerUpload(this)">'
    + '</label>'
    + '</div>'
    + '</div>';
  el.addEventListener('click', function(e) { if (e.target === el) closePicker(); });
  document.body.appendChild(el);
}

function closePicker() {
  var el = document.getElementById('_docpicker');
  if (el) el.remove();
  _pickerTarget = null;
}

function pickerSelect(name) {
  addDocChip(_pickerTarget, name);
  closePicker();
}

function pickerUpload(inp) {
  if (inp.files && inp.files[0]) addDocChip(_pickerTarget, inp.files[0].name);
  closePicker();
}

function addDocChip(cid, name) {
  var c = document.getElementById(cid);
  if (!c) return;
  if (Array.from(c.querySelectorAll('.doc-chip')).some(function(x) { return x.dataset.dn === name; })) return;
  var chip = document.createElement('span');
  chip.className = 'doc-chip';
  chip.dataset.dn = name;
  var clr = name.endsWith('.xlsx') ? '#5b9cf6' : '#e05252';
  var short = name.length > 32 ? name.slice(0, 29) + '\u2026' : name;
  chip.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="' + clr + '" stroke-width="2">'
    + '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
    + '<polyline points="14 2 14 8 20 8"/></svg>'
    + '<span title="' + name + '">' + short + '</span>'
    + '<button onclick="rmChip(this)">&times;</button>';
  c.appendChild(chip);
}

function rmChip(btn) {
  var c = btn.closest('.doc-chip');
  if (c) c.remove();
}

/* ── Case Packaging card edit toggle ── */
function cpkgToggle(uid) {
  var btn = document.getElementById(uid + '-btn');
  if (!btn) return;
  var editing = btn.classList.toggle('active');
  btn.innerHTML = editing
    ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save'
    : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit';
  var fields = [
    { v: uid+'-mv', i: uid+'-mi', s: uid+'-ms' },
    { v: uid+'-sv', i: uid+'-si', s: null },
    { v: uid+'-cv', i: uid+'-ci', s: null }
  ];
  fields.forEach(function(f) {
    var vEl = document.getElementById(f.v);
    var iEl = document.getElementById(f.i);
    var sEl = f.s ? document.getElementById(f.s) : null;
    if (vEl) vEl.style.display = editing ? 'none' : '';
    if (iEl) iEl.style.display = editing ? 'block' : 'none';
    if (sEl) sEl.style.display = editing ? 'block' : 'none';
  });
  if (!editing) {
    var mv = document.getElementById(uid+'-mv'), ms = document.getElementById(uid+'-ms');
    var sv = document.getElementById(uid+'-sv'), si = document.getElementById(uid+'-si');
    var cv = document.getElementById(uid+'-cv'), ci = document.getElementById(uid+'-ci');
    if (mv && ms && ms.selectedIndex >= 0) mv.textContent = ms.options[ms.selectedIndex].text;
    if (sv && si) sv.textContent = si.value;
    if (cv && ci) cv.textContent = ci.value;
  }
}

function docsDownload(){alert("Download would start — file not available in prototype.");}

/* ── AI Review navigation ── */
var _aiTotal = 3;
function aiNav(idx) {
  if (idx < 0 || idx >= _aiTotal) return;
  go('air-' + idx);
}
function aiAccept(idx) {
  if (idx < _aiTotal - 1) {
    // No blocking alert — advance to the next component with a quiet toast.
    if (typeof gsToast === 'function') gsToast('Component accepted — ' + (idx + 2) + ' of ' + _aiTotal);
    aiNav(idx + 1);
  } else {
    // Last component accepted → confirmation screen offering the next action.
    var sub = document.getElementById('sp9-sub');
    if (sub) sub.textContent = _aiTotal + ' components have been added to your packaging library.';
    go('sp9');
  }
}
/* Small non-blocking toast used across the live (non-iframe) screens. */
function gsToast(msg){
  var t=document.getElementById('gs-toast');
  if(!t){ t=document.createElement('div'); t.id='gs-toast'; t.className='gs-toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  clearTimeout(gsToast._t); gsToast._t=setTimeout(function(){ t.classList.remove('show'); }, 2600);
}


/* Packaging Components — "Filters" button toggles the advanced-filter panel (status/material/recycled%);
   badge shows how many of those dropdowns are set away from "all". Level chips + search stay in the primary row. */
function togglePkgFilters(btn){
  var p=document.getElementById('pkg-adv-filters');
  if(!p)return;
  var open=(p.style.display==='none'||!p.style.display);
  p.style.display=open?'flex':'none';
  if(btn)btn.classList.toggle('active',open);
}
function updatePkgFilterBadge(){
  var ids=['pkg-tbl-status','pkg-tbl-material','pkg-tbl-recycled'],n=0;
  ids.forEach(function(id){var s=document.getElementById(id);if(s&&s.value&&s.value!=='all')n++;});
  var b=document.getElementById('pkg-filters-badge');
  if(b){b.textContent=n;b.style.display=n?'inline-flex':'none';}
}
/* AI review: once the user edits a suggested field it's user-verified — drop the confidence badge + AI
   colour/left-border/dimming so it reads as a normal confirmed value (the "accept / dismiss" state clears). */
function gsAirEdited(e){
  var feat=e.target.closest&&e.target.closest('.air-feat');
  if(!feat||feat.dataset.userset) return;
  feat.dataset.userset='1';
  feat.setAttribute('data-conf','user');
  feat.style.borderLeft='none'; feat.style.paddingLeft='0';
  var row=feat.children[1];
  if(row){ var badge=row.querySelector('span'); if(badge) badge.style.display='none'; }
  var inp=feat.querySelector('.pkg-detail-feat-input');
  if(inp){ inp.style.color=''; inp.style.fontStyle=''; }
}
document.addEventListener('input',gsAirEdited,true);
document.addEventListener('change',gsAirEdited,true);


(function(){
  var DATA = {
    'PRK-003-DRS-RED': {
      'product details':[['Product','Red Midi Dress'],['SKU','PRK-003-DRS-RED'],['ORIN','991171505'],['Category','Womenswear › Dresses'],['Season','SS26']],
      'packaging':[['Component','Garment polybag'],['Role','Primary'],['Items / pack','1'],['Reusable','No']],
      'level & format':[['Level','Primary packaging'],['Format','Flexible film bag']],
      'source type':[['Source','Supplier-manufactured'],['Placed on market','Ireland (EU)'],['Importer','Primark']],
      'materials':[['Main body','LDPE film (plastic)'],['Hangtag','Paper (FSC)'],['Care label','Woven polyester']],
      'recycled content':[['Recycled (PCR)','30%'],['Basis','Post-consumer'],['Certified','GRS']],
      'colour & decoration':[['Colour','Transparent'],['Print','1-colour logo'],['Inks','Water-based']],
      'weight & grammage':[['Unit weight','6.2 g'],['Film gauge','50 µm']],
      'dimensions':[['Width × Height','320 × 400 mm']],
      'additional info':[['Barcode','Printed on care label'],['Resealable','Yes (adhesive strip)']],
      'compliance':[['PFAS','Not present'],['SVHC','None &gt; 0.1%'],['Heavy metals','&lt; 100 ppm (compliant)']]
    },
    'PRK-004-JKT-KHK': {
      'product details':[['Product','Khaki Utility Jacket'],['SKU','PRK-004-JKT-KHK'],['ORIN','991172103'],['Category','Menswear › Outerwear'],['Season','AW26']],
      'packaging':[['Component','Polybag + hanger'],['Role','Primary'],['Items / pack','1'],['Reusable','No']],
      'level & format':[['Level','Primary packaging'],['Format','Bag + rigid hanger']],
      'source type':[['Source','Supplier-manufactured'],['Placed on market','United Kingdom'],['Importer','Primark']],
      'materials':[['Main body','LDPE film (plastic)'],['Hanger','rPET'],['Hangtag','Paper (FSC)']],
      'recycled content':[['Recycled (PCR)','25%'],['Basis','Post-consumer'],['Certified','Pending verification']],
      'colour & decoration':[['Colour','Transparent'],['Print','None'],['Inks','—']],
      'weight & grammage':[['Unit weight','24.5 g (incl. hanger)'],['Film gauge','60 µm']],
      'dimensions':[['Width × Height','400 × 600 mm']],
      'additional info':[['Barcode','Printed on hangtag'],['Hanger returnable','Yes']],
      'compliance':[['PFAS','Not present'],['SVHC','None &gt; 0.1%'],['Heavy metals','Compliant']]
    },
    'PRK-002-JN-BLU': {
      'product details':[['Product','Blue Slim Fit Jeans'],['SKU','PRK-002-JN-BLU'],['ORIN','991169841'],['Category','Menswear › Denim'],['Season','Core']],
      'packaging':[['Component','Garment polybag'],['Role','Primary'],['Items / pack','1'],['Reusable','No']],
      'level & format':[['Level','Primary packaging'],['Format','Flexible film bag']],
      'source type':[['Source','Supplier-manufactured'],['Placed on market','Ireland (EU)'],['Importer','Primark']],
      'materials':[['Main body','LDPE film (plastic)'],['Brand card','Recycled board'],['Rivet card','Paper']],
      'recycled content':[['Recycled (PCR)','20%'],['Basis','Post-consumer'],['Certified','GRS']],
      'colour & decoration':[['Colour','Blue tint'],['Print','2-colour'],['Inks','Water-based']],
      'weight & grammage':[['Unit weight','9.8 g'],['Film gauge','55 µm']],
      'dimensions':[['Width × Height','300 × 380 mm']],
      'additional info':[['Barcode','Printed on hangtag'],['Notes','Denim brand card included']],
      'compliance':[['PFAS','Not present'],['SVHC','None &gt; 0.1%'],['Heavy metals','Compliant']]
    },
    'PRK-001-SW-BLK': {
      'product details':[['Product','Black Crew Neck Sweatshirt'],['SKU','PRK-001-SW-BLK'],['ORIN','991175801'],['Category','Menswear › Tops'],['Season','Core']],
      'packaging':[['Component','Garment polybag'],['Role','Primary'],['Items / pack','1'],['Reusable','No']],
      'level & format':[['Level','Primary packaging'],['Format','Flexible film bag']],
      'source type':[['Source','Supplier-manufactured'],['Placed on market','Ireland (EU)'],['Importer','Primark']],
      'materials':[['Main body','LDPE film (plastic)'],['Hangtag','Paper (FSC)'],['Size sticker','Paper']],
      'recycled content':[['Recycled (PCR)','35%'],['Basis','Post-consumer'],['Certified','GRS']],
      'colour & decoration':[['Colour','Transparent'],['Print','1-colour logo'],['Inks','Water-based']],
      'weight & grammage':[['Unit weight','7.5 g'],['Film gauge','50 µm']],
      'dimensions':[['Width × Height','300 × 400 mm']],
      'additional info':[['Barcode','Printed on hangtag'],['Notes','—']],
      'compliance':[['PFAS','Not present'],['SVHC','None &gt; 0.1%'],['Heavy metals','Compliant']]
    },
    'PRK-005-TOP-WHT': {
      'product details':[['Product','White Cropped Top'],['SKU','PRK-005-TOP-WHT'],['ORIN','991178220'],['Category','Womenswear › Tops'],['Season','SS26']],
      'packaging':[['Component','Garment polybag'],['Role','Primary'],['Items / pack','1'],['Reusable','No']],
      'level & format':[['Level','Primary packaging'],['Format','Flexible film bag']],
      'source type':[['Source','Supplier-manufactured'],['Placed on market','Ireland (EU)'],['Importer','Primark']],
      'materials':[['Main body','LDPE film (plastic)'],['Hangtag','Paper (FSC)'],['Size sticker','Paper']],
      'recycled content':[['Recycled (PCR)','30%'],['Basis','Post-consumer'],['Certified','GRS']],
      'colour & decoration':[['Colour','Transparent'],['Print','1-colour logo'],['Inks','Water-based']],
      'weight & grammage':[['Unit weight','5.4 g'],['Film gauge','45 µm']],
      'dimensions':[['Width × Height','280 × 360 mm']],
      'additional info':[['Barcode','Printed on hangtag'],['Notes','—']],
      'compliance':[['PFAS','Not present'],['SVHC','None &gt; 0.1%'],['Heavy metals','Compliant']]
    }
  };
  function kv(rows){
    return '<div style="padding:9px 12px;display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:11px;align-items:baseline">'+
      rows.map(function(r){
        return '<span style="color:rgba(255,255,255,.4)">'+r[0]+'</span>'+
               '<span style="color:rgba(255,255,255,.82);text-align:right;font-weight:500">'+r[1]+'</span>';
      }).join('')+
    '</div>';
  }
  function fill(){
    document.querySelectorAll('[id^="s_review_"]').forEach(function(scr){
      var code = '';
      scr.querySelectorAll('.ph span').forEach(function(s){ if(/^PRK-\d/.test(s.textContent.trim())) code = s.textContent.trim(); });
      var map = DATA[code];
      if(!map) return;
      scr.querySelectorAll('div[style*="border-radius:7px"]').forEach(function(block){
        var titleEl = block.querySelector('span');
        var body = block.lastElementChild;
        if(!titleEl || !body) return;
        if(body.textContent.indexOf('Data entered') === -1) return; // already filled / not a section body
        var key = titleEl.textContent.trim().toLowerCase();
        if(map[key]) body.innerHTML = kv(map[key]);
      });
    });
  }
  if(document.readyState !== 'loading') fill();
  else document.addEventListener('DOMContentLoaded', fill);
})();


/* ==========================================================================
   SPLIT-BUILD OVERRIDES  (appended after the extracted monolith code so these
   win over the hoisted originals).  Turns the single-page go(id) screen-toggle
   into real per-page navigation, and carries state across pages via
   sessionStorage.  Guarded so this one file loads safely on every page.
   ========================================================================== */
var GS_PAGES = {
  'sp1':                   '04-greenstreets_supplier_portal_Login.html',
  'sp2':                   '04-greenstreets_supplier_portal_Landing.html',
  's_upload_0':            '04-greenstreets_supplier_portal_AI-Upload.html',
  'sp_ai':                 '04-greenstreets_supplier_portal_AI-Processing.html',
  'air-0':                 '04-greenstreets_supplier_portal_AI-Review-1.html',
  'air-1':                 '04-greenstreets_supplier_portal_AI-Review-2.html',
  'air-2':                 '04-greenstreets_supplier_portal_AI-Review-3.html',
  'sp9':                   '04-greenstreets_supplier_portal_Confirmation.html',
  'proddetail':            '04-greenstreets_supplier_portal_Product-Detail.html',
  'wiz5':                  '04-greenstreets_supplier_portal_Component-Wizard.html',
  'pkgdetail-swing_tag':   '04-greenstreets_supplier_portal_Packaging-Swing-Tag.html',
  'pkgdetail-hanger':      '04-greenstreets_supplier_portal_Packaging-Hanger.html',
  'pkgdetail-poly_bag':    '04-greenstreets_supplier_portal_Packaging-Poly-Bag.html',
  'pkgdetail-display_box': '04-greenstreets_supplier_portal_Packaging-Display-Box.html',
  'pkgdetail-wrap_band':   '04-greenstreets_supplier_portal_Packaging-Wrap-Band.html',
  'pkgdetail-tissue_paper': '04-greenstreets_supplier_portal_Packaging-Tissue-Paper.html',
  'pkgdetail-shipping_carton': '04-greenstreets_supplier_portal_Packaging-Shipping-Carton.html',
  'pkgdetail-shelf_tray':  '04-greenstreets_supplier_portal_Packaging-Shelf-Tray.html',
  'pkgdetail-carton_divider': '04-greenstreets_supplier_portal_Packaging-Carton-Divider.html',
  'pkgdetail-padding':     '04-greenstreets_supplier_portal_Packaging-Padding.html',
  'pkgdetail-goh_polybag': '04-greenstreets_supplier_portal_Packaging-Goh-Polybag.html',
  'pkgdetail-cdu':         '04-greenstreets_supplier_portal_Packaging-Cdu.html',
  'pkgdetail-pallet':      '04-greenstreets_supplier_portal_Packaging-Pallet.html',
  'pkgdetail-pallet_wrap': '04-greenstreets_supplier_portal_Packaging-Pallet-Wrap.html',
  'pkgdetail-pallet_label': '04-greenstreets_supplier_portal_Packaging-Pallet-Label.html',
  'pkgdetail-fastener':    '04-greenstreets_supplier_portal_Packaging-Fastener.html'
};
go = function(id){ var u = GS_PAGES[id]; if(u) window.location.href = u; };

/* Product row -> Product-Detail page (pi round-trips through sessionStorage). */
openProductDetail = function(pi){ sessionStorage.setItem('gs_pi', pi); go('proddetail'); };

/* Any "add / new component" entry point -> standalone Component-Wizard page. */
launchWizard = function(code, name, origin, pi){
  sessionStorage.setItem('gs_wiz', JSON.stringify({
    code: code || '', name: name || '',
    origin: (origin === 'packaging' ? 'packaging' : 'products'),
    pi: (pi == null ? null : pi)
  }));
  go('wiz5');
};

/* Wizard success -> Landing, flashing the newly-saved component. */
gsWizardDone = function(origin, name, id){
  sessionStorage.setItem('gs_flash', JSON.stringify({ origin: origin, name: name, id: id }));
  go('sp2');
};

/* Land on a specific Landing tab (used by sp9 buttons + wizard Back). */
gsGoLanding = function(tab){ sessionStorage.setItem('gs_tab', tab || 'products'); go('sp2'); };

/* Per-page onload dispatcher. */
(function(){
  function init(){
    /* --- Product-Detail page --- */
    var piRaw = sessionStorage.getItem('gs_pi');
    if(document.getElementById('pd-body') && piRaw != null &&
       typeof PRODUCTS !== 'undefined' && typeof renderProductDetail === 'function'){
      var pi = +piRaw;
      var p = PRODUCTS.filter(function(x){ return x.id === pi; })[0];
      if(p){
        if(!p._pkgs && typeof buildPkgData === 'function')
          p._pkgs = p.comps.map(function(n){ return buildPkgData(n); });
        try { _pdOpen = pi; } catch(e){}
        renderProductDetail(pi);
      }
    }
    /* --- Landing page --- */
    if(document.getElementById('prod-tbody')){
      var flashRaw = sessionStorage.getItem('gs_flash');
      if(flashRaw){
        sessionStorage.removeItem('gs_flash');
        var f = null; try { f = JSON.parse(flashRaw); } catch(e){}
        if(f){
          var origin = (f.origin === 'packaging') ? 'packaging' : 'products';
          if(typeof switchLandingTab === 'function') switchLandingTab(origin);
          if(origin === 'packaging'){
            if(typeof gsFlashNewPackaging === 'function') gsFlashNewPackaging(f.name, f.id);
          } else {
            if(typeof gsFlashProductRow === 'function') gsFlashProductRow(f.pi);
            if(f.name && typeof gsToast === 'function') gsToast('Component “' + f.name + '” added');
          }
        }
      }
      var tab = sessionStorage.getItem('gs_tab');
      if(tab){
        sessionStorage.removeItem('gs_tab');
        if(typeof switchLandingTab === 'function') switchLandingTab(tab);
      }
    }
  }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

/* =======================================================================
   SUPPORTING DOCUMENTS TAB — full JS implementation
   ======================================================================= */
(function(){
  var DOCS_DATA = [
    {id:1, name:'FSC_CoC_Certificate_2026.pdf',                   type:'Certification', ref:'Swing Tag, Tissue Paper, Wrap Band', date:'12 Jun 2026', size:'342 KB',  color:'#e05252'},
    {id:2, name:'REACH_Compliance_Declaration_2026.pdf',          type:'Declaration',   ref:'Hanger, Poly Bag',                   date:'3 Jun 2026',  size:'198 KB',  color:'#e05252'},
    {id:3, name:'RecycledContent_SupplierDeclaration_Apr2026.pdf',type:'Declaration',   ref:'Shipping Carton, Display Box',        date:'28 Apr 2026', size:'87 KB',   color:'#e05252'},
    {id:4, name:'HeavyMetals_TestReport_Q1_2026.xlsx',            type:'Test Report',   ref:'All primary packaging',              date:'15 Mar 2026', size:'1.2 MB',  color:'#5b9cf6'},
    {id:5, name:'PEFC_WoodCertification_Pallet_2026.pdf',         type:'Certification', ref:'Pallet',                             date:'29 Jun 2026', size:'512 KB',  color:'#e05252'},
    {id:6, name:'OEKOTEX_Certificate_SwingTag_2026.pdf',          type:'Certification', ref:'Swing Tag',                          date:'14 Jun 2026', size:'289 KB',  color:'#e05252'}
  ];
  var _docsView='list', _docsPage=0, DOCS_PG_SIZE=8;
  var _docsSearch='', _docsType='all', _docsSelected={}, _docConfirmTimers={};

  function docsVisible(){
    return DOCS_DATA.filter(function(d){
      var q=_docsSearch.toLowerCase();
      var mS=!q||d.name.toLowerCase().indexOf(q)>-1||d.ref.toLowerCase().indexOf(q)>-1;
      var mT=_docsType==='all'||d.type===_docsType;
      return mS&&mT;
    });
  }
  function docsPageCount(){ return Math.max(1,Math.ceil(docsVisible().length/DOCS_PG_SIZE)); }
  function docsSvgFile(c){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'; }

  function docsRenderList(){
    var tbody=document.getElementById('docs-tbody-new'); if(!tbody) return;
    var vis=docsVisible(), page=Math.min(_docsPage,docsPageCount()-1);
    var slice=vis.slice(page*DOCS_PG_SIZE,(page+1)*DOCS_PG_SIZE);
    var html='';
    slice.forEach(function(d){
      var sel=!!_docsSelected[d.id], isC=!!_docConfirmTimers[d.id];
      var sn=d.name.length>42?d.name.slice(0,39)+'...':d.name;
      html+='<tr class="'+(sel?'doc-row-sel':'')+'" data-doc-id="'+d.id+'">';
      html+='<td class="doc-cb-cell"><input type="checkbox" class="doc-cb" data-id="'+d.id+'" '+(sel?'checked':'')+' onchange="docsToggleRow('+d.id+',this)"></td>';
      html+='<td><div class="doc-name-wrap">'+docsSvgFile(d.color)+'<span class="doc-name-col" title="'+d.name+'">'+sn+'</span></div></td>';
      html+='<td class="doc-secondary">'+d.type+'</td>';
      html+='<td class="doc-secondary">'+d.ref+'</td>';
      html+='<td class="doc-secondary">'+d.date+'</td>';
      html+='<td class="doc-secondary">'+d.size+'</td>';
      html+='<td class="doc-actions-col"><button class="docs-dl-btn" onclick="docsDownload()" style="margin-right:2px">Download</button>';
      html+='<button class="doc-del-btn'+(isC?' confirming':'')+'" title="'+(isC?'Click again to confirm':'Delete')+'" onclick="docsDeleteRow('+d.id+',this)">';
      html+=isC?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>'
              :'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/><path d="M3 6l2-3h14l2 3"/></svg>';
      html+='</button></td></tr>';
    });
    tbody.innerHTML=html;
    docsUpdateSelectAll(); docsUpdateBulkBar(); docsUpdatePager(vis.length);
  }

  function docsRenderThumb(){
    var grid=document.getElementById('docs-thumb-view'); if(!grid) return;
    var vis=docsVisible(), page=Math.min(_docsPage,docsPageCount()-1);
    var slice=vis.slice(page*DOCS_PG_SIZE,(page+1)*DOCS_PG_SIZE);
    var html='';
    slice.forEach(function(d){
      var sel=!!_docsSelected[d.id], isC=!!_docConfirmTimers[d.id];
      var sn=d.name.length>22?d.name.slice(0,20)+'...':d.name;
      html+='<div class="docs-thumb'+(sel?' thumb-sel':'')+'" data-doc-id="'+d.id+'">';
      html+='<input type="checkbox" class="docs-thumb-cb" data-id="'+d.id+'" '+(sel?'checked':'')+' onchange="docsToggleRow('+d.id+',this)">';
      html+='<div class="docs-thumb-icon">'+docsSvgFile(d.color)+'</div>';
      html+='<div class="docs-thumb-name" title="'+d.name+'">'+sn+'</div>';
      html+='<div class="docs-thumb-type">'+d.type+'</div>';
      html+='<div class="docs-thumb-actions"><button class="docs-thumb-dl" onclick="docsDownload()">&#8595; DL</button>';
      html+='<button class="docs-thumb-del-btn'+(isC?' confirming':'')+'" title="'+(isC?'Confirm?':'Delete')+'" onclick="docsDeleteRow('+d.id+',this)">';
      html+=isC?'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>'
              :'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/><path d="M3 6l2-3h14l2 3"/></svg>';
      html+='</button></div></div>';
    });
    grid.innerHTML=html; docsUpdateBulkBar(); docsUpdatePager(vis.length);
  }

  function docsRender(){
    if(_docsView==='list') docsRenderList(); else docsRenderThumb();
    var cl=document.getElementById('docs-count-lbl');
    if(cl) cl.textContent=DOCS_DATA.length+' document'+(DOCS_DATA.length!==1?'s':'');
  }

  function docsUpdatePager(visCount){
    var pages=Math.max(1,Math.ceil(visCount/DOCS_PG_SIZE));
    if(_docsPage>=pages) _docsPage=pages-1;
    var pB=document.getElementById('dpg-prev'), nB=document.getElementById('dpg-next');
    var jmp=document.getElementById('dpg-jump'), of=document.getElementById('dpg-of');
    var fc=document.getElementById('docs-foot-count');
    if(pB) pB.disabled=_docsPage<=0;
    if(nB) nB.disabled=_docsPage>=pages-1;
    if(of) of.textContent='of '+pages;
    if(fc) fc.textContent=visCount+' document'+(visCount!==1?'s':'')+(visCount<DOCS_DATA.length?' (filtered)':'');
    if(jmp){
      jmp.innerHTML='';
      for(var i=0;i<pages;i++){var o=document.createElement('option');o.value=i;o.textContent=i+1;if(i===_docsPage)o.selected=true;jmp.appendChild(o);}
    }
  }

  function docsUpdateBulkBar(){
    var n=Object.keys(_docsSelected).length;
    var bar=document.getElementById('docs-bulk-bar'), cnt=document.getElementById('docs-bulk-count');
    if(bar) bar.classList.toggle('visible',n>0);
    if(cnt) cnt.textContent=n+' selected';
  }

  function docsUpdateSelectAll(){
    var sa=document.getElementById('docs-select-all'); if(!sa) return;
    var vis=docsVisible().slice(_docsPage*DOCS_PG_SIZE,(_docsPage+1)*DOCS_PG_SIZE);
    var allSel=vis.length>0&&vis.every(function(d){return!!_docsSelected[d.id];});
    sa.checked=allSel;
    sa.indeterminate=!allSel&&vis.some(function(d){return!!_docsSelected[d.id];});
  }

  window.docsSetView=function(v){
    _docsView=v;
    var lv=document.getElementById('docs-list-view'), tv=document.getElementById('docs-thumb-view');
    var lb=document.getElementById('docs-vbtn-list'), tb=document.getElementById('docs-vbtn-thumb');
    if(lv) lv.style.display=v==='list'?'':'none';
    if(tv) tv.style.display=v==='thumb'?'':'none';
    if(lb) lb.classList.toggle('active',v==='list');
    if(tb) tb.classList.toggle('active',v==='thumb');
    docsRender();
  };
  window.docsApplyFilters=function(){
    var si=document.getElementById('docs-search'), tf=document.getElementById('docs-type-filter');
    _docsSearch=si?si.value:''; _docsType=tf?tf.value:'all'; _docsPage=0; docsRender();
  };
  window.docsSelectAll=function(cb){
    var vis=docsVisible().slice(_docsPage*DOCS_PG_SIZE,(_docsPage+1)*DOCS_PG_SIZE);
    if(cb.checked){ vis.forEach(function(d){_docsSelected[d.id]=true;}); }
    else { vis.forEach(function(d){delete _docsSelected[d.id];}); }
    docsRender();
  };
  window.docsToggleRow=function(id,cb){
    if(cb.checked) _docsSelected[id]=true; else delete _docsSelected[id];
    docsUpdateSelectAll(); docsUpdateBulkBar();
    var row=document.querySelector('[data-doc-id="'+id+'"]');
    if(row){ row.classList.toggle('doc-row-sel',!!_docsSelected[id]); row.classList.toggle('thumb-sel',!!_docsSelected[id]); }
  };
  window.docsDeleteRow=function(id,btn){
    if(_docConfirmTimers[id]){
      clearTimeout(_docConfirmTimers[id]); delete _docConfirmTimers[id]; delete _docsSelected[id];
      DOCS_DATA=DOCS_DATA.filter(function(d){return d.id!==id;});
      if(typeof gsToast==='function') gsToast('Document deleted');
      docsRender();
    } else {
      btn.classList.add('confirming'); btn.title='Click again to confirm';
      _docConfirmTimers[id]=setTimeout(function(){ delete _docConfirmTimers[id]; docsRender(); },3000);
    }
  };
  window.docsBulkDownload=function(){ alert('Download would start — files not available in prototype.'); };
  window.docsBulkDelete=function(){
    var ids=Object.keys(_docsSelected).map(Number); if(!ids.length) return;
    DOCS_DATA=DOCS_DATA.filter(function(d){return ids.indexOf(d.id)<0;});
    _docsSelected={};
    ids.forEach(function(id){clearTimeout(_docConfirmTimers[id]);delete _docConfirmTimers[id];});
    if(typeof gsToast==='function') gsToast(ids.length+' document'+(ids.length!==1?'s':'')+' deleted');
    docsRender();
  };
  window.docsHandleUpload=function(files){
    Array.prototype.forEach.call(files,function(f){
      var id=Date.now()+Math.floor(Math.random()*1000);
      DOCS_DATA.push({id:id,name:f.name,type:'Uploaded',ref:'—',
        date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
        size:f.size>1048576?(f.size/1048576).toFixed(1)+' MB':Math.round(f.size/1024)+' KB',
        color:f.name.endsWith('.xlsx')||f.name.endsWith('.xls')?'#5b9cf6':'#e05252'});
    });
    docsRender();
    if(typeof gsToast==='function') gsToast(files.length+' file'+(files.length!==1?'s':'')+' uploaded');
  };
  window.docsGotoPrev=function(){ if(_docsPage>0){_docsPage--;docsRender();} };
  window.docsGotoNext=function(){ if(_docsPage<docsPageCount()-1){_docsPage++;docsRender();} };
  window.docsGotoPage=function(p){ _docsPage=p; docsRender(); };

  function init(){
    if(!document.getElementById('docs-tbody-new')&&!document.getElementById('docs-thumb-view')) return;
    docsRender();
  }
  if(document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded',init);
})();
