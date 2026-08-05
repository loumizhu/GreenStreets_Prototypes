# Retailer Admin & Retailer User portals — WCAG 2.1 AA colour-contrast audit

**Date:** 2026-08-04
**Scope:** every screen of `Retailer_Admin_Portal/` (27 pages) and `Retailer_User_Portal/` (13 pages) — 40 pages total.
**Target:** WCAG 2.1 **Level AA** contrast (SC 1.4.3):
- Normal text ≥ **4.5:1**
- Large text (≥24px, or ≥18.66px bold) ≥ **3:1**

## Method

Rather than eyeball screenshots, every page was scanned with a scripted contrast auditor run in-browser (served over `http://localhost:8899`). For each element carrying its own text it:

1. reads the computed text colour (compositing any `rgba` alpha),
2. walks ancestors to resolve the **effective background**, compositing translucent glass layers and taking the **worst-case** colour stop of any gradient behind the element,
3. computes the contrast ratio and compares it against the correct AA threshold for that element's font-size/weight.

Image-backed regions (e.g. the login photo) are reported separately as "cannot compute" and were checked by eye. Both portals use the same dark "glass" theme, so failures were systemic (shared component classes) rather than per-page.

## Result summary

| | Before | After |
|---|---|---|
| Total failing text elements (across 40 pages) | **118** | **0** |
| Unique failing colour/component signatures | **32** | **0** |
| Pages with ≥1 failure | **32** | **0** |

All 40 pages now pass AA for text contrast. Re-running the same auditor after the fixes returns zero failures.

---

## Findings (before fix) & fixes applied

The failures reduced to a handful of root causes — mostly the page-level stylesheets (`retailer-admin.css` / `retailer-user.css`) **overriding** the theme's already-accessible tokens with darker raw accent colours, plus a few hard-coded inline colours.

### 1. Status pills — text too dark on the tinted pill background
`.pill-blue`, `.pill-green`, `.pill-gs`, `.pill-grey` used the saturated accent as text on a same-hue tint.

| Pill | Before (fg) | Ratio | After (fg) | Ratio |
|---|---|---|---|---|
| Blue ("Primary", "Request", "Info", "Awaiting Approval") | `#5b9cf6` | 3.3–3.8 | `#9dc4ff` | ≥5.3 |
| Green ("Submission", "Retailer Approved", "Provided") | `#4ebb81` | 3.6–4.1 | `#8fe3b6` | ≥5.7 |
| GS ("Document") | `#4ebb81` | 3.97 | `#8fe3b6` | ✔ |
| Grey ("User", "Pending", "Secondary") | `rgba(255,255,255,.6)` | 4.3–4.5 | `rgba(255,255,255,.86)` | ≥7.0 |

**Fixed in:** `css/retailer-admin.css` and `css/retailer-user.css` (`.pill-*` rules).

### 2. Document chips & breadcrumb / required-field markers
- `.doc-chip` green `#4ebb81` (4.04) → `#8fe3b6`
- `.bc-link` breadcrumb link `var(--gs)` (4.48) → `var(--gs-l)`
- `.req` required-field `*` `var(--gs)` (4.43) → `var(--gs-l)`
- `.nav-item.active` sidebar `var(--gs)` → `var(--gs-l)` (defensive)

**Fixed in:** both page stylesheets.

### 3. Alerts
- `.alert-info` `#5b9cf6` → `#9dc4ff`
- `.alert-warn` `#f5a623` → `#ffcd7a` (defensive, matches theme)

**Fixed in:** both page stylesheets.

### 4. "Send reminder" button
`.btn-reminder` amber text `#f5a623` on its tinted chip (4.49) → `#ffc061` (5.6).
**Fixed in:** `css/retailer-admin.css`.

### 5. Notification filter counts
`.notif-filter-count` inherited `rgba(255,255,255,.6)` (3.67) → explicit `#eef1f6` (6.1).
**Fixed in:** both page stylesheets.

### 6. Onboarding stepper "done" dot
`.ob-dot.done` used **white tick on the green fill** (2.4). Swapped to dark ink `#04160e` on green (7.8), matching the shared theme.
**Fixed in:** both page stylesheets.

### 7. Coloured stat values (inline)
Large KPI numbers coloured `#4ebb81` / `var(--gs)` / `var(--red)` / `#5b9cf6` failed on the lighter stat-card backgrounds:
- green stat numbers `#4ebb81`/`var(--gs)` (3.6–4.2) → `#8fe3b6` / `var(--gs-l)`
- blue stat numbers `#5b9cf6` (3.9) → `#9dc4ff`
- red stat number `var(--red)` (3.6) → `#ff9c96`

**Fixed in:** inline styles on Dashboard, Notifications, Suppliers, Tracker, Compliance, Setup-3, Send-Invites, Products, etc.

### 8. Inline coloured table / body text
- Blue link/label text `#5b9cf6` in tables & Setup (3.6–4.1) → `#9dc4ff`
- Green section labels `var(--gs)` on Setup-1/Setup-3 (4.32) → `var(--gs-l)`
- Green tinted-button text (`btn-c` "Request DoC data", RU) `var(--gs)` (3.67) → `var(--gs-l)`

### 9. JS-rendered "missing fields" warning (Retailer User Products)
`retailer-user.js` rendered the severe warning in `#e05252` (3.04). Changed the severity palette to `#ff9c96` (severe) / `#ffcd7a` (moderate).
**Fixed in:** `js/retailer-user.js`.

### 10. Invitation e-mail preview (white-background mockup, Custom-Invite)
This is the only light-background surface, so the fix goes the other way (darker text):
- CTA button `#fff on #4ebb81` (2.4) → `#fff on #157347` (5.9)
- footer "Deadline… no account needed" `#aaa on #fff` (2.32) → `#5f5f5f` (6.4)

---

## Notes & things deliberately left as-is

- **Icon/graphical strokes** (e.g. the blue info glyph on the Compliance alert) are non-text graphics judged against the 3:1 SC 1.4.11 threshold and already pass; only the adjacent *text* was raised.
- **`--tw3` muted body text** (`rgba(255,255,255,.62)`) sits at ~4.5–5:1 on the dark cards and passes; it was not flagged.
- **Login background photo** is an image; the login card text sits on an opaque frosted panel and passes.
- Cache-busting versions were bumped so the changes take effect: `retailer-admin.css v15`, `retailer-user.css v9`, `retailer-user.js v6`.

## Out of scope (not contrast)
This audit covers **SC 1.4.3 colour contrast** only. Keyboard operability, focus visibility, form labels/error text, zoom/reflow and touch-target size (the other axes in the general accessibility checklist) were **not** re-tested here and should be run separately if full AA sign-off is needed.
