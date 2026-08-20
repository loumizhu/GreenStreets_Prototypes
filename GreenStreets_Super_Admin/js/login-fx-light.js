/* ============================================================================
   Login FX (light theme) — animated background + card outline for the
   *-Login-Light.html pages. Ported from the Supplier Portal's js/login-fx.js
   and re-tuned for a light background.
   ----------------------------------------------------------------------------
     · BLOBS  — soft colour blobs advected along an INVISIBLE vector field, so
                you see clouds of colour drifting, never lines. Composited with
                `multiply` so they read as pastel tints on white instead of
                washing out (which is what `lighter` does on a light page).
     · STROKE — one comet orbiting the login card, head AND tail fading to
                transparent. Mounted on the card's WRAPPER, because the card is
                overflow:hidden and would clip a stroke sitting on its edge.
                Corner radius follows the card's own computed border-radius, so
                this file works unchanged on any portal / theme.

   Both canvases are created by this script — no markup changes needed.
   Add ?fx to the URL for a live control panel + export of tweaked settings.
   ========================================================================== */
(function(){
'use strict';

/* ── DEFAULTS — paste an exported block over this one to bake in tweaks ── */
var DEFAULTS = {
  stroke: {
    enabled:   true,
    lap:       20750,     // ms for one full lap around the card (speed)
    tail:      0.48,      // stroke length, as a fraction of the card perimeter
    fade:      2.85,      // fade curve: <1 = long soft tips, >1 = tight bright core
    opacity:   1.00,      // overall transparency
    headAlpha: 0.55,      // transparency multiplier at the leading tip
    tailAlpha: 0.75,      // transparency multiplier at the trailing tip
    width:     2.0,       // stroke thickness (px)
    glow:      6,         // outer glow blur (px)
    color1:    '#8fd0b6', // colour at the tail (light-theme mint)
    color2:    '#6ea8fe', // colour at the head (light-theme cornflower)
    direction: 1,         // 1 = clockwise, -1 = anticlockwise
    inset:     0,         // distance inside the card edge (px) — negative = outside
    radius:    'auto'     // 'auto' follows the card's own border-radius, or a number
  },
  blobs: {
    enabled:   true,
    count:     9,         // number of blobs
    sizeMin:   0.28,      // smallest blob radius, as a fraction of min(w,h)
    sizeMax:   0.52,      // largest blob radius
    speed:     2.25,      // how fast blobs travel along the field
    morph:     1.5,       // how fast the invisible field itself changes
    fieldScale:0.0016,    // field spatial frequency (smaller = broader swirls)
    opacity:   0.42,      // core opacity of each blob
    softness:  0.45,      // where the blob starts falling off (0 = hard, 1 = soft)
    blend:     'multiply',// 'multiply' reads as tint on light; 'lighter' for dark
    color1:    '#b7e4cd', // pastel mint
    color2:    '#bcd6ff', // pastel cornflower
    color3:    '#d7cdf2', // pastel lavender
    color4:    '#cfe9e6'  // pastel teal
  }
};

var LS_KEY = 'gs_login_fx_light_v1';
function clone(o){ return JSON.parse(JSON.stringify(o)); }
var CFG = (function(){
  var c = clone(DEFAULTS);
  try{
    var raw = localStorage.getItem(LS_KEY);
    if(raw){
      var s = JSON.parse(raw);
      ['stroke','blobs'].forEach(function(g){
        if(s && s[g]) Object.keys(c[g]).forEach(function(k){ if(s[g][k]!==undefined) c[g][k]=s[g][k]; });
      });
    }
  }catch(e){}
  return c;
})();
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(CFG)); }catch(e){} }
function hexRgb(h){
  h = String(h).replace('#','');
  if(h.length===3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
}

var css = document.createElement('style');
css.textContent = [
'canvas.login-blobs{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block}',
'canvas.login-stroke{position:absolute;z-index:5;pointer-events:none;display:block}',
'.login-card::before{animation:none!important;opacity:0!important}',
/* the card must paint above the blob canvas */
'.login-wrap>.login-card,.login-wrap>div{position:relative;z-index:1}',
'.lsp-btn{position:fixed;right:18px;bottom:18px;z-index:99999;width:44px;height:44px;border-radius:50%;',
'  border:1px solid rgba(110,168,254,.5);background:#fff;color:#4f79b7;font:700 12px/1 Inter,sans-serif;',
'  cursor:pointer;box-shadow:0 6px 22px rgba(60,90,140,.28)}',
'.lsp{position:fixed;right:18px;bottom:72px;z-index:99999;width:300px;max-height:78vh;overflow:auto;display:none;',
'  background:#fff;border:1px solid #dbe2ee;border-radius:14px;padding:14px;',
'  box-shadow:0 18px 50px rgba(60,90,140,.3);color:#33415c;font-family:Inter,system-ui,sans-serif}',
'.lsp.open{display:block}',
'.lsp h4{margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#4f79b7;font-weight:700}',
'.lsp h4:not(:first-child){margin-top:16px;padding-top:14px;border-top:1px solid #e6ebf3}',
'.lsr{display:flex;align-items:center;gap:8px;margin-bottom:7px}',
'.lsr label{flex:0 0 104px;font-size:11px;color:#5a6b86}',
'.lsr input[type=range]{flex:1;min-width:0;accent-color:#6ea8fe;height:18px}',
'.lsr input[type=color]{width:30px;height:22px;padding:0;border:1px solid #dbe2ee;border-radius:5px;background:none;cursor:pointer}',
'.lsr .lsv{flex:0 0 46px;text-align:right;font-size:10.5px;color:#4f79b7;font-variant-numeric:tabular-nums}',
'.lsr select{flex:1;background:#fff;color:#33415c;border:1px solid #dbe2ee;border-radius:6px;font-size:11px;padding:3px 6px}',
'.lsp-acts{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;padding-top:13px;border-top:1px solid #e6ebf3}',
'.lsp-acts button{padding:7px 8px;font-size:11px;font-weight:600;border-radius:7px;cursor:pointer;background:#f6f8fb;color:#33415c;border:1px solid #dbe2ee}',
'.lsp-acts button:hover{border-color:#6ea8fe;color:#4f79b7}',
'.lsp-acts button.wide{grid-column:1/-1}'
].join('\n');
document.head.appendChild(css);

/* ── BLOBS ───────────────────────────────────────────────────────────────── */
var Blobs = (function(){
  var wrap = document.querySelector('.login-wrap');
  if(!wrap) return null;
  if(getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
  var cv = document.createElement('canvas');
  cv.className = 'login-blobs'; cv.setAttribute('aria-hidden','true');
  wrap.insertBefore(cv, wrap.firstChild);
  var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio||1, 2);
  var W=0,H=0,blobs=[],t=0;

  function frac(v){ return v - Math.floor(v); }
  function palette(){
    var b=CFG.blobs;
    return [hexRgb(b.color1),hexRgb(b.color2),hexRgb(b.color3),hexRgb(b.color4)];
  }
  function build(){
    var b=CFG.blobs;
    var minR=Math.min(W,H)*b.sizeMin, maxR=Math.min(W,H)*Math.max(b.sizeMin,b.sizeMax);
    blobs=[];
    for(var i=0;i<b.count;i++){
      var s1=frac(Math.sin(i*127.1)*43758.5453);
      var s2=frac(Math.sin(i*311.7+9.7)*24634.6345);
      var s3=frac(Math.sin(i*74.7+3.3)*9812.113);
      blobs.push({x:s1*W,y:s2*H,r:minR+(maxR-minR)*s3,ci:i%4,spd:0.55+s2*0.7});
    }
  }
  function resize(){
    var r = wrap.getBoundingClientRect();
    W=r.width; H=r.height;
    cv.width=Math.max(1,W*DPR); cv.height=Math.max(1,H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    build();
  }
  function angle(x,y){
    var fs=CFG.blobs.fieldScale;
    var n = Math.sin(x*fs         + t*0.20)
          + Math.sin(y*fs*1.31    - t*0.16)
          + Math.sin((x+y)*fs*.75 + t*0.13)
          + Math.cos((x-y)*fs*1.12- t*0.10);
    return n*0.9;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    var b=CFG.blobs;
    if(!b.enabled) return;
    var pal=palette();
    t += 0.012*b.morph;
    ctx.globalCompositeOperation = b.blend || 'multiply';
    for(var i=0;i<blobs.length;i++){
      var o=blobs[i];
      var a=angle(o.x,o.y);
      o.x += Math.cos(a)*o.spd*b.speed;
      o.y += Math.sin(a)*o.spd*b.speed;
      var m=o.r;
      if(o.x<-m) o.x+=W+2*m; else if(o.x>W+m) o.x-=W+2*m;
      if(o.y<-m) o.y+=H+2*m; else if(o.y>H+m) o.y-=H+2*m;
      var c=pal[o.ci];
      var g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+','+b.opacity.toFixed(3)+')');
      g.addColorStop(Math.min(.99,Math.max(.01,b.softness)),'rgba('+c[0]+','+c[1]+','+c[2]+','+(b.opacity*0.45).toFixed(3)+')');
      g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }
  resize();
  window.addEventListener('resize', resize);
  if(window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  return {draw:draw, rebuild:build, resize:resize};
})();

/* ── STROKE ──────────────────────────────────────────────────────────────── */
var Stroke = (function(){
  var card = document.querySelector('.login-card');
  if(!card) return null;
  var host = card.parentElement || card;   // .login-wrap — the card is overflow:hidden
  var PAD = 16;
  var cv = document.createElement('canvas');
  cv.className='login-stroke'; cv.setAttribute('aria-hidden','true');
  host.appendChild(cv);
  var ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio||1, 2);
  var pts=[], total=0, W=0, H=0;

  function cardRadius(){
    var s=CFG.stroke;
    if(s.radius!=='auto' && s.radius!=='' && !isNaN(parseFloat(s.radius))) return parseFloat(s.radius);
    var r=parseFloat(getComputedStyle(card).borderTopLeftRadius);
    return isNaN(r)?18:r;
  }
  function buildPath(){
    var inset=parseFloat(CFG.stroke.inset)||0;
    var x=PAD+inset, y=PAD+inset, w=Math.max(0,W-inset*2), h=Math.max(0,H-inset*2);
    var r=Math.min(cardRadius(), w/2, h/2);
    pts=[]; var STEP=2;
    function line(x1,y1,x2,y2){
      var d=Math.hypot(x2-x1,y2-y1), n=Math.max(1,Math.round(d/STEP));
      for(var i=0;i<n;i++) pts.push([x1+(x2-x1)*i/n, y1+(y2-y1)*i/n]);
    }
    function arc(cx,cy,a0,a1){
      var d=Math.abs(a1-a0)*r, n=Math.max(2,Math.round(d/STEP));
      for(var i=0;i<n;i++){ var a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); }
    }
    var P=Math.PI;
    line(x+r,y,x+w-r,y);       arc(x+w-r,y+r,-P/2,0);
    line(x+w,y+r,x+w,y+h-r);   arc(x+w-r,y+h-r,0,P/2);
    line(x+w-r,y+h,x+r,y+h);   arc(x+r,y+h-r,P/2,P);
    line(x,y+h-r,x,y+r);       arc(x+r,y+r,P,P*1.5);
    total=pts.length;
  }
  function resize(){
    // offsetWidth/Height (NOT client*) — the card has a 1px border and the canvas is
    // positioned from its border-box origin; client* excludes the border, which left
    // the path ~2px short along the bottom and right edges.
    W=card.offsetWidth; H=card.offsetHeight;
    var cw=W+PAD*2, ch=H+PAD*2;
    cv.width=Math.max(1,cw*DPR); cv.height=Math.max(1,ch*DPR);
    cv.style.width=cw+'px'; cv.style.height=ch+'px';
    cv.style.left=(card.offsetLeft-PAD)+'px';
    cv.style.top =(card.offsetTop -PAD)+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    buildPath();
  }
  function draw(now){
    ctx.clearRect(0,0,W+PAD*2,H+PAD*2);
    var s=CFG.stroke;
    if(!s.enabled || total<3) return;
    var c1=hexRgb(s.color1), c2=hexRgb(s.color2);
    var prog=(now % s.lap)/s.lap;
    if(s.direction<0) prog=1-prog;
    var head=prog*total, len=Math.max(2,Math.round(total*s.tail));
    ctx.lineWidth=s.width; ctx.lineCap='round';
    ctx.shadowBlur=s.glow; ctx.shadowColor='rgba('+c1[0]+','+c1[1]+','+c1[2]+',.5)';
    for(var i=0;i<len;i++){
      var f=i/(len-1);                                 // 0 = tail, 1 = head
      var alpha=Math.pow(Math.sin(f*Math.PI), s.fade); // fade both tips
      alpha *= (s.tailAlpha + (s.headAlpha-s.tailAlpha)*f) * s.opacity;
      if(!(alpha>0.004)) continue;
      var i0=Math.floor(head-len+i), i1=i0+1;
      var p0=pts[((i0%total)+total)%total], p1=pts[((i1%total)+total)%total];
      var r=Math.round(c1[0]+(c2[0]-c1[0])*f),
          g=Math.round(c1[1]+(c2[1]-c1[1])*f),
          b=Math.round(c1[2]+(c2[2]-c1[2])*f);
      ctx.strokeStyle='rgba('+r+','+g+','+b+','+alpha.toFixed(3)+')';
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke();
    }
    ctx.shadowBlur=0;
  }
  resize();
  window.addEventListener('resize', resize);
  if(window.ResizeObserver) new ResizeObserver(resize).observe(card);
  return {draw:draw, rebuild:buildPath, resize:resize};
})();

function frame(now){
  if(Blobs)  Blobs.draw();
  if(Stroke) Stroke.draw(now||0);
  requestAnimationFrame(frame);
}
if(Blobs)  Blobs.draw();
if(Stroke) Stroke.draw(0);
requestAnimationFrame(frame);

window.GSLoginFXLight = { cfg:CFG, blobs:Blobs, stroke:Stroke, save:save, defaults:DEFAULTS };

/* ── optional control panel (?fx) ─────────────────────────────────────── */
if(!/[?&]fx\b/.test(location.search)) return;

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
    ['inset',    'Edge inset',     'range', -10,  14,    0.5]
  ],
  blobs: [
    ['enabled',   'Enabled',       'bool'],
    ['count',     'Blob count',    'range', 1,     40,    1],
    ['sizeMin',   'Size min',      'range', 0.05,  1,     0.01],
    ['sizeMax',   'Size max',      'range', 0.05,  1.4,   0.01],
    ['speed',     'Drift speed',   'range', 0,     4,     0.05],
    ['morph',     'Field morph',   'range', 0,     4,     0.05],
    ['fieldScale','Field scale',   'range', 0.0002,0.006, 0.0001],
    ['opacity',   'Opacity',       'range', 0,     1,     0.01],
    ['softness',  'Softness',      'range', 0.05,  0.95,  0.01],
    ['blend',     'Blend',         'select', [['multiply','Multiply (light)'],['lighter','Lighten (dark)'],['source-over','Normal']]],
    ['color1',    'Colour 1',      'color'],
    ['color2',    'Colour 2',      'color'],
    ['color3',    'Colour 3',      'color'],
    ['color4',    'Colour 4',      'color']
  ]
};
var STRUCTURAL = { blobs:['count','sizeMin','sizeMax'], stroke:['inset','radius'] };

var btn=document.createElement('button'); btn.className='lsp-btn'; btn.type='button'; btn.textContent='FX';
var panel=document.createElement('div'); panel.className='lsp';
btn.onclick=function(){ panel.classList.toggle('open'); };
function fmt(v){ if(typeof v!=='number') return v; if(Math.abs(v)>=1000) return String(Math.round(v)); if(Number.isInteger(v)) return String(v); return v<0.01?v.toFixed(4):v.toFixed(2); }
function commit(group,key){
  if(STRUCTURAL[group] && STRUCTURAL[group].indexOf(key)>=0){
    if(group==='blobs' && Blobs) Blobs.rebuild();
    if(group==='stroke' && Stroke) Stroke.rebuild();
  }
  save();
}
function buildGroup(group,title){
  var h=document.createElement('h4'); h.textContent=title; panel.appendChild(h);
  SPECS[group].forEach(function(spec){
    var key=spec[0], row=document.createElement('div'); row.className='lsr'; row.dataset.k=group+'.'+key;
    var lb=document.createElement('label'); lb.textContent=spec[1]; row.appendChild(lb);
    var out;
    if(spec[2]==='bool'){
      var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!CFG[group][key];
      cb.onchange=function(){ CFG[group][key]=cb.checked; commit(group,key); }; row.appendChild(cb);
    } else if(spec[2]==='color'){
      var col=document.createElement('input'); col.type='color'; col.value=CFG[group][key];
      out=document.createElement('span'); out.className='lsv'; out.textContent=CFG[group][key];
      col.oninput=function(){ CFG[group][key]=col.value; out.textContent=col.value; commit(group,key); };
      row.appendChild(col); row.appendChild(out);
    } else if(spec[2]==='select'){
      var sel=document.createElement('select');
      spec[3].forEach(function(o){ var op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sel.appendChild(op); });
      sel.value=String(CFG[group][key]);
      sel.onchange=function(){ var v=sel.value; CFG[group][key]=isNaN(parseFloat(v))?v:parseFloat(v); commit(group,key); };
      row.appendChild(sel);
    } else {
      var rg=document.createElement('input'); rg.type='range'; rg.min=spec[3]; rg.max=spec[4]; rg.step=spec[5]; rg.value=CFG[group][key];
      out=document.createElement('span'); out.className='lsv'; out.textContent=fmt(CFG[group][key]);
      rg.oninput=function(){ CFG[group][key]=parseFloat(rg.value); out.textContent=fmt(CFG[group][key]); commit(group,key); };
      row.appendChild(rg); row.appendChild(out);
    }
    panel.appendChild(row);
  });
}
buildGroup('stroke','Card stroke');
buildGroup('blobs','Background blobs');

var acts=document.createElement('div'); acts.className='lsp-acts';
function download(name,text,mime){
  var b=new Blob([text],{type:mime||'application/json'}), u=URL.createObjectURL(b);
  var a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(u); },2000);
}
function snippet(){
  return '/* Login FX (light) — exported settings. Paste over the DEFAULTS block\n'
       + '   at the top of js/login-fx-light.js to bake these in. */\n'
       + 'var DEFAULTS = ' + JSON.stringify(CFG,null,2) + ';\n';
}
function refresh(){
  ['stroke','blobs'].forEach(function(group){
    SPECS[group].forEach(function(spec){
      var row=panel.querySelector('[data-k="'+group+'.'+spec[0]+'"]'); if(!row) return;
      var inp=row.querySelector('input,select'), out=row.querySelector('.lsv'), v=CFG[group][spec[0]];
      if(!inp) return;
      if(inp.type==='checkbox') inp.checked=!!v; else inp.value=v;
      if(out) out.textContent=(spec[2]==='color')?v:fmt(v);
    });
  });
}
function act(t,fn,wide){ var b=document.createElement('button'); b.type='button'; b.textContent=t; if(wide) b.className='wide'; b.onclick=fn; acts.appendChild(b); }
act('Export JSON', function(){ download('login-fx-light-settings.json', JSON.stringify(CFG,null,2)); });
act('Export JS',   function(){ download('login-fx-light-defaults.js', snippet(), 'text/javascript'); });
act('Copy JS', function(){
  var t=snippet();
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t); else prompt('Copy:',t);
});
act('Import', function(){
  var f=document.createElement('input'); f.type='file'; f.accept='.json,application/json';
  f.onchange=function(){
    var file=f.files[0]; if(!file) return;
    var rd=new FileReader();
    rd.onload=function(){
      try{
        var o=JSON.parse(rd.result);
        ['stroke','blobs'].forEach(function(g){ if(o[g]) Object.keys(CFG[g]).forEach(function(k){ if(o[g][k]!==undefined) CFG[g][k]=o[g][k]; }); });
        save(); refresh(); if(Blobs) Blobs.rebuild(); if(Stroke) Stroke.rebuild();
      }catch(e){}
    };
    rd.readAsText(file);
  };
  f.click();
});
act('Reset to defaults', function(){
  CFG=clone(DEFAULTS); try{ localStorage.removeItem(LS_KEY); }catch(e){}
  refresh(); if(Blobs) Blobs.rebuild(); if(Stroke) Stroke.rebuild();
}, true);
panel.appendChild(acts);
document.body.appendChild(btn); document.body.appendChild(panel);
})();
