/*!
 * Greenstreets logo animation — "compliance seal → G"
 * Proposition v2
 *
 * Story (timeline seconds below; plays at speed 1.5 by default → ≈2.7 s real time):
 *   1. A blue seal ring draws itself; yellow points pop in one by one, clockwise
 *      (a nod to Europe — blue + a circle of yellow points — NOT the EU emblem).
 *   2. A white checkmark draws inside the seal, the seal pulses: "verified". The points
 *      leave one by one in the opposite order.
 *   3. The checkmark breaks into four squares. They fly to the top, left, bottom and centre
 *      of the G, then each slides along its part of the letter — turning with the curve —
 *      and draws it behind itself:
 *        top    → the top arc, from the terminal round to the left
 *        left   → the lower-left quarter circle, down to the bottom
 *        bottom → the bottom-right curve and up the stem
 *        centre → the horizontal bar
 *   4. The blue ring retracts while the two green swooshes are drawn from their thick base
 *      to their thin tip. Optional navy tile fades in; a sheen passes over the G.
 *   Ends on the exact static logo.
 *
 * Requires GSAP 3.13+ with DrawSVGPlugin and MotionPathPlugin (all free since 3.13).
 * Without them, or with prefers-reduced-motion, the final logo is shown instantly.
 *
 * Usage:
 *   const anim = GSLogoAnim.mount(element, { background: 'none', delay: 0.2 });
 *   anim.replay();
 * or declaratively:
 *   <div data-gs-logo-anim data-background="rounded" style="width:200px"></div>
 *
 * The SVG fills its container (width:100%, square), so size it with CSS on the container.
 */
(function (root) {
  'use strict';

  var VB = 368.504;
  var C = VB / 2; // 184.252 — centre of the artwork

  // Brand artwork, copied from Logo BrandGuidelines/LOGOS/CMYK/EPS/SmallFavIcon.svg
  var G_PATH = 'M239.144 175.536 L239.144 230.034 C225.015 244.347 208.133 251.136 186.848 251.136 C147.213 251.136 120.79 224.896 120.79 184.711 C120.79 145.259 148.865 117.368 188.683 117.368 C207.399 117.368 223.547 124.341 235.291 134.25 L223.363 150.03 C213.454 141.773 201.895 137.186 188.866 137.186 C161.159 137.186 142.442 155.902 142.442 183.977 C142.442 213.152 160.058 231.502 187.581 231.502 C200.243 231.502 210.151 228.199 219.51 221.226 L219.51 194.253 L183.728 194.253 L183.728 175.536 Z';
  var SWOOSH_TOP = [
    'M122.221 130.525 C137.658 89.02 174.175 59.846 216.77 59.846 C238.856 59.846 259.308 67.689 276.035 81.027 C251.795 59.29 219.766 46.063 184.644 46.063 C127.247 46.063 78.105 81.377 57.739 131.459 L121.711 131.459 C121.883 131.149 122.047 130.833 122.221 130.525 Z',
    'M122.221 130.525 C140.534 98.223 175.222 76.425 215.006 76.425 C254.85 76.425 289.585 98.289 307.874 130.673 C308.148 131.158 308.657 131.459 309.213 131.459 L309.213 131.459 C310.317 131.459 311.075 130.331 310.642 129.316 C302.724 110.759 290.84 94.302 276.035 81.027 C259.308 67.689 238.856 59.846 216.77 59.846 C174.175 59.846 137.658 89.02 122.221 130.525 Z'
  ];
  var SWOOSH_BOTTOM = [
    'M246.283 237.979 C230.846 279.484 194.329 308.658 151.734 308.658 C129.648 308.658 109.196 300.815 92.468 287.477 C116.709 309.214 148.738 322.441 183.86 322.441 C241.257 322.441 290.398 287.127 310.765 237.045 L246.793 237.045 C246.621 237.355 246.457 237.671 246.283 237.979 Z',
    'M246.283 237.979 C227.97 270.281 193.281 292.079 153.498 292.079 C113.653 292.079 78.919 270.215 60.63 237.831 C60.356 237.346 59.847 237.045 59.291 237.045 L59.291 237.045 C58.187 237.045 57.429 238.173 57.862 239.188 C65.78 257.745 77.664 274.202 92.468 287.477 C109.196 300.815 129.648 308.658 151.734 308.658 C194.329 308.658 230.846 279.484 246.283 237.979 Z'
  ];

  // Checkmark centre line A(140,182) → B(174,216) → C(238,152), 30 units thick.
  var CHECK_LINE = 'M140 182 L174 216 L238 152';

  // The G as four strokes, one per square. Centre-line circle: (188.5, 184.25), r 57; the
  // letter is ~20 units thick. Each stroke is 30 wide and clipped by the real G outline, so
  // together they reveal exactly the letter. Each starts a little outside its section and
  // ends overlapping the next, so no seams show.
  var G_STROKES = {
    top:    'M223.59 139.33 A57 57 0 0 0 131.64 188.23',                       // terminal → over the top → left
    left:   'M131.5 184.25 A57 57 0 0 0 190.49 241.21',                        // left → bottom
    bottom: 'M186.51 241.21 A57 57 0 0 0 228.81 224.56 L229.33 175.536',           // bottom → bottom-right → up the stem
    center: 'M180 184.89 L229.33 184.89'                                       // the bar, left → right (ends mid-stem)
  };
  // Where each square sits on the checkmark when it breaks (x, y, rotation).
  var CHECK_SQUARES = {
    left:   [157, 199, 45],
    bottom: [174, 213, 45],
    center: [197, 193, -45],
    top:    [222, 168, -45]
  };
  var SQ = 20; // square size = the G's stroke thickness

  // Swoosh reveal: a thick stroke inside a mask, drawn from the thick base to the thin tip.
  var SWOOSH_DRAW_TOP = 'M75.92 165.15 A110 110 0 0 1 290.5 155.78';      // left base → right tip
  var SWOOSH_DRAW_BOTTOM = 'M292.58 203.35 A110 110 0 0 1 78 212.72';    // right base → left tip

  var COLORS = {
    navy: '#1d2046',     // brand tile
    green: '#49ae7a',    // brand swoosh green
    seal: '#3d6cf5',     // "European" blue for the seal ring
    sealGlow: '#2f5be0',
    point: '#ffcc00',    // yellow points around the seal
    mark: '#ffffff'
  };

  var SEAL_R = 138;      // matches the outer edge of the swooshes
  var POINT_R = 122;     // sits inside the swoosh band
  var POINT_COUNT = 16;  // deliberately not 12

  var uid = 0;

  function buildSvg(p, background) {
    var bg = '';
    if (background === 'square') bg = '<rect class="gsla-bg" width="' + VB + '" height="' + VB + '" fill="' + COLORS.navy + '"/>';
    if (background === 'rounded') bg = '<rect class="gsla-bg" width="' + VB + '" height="' + VB + '" rx="72" fill="' + COLORS.navy + '"/>';
    if (background === 'circle') bg = '<circle class="gsla-bg" cx="' + C + '" cy="' + C + '" r="' + C + '" fill="' + COLORS.navy + '"/>';

    var points = '';
    for (var i = 0; i < POINT_COUNT; i++) {
      var a = (i / POINT_COUNT) * Math.PI * 2 - Math.PI / 2;
      var x = (C + Math.cos(a) * POINT_R).toFixed(2);
      var y = (C + Math.sin(a) * POINT_R).toFixed(2);
      points += '<circle class="gsla-point" cx="' + x + '" cy="' + y + '" r="5" fill="' + COLORS.point + '"/>';
    }

    var strokes = '', squares = '';
    Object.keys(G_STROKES).forEach(function (k) {
      strokes += '<path class="gsla-gs gsla-gs-' + k + '" d="' + G_STROKES[k] + '" fill="none" stroke="' + COLORS.mark + '" stroke-width="30" stroke-linecap="butt" stroke-linejoin="miter"/>';
      squares += '<rect class="gsla-sq gsla-sq-' + k + '" x="' + (-SQ / 2) + '" y="' + (-SQ / 2) + '" width="' + SQ + '" height="' + SQ + '" rx="1.5" fill="' + COLORS.mark + '"/>';
    });

    var vbox = 'maskUnits="userSpaceOnUse" x="0" y="0" width="' + VB + '" height="' + VB + '"';

    return '' +
      '<svg class="gsla-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + VB + ' ' + VB + '" role="img" aria-label="Greenstreets" focusable="false">' +
      '<defs>' +
        '<radialGradient id="' + p + 'g36" cx="191.792" cy="171.051" r="129.297" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#49ae7a" stop-opacity="0"/><stop offset="0.7091" stop-color="#49ae7a" stop-opacity="0.5"/><stop offset="0.9214" stop-color="#49ae7a"/></radialGradient>' +
        '<linearGradient id="' + p + 'g48" x1="299.714" y1="53.428" x2="315.852" y2="146.11" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.0782" stop-color="#49ae7a"/><stop offset="0.4201" stop-color="#49ae7a" stop-opacity="0.5"/><stop offset="1" stop-color="#49ae7a" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="' + p + 'g36b" cx="176.712" cy="197.453" r="129.297" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#49ae7a" stop-opacity="0"/><stop offset="0.7091" stop-color="#49ae7a" stop-opacity="0.5"/><stop offset="0.9214" stop-color="#49ae7a"/></radialGradient>' +
        '<linearGradient id="' + p + 'g48b" x1="68.79" y1="315.076" x2="52.651" y2="222.394" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.0782" stop-color="#49ae7a"/><stop offset="0.4201" stop-color="#49ae7a" stop-opacity="0.5"/><stop offset="1" stop-color="#49ae7a" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="' + p + 'aura" cx="' + C + '" cy="' + C + '" r="' + SEAL_R + '" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="' + COLORS.sealGlow + '" stop-opacity="0.38"/><stop offset="0.75" stop-color="' + COLORS.sealGlow + '" stop-opacity="0.12"/><stop offset="1" stop-color="' + COLORS.sealGlow + '" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + p + 'sheen" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
        '<clipPath id="' + p + 'gclip"><path d="' + G_PATH + '"/></clipPath>' +
        '<mask id="' + p + 'mtop" ' + vbox + '><path class="gsla-swd gsla-swd-top" d="' + SWOOSH_DRAW_TOP + '" fill="none" stroke="#fff" stroke-width="72"/></mask>' +
        '<mask id="' + p + 'mbot" ' + vbox + '><path class="gsla-swd gsla-swd-bottom" d="' + SWOOSH_DRAW_BOTTOM + '" fill="none" stroke="#fff" stroke-width="72"/></mask>' +
      '</defs>' +
      bg +
      '<circle class="gsla-aura" cx="' + C + '" cy="' + C + '" r="' + SEAL_R + '" fill="url(#' + p + 'aura)"/>' +
      '<g class="gsla-points">' + points + '</g>' +
      '<circle class="gsla-pulse" cx="' + C + '" cy="' + C + '" r="' + SEAL_R + '" fill="none" stroke="' + COLORS.seal + '" stroke-width="3"/>' +
      '<circle class="gsla-seal" cx="' + C + '" cy="' + C + '" r="' + SEAL_R + '" fill="none" stroke="' + COLORS.seal + '" stroke-width="5" transform="rotate(-90 ' + C + ' ' + C + ')"/>' +
      '<g class="gsla-swoosh gsla-swoosh-top" mask="url(#' + p + 'mtop)">' +
        '<path d="' + SWOOSH_TOP[0] + '" fill="url(#' + p + 'g36)"/><path d="' + SWOOSH_TOP[1] + '" fill="url(#' + p + 'g48)"/></g>' +
      '<g class="gsla-swoosh gsla-swoosh-bottom" mask="url(#' + p + 'mbot)">' +
        '<path d="' + SWOOSH_BOTTOM[0] + '" fill="url(#' + p + 'g36b)"/><path d="' + SWOOSH_BOTTOM[1] + '" fill="url(#' + p + 'g48b)"/></g>' +
      '<path class="gsla-check-line" d="' + CHECK_LINE + '" fill="none" stroke="' + COLORS.mark + '" stroke-width="30" stroke-linecap="butt" stroke-linejoin="miter"/>' +
      '<g class="gsla-gstrokes" clip-path="url(#' + p + 'gclip)">' + strokes + '</g>' +
      '<path class="gsla-g" d="' + G_PATH + '" fill="' + COLORS.mark + '"/>' +
      '<g class="gsla-squares">' + squares + '</g>' +
      '<g clip-path="url(#' + p + 'gclip)"><rect class="gsla-sheen" x="-140" y="-40" width="110" height="' + (VB + 80) + '" fill="url(#' + p + 'sheen)" transform="rotate(18 ' + C + ' ' + C + ')"/></g>' +
      '</svg>';
  }

  // The finished, static logo — used for reduced motion / missing GSAP.
  function showFinal(svg) {
    [].forEach.call(svg.querySelectorAll('.gsla-aura, .gsla-points, .gsla-pulse, .gsla-seal, .gsla-check-line, .gsla-gstrokes, .gsla-squares, .gsla-sheen'),
      function (el) { el.style.opacity = 0; });
  }

  // Position and heading (degrees) at the start of a path — what MotionPath's autoRotate
  // will use on the first frame, so the hand-off from the fly-in to the slide has no jump.
  function pathStart(path) {
    var a = path.getPointAtLength(0), b = path.getPointAtLength(0.5);
    return { x: a.x, y: a.y, rotation: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
  }

  function buildTimeline(svg, opts) {
    var gsap = root.gsap;
    var $ = function (s) { return svg.querySelector(s); };
    var $$ = function (s) { return svg.querySelectorAll(s); };
    var origin = C + ' ' + C;

    var bg = $('.gsla-bg');
    var seal = $('.gsla-seal');
    var pulse = $('.gsla-pulse');
    var aura = $('.gsla-aura');
    var points = $$('.gsla-point');
    var checkLine = $('.gsla-check-line');
    var gFill = $('.gsla-g');
    var gStrokes = $('.gsla-gstrokes');
    var swDrawTop = $('.gsla-swd-top');
    var swDrawBottom = $('.gsla-swd-bottom');
    var sheen = $('.gsla-sheen');
    var parts = Object.keys(G_STROKES).map(function (k) {
      return { key: k, stroke: $('.gsla-gs-' + k), sq: $('.gsla-sq-' + k), from: CHECK_SQUARES[k] };
    });

    // ---- initial state ----
    gsap.set(seal, { drawSVG: '0% 0%', opacity: 1 });
    gsap.set(pulse, { opacity: 0, scale: 1, svgOrigin: origin });
    gsap.set(aura, { opacity: 0, scale: 0.6, svgOrigin: origin });
    gsap.set(points, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(checkLine, { drawSVG: '0% 0%', opacity: 1 });
    gsap.set(gFill, { opacity: 0 });
    gsap.set(gStrokes, { opacity: 1 });
    gsap.set([swDrawTop, swDrawBottom], { drawSVG: '0% 0%' });
    gsap.set(sheen, { attr: { x: -140 } });
    parts.forEach(function (pt) {
      gsap.set(pt.stroke, { drawSVG: '0% 0%' });
      gsap.set(pt.sq, { x: pt.from[0], y: pt.from[1], rotation: pt.from[2], scale: 1.5, opacity: 0, transformOrigin: '50% 50%' });
    });
    if (bg) gsap.set(bg, { opacity: 0, scale: 0.92, svgOrigin: origin });

    var tl = gsap.timeline({
      paused: true,
      delay: opts.delay,
      repeat: opts.loop ? -1 : 0,
      repeatDelay: 1.2,
      onComplete: opts.onComplete
    });

    // 1 — the seal forms; points appear clockwise from 12 o'clock
    tl.to(aura, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(seal, { drawSVG: '0% 100%', duration: 0.7, ease: 'power2.inOut' }, 0)
      .to(points, { scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: { each: 0.035 } }, 0.12);

    // 2 — verified; points leave one by one in the opposite order
    tl.to(checkLine, { drawSVG: '0% 100%', duration: 0.42, ease: 'power3.inOut' }, 0.6)
      .fromTo(pulse, { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.22, duration: 0.6, ease: 'power2.out' }, 1.0)
      .to(checkLine, { scale: 1.08, svgOrigin: origin, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, 1.0)
      .to(points, { scale: 0, duration: 0.25, ease: 'back.in(2.5)', stagger: { each: 0.035, from: 'end' } }, 1.05);

    // 3a — the checkmark breaks into four squares…
    var BREAK = 1.45;
    tl.set(checkLine, { opacity: 0 }, BREAK);
    parts.forEach(function (pt) {
      tl.set(pt.sq, { opacity: 1 }, BREAK);
      // a small jolt apart from the check's centre, as if it cracked
      var dx = pt.from[0] - 190, dy = pt.from[1] - 192, d = Math.sqrt(dx * dx + dy * dy) || 1;
      tl.to(pt.sq, { x: pt.from[0] + dx / d * 6, y: pt.from[1] + dy / d * 6, scale: 1.3, duration: 0.18, ease: 'power2.out' }, BREAK);
    });

    // 3b — …that fly to their start points, turning to face their path…
    var FLY = BREAK + 0.2;
    parts.forEach(function (pt) {
      var s = pathStart(pt.stroke);
      tl.to(pt.sq, { x: s.x, y: s.y, rotation: s.rotation, scale: 1, duration: 0.5, ease: 'power3.inOut' }, FLY);
    });

    // 3c — …and slide along their section of the G, drawing it behind them.
    var DRAW = FLY + 0.55, DRAW_DUR = 0.85;
    var offsets = { top: 0, left: 0, bottom: 0.08, center: 0.16 };
    parts.forEach(function (pt) {
      var at = DRAW + offsets[pt.key];
      tl.to(pt.stroke, { drawSVG: '0% 100%', duration: DRAW_DUR, ease: 'power2.inOut' }, at)
        .to(pt.sq, { motionPath: { path: pt.stroke, autoRotate: true }, duration: DRAW_DUR, ease: 'power2.inOut' }, at)
        .to(pt.sq, { scale: 0, duration: 0.24, ease: 'power2.in' }, at + DRAW_DUR - 0.22); // gone as it lands
    });
    var DONE = DRAW + 0.16 + DRAW_DUR;
    tl.set(gFill, { opacity: 1 }, DONE)          // the strokes now cover exactly the G — swap to the real path
      .set(gStrokes, { opacity: 0 }, DONE);

    // 4 — the ring retracts, the swooshes are drawn thick → thin
    var SW = DRAW + 0.35;
    tl.to(seal, { drawSVG: '100% 100%', duration: 0.7, ease: 'power2.inOut' }, SW - 0.15)
      .to(aura, { opacity: 0, duration: 0.7 }, SW - 0.15)
      .to([swDrawTop, swDrawBottom], { drawSVG: '0% 100%', duration: 0.95, ease: 'power2.inOut' }, SW);

    if (bg) tl.to(bg, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, DONE - 0.1);
    tl.to(sheen, { attr: { x: VB + 60 }, duration: 0.7, ease: 'power1.inOut' }, DONE + 0.1);

    tl.timeScale(opts.speed);
    return tl;
  }

  function mount(el, options) {
    var opts = Object.assign({
      background: 'none',   // 'none' | 'square' | 'rounded' | 'circle' (navy brand tile)
      autoplay: true,
      delay: 0.15,          // seconds before the intro starts
      speed: 1.5,           // playback rate; 1.5 ≈ 2.7 s, 1 ≈ 4 s
      loop: false,
      respectReducedMotion: true,
      onComplete: null
    }, options || {});

    var p = 'gsla' + (++uid) + '-';
    el.innerHTML = buildSvg(p, opts.background);
    var svg = el.querySelector('svg');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.overflow = 'visible';

    var gsap = root.gsap;
    var reduced = opts.respectReducedMotion && root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAnimate = gsap && root.DrawSVGPlugin && root.MotionPathPlugin;

    if (!canAnimate || reduced) {
      showFinal(svg);
      if (opts.onComplete) opts.onComplete();
      return { svg: svg, timeline: null, play: function () {}, replay: function () {}, seek: function () {}, destroy: function () { el.innerHTML = ''; } };
    }

    gsap.registerPlugin(root.DrawSVGPlugin, root.MotionPathPlugin);
    var tl = buildTimeline(svg, opts);
    if (opts.autoplay) tl.play();

    return {
      svg: svg,
      timeline: tl,
      play: function () { tl.play(); },
      replay: function () { tl.restart(true); },        // true = honour the start delay
      seek: function (t) { tl.pause(t); },               // freeze at t seconds (for review)
      destroy: function () { tl.kill(); el.innerHTML = ''; }
    };
  }

  function autoMount() {
    [].forEach.call(document.querySelectorAll('[data-gs-logo-anim]'), function (el) {
      if (el._gsla) return;
      el._gsla = mount(el, {
        background: el.getAttribute('data-background') || 'none',
        delay: el.hasAttribute('data-delay') ? parseFloat(el.getAttribute('data-delay')) : 0.15,
        speed: el.hasAttribute('data-speed') ? parseFloat(el.getAttribute('data-speed')) : 1.5,
        loop: el.hasAttribute('data-loop')
      });
    });
  }

  root.GSLogoAnim = { mount: mount, autoMount: autoMount };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
    else autoMount();
  }
})(typeof window !== 'undefined' ? window : this);
