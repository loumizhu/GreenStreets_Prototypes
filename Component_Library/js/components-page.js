/* ═══════════════════════════════════════════════════════════════════════════
   components-page.js — the engine behind components.html
   ═══════════════════════════════════════════════════════════════════════════
   The catalogue page is authored as a flat list of specimens:

     <article class="cx-item"
              data-name="Primary button"
              data-cls=".btn-p .btn-c .btn-sw"
              data-src="css/greenstreets-theme.css"
              data-tip="What it is / when to use it. `backticks` render as code."
              data-used="SP:Products|../Supplier_Portal/04-…_Products.html">
       <script type="text/html" class="cx-src">
         <button class="btn-p">…</button>
       </script>
     </article>

   This file turns each of those into a full specimen card: header (name +
   info tooltip + class list + "used in" links), the live stage (the snippet
   injected verbatim into the DOM so the REAL portal CSS styles it), a
   floating copy button, and a collapsible code drawer.

   WHY the snippet lives in a `<script type="text/html">` instead of a
   `<template>`: a template exposes only its parsed DOM, so reading it back
   re-serialises the markup (`readonly` becomes `readonly=""`, attribute
   order can shift) AND it would return whatever greenstreets-theme.js has
   since done to it — custom selects, injected pagers, focus rings. A script
   block keeps the authored text byte-exact, so the copy button always hands
   a developer the source, never the enhanced DOM.

   LOAD ORDER MATTERS: this file must run BEFORE greenstreets-theme.js. It
   hydrates the stages synchronously at parse time (it sits at the end of
   <body>), so the theme JS then finds real markup to upgrade — themed
   selects, number steppers, data-grid toolkits, the animated focus ring and
   the click ripple all work inside the specimens exactly as they do in the
   portals. It also claims `window.gsToggleTheme` first: the theme JS uses
   `window.gsToggleTheme = window.gsToggleTheme || …`, so defining ours here
   swaps its navigate-to-the-Light-twin behaviour for an in-page body.lt
   toggle — this page is a single file that carries both themes.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var THEME_KEY = 'gs-components-theme';

  /* ─────────────────────────────────────────────────────────────────────────
     1 — Dark / Light, in place
     ───────────────────────────────────────────────────────────────────────── */
  function isLight() { return document.body.classList.contains('lt'); }

  function setTheme(light, save) {
    document.body.classList.toggle('lt', !!light);
    if (save) { try { localStorage.setItem(THEME_KEY, light ? 'light' : 'dark'); } catch (e) {} }
    /* the light palette (--lt-*) is only honoured on body.lt, so (re)apply the
       saved preset every time we switch INTO light */
    if (light && typeof window.gsApplyLightPreset === 'function') {
      var p = 'Meadow';
      try { p = localStorage.getItem(window.GS_LIGHT_PRESET_KEY) || 'Meadow'; } catch (e) {}
      window.gsApplyLightPreset(p, false);
    }
    /* every logo on the page follows the theme */
    var logo = light ? 'img/GreenStreet-Light-Theme.png' : 'img/Logo-WG.png';
    document.querySelectorAll('.gs-logo-img,.sb-logo,.login-logo').forEach(function (im) {
      if (im.tagName === 'IMG') im.src = logo;
    });
    if (typeof refreshResolved === 'function') refreshResolved();
    document.querySelectorAll('.cx-seg [data-theme]').forEach(function (b) {
      b.classList.toggle('on', (b.getAttribute('data-theme') === 'light') === !!light);
    });
  }
  /* claimed before greenstreets-theme.js loads — see the header note */
  window.gsToggleTheme = function () { setTheme(!isLight(), true); };
  window.cxSetTheme = function (t) { setTheme(t === 'light', true); };

  (function bootTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'light') document.body.classList.add('lt');
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     2 — Specimen hydration
     ───────────────────────────────────────────────────────────────────────── */
  var PORTALS = {
    SA: { cls: 'p-sa', name: 'Super Admin' },
    RA: { cls: 'p-ra', name: 'Retailer Admin' },
    RU: { cls: 'p-ru', name: 'Retailer User' },
    SP: { cls: 'p-sp', name: 'Supplier Portal' },
    ALL: { cls: 'p-all', name: 'All portals' }
  };

  var ICO_COPY = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var ICO_TICK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* For a value going into a double-quoted ATTRIBUTE. `esc()` alone leaves `"`
     untouched, which silently truncated a data-copy at the first double quote
     in the code it carried — and generated TSX is full of them. */
  function escAttr(s) {
    return esc(s).replace(/"/g, '&quot;');
  }
  /* `backticks` in a data-tip become <code> */
  function tipHtml(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  /* Strip the page's own indentation off an authored snippet so the copied
     markup starts at column 0. */
  function dedent(src) {
    var lines = src.replace(/\t/g, '  ').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    var min = Infinity;
    lines.forEach(function (l) {
      if (!l.trim()) return;
      min = Math.min(min, l.match(/^ */)[0].length);
    });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l) { return l.slice(min); }).join('\n');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     The CSS panel
     ─────────────────────────────────────────────────────────────────────────
     Sits to the right of the live render, always open. Every declaration is
     its own copy target, so a developer can lift just the colour, just the
     font-size or just the border — plus Copy rule and Copy all.

     The declarations come from `js/css-index.js`, generated by
     tools/extract-css-index.py out of the real stylesheets. They are baked
     rather than read from `document.styleSheets` because Chrome refuses
     `cssRules` on a linked stylesheet over `file://`, and these pages are
     opened by double-click.
     ───────────────────────────────────────────────────────────────────────── */
  var CSSX = (window.CX_CSS_INDEX || { rules: {}, specimens: {} });
  var COLOR_RX = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|linear-gradient|radial-gradient|conic-gradient)/i;

  function cssVarValue(name) {
    try {
      return getComputedStyle(document.body).getPropertyValue(name).trim();
    } catch (e) { return ''; }
  }

  /* `var(--rs)` is what you want to copy, but you also want to know it is
     10px — and the answer changes with the theme, so it is re-read on switch. */
  function resolveVars(value) {
    var names = [];
    value.replace(/var\((--[a-z0-9-]+)/gi, function (_, n) { names.push(n); return _; });
    if (!names.length) return '';
    var vals = names.map(cssVarValue).filter(Boolean);
    return vals.length ? vals.join(' / ') : '';
  }

  function declRow(prop, value) {
    var resolved = resolveVars(value);
    var swatch = COLOR_RX.test(resolved || value)
      ? '<i class="cx-sw" style="background:' + (resolved || value).split(' / ')[0] + '"></i>' : '';
    return '<button class="cx-decl" type="button" data-copy="' + escAttr(prop + ': ' + value + ';') +
      '" title="Copy  ' + escAttr(prop + ': ' + value + ';') + '">' +
      swatch +
      '<span class="cx-p">' + esc(prop) + '</span><span class="cx-pn">:</span>' +
      '<span class="cx-v">' + esc(value) + '</span><span class="cx-pn">;</span>' +
      (resolved ? '<span class="cx-res" data-copy="' + escAttr(resolved) + '" title="Copy ' + escAttr(resolved) + '">' + esc(resolved) + '</span>' : '') +
      '</button>';
  }

  function ruleText(sel, decls) {
    return sel + ' {\n' + decls.map(function (d) { return '  ' + d[0] + ': ' + d[1] + ';'; }).join('\n') + '\n}';
  }

  /* Build one specimen's panel. Called lazily (see the observer at the bottom)
     so a 113-specimen page does not create thousands of buttons up front. */
  function fillCssPanel(panel) {
    if (panel.dataset.filled) return;
    panel.dataset.filled = '1';
    var keys = (panel.getAttribute('data-keys') || '').split('|').filter(Boolean);
    var body = panel.querySelector('.cx-css-body');
    var all = [], html = '', sheets = {};

    keys.forEach(function (k) {
      var rec = CSSX.rules[k];
      if (!rec) return;
      sheets[rec.f] = 1;
      rec.r.forEach(function (pair) {
        var sel = (k.indexOf('--') === 0 ? ':root' : '.' + k) + pair[0];
        var decls = pair[1];
        all.push(ruleText(sel, decls));
        html += '<div class="cx-rule">' +
          '<button class="cx-rule-sel" type="button" data-copy="' + escAttr(ruleText(sel, decls)) +
          '" title="Copy the whole rule"><span class="cx-sel">' + esc(sel) + '</span><span class="cx-pn"> {</span></button>' +
          decls.map(function (d) { return declRow(d[0], d[1]); }).join('') +
          '<div class="cx-rule-end">}</div></div>';
      });
    });

    if (!html) {
      body.innerHTML = '<div class="cx-css-none">' +
        (panel.getAttribute('data-kind') === 'composed'
          ? 'No CSS of its own — it is assembled from the base elements listed below.'
          : 'No class of its own yet. The tooltip says what it is built from.') +
        '</div>';
      panel.querySelector('.cx-css-all').setAttribute('hidden', '');
      return;
    }
    body.innerHTML = html;
    panel.querySelector('.cx-css-all').setAttribute('data-copy', all.join('\n\n'));
    var f = panel.querySelector('.cx-css-f');
    if (f) f.textContent = Object.keys(sheets).join(' + ');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     The Next.js / Tailwind panels (Columns 2 and 3)
     ─────────────────────────────────────────────────────────────────────────
     A section marked `data-tsx` gets the three-column card a developer asked
     for — live preview · component code · usage — instead of the CSS panel.
     Sections are being converted one at a time; the rest keep the CSS panel.

     The code comes from `js/tsx-index.js`, generated by tools/build-tsx.py:
     the Tailwind classes are translated from each component's real
     declarations with every design token resolved to a literal, so a snippet
     pastes into any Tailwind project with no config and no CSS file.
     ───────────────────────────────────────────────────────────────────────── */
  var TSX = (window.CX_TSX || {});

  /* Single-pass TSX tokeniser. It runs on the RAW source and escapes each
     span as it emits, rather than escaping first and pattern-matching after —
     escaping turns `<` into `&lt;`, which would hide every JSX tag, and a
     multi-pass highlighter re-matches its own output (that bug shredded the
     markup drawer this panel replaced). */
  var TSX_RX = new RegExp([
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)',                       // 1 comment
    '(\'(?:[^\'\\\\\\n]|\\\\.)*\'|"(?:[^"\\\\\\n]|\\\\.)*"|`(?:[^`\\\\]|\\\\.)*`)', // 2 string
    '(\\b(?:import|from|export|default|function|return|const|let|var|type|interface|' +
      'extends|keyof|typeof|as|if|else|true|false|null|undefined|await|async|new|' +
      'Record|NonNullable|React|useState|useRef|useEffect)\\b)',    // 3 keyword
    '(<\\/?[A-Za-z][\\w.]*|\\/>)',                                  // 4 JSX tag
    '(\\b[a-zA-Z-]+(?==)|\\b(?:string|number|boolean|void)\\b)'     // 5 attr / primitive type
  ].join('|'), 'g');

  function highlightTsx(src) {
    var out = '', last = 0, m;
    TSX_RX.lastIndex = 0;
    while ((m = TSX_RX.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 't' : 'a';
      out += '<span class="cx-' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
      if (m[0] === '') TSX_RX.lastIndex++;          // never spin on an empty match
    }
    return out + esc(src.slice(last));
  }

  /* ---------------------------------------------------------------------
     Props / States / Responsive panels for a three-column card.

     All three render EXPANDED, like the CSS panel: a handoff doc that hides
     the prop contract behind a disclosure is a doc nobody reads. Height is
     kept in check by giving Props the full card width (its description
     column needs it) and putting States beside Responsive underneath, so
     the strip grows sideways rather than downwards.

     The two conventions the data carries, honoured here:
       * a state whose trigger is null is "not applicable" and its text is
         the REASON - rendered muted, never as a real state, so nobody ports
         an error state onto a button that has none;
       * responsive is split into what the prototypes measurably do today
         and what is merely RECOMMENDED, and the recommendation is labelled
         as such in the markup. The prototypes are desktop-only.
     --------------------------------------------------------------------- */

  function propsPanel(pr) {
    if (!pr || !pr.length) return '';
    /* Default is folded into the Type cell rather than given a column of its
       own: it keeps the table to three columns, which is what lets Props sit
       beside States and Responsive in one row instead of stacking above them
       and adding ~350px to every card. */
    var rows = pr.map(function (p) {
      var req = p[2] === '';
      return '<tr>' +
        '<td class="cx-pn"><code data-copy="' + escAttr(p[0]) + '" title="Copy ' + escAttr(p[0]) + '">' + esc(p[0]) + '</code>' +
          (req ? '<span class="cx-req" data-cx-tip="Required prop">*</span>' : '') + '</td>' +
        '<td class="cx-pt"><code data-copy="' + escAttr(p[1]) + '" title="Copy the type">' + esc(p[1]) + '</code>' +
          '<span class="cx-pdf">' +
            (req ? 'required' : p[2] === '-' ? 'optional' : 'default ' + esc(p[2])) +
          '</span></td>' +
        '<td class="cx-px">' + esc(p[3]) + '</td>' +
      '</tr>';
    }).join('');
    return '<section class="cx-doc cx-doc-props">' +
      '<div class="cx-doc-hd"><span class="cx-doc-t">Props</span>' +
        '<span class="cx-doc-n">' + pr.length + ' &middot; click to copy</span></div>' +
      '<div class="cx-doc-body"><table class="cx-props">' +
        '<thead><tr><th>Prop</th><th>Type</th><th>What it does</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
    '</section>';
  }

  function statesPanel(st) {
    if (!st || !st.length) return '';
    /* An ORDERED LIST, not an object — default, hover, focus, disabled, error
       is the order a developer reads these in, and build-tsx.py dumps the
       index with sort_keys=True, which silently alphabetised an object into
       "Active, Default, Disabled…". A list survives the round trip. */
    var live = 0;
    var rows = st.map(function (s) {
      var na = (s[1] === null || s[1] === undefined);
      if (!na) live++;
      return '<div class="cx-st' + (na ? ' cx-st-na' : '') + '">' +
        '<div class="cx-st-hd"><span class="cx-st-k">' + esc(s[0]) + '</span>' +
          '<span class="cx-st-w">' + (na ? 'not applicable' : esc(s[1])) + '</span></div>' +
        '<p class="cx-st-d">' + esc(s[2]) + '</p>' +
      '</div>';
    }).join('');
    return '<section class="cx-doc cx-doc-states">' +
      '<div class="cx-doc-hd"><span class="cx-doc-t">States</span>' +
        '<span class="cx-doc-n">' + live + ' of ' + st.length + ' apply</span></div>' +
      '<div class="cx-doc-body">' + rows + '</div>' +
    '</section>';
  }

  function respPanel(rs) {
    if (!rs) return '';
    var rec = (rs.rec || []).map(function (r) {
      return '<div class="cx-bp"><span class="cx-bp-k">' + esc(r[0]) + '</span>' +
        '<p class="cx-bp-d">' + esc(r[1]) + '</p></div>';
    }).join('');
    return '<section class="cx-doc cx-doc-resp">' +
      '<div class="cx-doc-hd"><span class="cx-doc-t">Responsive</span>' +
        '<span class="cx-doc-n">measured, then recommended</span></div>' +
      '<div class="cx-doc-body">' +
        '<div class="cx-rs-now"><span class="cx-rs-lbl">In the prototypes today</span>' +
          '<p>' + esc(rs.now) + '</p></div>' +
        '<div class="cx-rs-rec"><span class="cx-rs-lbl cx-rs-lbl-rec">Recommended for the port' +
          '<b data-cx-tip="Not a specification. The prototypes were designed at desktop width only, so the mobile and tablet behaviour below is a proposal to review - not something the designs already say.">recommendation</b></span>' +
          rec + '</div>' +
        (rs.flag ? '<p class="cx-rs-flag"><span>Watch out</span>' + esc(rs.flag) + '</p>' : '') +
      '</div>' +
    '</section>';
  }

  function docsStrip(rec) {
    var h = propsPanel(rec.pr) + statesPanel(rec.st) + respPanel(rec.rs);
    if (!h) return null;
    var d = document.createElement('div');
    d.className = 'cx-docs';
    d.innerHTML = h;
    return d;
  }

  function codePanel(title, code, note) {
    return '<div class="cx-code">' +
      '<div class="cx-code-hd">' +
        '<span class="cx-code-t">' + esc(title) + '</span>' +
        (note ? '<span class="cx-code-f">' + esc(note) + '</span>' : '') +
        '<button class="cx-code-copy" type="button" data-copy="' + escAttr(code) +
          '" title="Copy ' + escAttr(title) + '">' + ICO_COPY + 'Copy</button>' +
      '</div>' +
      '<pre class="cx-code-body"><code>' + highlightTsx(code) + '</code></pre>' +
    '</div>';
  }

  /* One delegated handler for every copy target on the page. */
  function wireCssCopy() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-copy]');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      var what = t.classList.contains('cx-code-copy') ? t.getAttribute('title').replace('Copy ', '')
               : t.classList.contains('cx-css-all') ? 'Every rule shown'
               : t.classList.contains('cx-rule-sel') ? 'Rule'
               : t.classList.contains('cx-res') ? 'Value'
               : 'Declaration';
      copyText(t.getAttribute('data-copy'), null, what);
      t.classList.add('cx-copied');
      setTimeout(function () { t.classList.remove('cx-copied'); }, 900);
    });
  }

  /* The resolved values are theme-dependent, so re-read them on a switch. */
  function refreshResolved() {
    document.querySelectorAll('.cx-decl').forEach(function (b) {
      var v = b.querySelector('.cx-v'), res = b.querySelector('.cx-res');
      if (!v) return;
      var r = resolveVars(v.textContent);
      if (res) {
        if (r) { res.textContent = r; res.setAttribute('data-copy', r); res.title = 'Copy ' + r; }
        else res.remove();
      }
      var sw = b.querySelector('.cx-sw');
      if (sw && r && COLOR_RX.test(r)) sw.style.background = r.split(' / ')[0];
    });
  }

  function usedChips(spec) {
    if (!spec) return '';
    return spec.split(';').map(function (entry) {
      entry = entry.trim(); if (!entry) return '';
      var m = entry.match(/^([A-Z]+):([^|]*)(?:\|(.*))?$/);
      if (!m) return '';
      var p = PORTALS[m[1]] || PORTALS.ALL;
      var label = (m[1] === 'ALL' ? '' : m[1] + ' · ') + m[2].trim();
      var href = (m[3] || '').trim();
      var title = p.name + (m[2].trim() ? ' — ' + m[2].trim() : '');
      return href
        ? '<a class="cx-chip ' + p.cls + '" href="' + href + '" target="_blank" rel="noopener" title="Open ' + escAttr(title) + '">' + esc(label) + '</a>'
        : '<span class="cx-chip ' + p.cls + '" title="' + escAttr(title) + '">' + esc(label) + '</span>';
    }).join('');
  }

  /* Specimen name → the anchor id build() will give it. Kept in one place so
     `data-parts` can name a base specimen in plain English and still link. */
  function slug(name) {
    return 'cx-' + (String(name).replace(/&amp;/g, '&').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  /* "Composed of" — a composition lists the base specimens it is assembled
     from, as links. This is the whole point of the base/composed split: a
     composition needs no CSS and no component of its own in the port, only
     the parts named here. */
  /* Parts are `|`-separated, NOT `;` — a specimen name can contain an `&`,
     and `;` terminates an HTML entity, so `Body &amp; muted copy` split in
     half and produced two dead links. */
  function partsHtml(spec) {
    if (!spec) return '';
    var links = spec.split('|').map(function (p) {
      p = p.trim(); if (!p) return '';
      return '<a class="cx-part" href="#' + slug(p) + '">' + p + '</a>';
    }).filter(Boolean).join('');
    return links ? '<span class="cx-parts"><span class="cx-parts-lbl">Composed of</span>' + links + '</span>' : '';
  }

  function build(item, idx) {
    var holder = item.querySelector('.cx-src');
    var raw = holder ? dedent(holder.textContent) : '';
    if (holder) holder.parentNode.removeChild(holder);

    var name = item.getAttribute('data-name') || 'Component ' + (idx + 1);
    var cls = item.getAttribute('data-cls') || '';
    var tip = item.getAttribute('data-tip') || '';
    var src = item.getAttribute('data-src') || '';
    var used = item.getAttribute('data-used') || '';
    var stageCls = item.getAttribute('data-stage') || '';
    var kind = item.getAttribute('data-kind') || '';
    var parts = item.getAttribute('data-parts') || '';
    var id = slug(name) || 'cx-' + idx;

    item.id = id;
    item.setAttribute('data-q', (name + ' ' + cls + ' ' + tip + ' ' + used + ' ' + kind + ' ' + parts).toLowerCase());

    var KIND_TIP = {
      base: 'A base element — one component, one class contract. Port it as a component of its own.',
      composed: 'A composition — assembled from base elements and carrying no CSS of its own. Port it as a pattern, not a component; the parts it needs are listed under the specimen.'
    };
    var kindChip = kind
      ? '<span class="cx-kind cx-kind-' + kind + '" data-cx-tip="' + escAttr(KIND_TIP[kind] || '') + '">' +
        (kind === 'base' ? 'Base' : 'Composed') + '</span>'
      : '';

    /* A `data-tsx` section shows the three-column card; the rest still show
       the CSS panel. See the note above `TSX`. */
    var sec = item.closest('.cx-sec');
    var asTsx = !!(sec && sec.hasAttribute('data-tsx') && TSX[name]);
    var rec = TSX[name];

    var hdr = document.createElement('div');
    hdr.className = 'cx-item-hdr' + (asTsx ? ' cx-item-hdr-tsx' : '');
    if (asTsx) {
      /* Name + one-line purpose. The class list moves to the footer: the
         preview column is meant to show the component and nothing else. */
      hdr.innerHTML =
        '<div class="cx-hd-main">' +
          '<h3 class="cx-item-name">' + esc(name) + '</h3>' +
          '<p class="cx-item-desc">' + esc(rec.d || '') + '</p>' +
        '</div>' +
        '<div class="cx-hd-meta">' +
          '<code class="cx-comp">&lt;' + esc(rec.c) + ' /&gt;</code>' +
          kindChip +
          (tip ? '<button class="cx-info" type="button" aria-label="Design notes for ' + escAttr(name) + '" data-cx-tip="' + escAttr(tip) + '">i</button>' : '') +
        '</div>' +
        (used ? '<span class="cx-used"><span class="cx-used-lbl">Used in</span>' + usedChips(used) + '</span>' : '');
    } else {
      hdr.innerHTML =
        '<span class="cx-item-name">' + esc(name) + '</span>' +
        kindChip +
        (tip ? '<button class="cx-info" type="button" aria-label="About ' + escAttr(name) + '" data-cx-tip="' + escAttr(tip) + '">i</button>' : '') +
        (cls ? '<span class="cx-cls">' + esc(cls) + '</span>' : '') +
        (used ? '<span class="cx-used"><span class="cx-used-lbl">Used in</span>' + usedChips(used) + '</span>' : '');
    }

    var stage = document.createElement('div');
    stage.className = 'cx-stage' + (stageCls ? ' ' + stageCls : '');
    stage.innerHTML = raw;

    /* The prototype markup stays one click away for the CSS-panel cards. A
       three-column card deliberately gets NO button here: its preview column
       shows the component and nothing else, and the TSX beside it — not the
       prototype HTML — is what a developer takes away. */
    if (!asTsx) {
      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'cx-copy';
      copy.title = 'Copy the HTML for ' + name;
      copy.innerHTML = ICO_COPY + '<span>HTML</span>';
      copy.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        copyText(raw, copy, 'Markup');
      });
      stage.appendChild(copy);
    }

    var body = document.createElement('div');
    var foot = document.createElement('div');
    foot.className = 'cx-item-foot';

    if (asTsx) {
      stage.classList.add('cx-stage-center');
      body.className = 'cx-tri';
      body.appendChild(stage);
      var codes = document.createElement('div');
      codes.className = 'cx-codes';
      codes.innerHTML =
        codePanel('Component code (TSX)', rec.tsx, 'components/' + rec.c + '.tsx') +
        codePanel('Usage', rec.use, 'app/page.tsx');
      body.appendChild(codes);
      item._cxDocs = docsStrip(rec);
      foot.innerHTML = partsHtml(parts) +
        (cls ? '<span class="cx-cls">' + esc(cls) + '</span>' : '') +
        (src ? '<span class="cx-src-file">' + esc(src) + '</span>' : '');
    } else {
      var cssKeys = (CSSX.specimens[name] || []);
      var cssPanel = document.createElement('aside');
      cssPanel.className = 'cx-css';
      cssPanel.setAttribute('data-keys', cssKeys.join('|'));
      cssPanel.setAttribute('data-kind', kind);
      cssPanel.innerHTML =
        '<div class="cx-css-hd">' +
          '<span class="cx-css-t">CSS</span>' +
          '<span class="cx-css-f"></span>' +
          '<button class="cx-css-all" type="button" data-copy="" title="Copy every rule shown">' + ICO_COPY + 'All</button>' +
        '</div>' +
        '<div class="cx-css-body"></div>';
      body.className = 'cx-split';
      body.appendChild(stage);
      body.appendChild(cssPanel);
      foot.innerHTML = partsHtml(parts) +
        (src ? '<span class="cx-src-file">' + esc(src) + '</span>' : '');
    }

    item.appendChild(hdr);
    item.appendChild(body);
    /* Docs sit between the columns and the footer: read the component, read
       its code, then its contract. */
    if (item._cxDocs) { item.appendChild(item._cxDocs); item._cxDocs = null; }
    if (foot.innerHTML) item.appendChild(foot);

    /* very tall specimens are clamped with a Show-all affordance */
    if (item.hasAttribute('data-clamp')) {
      stage.classList.add('cx-clamp');
      var exp = document.createElement('button');
      exp.type = 'button'; exp.className = 'cx-expand'; exp.textContent = 'Show full specimen';
      exp.addEventListener('click', function () {
        var open = stage.classList.toggle('cx-clamp');
        exp.textContent = open ? 'Show full specimen' : 'Collapse specimen';
      });
      stage.appendChild(exp);
    }
    return item;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     3 — Clipboard (works from file:// too, where navigator.clipboard is
         often unavailable — these prototypes are opened by double-click)
     ───────────────────────────────────────────────────────────────────────── */
  function copyText(text, btn, label) {
    function done(ok) {
      /* Always report: a green flash with nothing on the clipboard (blocked
         permissions, an insecure origin) would be a lie. */
      toast(ok ? (label || 'Copied') + ' to clipboard'
               : 'Copy blocked — the text is selected, press Ctrl+C');
      if (!btn) return;
      btn.classList.add('cx-done');
      btn.innerHTML = (ok ? ICO_TICK : '') + '<span>' + (ok ? 'Copied' : 'Press Ctrl+C') + '</span>';
      setTimeout(function () {
        btn.classList.remove('cx-done');
        btn.innerHTML = ICO_COPY + '<span>Copy</span>';
      }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { legacy(); });
    } else { legacy(); }

    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) {
        document.body.removeChild(ta);
      } else {
        /* The message tells the user the text is selected, so it has to STAY
           selected — removing the textarea here made that a lie and Ctrl+C
           copied whatever was selected before. Kept alive briefly instead. */
        ta.focus(); ta.select();
        var drop = function () {
          clearTimeout(ta._t);
          if (ta.parentNode) ta.parentNode.removeChild(ta);
          document.removeEventListener('pointerdown', drop, true);
        };
        ta._t = setTimeout(drop, 6000);
        document.addEventListener('pointerdown', drop, true);
      }
      done(ok);
    }
  }

  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'cx-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('on'); }, 2000);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     4 — The basic tooltip (one fixed node, positioned to the trigger)
         A single shared node means it can never be clipped by an ancestor's
         overflow, and there is only ever one visible at a time.
     ───────────────────────────────────────────────────────────────────────── */
  var tipEl;
  function tipShow(trigger) {
    var text = trigger.getAttribute('data-cx-tip');
    if (!text) return;
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'cx-tip';
      tipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tipEl);
    }
    tipEl.innerHTML = tipHtml(text);
    tipEl.classList.add('on');
    var r = trigger.getBoundingClientRect();
    var t = tipEl.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
    var top = r.top - t.height - 9;
    if (top < 8) top = r.bottom + 9;              /* flip below when there is no room above */
    tipEl.style.left = Math.round(left) + 'px';
    tipEl.style.top = Math.round(top) + 'px';
  }
  function tipHide() { if (tipEl) tipEl.classList.remove('on'); }

  function wireTooltips() {
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-cx-tip]');
      if (t) tipShow(t);
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest('[data-cx-tip]')) tipHide();
    });
    document.addEventListener('focusin', function (e) {
      var t = e.target.closest && e.target.closest('[data-cx-tip]');
      if (t) tipShow(t); else tipHide();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tipHide(); });
    window.addEventListener('scroll', tipHide, true);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     5 — Table of contents, counts, search and scroll-spy
     ───────────────────────────────────────────────────────────────────────── */
  /* Sections are numbered here, not in the HTML — reordering the catalogue
     used to mean renumbering 26 hardcoded badges by hand. */
  function numberSections() {
    var n = 0;
    document.querySelectorAll('.cx-sec').forEach(function (sec) {
      n++;
      var badge = sec.querySelector('.cx-sec-n');
      if (badge) badge.textContent = (n < 10 ? '0' : '') + n;
    });
  }

  function buildToc() {
    var toc = document.querySelector('.cx-toc');
    if (!toc) return;
    var html = '';
    [].slice.call(document.querySelectorAll('.cx-main > .cx-grp, .cx-main > .cx-sec')).forEach(function (node) {
      if (node.classList.contains('cx-grp')) {
        html += '<div class="cx-toc-grp">' + esc(node.getAttribute('data-label') || '') + '</div>';
        return;
      }
      var n = node.querySelectorAll('.cx-item').length;
      var title = node.getAttribute('data-title') || node.id;
      html += '<a href="#' + node.id + '" data-sec="' + node.id + '">' +
        '<span>' + esc(title) + '</span><span class="cx-toc-n">' + n + '</span></a>';
    });
    toc.innerHTML = html;
  }

  var kindFilter = 'all';

  function wireSearch() {
    var wrap = document.querySelector('.cx-nav-search');
    if (!wrap) return;
    var input = wrap.querySelector('input');
    var clear = wrap.querySelector('.cx-nav-clear');
    var hits = document.querySelector('.cx-nav-hits');
    var empty = document.querySelector('.cx-empty');

    function run() {
      var q = input.value.trim().toLowerCase();
      wrap.classList.toggle('has-q', !!q);
      var shown = 0;
      document.querySelectorAll('.cx-sec').forEach(function (sec) {
        var vis = 0;
        sec.querySelectorAll('.cx-item').forEach(function (it) {
          var match = !q || (it.getAttribute('data-q') || '').indexOf(q) > -1 ||
            (sec.getAttribute('data-title') || '').toLowerCase().indexOf(q) > -1;
          if (match && kindFilter !== 'all') match = it.getAttribute('data-kind') === kindFilter;
          it.classList.toggle('cx-hidden', !match);
          if (match) vis++;
        });
        sec.classList.toggle('cx-hidden', vis === 0);
        var link = document.querySelector('.cx-toc a[data-sec="' + sec.id + '"]');
        if (link) link.classList.toggle('cx-hidden', vis === 0);
        shown += vis;
      });
      document.querySelectorAll('.cx-grp').forEach(function (g) {
        /* hide a group heading whose whole run of sections is filtered out */
        var any = false, n = g.nextElementSibling;
        while (n && !n.classList.contains('cx-grp')) {
          if (n.classList.contains('cx-sec') && !n.classList.contains('cx-hidden')) any = true;
          n = n.nextElementSibling;
        }
        g.classList.toggle('cx-hidden', !any);
      });
      var filtering = q || kindFilter !== 'all';
      if (hits) hits.textContent = filtering ? shown + ' component' + (shown === 1 ? '' : 's') + ' shown' : '';
      if (empty) empty.classList.toggle('on', filtering && shown === 0);
    }

    input.addEventListener('input', run);
    if (clear) clear.addEventListener('click', function () { input.value = ''; run(); input.focus(); });
    document.querySelectorAll('[data-cx-kind-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        kindFilter = b.getAttribute('data-cx-kind-filter');
        document.querySelectorAll('[data-cx-kind-filter]').forEach(function (o) {
          o.classList.toggle('on', o === b);
        });
        run();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) {
        e.preventDefault(); input.focus();
      }
    });
  }

  function wireSpy() {
    var links = [].slice.call(document.querySelectorAll('.cx-toc a[data-sec]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var best = null, bestV = 0;
      Object.keys(seen).forEach(function (k) { if (seen[k] > bestV) { bestV = seen[k]; best = k; } });
      links.forEach(function (a) { a.classList.toggle('cx-cur', a.getAttribute('data-sec') === best); });
    }, { rootMargin: '-10% 0px -70% 0px', threshold: [0, .05, .3, .6, 1] });
    document.querySelectorAll('.cx-sec').forEach(function (s) { io.observe(s); });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     6 — Demo-only helpers referenced by a few specimens' onclick handlers.
         Named cx* so nothing here can shadow a real portal function.
     ───────────────────────────────────────────────────────────────────────── */
  window.cxToggle = function (el, cls) { el.classList.toggle(cls || 'on'); return false; };
  window.cxNoop = function () { return false; };
  window.cxDemoToast = function (msg) { toast(msg || 'Demo action'); return false; };
  window.cxShake = function (sel) {
    var el = document.querySelector(sel);
    if (el && window.gsShake) window.gsShake(el);
    return false;
  };
  window.cxReplay = function (btn) {
    /* re-runs the shared screen-entrance cascade on a specimen so the motion
       can actually be seen (in the app it fires on every screen change) */
    var stage = btn.closest('.cx-stage');
    var host = stage && stage.querySelector('[data-cx-anim]');
    if (!host) return false;
    var kids = [].slice.call(host.children);
    kids.forEach(function (k) { k.style.animation = 'none'; });
    void host.offsetWidth;
    kids.forEach(function (k, i) {
      k.style.animation = '';
      k.style.animationDelay = (i * 0.06) + 's';
    });
    return false;
  };
  /* the reference page's click-counter demo, so a reader can confirm the
     press-scale, focus ring and ripple all fire on a real handler */
  window.cxCount = function (btn) {
    var out = btn.closest('.cx-stage').querySelector('[data-cx-count]');
    var n = (parseInt(btn.getAttribute('data-n'), 10) || 0) + 1;
    btn.setAttribute('data-n', n);
    if (out) out.textContent = 'Clicked ' + n + (n === 1 ? ' time' : ' times');
    return false;
  };
  /* live-values readout for the Form inputs section: shows what a controlled
     port has to keep in sync, including reading the themed select's value off
     the real hidden <select> */
  window.cxLive = function () {
    var out = document.querySelector('[data-cx-live]');
    if (!out) return;
    var nm = (document.getElementById('cx-lv-name') || {}).value || '';
    var cat = (document.getElementById('cx-lv-cat') || {}).value || '';
    var sub = (document.getElementById('cx-lv-sub') || {}).checked;
    out.textContent = 'Live values — name: ' + (nm.trim() || '—') +
      ', category: ' + cat + ', subscribed: ' + (sub ? 'yes' : 'no');
  };

  window.cxOpenOverlay = function (sel) {
    var el = document.querySelector(sel);
    if (el) el.classList.add('cx-shown');
    return false;
  };
  window.cxCloseOverlay = function (elOrSel) {
    var el = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel.closest('.cx-ov');
    if (el) el.classList.remove('cx-shown');
    return false;
  };

  /* ─────────────────────────────────────────────────────────────────────────
     7 — Boot
     ───────────────────────────────────────────────────────────────────────── */
  var items = [].slice.call(document.querySelectorAll('.cx-item'));
  items.forEach(build);

  /* `indeterminate` has no HTML attribute — honour a data flag so a specimen
     can still show a half-checked select-all box. */
  document.querySelectorAll('input[data-indeterminate]').forEach(function (c) { c.indeterminate = true; });

  numberSections();
  wireCssCopy();
  buildToc();
  wireTooltips();
  wireSearch();

  /* header facts */
  var nItems = document.querySelector('[data-cx-count-items]');
  var nSecs = document.querySelector('[data-cx-count-secs]');
  var nBase = document.querySelector('[data-cx-count-base]');
  var nComp = document.querySelector('[data-cx-count-composed]');
  if (nItems) nItems.textContent = items.length;
  if (nSecs) nSecs.textContent = document.querySelectorAll('.cx-sec').length;
  if (nBase) nBase.textContent = document.querySelectorAll('.cx-item[data-kind="base"]').length;
  if (nComp) nComp.textContent = document.querySelectorAll('.cx-item[data-kind="composed"]').length;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  /* The panels are ALWAYS open, so they must always get built — but building
     113 of them up front is thousands of buttons in one frame. So: fill the
     first screenful synchronously, then the rest in idle batches.

     This deliberately does NOT use an IntersectionObserver keyed on
     visibility: in a zero-height or hidden context (a background tab, print,
     an embed) nothing ever intersects and every panel would stay empty. */
  function wireCssPanels() {
    var panels = [].slice.call(document.querySelectorAll('.cx-css'));
    var FIRST = 14;
    panels.slice(0, FIRST).forEach(fillCssPanel);
    refreshResolved();

    var rest = panels.slice(FIRST), i = 0;
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 16); };
    (function chunk() {
      if (i >= rest.length) { refreshResolved(); return; }
      var end = Math.min(i + 12, rest.length);
      for (; i < end; i++) fillCssPanel(rest[i]);
      idle(chunk);
    })();
  }

  ready(function () {
    setTheme(isLight(), false);
    wireCssPanels();
    wireSpy();
  });
  window.addEventListener('load', function () { setTheme(isLight(), false); });
})();
