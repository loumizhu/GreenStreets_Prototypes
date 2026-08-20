/* ============================================================================
   Login FX — the animated login background for 04-…_Login-Blobs.html
   ----------------------------------------------------------------------------
   Two effects, both driven by ONE config object (`CFG`) so every knob is live-
   tunable from the built-in control panel (the "FX" button, bottom-right):

     · BLOBS — soft colour blobs advected along an invisible vector field.
     · STROKE — a single comet orbiting the login card, its head and tail
       fading out to transparent.

   The panel can export the current settings as JSON, or as a ready-to-paste
   DEFAULTS block, so tweaks can be baked back into this file.
   Settings also persist per-browser in localStorage ('gs_login_fx').
   ========================================================================== */
(function(){
'use strict';

/* ── DEFAULTS ─────────────────────────────────────────────────────────────
   Paste an exported block over this one to bake in your final tweaks. */
var DEFAULTS = {
  stroke: {
    enabled:   true,
    lap:       20750,   // ms for one full lap around the card (speed)
    tail:      0.48,    // stroke length, as a fraction of the card perimeter
    fade:      2.85,    // fade curve: <1 = long soft tips, >1 = tight bright core
    opacity:   0.95,    // overall transparency
    headAlpha: 0.30,    // transparency multiplier at the leading tip
    tailAlpha: 0.43,    // transparency multiplier at the trailing tip
    width:     1.8,     // stroke thickness (px)
    glow:      8,       // outer glow blur (px)
    color1:    '#8fe3b6', // colour at the tail
    color2:    '#9dc4ff', // colour at the head
    direction: 1,       // 1 = clockwise, -1 = anticlockwise
    inset:     0,       // distance inside the card edge (px) — negative pushes it outside
    radius:    18       // corner radius (px) — matches the card's --rl
  },
  blobs: {
    enabled:   true,
    count:     9,       // number of blobs
    sizeMin:   0.28,    // smallest blob radius, as a fraction of min(w,h)
    sizeMax:   0.52,    // largest blob radius
    speed:     2.25,    // how fast blobs travel along the field
    morph:     1.5,     // how fast the invisible field itself changes
    fieldScale:0.0016,  // field spatial frequency (smaller = broader swirls)
    opacity:   0.14,    // core opacity of each blob
    softness:  0.45,    // where the blob starts falling off (0 = hard, 1 = soft)
    color1:    '#1b462f',
    color2:    '#5b9cf6',
    color3:    '#398e61',
    color4:    '#3f5678'
  }
};

var LS_KEY = 'gs_login_fx_v3';
var CFG = load();

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function load(){
  var c = clone(DEFAULTS);
  try{
    var raw = localStorage.getItem(LS_KEY);
    if(raw){
      var saved = JSON.parse(raw);
      ['stroke','blobs'].forEach(function(g){
        if(saved && saved[g]) Object.keys(c[g]).forEach(function(k){
          if(saved[g][k] !== undefined) c[g][k] = saved[g][k];
        });
      });
    }
  }catch(e){}
  return c;
}
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(CFG)); }catch(e){} }
function hexRgb(h){
  h = String(h).replace('#','');
  if(h.length===3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
}

/* ── STYLES ─────────────────────────────────────────────────────────────── */
var css = document.createElement('style');
css.textContent = [
'.login-fx{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block}',
'.login-card::before{animation:none!important;opacity:0!important}',
'canvas.login-snake{position:absolute;z-index:5;pointer-events:none;display:block}',
/* control panel */
'.fxp-btn{position:fixed;right:18px;bottom:18px;z-index:99999;width:44px;height:44px;border-radius:50%;',
'  border:1px solid rgba(148,180,230,.35);background:rgba(9,20,38,.92);color:#8fe3b6;font:700 12px/1 Inter,sans-serif;',
'  cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.45);backdrop-filter:blur(10px)}',
'.fxp-btn:hover{border-color:#8fe3b6}',
'.fxp{position:fixed;right:18px;bottom:72px;z-index:99999;width:310px;max-height:78vh;overflow:auto;display:none;',
'  background:rgba(9,20,38,.96);border:1px solid rgba(148,180,230,.26);border-radius:14px;padding:14px;',
'  box-shadow:0 18px 50px rgba(0,0,0,.6);backdrop-filter:blur(16px);color:#e8f0ff;font-family:Inter,system-ui,sans-serif}',
'.fxp.open{display:block}',
'.fxp h4{margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8fe3b6;font-weight:700}',
'.fxp h4:not(:first-child){margin-top:16px;padding-top:14px;border-top:1px solid rgba(148,180,230,.16)}',
'.fxr{display:flex;align-items:center;gap:8px;margin-bottom:7px}',
'.fxr label{flex:0 0 108px;font-size:11px;color:rgba(232,240,255,.72);line-height:1.25}',
'.fxr input[type=range]{flex:1;min-width:0;accent-color:#4ebb81;height:18px}',
'.fxr input[type=color]{width:30px;height:22px;padding:0;border:1px solid rgba(148,180,230,.3);border-radius:5px;background:none;cursor:pointer}',
'.fxr .fxv{flex:0 0 46px;text-align:right;font-size:10.5px;color:#8fe3b6;font-variant-numeric:tabular-nums}',
'.fxr select{flex:1;background:rgba(255,255,255,.06);color:#e8f0ff;border:1px solid rgba(148,180,230,.28);',
'  border-radius:6px;font-size:11px;padding:3px 6px}',
'.fxp-acts{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;padding-top:13px;border-top:1px solid rgba(148,180,230,.16)}',
'.fxp-acts button{padding:7px 8px;font-size:11px;font-weight:600;border-radius:7px;cursor:pointer;',
'  background:rgba(255,255,255,.06);color:#e8f0ff;border:1px solid rgba(148,180,230,.28)}',
'.fxp-acts button:hover{border-color:#8fe3b6;color:#8fe3b6}',
'.fxp-acts button.wide{grid-column:1/-1}',
'.fxp-note{margin-top:9px;font-size:10px;line-height:1.45;color:rgba(232,240,255,.5)}'
].join('\n');
document.head.appendChild(css);

/* ── BLOBS ────────────────────────────────────────────────────────────────
   The vector field is invisible; the blobs are pushed along it. */
var Blobs = (function(){
  var cv = document.querySelector('.login-fx');
  if(!cv) return null;
  var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio||1, 2);
  var W=0, H=0, blobs=[], t=0;

  function palette(){
    var b = CFG.blobs;
    return [hexRgb(b.color1), hexRgb(b.color2), hexRgb(b.color3), hexRgb(b.color4)];
  }
  function build(){
    var b = CFG.blobs, pal = palette();
    var minR = Math.min(W,H)*b.sizeMin, maxR = Math.min(W,H)*Math.max(b.sizeMin,b.sizeMax);
    blobs = [];
    for(var i=0;i<b.count;i++){
      var s1 = frac(Math.sin(i*127.1)*43758.5453);
      var s2 = frac(Math.sin(i*311.7+9.7)*24634.6345);
      var s3 = frac(Math.sin(i*74.7+3.3)*9812.113);
      blobs.push({ x:s1*W, y:s2*H, r:minR+(maxR-minR)*s3, ci:i%4, spd:0.55+s2*0.7 });
    }
  }
  function frac(v){ return v - Math.floor(v); }
  function resize(){
    var r = cv.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.max(1,W*DPR); cv.height = Math.max(1,H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    build();
  }
  function angle(x,y){
    var fs = CFG.blobs.fieldScale;
    var n = Math.sin(x*fs        + t*0.20)
          + Math.sin(y*fs*1.31   - t*0.16)
          + Math.sin((x+y)*fs*.75+ t*0.13)
          + Math.cos((x-y)*fs*1.12- t*0.10);
    return n*0.9;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    var b = CFG.blobs;
    if(!b.enabled) return;
    var pal = palette();
    t += 0.012 * b.morph;
    ctx.globalCompositeOperation = 'lighter';
    for(var i=0;i<blobs.length;i++){
      var o = blobs[i];
      var a = angle(o.x,o.y);
      o.x += Math.cos(a)*o.spd*b.speed;
      o.y += Math.sin(a)*o.spd*b.speed;
      var m = o.r;
      if(o.x<-m) o.x += W+2*m; else if(o.x>W+m) o.x -= W+2*m;
      if(o.y<-m) o.y += H+2*m; else if(o.y>H+m) o.y -= H+2*m;
      var c = pal[o.ci];
      var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0, 'rgba('+c[0]+','+c[1]+','+c[2]+','+b.opacity.toFixed(3)+')');
      g.addColorStop(Math.min(.99,Math.max(.01,b.softness)), 'rgba('+c[0]+','+c[1]+','+c[2]+','+(b.opacity*0.45).toFixed(3)+')');
      g.addColorStop(1, 'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  resize();
  window.addEventListener('resize', resize);
  return { draw:draw, rebuild:build, resize:resize };
})();

/* ── STROKE ───────────────────────────────────────────────────────────────
   One comet orbiting the card. Drawn as a chain of short segments so the
   alpha can ramp along the stroke's own length (transparent tips). */
var Stroke = (function(){
  var card = document.querySelector('.login-card');
  if(!card) return null;
  // The card itself is overflow:hidden, so mount the canvas on its wrapper and give it
  // PAD px of bleed on every side — that lets the stroke sit ON or OUTSIDE the card edge.
  var host = card.parentElement || card;
  var PAD = 16;
  var cv = document.createElement('canvas');
  cv.className = 'login-snake'; cv.setAttribute('aria-hidden','true');
  host.appendChild(cv);
  var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio||1, 2);
  var pts=[], total=0, W=0, H=0;

  function buildPath(){
    var s = CFG.stroke;
    var inset = s.inset;
    var x=PAD+inset, y=PAD+inset, w=Math.max(0,W-inset*2), h=Math.max(0,H-inset*2);
    var r = Math.min(s.radius, w/2, h/2);
    pts = []; var STEP = 2;
    function line(x1,y1,x2,y2){
      var d=Math.hypot(x2-x1,y2-y1), n=Math.max(1,Math.round(d/STEP));
      for(var i=0;i<n;i++) pts.push([x1+(x2-x1)*i/n, y1+(y2-y1)*i/n]);
    }
    function arc(cx,cy,a0,a1){
      var d=Math.abs(a1-a0)*r, n=Math.max(2,Math.round(d/STEP));
      for(var i=0;i<n;i++){ var a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); }
    }
    var P=Math.PI;
    line(x+r,y,x+w-r,y);            arc(x+w-r,y+r,-P/2,0);
    line(x+w,y+r,x+w,y+h-r);        arc(x+w-r,y+h-r,0,P/2);
    line(x+w-r,y+h,x+r,y+h);        arc(x+r,y+h-r,P/2,P);
    line(x,y+h-r,x,y+r);            arc(x+r,y+r,P,P*1.5);
    total = pts.length;
  }
  function resize(){
    // offsetWidth/Height (NOT client*) — the card has a 1px border, and the canvas is
    // positioned from its border-box origin; client* excludes the border, which left the
    // path ~2px short along the bottom and right edges.
    W = card.offsetWidth; H = card.offsetHeight;
    var cw = W+PAD*2, ch = H+PAD*2;
    cv.width=Math.max(1,cw*DPR); cv.height=Math.max(1,ch*DPR);
    cv.style.width=cw+'px'; cv.style.height=ch+'px';
    cv.style.left=(card.offsetLeft-PAD)+'px';
    cv.style.top =(card.offsetTop -PAD)+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    buildPath();
  }
  function draw(now){
    ctx.clearRect(0,0,W+PAD*2,H+PAD*2);
    var s = CFG.stroke;
    if(!s.enabled || total<3) return;
    var c1 = hexRgb(s.color1), c2 = hexRgb(s.color2);
    var prog = (now % s.lap)/s.lap;
    if(s.direction < 0) prog = 1 - prog;
    var head = prog * total;
    var len = Math.max(2, Math.round(total*s.tail));
    ctx.lineWidth = s.width; ctx.lineCap = 'round';
    ctx.shadowBlur = s.glow;
    ctx.shadowColor = 'rgba('+c1[0]+','+c1[1]+','+c1[2]+',.5)';
    for(var i=0;i<len;i++){
      var f = i/(len-1);                         // 0 = tail, 1 = head
      var alpha = Math.pow(Math.sin(f*Math.PI), s.fade);   // fade both tips
      alpha *= (s.tailAlpha + (s.headAlpha - s.tailAlpha)*f) * s.opacity;
      if(!(alpha > 0.004)) continue;
      var i0 = Math.floor(head-len+i), i1 = i0+1;
      var p0 = pts[((i0%total)+total)%total], p1 = pts[((i1%total)+total)%total];
      var r = Math.round(c1[0]+(c2[0]-c1[0])*f),
          g = Math.round(c1[1]+(c2[1]-c1[1])*f),
          b = Math.round(c1[2]+(c2[2]-c1[2])*f);
      ctx.strokeStyle = 'rgba('+r+','+g+','+b+','+alpha.toFixed(3)+')';
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
  resize();
  window.addEventListener('resize', resize);
  if(window.ResizeObserver) new ResizeObserver(resize).observe(card);
  return { draw:draw, rebuild:buildPath, resize:resize };
})();

/* ── LOOP ─────────────────────────────────────────────────────────────── */
function frame(now){
  if(Blobs)  Blobs.draw();
  if(Stroke) Stroke.draw(now||0);
  requestAnimationFrame(frame);
}
if(Blobs)  Blobs.draw();
if(Stroke) Stroke.draw(0);
requestAnimationFrame(frame);

/* ── CONTROL PANEL ────────────────────────────────────────────────────────
   Opt-in, so the real login page ships clean. It shows when either:
     · the <script> tag carries a `data-panel` attribute (the FX lab page), or
     · the URL has ?fx (handy for tweaking any page that loads this file). */
var PANEL_ON = /[?&]fx\b/.test(location.search) ||
  !!(document.currentScript && document.currentScript.hasAttribute('data-panel')) ||
  !!document.querySelector('script[src*="login-fx.js"][data-panel]');
if(!PANEL_ON){
  window.GSLoginFX = { cfg:CFG, blobs:Blobs, stroke:Stroke, save:save, defaults:DEFAULTS };
  return;
}

var SPECS = {
  stroke: [
    ['enabled',  'Enabled',        'bool'],
    ['lap',      'Speed (lap ms)', 'range', 1000, 40000, 250],
    ['tail',     'Stroke length',  'range', 0.02, 1,     0.01],
    ['fade',     'Fade / gradient','range', 0.15, 4,     0.05],
    ['opacity',  'Overall opacity','range', 0,    1,     0.01],
    ['headAlpha','Head opacity',   'range', 0,    1,     0.01],
    ['tailAlpha','Tail opacity',   'range', 0,    1,     0.01],
    ['width',    'Thickness',      'range', 0.5,  10,    0.1],
    ['glow',     'Glow',           'range', 0,    30,    0.5],
    ['color1',   'Tail colour',    'color'],
    ['color2',   'Head colour',    'color'],
    ['direction','Direction',      'select', [[1,'Clockwise'],[-1,'Anticlockwise']]],
    ['inset',    'Edge inset',     'range', -10,  14,    0.5],
    ['radius',   'Corner radius',  'range', 0,    40,    1]
  ],
  blobs: [
    ['enabled',   'Enabled',       'bool'],
    ['count',     'Blob count',    'range', 1,     40,    1],
    ['sizeMin',   'Size min',      'range', 0.05,  1,     0.01],
    ['sizeMax',   'Size max',      'range', 0.05,  1.4,   0.01],
    ['speed',     'Drift speed',   'range', 0,     4,     0.05],
    ['morph',     'Field morph',   'range', 0,     4,     0.05],
    ['fieldScale','Field scale',   'range', 0.0002,0.006, 0.0001],
    ['opacity',   'Opacity',       'range', 0,     0.8,   0.01],
    ['softness',  'Softness',      'range', 0.05,  0.95,  0.01],
    ['color1',    'Colour 1',      'color'],
    ['color2',    'Colour 2',      'color'],
    ['color3',    'Colour 3',      'color'],
    ['color4',    'Colour 4',      'color']
  ]
};
// changing these needs the geometry/blob list rebuilt
var STRUCTURAL = { blobs:['count','sizeMin','sizeMax'], stroke:['inset','radius'] };

var btn = document.createElement('button');
btn.className = 'fxp-btn'; btn.type='button'; btn.textContent='FX';
btn.title = 'Login FX controls';
var panel = document.createElement('div');
panel.className = 'fxp';
btn.onclick = function(){ panel.classList.toggle('open'); };

function fmt(v){
  if(typeof v !== 'number') return v;
  if(Math.abs(v) >= 1000) return String(Math.round(v));
  if(Number.isInteger(v)) return String(v);
  return v < 0.01 ? v.toFixed(4) : v.toFixed(2);
}
function buildGroup(group, title){
  var h = document.createElement('h4'); h.textContent = title; panel.appendChild(h);
  SPECS[group].forEach(function(spec){
    var key=spec[0], label=spec[1], type=spec[2];
    var row = document.createElement('div'); row.className='fxr';
    var lb = document.createElement('label'); lb.textContent = label; row.appendChild(lb);
    var out;
    if(type==='bool'){
      var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!CFG[group][key];
      cb.onchange=function(){ CFG[group][key]=cb.checked; commit(group,key); };
      row.appendChild(cb);
    } else if(type==='color'){
      var col=document.createElement('input'); col.type='color'; col.value=CFG[group][key];
      col.oninput=function(){ CFG[group][key]=col.value; commit(group,key); };
      row.appendChild(col);
      out=document.createElement('span'); out.className='fxv'; out.textContent=CFG[group][key];
      col.addEventListener('input',function(){ out.textContent=col.value; });
      row.appendChild(out);
    } else if(type==='select'){
      var sel=document.createElement('select');
      spec[3].forEach(function(o){ var op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sel.appendChild(op); });
      sel.value=String(CFG[group][key]);
      sel.onchange=function(){ CFG[group][key]=parseFloat(sel.value); commit(group,key); };
      row.appendChild(sel);
    } else {
      var rg=document.createElement('input'); rg.type='range';
      rg.min=spec[3]; rg.max=spec[4]; rg.step=spec[5]; rg.value=CFG[group][key];
      out=document.createElement('span'); out.className='fxv'; out.textContent=fmt(CFG[group][key]);
      rg.oninput=function(){ CFG[group][key]=parseFloat(rg.value); out.textContent=fmt(CFG[group][key]); commit(group,key); };
      row.appendChild(rg); row.appendChild(out);
    }
    row.dataset.k = group+'.'+key;
    panel.appendChild(row);
  });
}
function commit(group,key){
  if(STRUCTURAL[group] && STRUCTURAL[group].indexOf(key)>=0){
    if(group==='blobs' && Blobs) Blobs.rebuild();
    if(group==='stroke' && Stroke) Stroke.rebuild();
  }
  save();
}
buildGroup('stroke','Card stroke');
buildGroup('blobs','Background blobs');

/* actions */
var acts = document.createElement('div'); acts.className='fxp-acts';
function act(text, fn, wide){
  var b=document.createElement('button'); b.type='button'; b.textContent=text;
  if(wide) b.className='wide'; b.onclick=fn; acts.appendChild(b); return b;
}
function download(name, text, mime){
  var blob=new Blob([text],{type:mime||'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a'); a.href=url; a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
}
function snippet(){
  return '/* Login FX — exported settings. Paste over the DEFAULTS block\n'
       + '   at the top of js/login-fx.js to bake these in. */\n'
       + 'var DEFAULTS = ' + JSON.stringify(CFG, null, 2) + ';\n';
}
act('Export JSON', function(){ download('login-fx-settings.json', JSON.stringify(CFG,null,2)); });
act('Export JS',   function(){ download('login-fx-defaults.js', snippet(), 'text/javascript'); });
act('Copy JS', function(){
  var t = snippet();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){ flash('Copied'); }, function(){ prompt('Copy:', t); });
  } else prompt('Copy:', t);
});
act('Import', function(){
  var f=document.createElement('input'); f.type='file'; f.accept='.json,application/json';
  f.onchange=function(){
    var file=f.files[0]; if(!file) return;
    var rd=new FileReader();
    rd.onload=function(){
      try{
        var o=JSON.parse(rd.result);
        ['stroke','blobs'].forEach(function(g){
          if(o[g]) Object.keys(CFG[g]).forEach(function(k){ if(o[g][k]!==undefined) CFG[g][k]=o[g][k]; });
        });
        save(); refresh(); if(Blobs) Blobs.rebuild(); if(Stroke) Stroke.rebuild();
        flash('Imported');
      }catch(e){ flash('Bad file'); }
    };
    rd.readAsText(file);
  };
  f.click();
});
act('Reset to defaults', function(){
  CFG = clone(DEFAULTS);
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  refresh(); if(Blobs) Blobs.rebuild(); if(Stroke) Stroke.rebuild();
  flash('Reset');
}, true);
panel.appendChild(acts);

var note=document.createElement('div');
note.className='fxp-note';
note.textContent='Tweaks save in this browser automatically. Use Export JS and paste it over the DEFAULTS block in js/login-fx.js to make them permanent.';
panel.appendChild(note);

function flash(msg){
  var old = btn.textContent; btn.textContent = '✓';
  btn.title = msg;
  setTimeout(function(){ btn.textContent = old; }, 900);
}
// re-sync every control from CFG (after import / reset)
function refresh(){
  ['stroke','blobs'].forEach(function(group){
    SPECS[group].forEach(function(spec){
      var row = panel.querySelector('[data-k="'+group+'.'+spec[0]+'"]');
      if(!row) return;
      var v = CFG[group][spec[0]];
      var inp = row.querySelector('input,select');
      var out = row.querySelector('.fxv');
      if(!inp) return;
      if(inp.type==='checkbox') inp.checked = !!v; else inp.value = v;
      if(out) out.textContent = (spec[2]==='color') ? v : fmt(v);
    });
  });
}

document.body.appendChild(btn);
document.body.appendChild(panel);

// expose for console tweaking / structural verification
window.GSLoginFX = { cfg:CFG, refresh:refresh, blobs:Blobs, stroke:Stroke, save:save, defaults:DEFAULTS };
})();
