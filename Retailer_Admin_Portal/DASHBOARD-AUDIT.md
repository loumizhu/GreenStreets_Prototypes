# Technical Audit — Retailer Admin · Compliance Dashboard

**File:** `02-Greenstreets_retailer_admin_Dashboard.html` (654 lines)
**Date:** 2026-08-17
**Tool:** `/impeccable audit` (code-level: a11y, performance, responsive, theming, integrity)

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | **2**/4 | Sub-11px text at 62% opacity; status shown by color dots; no heading landmarks |
| 2 | Performance | **3**/4 | WAAPI entrance engine is transform/opacity-based and clean; only minor glow shadows |
| 3 | Responsive Design | **2**/4 | Hardcoded 4-col tile grid + 7-col tables, no page-level breakpoints; several <44px targets |
| 4 | Theming | **2**/4 | Token system exists but the entire status palette is hardcoded hex, repeated inline |
| 5 | Implementation Integrity | **3**/4 | Coherent, domain-specific system; detector flags are mostly false positives |
| **Total** | | **12/20** | **Acceptable — significant work needed on responsive + theming** |

## Implementation Integrity Verdict — PASS

Expresses a genuinely product-specific system: real compliance domain modeling — Declaration of Conformity coverage, PFAS substance checks, PPWR Art. 7 PCR% targets, REACH test reports, supplier invitation funnels. Not interchangeable filler. The one real integrity smell is design-system drift: the status color palette is redefined as inline hex on nearly every element rather than drawn from tokens.

## Detector Findings — Verified

The bundled detector ran DEGRADED (parser modules missing → regex fallback). Each finding verified manually:

| Detector flag | Verdict | Notes |
|---|---|---|
| Broken/placeholder images (lines 61, 238, 250, 298, 309) | **False positive** | `[data-sw]` `src` set to `img/swoosh.png` by `retailer-admin.js:681`; sidebar logo populated by `gs-appearance.js`. |
| Em-dash overuse (10 in body) | **False positive** | UI microcopy strings, not body prose. |
| Flat type hierarchy (9–16px) | **Partly real** | Regex artifact, but the type scale does live almost entirely in the 9–12px band. |
| Overused font (Inter) | **Real, low priority** | Consistent with the design system; a brand choice, not a defect. |
| Glowing shadow accents (`#8ad2ac`) | **Real, minor** | Chart bars carry `0 0 7–8px` colored glows (lines 29–31). Cosmetic. |

## Executive Summary

- **Health Score: 12/20 (Acceptable)**
- **Issue count:** P0 ×0 · P1 ×3 · P2 ×4 · P3 ×2
- **Top issues:**
  1. **[P1]** No responsive breakpoints — 4-col metric grid + 7-col tables are fixed; squish/overflow below ~900px.
  2. **[P1]** Legibility/contrast — pervasive 9–11px text on `--tw3` (white @ 62%) at/under the WCAG AA 4.5:1 floor.
  3. **[P1]** Status conveyed by color alone (the `●` dots) — WCAG 1.4.1. Partially mitigated by adjacent text.
  4. **[P2]** Status palette hardcoded (`#8fe3b6`, `#f5a623`, `#ff9c96`, `#2a5298`…) inline across ~40 spots instead of tokens.
  5. **[P2]** Custom entrance engine has no `prefers-reduced-motion` path (pre-hides content via `opacity:0`).

## Detailed Findings by Severity

### [P1] No responsive breakpoints on this page
- **Location:** Inline grids at lines 112 (`repeat(4,1fr)`), 120 (`1.35fr 1fr`), 225 (`1fr 1fr`); tables 234, 269.
- **Category:** Responsive
- **Impact:** On tablet/phone the four metric tiles (9–14px text) compress to unreadable columns; the 5- and 7-column tables overflow horizontally.
- **Recommendation:** Breakpoints collapsing tiles to 2×2 then 1-col; `overflow-x:auto` wrapper (or card-per-row) for tables under ~720px.
- **Command:** `/impeccable adapt`

### [P1] Small-text contrast at/under AA floor
- **Location:** `.wk-day span`, `.stat-lbl`, `.tbl-muted`, the many `font-size:9–11px; color:var(--tw3)` spans; `--tw3 = rgba(255,255,255,.62)`.
- **Category:** Accessibility · WCAG 1.4.3 (AA)
- **Impact:** 62% white on dark navy for ≤11px text is borderline-to-failing 4.5:1; 9px y-axis labels are worst case.
- **Recommendation:** Raise secondary/tertiary text to `--tw2` (74%) at these sizes, or lift the smallest sizes to ≥12px.
- **Command:** `/impeccable typeset`

### [P1] Status communicated by color alone
- **Location:** Conformity table status column (lines 237–249): `<span style="color:#4ebb81">●</span>` etc.; the DoC pie (line 113).
- **Category:** Accessibility · WCAG 1.4.1
- **Impact:** Color-blind users can't distinguish green/amber/red dots; the dot has no text or shape difference.
- **Recommendation:** Add a glyph/label to the dot (✓ / ! / ✕) or visible text status.
- **Command:** `/impeccable clarify`

### [P2] Status palette hardcoded, not tokenized
- **Location:** ~40 inline `color:`/`background:` hex values (`#8fe3b6`, `#f5a623`, `#ff9c96`, `#2a5298`, `#8ad2ac`, `#e05252`, `#9dc4ff`…).
- **Category:** Theming / Implementation Integrity
- **Impact:** No single source of truth for status colors; values already drift (e.g. `#ff9c96` vs `#e05252` both for "red").
- **Recommendation:** Promote to `--gs-ok / --gs-warn / --gs-danger / --gs-info` tokens in `greenstreets-theme.css`.
- **Command:** `/impeccable colorize`

### [P2] No reduced-motion path in the entrance engine
- **Location:** Inline `<script>` engine (lines 414–652) + `html.gs-anim-armed{opacity:0}` pre-hide (lines 49–51).
- **Category:** Accessibility · WCAG 2.3.3 / motion sensitivity
- **Impact:** Content starts at `opacity:0`, revealed only by JS animation; reduce-motion users get the full sweep. (CLAUDE.md notes this was intentionally removed for demos — flagged for a production build.)
- **Recommendation:** Under `prefers-reduced-motion`, jump to end state (final opacity, no tween).
- **Command:** `/impeccable animate`

### [P2] Heading hierarchy / landmarks are non-semantic
- **Location:** `.pg-title` (line 89), `.grp-hdr` cards — all `<div>`s; no `<h1>`/`<h2>`.
- **Category:** Accessibility
- **Impact:** Screen-reader users get no heading outline. (`greenstreets-theme.js` guarantees one `main` landmark, but headings are still divs.)
- **Recommendation:** Promote page title to `<h1>`, card headers to `<h2>`.
- **Command:** `/impeccable harden`

### [P2] Small touch targets
- **Location:** `.exp-remind` (26px, line 41), `.btn-p` (26px), `.btn-reminder`, `.btn-g` (32px).
- **Category:** Responsive / Accessibility · WCAG 2.5.5
- **Impact:** Several action controls ~26px tall — below the 44×44 touch target.
- **Recommendation:** ≥40px min hit area (padding or `min-height`) on touch breakpoints.
- **Command:** `/impeccable adapt`

### [P3] Colored glow shadows on chart bars
Lines 29–31 — cosmetic "AI-glow" tell; consider neutral elevation. `/impeccable quieter`

### [P3] `View →` links with `onclick="void(0)"`
Lines 279, 288, 323 — dead affordances; fine for a mock, worth a `title`/disabled state. `/impeccable clarify`

## Patterns & Systemic Issues

- **Inline-style-driven design.** Nearly all color, spacing, and sizing lives in inline `style=` attributes, not classes/tokens — root cause of both the theming drift (P2) and the missing responsive behavior (P1). Highest-leverage thing to address.
- **Type scale collapses into 9–12px.** Almost every label, sublabel, and cell sits in a 3px-wide band — flattens hierarchy and creates the contrast risk.

## Positive Findings

- **Entrance animation engine is genuinely well-built** — transform/opacity WAAPI, cancellable run bookkeeping, count-up + pie-sweep tied to real values, GPU-friendly.
- **Keyboard access handled centrally** — `<a onclick>` nav and clickable `<div>`s promoted by `GSKeyboardEnable`.
- **The DoC pie is exemplary a11y** — `role="img"` + descriptive `aria-label` + tooltip.
- **Content is real and domain-coherent** — reads as an actual compliance tool.

## Recommended Actions (priority order)

1. **[P1] `/impeccable adapt`** — breakpoints for tile grid + tables; fix sub-44px touch targets.
2. **[P1] `/impeccable typeset`** — lift smallest text off `--tw3`/9px to clear AA contrast.
3. **[P1] `/impeccable clarify`** — non-color status cues on conformity dots; fix `void(0)` dead links.
4. **[P2] `/impeccable colorize`** — tokenize status palette into `--gs-ok/warn/danger/info`.
5. **[P2] `/impeccable harden`** — semantic headings + reduced-motion fallback.
6. **`/impeccable polish`** — final pass.
