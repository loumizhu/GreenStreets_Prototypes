/* ==========================================================================
   gs-appearance.js — focused per-portal appearance control
   --------------------------------------------------------------------------
   Lets a portal user pick a THEME (preset), an ACCENT colour, and a LOGO.
   State persists in localStorage (namespaced per portal folder) and is
   applied on every page load, so the choice carries across the whole portal.
   The settings PANEL is rendered only where a <div id="gs-appearance"></div>
   mount point exists (i.e. the Settings screen). Deliberately NOT the full
   admin prototyping customizer — just theme / colours / logo.
   ========================================================================== */
(function () {
  'use strict';

  var PRESETS = {
    emerald: { name: 'Emerald', accent: '#4ebb81', bg0: '#070f1c', bg1: '#0b1830' },
    ocean:   { name: 'Ocean',   accent: '#5b9cf6', bg0: '#081426', bg1: '#0d2036' },
    teal:    { name: 'Teal',    accent: '#2fb6ad', bg0: '#04140f', bg1: '#082019' },
    violet:  { name: 'Violet',  accent: '#8b5cf6', bg0: '#100a1f', bg1: '#1b1236' },
    sunset:  { name: 'Sunset',  accent: '#f5943b', bg0: '#1a0f0a', bg1: '#2a160d' },
    rose:    { name: 'Rose',    accent: '#e0607f', bg0: '#180a10', bg1: '#2a121c' }
  };
  var DEFAULT_THEME = 'emerald';

  /* --- storage (namespaced by the portal's containing folder) --- */
  function portalKey() {
    var p = location.pathname.replace(/\\/g, '/');
    var m = p.match(/\/([^\/]+)\/[^\/]*$/);
    return 'gs_appearance::' + (m ? m[1] : 'root');
  }
  function load() { try { return JSON.parse(localStorage.getItem(portalKey())) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(portalKey(), JSON.stringify(s)); } catch (e) {} }

  /* --- colour helpers --- */
  function clamp(n) { return Math.max(0, Math.min(255, n)); }
  function hexToRgb(h) {
    h = (h || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) { return ('0' + clamp(Math.round(x)).toString(16)).slice(-2); }).join('');
  }
  function shade(hex, pct) {
    var c = hexToRgb(hex), t = pct < 0 ? 0 : 255, p = Math.abs(pct);
    return rgbToHex(c[0] + (t - c[0]) * p, c[1] + (t - c[1]) * p, c[2] + (t - c[2]) * p);
  }

  /* --- apply saved appearance to the live document --- */
  function apply(s) {
    s = s || load();
    var root = document.documentElement.style;
    var preset = PRESETS[s.theme] || PRESETS[DEFAULT_THEME];
    var accent = s.accent || preset.accent;
    root.setProperty('--gs', accent);
    root.setProperty('--gs-l', shade(accent, 0.34));
    root.setProperty('--gs-d', shade(accent, -0.28));
    var rgb = hexToRgb(accent).join(',');
    root.setProperty('--particle-color-hex', accent);
    root.setProperty('--particle-rgb', rgb);
    root.setProperty('--card-glow-color1', shade(accent, 0.34));
    root.setProperty('--field-stroke-color', accent);
    if (s.theme && preset) {
      root.setProperty('--bg-0', preset.bg0);
      root.setProperty('--bg-1', preset.bg1);
    }
    if (s.logo) {
      var imgs = document.querySelectorAll('.gs-logo-img,.sb-logo,.login-logo,img[alt="Greenstreets"]');
      for (var i = 0; i < imgs.length; i++) imgs[i].src = s.logo;
    }
  }

  /* run as early as possible so pages paint themed */
  apply();

  /* ---------------------------------------------------------------- panel */
  function injectCss() {
    if (document.getElementById('gs-appearance-css')) return;
    var st = document.createElement('style');
    st.id = 'gs-appearance-css';
    st.textContent =
      '.gsa-wrap{display:flex;flex-direction:column;gap:22px}' +
      '.gsa-sec{display:flex;flex-direction:column;gap:10px}' +
      '.gsa-lbl{font-size:12px;font-weight:600;color:var(--tw)}' +
      '.gsa-hint{font-size:11px;color:var(--tw3);margin-top:-4px}' +
      '.gsa-themes{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}' +
      '.gsa-theme{cursor:pointer;border:1px solid var(--line-2);border-radius:12px;padding:10px;background:rgba(255,255,255,.03);transition:border-color .18s,transform .18s,box-shadow .18s;display:flex;flex-direction:column;gap:8px}' +
      '.gsa-theme:hover{transform:translateY(-2px);border-color:var(--gs)}' +
      '.gsa-theme.sel{border-color:var(--gs);box-shadow:0 0 0 1px var(--gs),0 8px 22px -12px rgba(0,0,0,.6)}' +
      '.gsa-swatch{height:34px;border-radius:8px;position:relative;overflow:hidden}' +
      '.gsa-dot{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.28)}' +
      '.gsa-theme-name{font-size:11px;font-weight:600;color:var(--tw2)}' +
      '.gsa-accents{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.gsa-chip{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:transform .15s}' +
      '.gsa-chip:hover{transform:scale(1.12)}' +
      '.gsa-chip.sel{border-color:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.35)}' +
      '.gsa-color-in{width:44px;height:30px;padding:0;border:1px solid var(--line-2);border-radius:8px;background:none;cursor:pointer}' +
      '.gsa-logo-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}' +
      '.gsa-logo-prev{width:150px;height:64px;border:1px dashed var(--line-2);border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);overflow:hidden}' +
      '.gsa-logo-prev img{max-width:88%;max-height:80%;object-fit:contain}' +
      '.gsa-logo-btns{display:flex;flex-direction:column;gap:8px}' +
      '.gsa-btn{font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;border-radius:8px;padding:7px 13px;border:1px solid var(--line-2);background:rgba(255,255,255,.05);color:var(--tw);display:inline-flex;align-items:center;gap:7px}' +
      '.gsa-btn:hover{border-color:var(--gs)}' +
      '.gsa-btn.pri{background:var(--gs);border-color:var(--gs);color:#04130c}' +
      '.gsa-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:16px}' +
      '.gsa-saved{font-size:11px;color:var(--gs-l);opacity:0;transition:opacity .3s}' +
      '.gsa-saved.on{opacity:1}';
    document.head.appendChild(st);
  }

  function buildPanel(mount) {
    injectCss();
    var s = load();
    if (!s.theme) s.theme = DEFAULT_THEME;

    var wrap = document.createElement('div');
    wrap.className = 'gsa-wrap';

    /* Theme presets */
    var themeSec = document.createElement('div');
    themeSec.className = 'gsa-sec';
    themeSec.innerHTML = '<div class="gsa-lbl">Theme</div><div class="gsa-hint">Sets the accent colour and background tone across the portal.</div>';
    var grid = document.createElement('div'); grid.className = 'gsa-themes';
    Object.keys(PRESETS).forEach(function (id) {
      var p = PRESETS[id];
      var card = document.createElement('div');
      card.className = 'gsa-theme' + (id === s.theme ? ' sel' : '');
      card.setAttribute('data-theme', id);
      card.innerHTML =
        '<div class="gsa-swatch" style="background:linear-gradient(135deg,' + p.bg0 + ',' + p.bg1 + ')">' +
          '<span class="gsa-dot" style="background:' + p.accent + '"></span></div>' +
        '<div class="gsa-theme-name">' + p.name + '</div>';
      card.onclick = function () {
        s = load(); s.theme = id; s.accent = null; /* theme resets custom accent */
        save(s); apply(s); refresh();
      };
      grid.appendChild(card);
    });
    themeSec.appendChild(grid);
    wrap.appendChild(themeSec);

    /* Accent colour */
    var accSec = document.createElement('div');
    accSec.className = 'gsa-sec';
    accSec.innerHTML = '<div class="gsa-lbl">Accent colour</div><div class="gsa-hint">Overrides the theme accent. Buttons, highlights and effects use it.</div>';
    var accRow = document.createElement('div'); accRow.className = 'gsa-accents';
    var swatches = ['#4ebb81', '#2fb6ad', '#5b9cf6', '#8b5cf6', '#f5943b', '#e0607f', '#e0c05a'];
    var curAccent = s.accent || (PRESETS[s.theme] || PRESETS[DEFAULT_THEME]).accent;
    swatches.forEach(function (hex) {
      var chip = document.createElement('span');
      chip.className = 'gsa-chip' + (hex.toLowerCase() === curAccent.toLowerCase() ? ' sel' : '');
      chip.style.background = hex;
      chip.onclick = function () { s = load(); s.accent = hex; save(s); apply(s); refresh(); };
      accRow.appendChild(chip);
    });
    var custom = document.createElement('input');
    custom.type = 'color'; custom.className = 'gsa-color-in'; custom.value = curAccent;
    custom.title = 'Custom colour';
    custom.oninput = function () { s = load(); s.accent = custom.value; save(s); apply(s); markSaved(); };
    accRow.appendChild(custom);
    accSec.appendChild(accRow);
    wrap.appendChild(accSec);

    /* Logo */
    var logoSec = document.createElement('div');
    logoSec.className = 'gsa-sec';
    logoSec.innerHTML = '<div class="gsa-lbl">Logo</div><div class="gsa-hint">Upload your organisation logo (PNG or SVG). Shown on the login and sidebar.</div>';
    var logoRow = document.createElement('div'); logoRow.className = 'gsa-logo-row';
    var prev = document.createElement('div'); prev.className = 'gsa-logo-prev';
    var prevImg = document.createElement('img');
    var existingLogo = document.querySelector('.gs-logo-img,.sb-logo,.login-logo,img[alt="Greenstreets"]');
    prevImg.src = s.logo || (existingLogo ? existingLogo.src : '');
    prevImg.alt = 'Logo preview';
    prev.appendChild(prevImg);
    var btns = document.createElement('div'); btns.className = 'gsa-logo-btns';
    var file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    file.onchange = function () {
      var f = file.files && file.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { s = load(); s.logo = r.result; save(s); apply(s); prevImg.src = r.result; markSaved(); };
      r.readAsDataURL(f);
    };
    var upBtn = document.createElement('button'); upBtn.className = 'gsa-btn pri';
    upBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Upload logo';
    upBtn.onclick = function () { file.click(); };
    var rmBtn = document.createElement('button'); rmBtn.className = 'gsa-btn';
    rmBtn.textContent = 'Use default';
    rmBtn.onclick = function () {
      s = load(); delete s.logo; save(s);
      if (existingLogo) prevImg.src = existingLogo.getAttribute('src');
      markSaved();
    };
    btns.appendChild(file); btns.appendChild(upBtn); btns.appendChild(rmBtn);
    logoRow.appendChild(prev); logoRow.appendChild(btns);
    logoSec.appendChild(logoRow);
    wrap.appendChild(logoSec);

    /* Footer: reset + saved indicator */
    var foot = document.createElement('div'); foot.className = 'gsa-foot';
    var saved = document.createElement('span'); saved.className = 'gsa-saved'; saved.textContent = '✓ Saved';
    var reset = document.createElement('button'); reset.className = 'gsa-btn'; reset.textContent = 'Reset to default';
    reset.onclick = function () {
      save({}); document.documentElement.removeAttribute('style');
      apply({}); refresh();
    };
    foot.appendChild(saved); foot.appendChild(reset);
    wrap.appendChild(foot);

    mount.innerHTML = '';
    mount.appendChild(wrap);

    function markSaved() {
      saved.classList.add('on');
      clearTimeout(markSaved._t);
      markSaved._t = setTimeout(function () { saved.classList.remove('on'); }, 1400);
    }
    function refresh() { buildPanel(mount); }
    markSaved();
  }

  function initPanel() {
    var mount = document.getElementById('gs-appearance');
    if (mount) buildPanel(mount);
  }
  if (document.readyState !== 'loading') initPanel();
  else document.addEventListener('DOMContentLoaded', initPanel);

  /* expose */
  window.GSAppearance = { apply: apply, load: load, save: save, PRESETS: PRESETS };
})();
