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

/* ── On the Landing products screen: auto-start the tour ───────────────
   Step 2 of onboarding ("Assign packaging to products") calls gsOnbStep(2),
   which arms the flag and navigates to the Landing (products tab). The whole
   assign flow — the Packaging-components column, the per-row chips, the
   "Add component" button, its library menu and the "Create a new component"
   wizard shortcut — all live on this screen, so the tour runs here.        */
(function(){
  if(!document.getElementById('prod-tbody')) return;   // Landing page only
  function tryBegin(){
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
    position: 'above',
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
