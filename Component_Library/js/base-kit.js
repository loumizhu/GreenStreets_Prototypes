/* ==========================================================================
   base-kit.js — the small amount of behaviour the design sheet needs.

   Three jobs, in this order:

   1. Let the real theme JS upgrade the specimens, so a dropdown list is the
      themed control and a number field has its stepper — the frames must show
      what ships, not a plain <select>.
   2. Then STRIP what the theme JS adds for interaction but which would import
      into Figma as junk: the fixed full-viewport FX layer, the focus ring
      overlay, and the ripple/particle tokens.
   3. Pin the overlay-bearing specimens open, because a design sheet has to
      show a dropdown's menu and a toast, not just their triggers.

   No layout measurement here on purpose. The column spans are decided at
   build time in tools/build-base-kit.py so the sheet is identical every time
   it is opened or captured — a runtime reflow would make two exports of the
   same file differ.
   ========================================================================== */
(function () {
  'use strict';

  var MENU_SAMPLE = 6;      /* options drawn per menu - see the cap below */

  /* ── 1. the specimens are enhanced by the real portal JS ───────────────
     greenstreets-theme.js runs before this file and does most of it. The
     packaging combo needs its own builder, the same way the catalogue does. */
  function enhance() {
    if (typeof window.GSEnhanceSelects === 'function') {
      try { window.GSEnhanceSelects(document); } catch (e) {}
    }
    if (typeof window.GSEnhanceNumbers === 'function') {
      try { window.GSEnhanceNumbers(document); } catch (e) {}
    }
    if (typeof window.GSPkgControls === 'function') {
      document.querySelectorAll('.bk-cell-box').forEach(function (st) {
        if (!st.querySelector('.pkg-detail-feat')) return;
        try { window.GSPkgControls(st); } catch (e) {}
      });
    }
  }

  /* ── 2. strip what would import as junk ───────────────────────────────── */
  function deFx() {
    /* The FX layer is a fixed, full-viewport div appended to <body>. In an
       import it becomes a detached layer the size of the artboard. */
    ['#gs-fx-layer', '.fs-ring'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    });
    /* Turn the effects off at the source too, so nothing re-creates them. */
    var r = document.documentElement.style;
    r.setProperty('--ripple-enabled', '0');
    r.setProperty('--particle-enabled', '0');
    /* NOT --field-stroke-weight: the focus cells reproduce the ring statically
       from that token (see SYSTEM_FOCUS in tools/kit_states.py). Zeroing it
       here made every focus cell draw a 0px ring, which is why a focused field
       showed no stroke. The overlay ELEMENT is still removed above. */
  }

  /* Everything that must not exist in an export: the FX layer, the
     focus-ring overlay, and any portal left on <body>. Idempotent. */
  function sweep() {
    deFx();
    /* Anything position:fixed sitting directly on <body> is a portal or a
       floating control whose owner is off-sheet. It is outside the artboard, so
       it would import as a detached layer over the export. A named list was not
       enough here: a part with no theme-toggle specimen gets the portals' own
       floating toggle injected (.hdr-theme-fixed), which no list predicted. */
    [].slice.call(document.body.children).forEach(function (el) {
      if (el.tagName === 'SCRIPT' || el.classList.contains('bk-artboard')) return;
      if (getComputedStyle(el).position === 'fixed') el.remove();
    });
    document.querySelectorAll('body > .cs-menu, body > .gs-ecombo-menu, body > .gs-colmenu')
      .forEach(function (el) { el.remove(); });
  }

  /* ── the open state, built rather than clicked ─────────────────────────────
     The open cells used to be realised by clicking the trigger, because the
     enhancer renders its options on the real open path. That had three costs
     the sheet could not carry:

       * clicking moved FOCUS into the dropdown, and because the same handler
         re-ran on every click and scroll, focus was dragged back there
         constantly — nothing else on the page could be focused;
       * the same click COLLAPSED any text selection, so you could not select
         a label to copy it;
       * the enhancer's menu is a `position:fixed` portal appended to <body>,
         so each open had to be chased and moved back into its frame.

     So the menu is CONSTRUCTED instead, from the real <select> options and with
     the enhancer's own classes (`.cs-menu` / `.cs-opt` / `.sel`). The sheet is
     now fully static: no synthetic clicks, no focus theft, no portals. The
     duplication is small and deliberate — it is markup, not behaviour, and this
     page only ever needs the drawing.

     Keep the class names in step with GSEnhanceSelects in greenstreets-theme.js
     and gsAttachCombo in gs-pkg-controls.js. */
  function buildMenu(wrap, values, selectedText, extraClass) {
    if (!wrap || !values.length) return null;
    var menu = wrap.querySelector('.cs-menu');
    if (!menu) {
      menu = document.createElement('div');
      wrap.appendChild(menu);
    }
    menu.className = 'cs-menu open' + (extraClass ? ' ' + extraClass : '');
    menu.innerHTML = '';

    var shown = values.slice(0, MENU_SAMPLE);
    shown.forEach(function (t) {
      var o = document.createElement('div');
      o.className = 'cs-opt' + (t === selectedText ? ' sel' : '');
      o.textContent = t;
      menu.appendChild(o);
    });
    if (values.length > MENU_SAMPLE) {
      var more = document.createElement('div');
      more.className = 'bk-menu-more';
      more.textContent = '+ ' + (values.length - MENU_SAMPLE) + ' more from the vocabulary';
      menu.appendChild(more);
    }

    /* Full width of the field, in flow, and never clipped or scrolled: the
       point of this cell is that the whole list is visible. */
    menu.style.cssText = 'position:static;display:block;margin-top:6px;' +
                         'width:100%;min-width:0;max-width:none;max-height:none;' +
                         'overflow:visible;inset:auto;transform:none;';
    wrap.classList.add('open');
    return menu;
  }

  function selectValues(sel) {
    return [].filter.call(sel.options, function (o) {
      var t = (o.text || '').trim();
      return !o.disabled && t && !/^select/i.test(t);
    }).map(function (o) { return o.text.trim(); });
  }

  /* ── structural states ────────────────────────────────────────────────────
     A state cell carries `data-bk-do="<action>"`, and these are the actions.
     They are not CSS: they put the markup into the state by doing what a user
     would do — open the menu, choose the option, tick the box — so the product
     CSS (.on / .sel / .active / .open / :checked, which it already has) draws
     the result. Keep this list in step with STRUCTURAL in tools/kit_states.py.

     Each action is deliberately tolerant: a specimen's markup can change in
     components.html at any time, and a state that can no longer be realised
     should quietly draw nothing rather than throw and take the sheet with it.
     The verification pass then reports it as a cell that does not differ. */
  var ACTIONS = {

    /* Open, without a click - see buildMenu above for why that matters.
       The themed <select> no longer arrives here: build-base-kit.py bakes that
       one, open menu included, so it cannot be broken by a stale script. What
       is left is the editable combo, whose menu is built by gs-pkg-controls at
       runtime and so has to be handled at runtime. */
    open: function (box) {
      var combo = box.querySelector('.gs-ecombo');
      if (!combo) return;
      /* The combo is backed by the schema vocabulary, not by a <select>. */
      var vals = (window.GS_VOCAB && window.GS_VOCAB.materialName) || [];
      var input = combo.querySelector('input');
      buildMenu(combo, vals.slice(), input ? input.value.trim() : '', 'gs-ecombo-menu');
    },

    /* A value chosen: the trigger shows it and the menu stays shut. Set it on
       the real <select> and let the enhancer's own change path sync the label,
       rather than writing the trigger's text — that would draw a label the
       component could never actually produce. */
    selected: function (box) {
      var sel = box.querySelector('select');
      if (!sel || sel.options.length < 2) return;
      var i = sel.selectedIndex;
      for (var k = 0; k < sel.options.length; k++) {
        if (k !== i && !sel.options[k].disabled && sel.options[k].value !== '') { i = k; break; }
      }
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /* Typed: a partial query, with the list filtered to what matches it -
       which is the whole point of an editable dropdown. Filtered here rather
       than by dispatching an `input` event, for the same no-clicks reason. */
    typed: function (box) {
      var inp = box.querySelector('input');
      var combo = box.querySelector('.gs-ecombo');
      if (!inp || !combo) return;
      var q = 'paper';
      inp.value = 'Paper';
      var vals = ((window.GS_VOCAB && window.GS_VOCAB.materialName) || [])
        .filter(function (v) { return v.toLowerCase().indexOf(q) > -1; });
      buildMenu(combo, vals, 'Paper', 'gs-ecombo-menu');
    },

    checked: function (box) {
      box.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = true; });
    },

    /* `indeterminate` has no HTML attribute — it exists only as a DOM property,
       which is exactly why the catalogue needs a data flag for it too. */
    indeterminate: function (box) {
      box.querySelectorAll('input[type=checkbox]').forEach(function (c) {
        c.checked = false;
        c.indeterminate = true;
      });
    },

    filled: function (box) {
      box.querySelectorAll('input,textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio' || el.value) return;
        el.value = el.type === 'number' ? '48' : 'Primark Stores Ltd';
      });
    },

    /* The mirror of `filled`, for a specimen that already ships with values —
       the number input arrives showing 1.72 and 300, so its resting state IS
       the filled one and the useful extra cell is the empty one. */
    empty: function (box) {
      box.querySelectorAll('input,textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') return;
        el.value = '';
      });
    },

    query: function (box) {
      var inp = box.querySelector('input');
      if (inp) inp.value = 'swing tag';
    },

    'sort-asc': function (box) { sortHeader(box, 'asc'); },
    'sort-desc': function (box) { sortHeader(box, 'desc'); },

    'progress-full': function (box) { setProgress(box, 100); },
    'progress-low': function (box) { setProgress(box, 8); },

    /* Move the selection along, so the cell shows a DIFFERENT option chosen
       rather than repeating the default. */
    'seg-next': function (box) { moveOn(box, '.gs-seg-opt', 'on'); },
    'tab-next': function (box) { moveOn(box, '.landing-tab', 'active'); },

    'row-selected': function (box) {
      var row = box.querySelector('tbody tr');
      if (!row) return;
      row.classList.add('gs-kbd', 'sel', 'on');
      var cb = row.querySelector('input[type=checkbox]');
      if (cb) cb.checked = true;
    }
  };

  function moveOn(box, sel, cls) {
    var opts = box.querySelectorAll(sel);
    if (opts.length < 2) return;
    opts.forEach(function (o) { o.classList.remove(cls); });
    opts[1].classList.add(cls);
  }

  function sortHeader(box, dir) {
    var th = box.querySelector('th.gs-sortable') || box.querySelector('th');
    if (!th) return;
    th.classList.add('gs-sorted', 'gs-sort-' + dir);
    th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
    var arrow = th.querySelector('.gs-sort-arrow');
    if (arrow) arrow.textContent = dir === 'asc' ? '▲' : '▼';
  }

  /* The fill is `.prog-f` here and `.pkg-bar-fill` in the packaging bar, and the
     percentage sits in an UNCLASSED <span> — a guessed `[class*="-fill"]`
     selector matched neither, so both progress cells were dropped as no-ops.
     aria-valuenow is updated too: a progress bar whose bar and label disagree
     with its ARIA value is a bug to copy. */
  function setProgress(box, pct) {
    box.querySelectorAll('.prog-f,.pkg-bar-fill,[class*="-fill"]').forEach(function (bar) {
      bar.style.width = pct + '%';
    });
    box.querySelectorAll('[role=progressbar]').forEach(function (p) {
      p.setAttribute('aria-valuenow', String(pct));
    });
    box.querySelectorAll('span').forEach(function (sp) {
      if (/^\s*\d+\s*%\s*$/.test(sp.textContent)) sp.textContent = pct + '%';
    });
  }

  function applyStates() {
    document.querySelectorAll('.bk-cell-box[data-bk-do]').forEach(function (box) {
      var fn = ACTIONS[box.getAttribute('data-bk-do')];
      if (!fn) return;
      try { fn(box); } catch (e) {}
    });
  }

  function boot() {
    enhance();          /* the real portal JS upgrades the specimens first */
    applyStates();      /* then each cell is put into its state */
    /* A menu drawn in full is not always the right drawing. The editable
       dropdown's vocabulary is 47 values, so rendering it (twice - default and
       hover) made that frame 1728px tall against a 457px next-largest: the
       frame stopped documenting the CONTROL and started dumping the DATA.
       Capped to a sample. The count is stated so nobody reads six as the whole
       vocabulary. */
    document.querySelectorAll('.bk-cell-box .cs-menu, .bk-cell-box .gs-ecombo-menu')
      .forEach(function (menu) {
        var opts = menu.querySelectorAll('.cs-opt');
        if (opts.length <= MENU_SAMPLE) return;
        for (var i = MENU_SAMPLE; i < opts.length; i++) opts[i].remove();
        var more = document.createElement('div');
        more.className = 'bk-menu-more';
        more.textContent = '+ ' + (opts.length - MENU_SAMPLE) + ' more from the vocabulary';
        menu.appendChild(more);
      });

    sweep();
    verifyStates();

    /* The theme JS re-creates its fixed FX layer lazily on the first pointer
       event, so the cleanup has to be repeatable. It deliberately does NOT
       re-open anything any more: the old version re-clicked the dropdown
       triggers on every click and scroll, which dragged focus back into the
       dropdown so nothing else could be focused, and collapsed any text
       selection the moment it was made. `sweep` touches neither. */
    ['pointerdown', 'click'].forEach(function (ev) {
      window.addEventListener(ev, function () { setTimeout(sweep, 0); }, true);
    });
  }

  /* ── verification ─────────────────────────────────────────────────────────
     The one check that matters on this sheet: a state cell that renders
     IDENTICALLY to the default cell is a lie — it tells a developer the
     component has a state it does not have. Rather than let that ship, the
     cell is removed and the fact is reported.

     This runs at runtime because it needs computed styles, and it is
     deterministic (same CSS in, same cells out), so two exports of the same
     file still match. */
  function verifyStates() {
    var PROPS = ['backgroundColor', 'backgroundImage', 'color', 'borderColor',
                 'borderWidth', 'boxShadow', 'transform', 'opacity', 'filter',
                 'outlineColor', 'outlineWidth', 'fontWeight', 'textDecorationLine'];
    var dropped = [];
    document.querySelectorAll('.bk-frame').forEach(function (frame) {
      var cells = frame.querySelectorAll('.bk-cell');
      if (cells.length < 2) return;
      var base = cells[0].querySelector('.bk-cell-box');
      for (var i = 1; i < cells.length; i++) {
        var box = cells[i].querySelector('.bk-cell-box');
        if (differs(base, box, PROPS)) continue;
        dropped.push(frame.dataset.frame + ' / ' +
                     (cells[i].querySelector('.bk-cell-lbl') || {}).textContent);
        cells[i].remove();
      }
      var left = frame.querySelectorAll('.bk-cell').length;
      frame.dataset.cells = left;

    });
    if (dropped.length && window.console) {
      console.info('[base-kit] %d state cell(s) removed as visually identical ' +
                   'to the default:\n  %s', dropped.length, dropped.join('\n  '));
    }
    window.BK_DROPPED = dropped;
  }

  function differs(a, b, props) {
    if (!a || !b) return false;
    /* Structural states change the DOM, so a different element count IS a
       difference — an open menu is the clearest example. */
    /* The box ITSELF can carry the state (when the marker had to fall back to
       it), so compare that too - comparing only children hid those cases. */
    var ca0 = getComputedStyle(a), cb0 = getComputedStyle(b);
    for (var q = 0; q < props.length; q++) {
      if (ca0[props[q]] !== cb0[props[q]]) return true;
    }
    var ea = a.querySelectorAll('*'), eb = b.querySelectorAll('*');
    if (ea.length !== eb.length) return true;
    if (a.textContent.trim() !== b.textContent.trim()) return true;
    for (var i = 0; i < ea.length; i++) {
      var ca = getComputedStyle(ea[i]), cb = getComputedStyle(eb[i]);
      for (var p = 0; p < props.length; p++) {
        if (ca[props[p]] !== cb[props[p]]) return true;
      }
      if (ea[i].checked !== eb[i].checked) return true;
      if (ea[i].indeterminate !== eb[i].indeterminate) return true;
      if ((ea[i].value || '') !== (eb[i].value || '')) return true;
    }
    return false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ── theme switch ─────────────────────────────────────────────────────────
     One file carries both themes, the same exception the component library
     documents. The portals' light theme is `body.lt`; the sheet's own chrome
     uses `body.bk-lt`, so both go on together. */
  var btn = document.getElementById('bkTheme');
  if (btn) {
    btn.addEventListener('click', function () {
      var light = !document.body.classList.contains('lt');
      document.body.classList.toggle('lt', light);
      document.body.classList.toggle('bk-lt', light);
      btn.setAttribute('aria-pressed', light ? 'true' : 'false');
      btn.textContent = light ? 'Dark theme' : 'Light theme';
    });
  }
})();
