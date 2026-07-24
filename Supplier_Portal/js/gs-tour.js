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

/* ── Packaging-components tour flag ───────────────────────────────────────
   Armed by the "I don't have documents right now" button on the AI-Upload
   page; consumed on the Landing page's Packaging Components tab.            */
var GS_PKG_TOUR_KEY = 'gs_pkg_tour_active';
function _gsPkgTourSetFlag()  { try{ sessionStorage.setItem(GS_PKG_TOUR_KEY,'1'); }catch(_){} }
function _gsPkgTourClearFlag(){ try{ sessionStorage.removeItem(GS_PKG_TOUR_KEY); }catch(_){} }
function _gsPkgTourIsActive() { try{ return sessionStorage.getItem(GS_PKG_TOUR_KEY)==='1'; }catch(_){ return false; } }

/* "I don't have documents right now" (AI-Upload page) → arm the packaging
   tour and land on the Packaging Components tab where it runs. */
function gsNoDocsToPackaging(){
  _gsPkgTourSetFlag();
  if(typeof gsGoLanding === 'function') gsGoLanding('packaging');
  else { try{ sessionStorage.setItem('gs_tab','packaging'); }catch(_){}
         if(typeof go === 'function') go('sp2'); }
}
try{ window.gsNoDocsToPackaging = gsNoDocsToPackaging; }catch(_){}

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

/* ── On the Landing products screen: auto-start the tour ───────────────
   Step 2 of onboarding ("Assign packaging to products") calls gsOnbStep(2),
   which arms the flag and navigates to the Landing (products tab). The whole
   assign flow — the Packaging-components column, the per-row chips, the
   "Add component" button, its library menu and the "Create a new component"
   wizard shortcut — all live on this screen, so the tour runs here.        */
(function(){
  if(!document.getElementById('prod-tbody')) return;   // Landing page only
  function tryBegin(){
    /* Packaging-components tour takes priority (armed from AI-Upload). */
    if(_gsPkgTourIsActive()){
      if(typeof switchLandingTab === 'function'){ try{ switchLandingTab('packaging'); }catch(_){} }
      var ptries = 0;
      (function waitForPkg(){
        if(document.querySelector('#pkg-lib-tbody tr')){ _gsPkgTourBegin(); }
        else if(ptries++ < 25){ setTimeout(waitForPkg, 140); }
      })();
      return;
    }
    if(!_gsTourIsActive()) return;
    if(typeof switchLandingTab === 'function'){ try{ switchLandingTab('products'); }catch(_){} }
    var tries = 0;
    (function waitForRows(){
      if(document.querySelector('#prod-tbody .prod-tr')){ _gsTourBegin(); }
      else if(tries++ < 25){ setTimeout(waitForRows, 140); }
    })();
  }
  if(document.readyState !== 'loading') setTimeout(tryBegin, 450);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(tryBegin, 450); });
})();

/* ── Tour target helpers (first product row + its add-component menu) ─── */
var _tourPi = null;
function _tourFirstRow(){ return document.querySelector('#prod-tbody .prod-tr'); }
function _tourEnsurePi(){ var r = _tourFirstRow(); _tourPi = r ? +r.getAttribute('data-pi') : null; return _tourPi; }
function _tourCloseMenu(){ if(typeof closeAllCompMenus === 'function'){ try{ closeAllCompMenus(); }catch(_){} } }
function _tourOpenMenu(){
  if(_tourPi == null) _tourEnsurePi();
  if(_tourPi == null) return null;
  var m = document.querySelector('.pcmp-menu[data-pi="' + _tourPi + '"]');
  if(!m && typeof prodToggleCompMenu === 'function'){
    var btn = document.querySelector('.pcmp-add-btn[data-pi="' + _tourPi + '"]');
    if(btn){ try{ btn.scrollIntoView({block:'center'}); }catch(_){} }
    prodToggleCompMenu(_tourPi);
    m = document.querySelector('.pcmp-menu[data-pi="' + _tourPi + '"]');
  }
  if(m) m.classList.add('gst-above');   // lift above the tour backdrop
  return m;
}
/* Add a highlight ring to a live element and register it for cleanup. */
function _tourHL(sel){
  var el = document.querySelector(sel);
  if(el){ el.classList.add('gst-highlight'); _highlighted.push(el); }
  return el;
}

/* ══════════════════════════════════════════════════════════════════════════
   TOUR ENGINE
   ══════════════════════════════════════════════════════════════════════════ */

var _tourStep    = 0;
var _tourRunning = false;
var _tourOverlay = null;
var _highlighted = [];
/* The step set the engine is currently walking — swapped per tour. */
var _activeSteps = null;

/* Tour step definitions — all on the Landing "Products" screen. */
var _TOUR_STEPS = [
  /* Step 1 – Packaging-components column + first row ────────────────────── */
  {
    icon:  '📦',
    title: 'Packaging components',
    body:  'This is where you assign packaging to each product. The ' +
           '<strong>Packaging Components</strong> column shows what each product ships in — ' +
           'the chips are the components you\'ve already added, and the <strong>/ number</strong> ' +
           'next to the count is how many Primark <strong>expects</strong>. ' +
           'Hover the <strong>ⓘ</strong> beside a product code to see the exact expected list.',
    targetFn: function(){ return document.querySelector('#prod-tbody .prod-tr:first-child .pcmp-cell') || document.querySelector('th[data-sort="comps"]'); },
    position: 'left',
    onShow: function(){
      _tourCloseMenu();
      _tourEnsurePi();
      _tourHL('#prod-tbody .prod-tr:first-child .pcmp-cell');
      _tourHL('#prod-tbody .prod-tr:first-child .prod-tooltip-wrap');
    }
  },
  /* Step 2 – Add component button ──────────────────────────────────────── */
  {
    icon:  '➕',
    title: 'Add a packaging component',
    body:  'To add a component to a product, click <strong>Add component</strong> in this column. ' +
           'A searchable list of your saved packaging library opens so you can pick the one that applies.',
    targetFn: function(){ return document.querySelector('#prod-tbody .prod-tr:first-child .pcmp-add-btn'); },
    position: 'left',
    onShow: function(){
      _tourCloseMenu();
      var btn = _tourHL('#prod-tbody .prod-tr:first-child .pcmp-add-btn');
      if(btn) btn.classList.add('gst-pulse-target');
    },
    onHide: function(){
      var btn = document.querySelector('#prod-tbody .prod-tr:first-child .pcmp-add-btn');
      if(btn) btn.classList.remove('gst-pulse-target');
    }
  },
  /* Step 3 – Pick from the saved library ───────────────────────────────── */
  {
    icon:  '📚',
    title: 'Pick from your library',
    body:  'Here\'s your saved packaging library. Search by name and click any component ' +
           'to add it to the product instantly — no re-typing its details.',
    targetFn: function(){ return document.querySelector('.pcmp-menu[data-pi] .comp-menu-items'); },
    position: 'left',
    onShow: function(){
      var self = this;
      _tourEnsurePi();
      /* Open AFTER the current click finishes bubbling, else the global
         outside-click closer (supplier-portal.js) kills the just-opened menu.
         Then re-anchor the bubble to the now-visible list. */
      setTimeout(function(){
        _tourOpenMenu();
        _tourHL('.pcmp-menu[data-pi="' + _tourPi + '"] .comp-menu-items');
        _positionBubble(self);
      }, 80);
    }
  },
  /* Step 4 – Create a new component via the wizard ─────────────────────── */
  {
    icon:  '🧙',
    title: 'Create a new component',
    body:  'Not in your library yet? Click <strong>Create a new component</strong> at the bottom of the list ' +
           'to open the step-by-step <strong>wizard</strong>, where you can declare a brand-new packaging type ' +
           'with all of its compliance details.',
    targetFn: function(){ return document.querySelector('.pcmp-menu[data-pi] .comp-menu-create-new'); },
    position: 'left',
    isLast: true,
    onShow: function(){
      var self = this;
      _tourEnsurePi();
      setTimeout(function(){
        _tourOpenMenu();
        var c = document.querySelector('.pcmp-menu[data-pi="' + _tourPi + '"] .comp-menu-create-new');
        if(c){ c.classList.add('gst-highlight','gst-pulse-target'); _highlighted.push(c); }
        _positionBubble(self);
      }, 80);
    },
    onHide: function(){
      var c = document.querySelector('.comp-menu-create-new');
      if(c) c.classList.remove('gst-pulse-target');
    }
  }
];

/* ══════════════════════════════════════════════════════════════════════════
   PACKAGING-COMPONENTS TOUR  — Landing "Packaging Components" tab.
   Armed by the AI-Upload page's "I don't have documents right now" button, so
   a supplier without files still understands the listing and its two ways in:
   import uploaded documents, or create a component by hand.
   ══════════════════════════════════════════════════════════════════════════ */
var _PKG_TOUR_STEPS = [
  /* Step 1 – the listing itself ────────────────────────────────────────── */
  {
    icon:  '📦',
    title: 'Your packaging components',
    body:  'This is your <strong>packaging library</strong> — every component you supply lives here. These are fictitious examples that will not show up later. ' +
           'In a ensuing step you\'ll simply <strong>attach these to the products</strong> Primark buys from you, ' +
           'so it\'s worth building the list up first.',
    targetFn: function(){ return document.getElementById('pkg-lib-scroll') || document.getElementById('pkg-lib-table'); },
    position: 'above',
    onShow: function(){
      /* Contour around the whole listing (the scroll wrapper isn't clipped
         horizontally the way the inner table would be). */
      var t = document.getElementById('pkg-lib-scroll') || document.getElementById('pkg-lib-table');
      if(t){ t.classList.add('gst-highlight'); _highlighted.push(t); }
    }
  },
  /* Step 2 – Status column: focus on the non-compliant ones ─────────────── */
  {
    icon:  '🚦',
    title: 'Watch the compliance status',
    body:  'This is the <strong>most important thing to keep an eye on</strong>. The ' +
           '<strong>Status</strong> column shows whether each component is ready: a green ' +
           '<strong>Compliant</strong> is done, while this <strong>Review needed</strong> one ' +
           '(and any <strong>Incomplete</strong> rows) still need you. ' +
           'Focus on the packagings that are <strong>not compliant</strong> first — they\'re what could hold up your submission.',
    targetFn: function(){ return document.querySelector('#pkg-lib-tbody .pkg-status-pill.review') || document.querySelector('#pkg-lib-tbody .pkg-status-pill'); },
    position: 'left',
    onShow: function(){
      var p = document.querySelector('#pkg-lib-tbody .pkg-status-pill.review') || document.querySelector('#pkg-lib-tbody .pkg-status-pill');
      if(p){ try{ p.scrollIntoView({block:'center'}); }catch(_){}
             p.classList.add('gst-highlight','gst-pulse-target'); _highlighted.push(p); }
    },
    onHide: function(){
      var p = document.querySelector('#pkg-lib-tbody .pkg-status-pill.gst-pulse-target');
      if(p) p.classList.remove('gst-pulse-target');
    }
  },
  /* Step 3 – Import with AI (uploaded documents) ───────────────────────── */
  {
    icon:  '🪄',
    title: 'Have documents? Import them',
    body:  'When you do have spec sheets, photos or spreadsheets, click <strong>Import with AI</strong> — ' +
           'it reads your files and fills in the component details for you, so you don\'t type them by hand.',
    targetFn: function(){ return document.getElementById('pkg-import-ai-btn'); },
    position: 'below',
    onShow: function(){
      var b = _tourHL('#pkg-import-ai-btn');
      if(b) b.classList.add('gst-pulse-target');
    },
    onHide: function(){
      var b = document.getElementById('pkg-import-ai-btn');
      if(b) b.classList.remove('gst-pulse-target');
    }
  },
  /* Step 4 – Add component manually ────────────────────────────────────── */
  {
    icon:  '✏️',
    title: 'Or add one by hand',
    body:  'No file for it? Click <strong>Add component</strong> to open the step-by-step form ' +
           'and enter the packaging details yourself. You can mix and match — import some, type others.',
    targetFn: function(){ return document.getElementById('pkg-add-comp-btn'); },
    position: 'below',
    isLast: true,
    onShow: function(){
      var b = _tourHL('#pkg-add-comp-btn');
      if(b) b.classList.add('gst-pulse-target');
    },
    onHide: function(){
      var b = document.getElementById('pkg-add-comp-btn');
      if(b) b.classList.remove('gst-pulse-target');
    }
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
  _activeSteps = _TOUR_STEPS;
  _tourStep   = 0;
  _tourRunning = true;
  _gsTourClearFlag();  // consumed — clear it so refresh doesn't re-fire
  _buildOverlay();
  _gsTourShow(0);
}

/* ── Begin the packaging-components tour (Landing → Packaging tab) ─────── */
function _gsPkgTourBegin(){
  if(_tourRunning) return;
  _activeSteps = _PKG_TOUR_STEPS;
  _tourStep    = 0;
  _tourRunning = true;
  _gsPkgTourClearFlag();  // consumed
  _buildOverlay();
  _gsTourShow(0);
}

/* ── Show a specific step ────────────────────────────────────────────── */
function _gsTourShow(idx){
  if(!_tourOverlay) return;
  var STEPS = _activeSteps || _TOUR_STEPS;
  idx = Math.max(0, Math.min(idx, STEPS.length - 1));
  _tourStep = idx;
  var step = STEPS[idx];

  /* Clear previous highlights */
  _clearHighlights();
  /* Call prev step's onHide */
  if(idx > 0 && STEPS[idx-1].onHide) STEPS[idx-1].onHide();

  /* Step indicator dots */
  var dots = document.getElementById('gst-dots');
  if(dots){
    dots.innerHTML = STEPS.map(function(_,i){
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

  /* Hide the bubble, then let _positionBubble pop it in AT its final spot
     (avoids the old "appear, then jump to position" clunk). */
  var bubble = document.getElementById('gst-bubble');
  if(bubble) bubble.classList.remove('gst-bubble-in');
  _positionBubble(step);
}

/* Scale-pop the bubble in at its current (already-positioned) location. */
function _popBubbleIn(){
  var bubble = document.getElementById('gst-bubble');
  if(!bubble) return;
  bubble.classList.remove('gst-bubble-in');
  void bubble.offsetWidth;   /* restart the transition */
  bubble.classList.add('gst-bubble-in');
}

function _clearHighlights(){
  _highlighted.forEach(function(el){ try{ el.classList.remove('gst-highlight'); }catch(_){} });
  _highlighted = [];
}

/* ── Position bubble next to its target element ─────────────────────── */
var _posT = null;
function _positionBubble(step){
  var bubble = document.getElementById('gst-bubble');
  var arrow  = document.getElementById('gst-arrow');
  if(!bubble) return;

  var target = step.targetFn ? step.targetFn() : null;
  var pos    = step.position || 'below';

  if(!target){
    /* Fallback: centre of screen (numeric, so the CSS scale-pop still plays) */
    var fbw = bubble.offsetWidth || 320, fbh = bubble.offsetHeight || 230;
    bubble.style.position = 'fixed';
    bubble.style.left = Math.max(14, (window.innerWidth  - fbw)/2) + 'px';
    bubble.style.top  = Math.max(14, (window.innerHeight - fbh)/2) + 'px';
    bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
    if(arrow) arrow.style.display = 'none';
    _popBubbleIn();
    return;
  }

  try{ target.scrollIntoView({behavior:'smooth', block:'center'}); }catch(_){}

  clearTimeout(_posT);
  _posT = setTimeout(function(){
    var tr  = target.getBoundingClientRect();
    var bw  = bubble.offsetWidth  || 320;
    var bh  = bubble.offsetHeight || 230;
    var vw  = window.innerWidth;
    var vh  = window.innerHeight;
    var pad = 14;

    bubble.style.position  = 'fixed';

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
    _popBubbleIn();
  }, 300);
}

/* ── Navigation ──────────────────────────────────────────────────────── */
function _gsTourNext(){
  var STEPS = _activeSteps || _TOUR_STEPS;
  var step = STEPS[_tourStep];
  if(step && step.onHide) step.onHide();
  if(_tourStep >= STEPS.length - 1){
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
  _gsPkgTourClearFlag();
  _clearHighlights();
  _tourCloseMenu();
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
