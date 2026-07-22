/* ═══════════════════════════════════════════════════════════════════════════
   GreenStreets Supplier Portal — Guided Tour  (gs-tour.js)
   ═══════════════════════════════════════════════════════════════════════════
   This file EXTENDS the routing layer already in supplier-portal.js.

   Activation:
     • On the Welcome page the user clicks Step 2 "Assign packaging to products"
       → the existing gsOnbStep(2) is called.
     • We wrap gsOnbStep so that when step === 2, we also set a sessionStorage
       flag GS_TOUR_KEY = '1'.
     • When Product-Detail.html loads, we detect the flag and start the tour
       automatically after the product data is rendered.

   Tour steps (on the Product Detail page):
     1. "Packaging components" section  – explains the column + expected list
     2. Existing cards                   – shows what's already filled in
     3. "Add packaging component" btn    – guides user to click it
     4. "Create new" in wizard          – explains the wizard shortcut
*/

/* ── Session flag ─────────────────────────────────────────────────────── */
var GS_TOUR_KEY = 'gs_tour_active';

function _gsTourSetFlag()  { try{ sessionStorage.setItem(GS_TOUR_KEY,'1'); }catch(_){} }
function _gsTourClearFlag(){ try{ sessionStorage.removeItem(GS_TOUR_KEY); }catch(_){} }
function _gsTourIsActive() { try{ return sessionStorage.getItem(GS_TOUR_KEY)==='1'; }catch(_){ return false; } }

/* ── Wrap gsOnbStep to inject tour flag on step 2 ────────────────────── */
/* supplier-portal.js sets gsOnbStep in the "SPLIT-BUILD OVERRIDES" block,
   which runs synchronously.  gs-tour.js loads after it, so by the time this
   IIFE runs the function already exists and we can wrap it safely. */
(function(){
  /* Guard: only needed on pages that have the Welcome screen (Welcome.html)
     or the Landing (which has the Getting-started button). Both pages include
     gs-tour.js.  Product-Detail.html also includes it for the tour itself. */
  if(typeof gsOnbStep !== 'function') return;

  var _orig = gsOnbStep;
  gsOnbStep = function(n){
    if(n === 2){
      _gsTourSetFlag();   // arm the tour before navigating to landing/product
    } else {
      _gsTourClearFlag(); // any other step → disarm
    }
    _orig(n);
  };
})();

/* ── On Product-Detail.html: wrap openProductDetail to start tour ──────
   The Product-Detail page uses the split-build override of openProductDetail
   (sessionStorage gs_pi + page navigation), but on the actual product-detail
   HTML page the *original* monolith openProductDetail is the one that
   renders and stays.  We hook into renderProductDetail instead.           */
(function(){
  /* Only run the tour hook on the Product-Detail page */
  if(!document.getElementById('proddetail') && !document.querySelector('#pd-body')) return;
  if(typeof renderProductDetail !== 'function') return;

  var _origRender = renderProductDetail;
  renderProductDetail = function(pi){
    _origRender(pi);
    if(_gsTourIsActive()){
      setTimeout(function(){ _gsTourBegin(); }, 480);
    }
  };
})();

/* ══════════════════════════════════════════════════════════════════════════
   TOUR ENGINE
   ══════════════════════════════════════════════════════════════════════════ */

var _tourStep    = 0;
var _tourRunning = false;
var _tourOverlay = null;
var _highlighted = [];

/* Tour step definitions */
var _TOUR_STEPS = [
  /* Step 1 – Packaging components section ──────────────────────────────── */
  {
    icon:  '📦',
    title: 'Packaging components',
    body:  'This section lists all the packaging components assigned to this product. ' +
           'Primark has pre-defined which components are <strong>expected</strong> — ' +
           'you can see them by hovering the <strong>ⓘ</strong> icon next to the product code on the list page.',
    targetFn: function(){ return document.querySelector('.pd-comp-hdr') || document.querySelector('#pd-body'); },
    highlight: ['.pd-comp-hdr'],
    position: 'below'
  },
  /* Step 2 – Existing cards ────────────────────────────────────────────── */
  {
    icon:  '✅',
    title: 'Components already assigned',
    body:  'Each card represents one packaging component. ' +
           'Click a card to expand it and review or fill in the compliance fields — ' +
           '<strong>material, weight, recycled content</strong> and more — that Primark requires.',
    targetFn: function(){
      return document.querySelector('.pd-card') ||
             document.querySelector('.pd-comp-list') ||
             document.querySelector('.pd-comp-hdr');
    },
    highlight: ['.pd-comp-list'],
    position: 'right'
  },
  /* Step 3 – Add packaging component button ────────────────────────────── */
  {
    icon:  '➕',
    title: 'Add a packaging component',
    body:  'Need to add another component? Click <strong>"Add packaging component"</strong>. ' +
           'A searchable list of your saved packaging library will appear — ' +
           'just pick the component that applies to this product.',
    targetFn: function(){ return document.querySelector('[id^="pd-addcard-"]'); },
    highlight: ['[id^="pd-addcard-"]'],
    position: 'above',
    onShow: function(){
      var btn = document.querySelector('[id^="pd-addcard-"]');
      if(btn) btn.classList.add('gst-pulse-target');
    },
    onHide: function(){
      var btn = document.querySelector('[id^="pd-addcard-"]');
      if(btn) btn.classList.remove('gst-pulse-target');
    }
  },
  /* Step 4 – Create new via wizard ─────────────────────────────────────── */
  {
    icon:  '🧙',
    title: 'Create a new component',
    body:  'If a component isn\'t in your library yet, click <strong>"Add packaging component"</strong> ' +
           'and choose <strong>"Create a new component"</strong> at the bottom of the list. ' +
           'This opens the step-by-step wizard where you can declare a brand-new packaging type ' +
           'with all its compliance details.',
    targetFn: function(){ return document.querySelector('[id^="pd-addcard-"]'); },
    highlight: ['[id^="pd-addcard-"]'],
    position: 'above',
    isLast: true
  }
];

/* ── Build overlay DOM ───────────────────────────────────────────────── */
function _buildOverlay(){
  if(_tourOverlay){ try{ _tourOverlay.remove(); }catch(_){} _tourOverlay = null; }

  var el = document.createElement('div');
  el.id = 'gs-tour-overlay';
  el.className = 'gst-overlay';
  el.innerHTML =
    '<div class="gst-backdrop" id="gst-backdrop"></div>' +
    '<div class="gst-bubble" id="gst-bubble" role="dialog" aria-modal="true" aria-label="Guided tour">' +
      '<div class="gst-bubble-inner">' +
        '<div class="gst-top">' +
          '<div class="gst-step-dots" id="gst-dots"></div>' +
          '<button class="gst-close" id="gst-close-btn" title="Close tour" aria-label="Close tour">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="gst-icon" id="gst-icon"></div>' +
        '<div class="gst-title" id="gst-title"></div>' +
        '<div class="gst-body"  id="gst-body"></div>' +
        '<div class="gst-foot">' +
          '<button class="gst-btn-skip" id="gst-skip-btn">Skip tour</button>' +
          '<div class="gst-foot-right">' +
            '<button class="gst-btn-prev" id="gst-prev-btn" style="display:none">← Back</button>' +
            '<button class="gst-btn-next" id="gst-next-btn">Next →</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="gst-arrow" id="gst-arrow"></div>' +
    '</div>';

  document.body.appendChild(el);
  _tourOverlay = el;

  document.getElementById('gst-close-btn').addEventListener('click', _gsTourDone);
  document.getElementById('gst-skip-btn').addEventListener('click',  _gsTourDone);
  document.getElementById('gst-next-btn').addEventListener('click',  _gsTourNext);
  document.getElementById('gst-prev-btn').addEventListener('click',  _gsTourPrev);
  document.getElementById('gst-backdrop').addEventListener('click',  _gsTourDone);
  document.addEventListener('keydown', _tourKeyDown);
}

function _tourKeyDown(e){
  if(!_tourRunning) return;
  if(e.key==='Escape'){ e.preventDefault(); _gsTourDone(); }
  else if(e.key==='ArrowRight'){ e.preventDefault(); _gsTourNext(); }
  else if(e.key==='ArrowLeft'){  e.preventDefault(); _gsTourPrev(); }
}

/* ── Begin tour ──────────────────────────────────────────────────────── */
function _gsTourBegin(){
  if(_tourRunning) return;
  _tourStep   = 0;
  _tourRunning = true;
  _gsTourClearFlag();  // consumed — clear it so refresh doesn't re-fire
  _buildOverlay();
  _gsTourShow(0);
}

/* ── Show a specific step ────────────────────────────────────────────── */
function _gsTourShow(idx){
  if(!_tourOverlay) return;
  idx = Math.max(0, Math.min(idx, _TOUR_STEPS.length - 1));
  _tourStep = idx;
  var step = _TOUR_STEPS[idx];

  /* Clear previous highlights */
  _clearHighlights();
  /* Call prev step's onHide */
  if(idx > 0 && _TOUR_STEPS[idx-1].onHide) _TOUR_STEPS[idx-1].onHide();

  /* Step indicator dots */
  var dots = document.getElementById('gst-dots');
  if(dots){
    dots.innerHTML = _TOUR_STEPS.map(function(_,i){
      return '<span class="gst-dot'+(i===idx?' gst-dot-active':'')+'"></span>';
    }).join('');
  }

  /* Content */
  var icon    = document.getElementById('gst-icon');
  var title   = document.getElementById('gst-title');
  var body    = document.getElementById('gst-body');
  var nextBtn = document.getElementById('gst-next-btn');
  var prevBtn = document.getElementById('gst-prev-btn');

  if(icon)  icon.textContent = step.icon || '';
  if(title) title.textContent = step.title;
  if(body)  body.innerHTML   = step.body;
  if(nextBtn) nextBtn.textContent = step.isLast ? '✓ Done' : 'Next →';
  if(prevBtn) prevBtn.style.display = idx === 0 ? 'none' : '';

  /* Highlight targets */
  (step.highlight || []).forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      el.classList.add('gst-highlight');
      _highlighted.push(el);
    });
  });

  /* Step-specific callback */
  if(step.onShow) step.onShow();

  /* Position bubble */
  _positionBubble(step);

  /* Animate in */
  var bubble = document.getElementById('gst-bubble');
  if(bubble){
    bubble.classList.remove('gst-bubble-in');
    void bubble.offsetWidth;
    bubble.classList.add('gst-bubble-in');
  }
}

function _clearHighlights(){
  _highlighted.forEach(function(el){ try{ el.classList.remove('gst-highlight'); }catch(_){} });
  _highlighted = [];
}

/* ── Position bubble next to its target element ─────────────────────── */
function _positionBubble(step){
  var bubble = document.getElementById('gst-bubble');
  var arrow  = document.getElementById('gst-arrow');
  if(!bubble) return;

  var target = step.targetFn ? step.targetFn() : null;
  var pos    = step.position || 'below';

  if(!target){
    /* Fallback: centre of screen */
    bubble.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);right:auto;bottom:auto';
    if(arrow) arrow.style.display = 'none';
    return;
  }

  try{ target.scrollIntoView({behavior:'smooth', block:'center'}); }catch(_){}

  setTimeout(function(){
    var tr  = target.getBoundingClientRect();
    var bw  = bubble.offsetWidth  || 320;
    var bh  = bubble.offsetHeight || 230;
    var vw  = window.innerWidth;
    var vh  = window.innerHeight;
    var pad = 14;

    bubble.style.position  = 'fixed';
    bubble.style.transform = 'none';

    var left, top, arrowCls;

    if(pos === 'below'){
      top      = Math.min(tr.bottom + 12, vh - bh - pad);
      left     = Math.max(pad, Math.min(tr.left + tr.width/2 - bw/2, vw - bw - pad));
      arrowCls = 'gst-arrow-top';
    } else if(pos === 'above'){
      top      = Math.max(pad, tr.top - bh - 12);
      left     = Math.max(pad, Math.min(tr.left + tr.width/2 - bw/2, vw - bw - pad));
      arrowCls = 'gst-arrow-bottom';
    } else if(pos === 'right'){
      left     = Math.min(tr.right + 12, vw - bw - pad);
      top      = Math.max(pad, Math.min(tr.top + tr.height/2 - bh/2, vh - bh - pad));
      arrowCls = 'gst-arrow-left';
    } else {
      left     = Math.max(pad, tr.left - bw - 12);
      top      = Math.max(pad, Math.min(tr.top + tr.height/2 - bh/2, vh - bh - pad));
      arrowCls = 'gst-arrow-right';
    }

    bubble.style.left   = left + 'px';
    bubble.style.top    = top  + 'px';
    bubble.style.right  = 'auto';
    bubble.style.bottom = 'auto';

    if(arrow){
      arrow.style.display = '';
      arrow.className     = 'gst-arrow ' + arrowCls;
      if(pos==='below' || pos==='above'){
        var al = Math.max(20, Math.min((tr.left + tr.width/2) - left, bw - 20));
        arrow.style.left = al + 'px';
        arrow.style.top  = '';
      } else {
        var at = Math.max(20, Math.min((tr.top + tr.height/2) - top, bh - 20));
        arrow.style.top  = at + 'px';
        arrow.style.left = '';
      }
    }
  }, 370);
}

/* ── Navigation ──────────────────────────────────────────────────────── */
function _gsTourNext(){
  var step = _TOUR_STEPS[_tourStep];
  if(step && step.onHide) step.onHide();
  if(_tourStep >= _TOUR_STEPS.length - 1){
    _gsTourDone();
  } else {
    _gsTourShow(_tourStep + 1);
  }
}

function _gsTourPrev(){
  if(_tourStep > 0) _gsTourShow(_tourStep - 1);
}

function _gsTourDone(){
  _tourRunning = false;
  _gsTourClearFlag();
  _clearHighlights();
  document.removeEventListener('keydown', _tourKeyDown);
  document.querySelectorAll('.gst-pulse-target').forEach(function(el){
    el.classList.remove('gst-pulse-target');
  });
  if(_tourOverlay){
    _tourOverlay.classList.add('gst-overlay-out');
    var ov = _tourOverlay;
    setTimeout(function(){ try{ ov.remove(); }catch(_){} }, 350);
    _tourOverlay = null;
  }
}

/* ── Public helpers (called from Welcome/Landing page buttons) ────────── */
/* These are already defined by supplier-portal.js split-build; we only need
   the tour flag injection done above in the gsOnbStep wrapper.             */
