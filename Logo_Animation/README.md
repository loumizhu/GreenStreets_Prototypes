# Greenstreets logo animation: "compliance seal → G"

**Proposition v2 (2026-10-28).** This is the intro animation for the login screen.

1. A blue seal closes and yellow points appear around it one by one.
2. A checkmark marks it as "verified", and the points leave one by one in the opposite order.
3. The checkmark breaks into four squares. Each square slides along one part of the **G**, turning
   with the curve, and draws that part behind it.
4. The two green swooshes are then drawn from their thick base to their thin tip.

It ends on the exact brand logo, taken from `Logo BrandGuidelines/LOGOS/CMYK/EPS/SmallFavIcon.svg`.

The blue seal and its ring of yellow points hint at Europe. It is deliberately **not** the EU
emblem: the points are 16 round dots instead of 12 stars.

## Files

| File | What it is |
|---|---|
| `greenstreets-logo-anim.js` | The animation. It is framework-free and exposes `window.GSLogoAnim`. |
| `GreenstreetsLogoAnim.tsx` | A React / Next.js wrapper (`'use client'`). |
| `greenstreets-logo-anim.html` | A review page. It has a replay button, sizes, tile variants, speed, a frame scrubber and a light/dark page toggle. |
| `greenstreets-login-anim.html` | The animation shown on the login card. |
| `lottie/greenstreets-logo.json` | **The Lottie version** (60 fps, 161 frames, 2.68 s, 64 KB). See "Lottie" below. |
| `lottie/compare.html` | GSAP and Lottie side by side, with a pixel-diff "Measure accuracy" button. |
| `tools/build-lottie.py` | Generates the Lottie JSON from the JS. Don't hand-edit the JSON. |

## Timeline

Times below are **timeline seconds**. It plays at **speed 1.5 by default**, so divide by 1.5
for real time: the whole intro runs about **2.7 s**.

| Time | Beat | Easing |
|---|---|---|
| 0.00–0.70 s | The blue seal ring draws clockwise from 12 o'clock and the inner aura grows. | power2.inOut |
| 0.12–0.80 s | 16 yellow points pop in clockwise. | back.out(3), 35 ms stagger |
| 0.60–1.02 s | The white checkmark draws. | power3.inOut |
| 1.00–1.60 s | The seal pulses outward and the checkmark bumps. | power2.out |
| 1.05–1.85 s | The points leave one by one in the **opposite** order. | back.in(2.5), stagger from the end |
| 1.45 s | **The checkmark breaks into 4 squares**, which jolt slightly apart. | power2.out |
| 1.65–2.15 s | The squares fly to their start points, turning to face their path. | power3.inOut |
| 2.20–3.21 s | Each square slides along its section, rotating with the curve, and draws it behind itself. | power2.inOut, 0.85 s each |
| 2.40–3.30 s | The blue ring retracts and the aura fades. | power2.inOut |
| 2.55–3.50 s | **The swooshes are drawn from the thick base to the thin tip** (top: left → right; bottom: right → left). | power2.inOut |
| 3.21 s | The four strokes are swapped for the real G path. They are clipped to it, so nothing visibly changes. | |
| 3.11–3.71 s | The navy tile fades in (only with `background` ≠ `none`). | power2.out |
| 3.31–4.01 s | A light sheen sweeps across the G. | power1.inOut |

Which square draws which part of the G:

| Square | Lands at | Draws |
|---|---|---|
| Top | The G's top terminal (upper right) | The top arc, over the top to the left |
| Left | The left side | The lower-left quarter circle, down to the bottom |
| Bottom | The bottom | The bottom-right curve, then up the vertical stem |
| Centre | The centre | The horizontal bar, left to right |

| Colour | Value | Role |
|---|---|---|
| Seal blue | `#3d6cf5` | The European hint |
| Aura | `#2f5be0` | Radial glow inside the seal |
| Points | `#ffcc00` | Yellow points around the seal |
| Brand green | `#49ae7a` | The swooshes |
| Brand navy | `#1d2046` | The optional tile |
| Mark | `#ffffff` | The checkmark and the G |

## Plain HTML

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/DrawSVGPlugin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/MotionPathPlugin.min.js"></script>
<script src="greenstreets-logo-anim.js"></script>

<!-- declarative: -->
<div data-gs-logo-anim data-background="none" style="width:200px"></div>

<!-- or scripted: -->
<script>
  const anim = GSLogoAnim.mount(document.getElementById('logo'), { delay: 0.2 });
  // anim.replay(); anim.seek(1.5); anim.destroy();
</script>
```

## React / Next.js

```bash
npm i gsap@^3.13
```

```tsx
import GreenstreetsLogoAnim from './GreenstreetsLogoAnim';
<GreenstreetsLogoAnim size={200} />
```

## Options

| Option | Default | Notes |
|---|---|---|
| `background` | `'none'` | `'none'` (transparent), `'square'`, `'rounded'` or `'circle'`. The last three add the navy brand tile. |
| `delay` | `0.15` | Seconds before the animation starts. |
| `speed` | `1.5` | Playback rate. `1.5` runs about 2.7 s; `1` is the slower original (about 4 s); `2` is about 2 s. |
| `loop` | `false` | Repeats with a 1.2 s pause between plays. |
| `respectReducedMotion` | `true` | When the user has reduced motion turned on, the final logo shows instantly. |
| `onComplete` | `null` | Use this, for example, to fade in the login form after the logo lands. |

## Sizing

The SVG fills its container's width and stays square. Set the size with CSS on the container.
It is pure vector, so it stays sharp at any size. We reviewed it at 48, 96, 200, 320 and 480 px.
Below about 64 px the points and the sheen become hard to see. For favicon-sized uses, consider
`speed: 2` or just the static logo.

## Fallbacks

If GSAP or one of its plugins fails to load, or reduced motion is on, the component renders
the finished static logo. The page never shows an empty box.

## How the G is drawn (for whoever maintains this)

The G is a filled outline, so it can't be stroke-drawn directly. Instead there are four
30-unit **stroke paths** (`G_STROKES`), one per square. They follow the letter's centre line
(a circle at (188.5, 184.25) with r 57, plus the stem and the bar), and they sit inside a
group **clipped by the real G outline**. However wide the strokes are, they only reveal the
exact letter. Once all four are drawn, they are swapped for the real G path, which looks
identical. Each square rides the tip of its stroke with MotionPath (`autoRotate`). The
swooshes use the same idea: a thick stroke in an SVG mask, drawn along the swoosh from its
base to its tip.

## Lottie

`lottie/greenstreets-logo.json` is the same animation as a Lottie file, for teams that
prefer a player over code, or for iOS and Android apps.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<div id="logo" style="width:150px;height:150px"></div>
<script>
  lottie.loadAnimation({ container: document.getElementById('logo'), renderer: 'svg',
                         loop: false, autoplay: true, path: 'greenstreets-logo.json' });
</script>
```

In React, `lottie-react` or `@lottiefiles/dotlottie-react` takes the same file. To make a
`.lottie` (zipped) copy, run it through LottieFiles.

- **Speed:** the 1.5× speed is already built in: 2.68 s at 60 fps. Change it with the
  player's `setSpeed()`.
- **Background:** transparent only. If you need the navy tile, put it behind the player with
  CSS.
- **Tagline sync:** there is a marker named `tagline` at frame 128. Listen for it, or for
  `enterFrame` ≥ 128, to bring in the text under the logo the way the login page does.
- **Reduced motion:** the player doesn't handle it. Check
  `matchMedia('(prefers-reduced-motion: reduce)')` and jump to the last frame
  (`goToAndStop(160, true)`).

**Accuracy against the code version:** `lottie/compare.html` renders both versions at every
frame and compares them pixel by pixel. Measured on 2026-11-02, across all 161 frames:

- On average, 0.13% of logo pixels differ visibly.
- The worst frame (117, as the squares shrink away) differs by 1.02%, which is 123 pixels.

**How it's built** (`python Logo_Animation/tools/build-lottie.py`):

- Every path, colour and position is read from `greenstreets-logo-anim.js`. The timings
  mirror `buildTimeline()` by hand, so change both together.
- Each GSAP easing curve is fitted to a Lottie cubic curve. The script prints each fit's error:
  0.006–0.015 for most curves, and about 0.035 for the two overshoot curves on the yellow
  points.
- The squares riding the G, and the tips of the strokes they draw, are baked as one keyframe
  per frame. A single cubic curve can't express "move along this arc while turning with it",
  and baking keeps each square locked to its tip. All other movements are ordinary keyframes,
  so they can be edited in a Lottie tool.
- The G is drawn the same way as in the code version: four strokes under a layer mask in the
  shape of the real G, swapped for the solid G once they finish. The swooshes are revealed by
  an alpha matte that draws itself along each swoosh.
