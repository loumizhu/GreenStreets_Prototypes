# Component library ⇄ Figma audit — 2026-10-13

**Source of truth:** Figma file **GreenStreets Component Page**, page **Components**
(the file's second page, *Supplier Portal*, is empty).

**Result:** `components.html` and the base-kit sheets now carry **only** the 38 components on
that page, under Figma's names, in Figma's order and with Figma's states. The 83 specimens
Figma does not carry are archived in [`old/`](old/). The Figma drawings are now real,
reusable **Figma components** (see §4).

---

## 1. What changed in the library

| Area | Change |
|---|---|
| `components.html` | 115 → **38** specimens, 27 → **12** sections. All base; composed specimens are gone (Figma has none). |
| Renamed to Figma's names | Heading levels → **Headings** · Inline code & numerics → **Numerics** · AI confidence badge → **Badges** · Component chip → **Supplier Page Component chip** |
| Regrouped as in Figma | Supplier Page Component chip, Add component button and Sidebar nav item now sit in **App shells** (the *Packaging components* and *Navigation* sections are gone) |
| Content trimmed as in Figma | **Chips** – only the AI-pending chip (FSC Mixed, Brown, Kraft paper hidden in Figma) · **Identifier** – the PKG-SWT-0091 chip removed · **Notification count badge** – the `3/5` counter removed |
| States trimmed as in Figma | **Number input** – *Empty* removed · **Editable dropdown list** – *Typed* removed (`tools/kit_states.py`) |
| Added from Figma | **Scrollbar** section (+ new `css/gs-scrollbar.css`, now also linked by `scrollbar.html`) · **Portal colours** section – Super Admin, Retailer Admin, Retailer User, Supplier Portal, Accent (every value checked against that portal's CSS) |
| Base kit | `base-kit-1..5.html` regenerated: **one page per Figma frame** (8 / 5 / 8 / 12 / 5 frames). The Supplier-Portal-only sheet is retired (its Figma page is empty). |
| Generator bug fixed | `strip_code_text()` missed the `&middot;` entity, leaving a stray “·” (“Heading 1 ·”). Figma had inherited it; fixed in both. |
| Archived in `old/` | `components-all.html` (the full 115-specimen page), `components - old.html`, `confirmation-dialog.html`, the five previous `base-kit-*.html`, plus frozen copies of `css-index.js`, `tsx-index.js`, `base-kit-states.css` so the archived pages still render. |

Verified in the browser: 38 specimens, 12 sections, no console errors; the five kit pages
match Figma frame-for-frame (sections, state cells and text).

## 2. Discrepancies in the Figma file (for the designer)

| # | Where | Issue | Suggested fix |
|---|---|---|---|
| 1 | Alerts › **Keyboard coach hint** | All three cells render **empty** — the text layers (`↑ ↓ move between rows · Enter opens · ×`) exist but nothing is visible. | Redraw the hint chip. |
| 2 | Pills › **Chips** | The kept chip shows only the **AI** tag; its label (“Recycled 30%”) is gone. The caption still promises certifications, materials, jurisdictions. | Restore the label, or reword the caption. |
| 3 | Pills › **Identifier with identicon** | Caption is garbled: “…this their container yet they’ll have a Graphic above them”. | Rewrite. |
| 4 | Pills › **badges** | Lower-case name; every other component is Sentence case. Library uses **Badges**. | Rename. |
| 5 | App shells › **Impersonation banner** | Rebuilt at 269 px wide, so the text wraps to 4 lines. The product draws a **full-width, single-line** bar. | Widen to the content area, or confirm the wrap is intended. |
| 6 | App shells | Supplier Page Component chip, Add component button and Sidebar nav item are filed under *App shells*. Followed in the library, but a nav row and packaging chips are not shells. | Consider *Navigation* and *Packaging* sections. |
| 7 | Section headers | Count badges are stale: Selection **2** (shows 1), Progress **3** (1), App shells **1** (4), Tables **5** (1). | Update or drop the counters. |
| 8 | Section headers | Numbering is partial and collides: 04–07 numbered, **Scrollbar is “06” like Cards**, the rest unnumbered. | Number all or none. |
| 9 | Portal colours › **Supplier Portal** | Says the portal has **no left navigation pane**. Out of date: `Supplier_Portal/js/supplier-shell.js` now injects a left pane on 56 pages, painted with the Retailer Admin nav gradient. | Add the left-pane swatch, or remove the pane from the product. |
| 10 | **Scrollbar** | Specified in Figma, but **not implemented in any portal stylesheet** — it exists only in the component library. | Port `css/gs-scrollbar.css` into the portals. |
| 11 | Hidden layers | Still in the file but hidden: the whole *Modals & dialogs* section, Sortable header, Bulk-selection bar, Column chooser, Empty state & search highlight, and the superseded copies of Impersonation banner / Component chip. | Delete, or unhide if they are meant to ship. |
| 12 | Page canvas | A stray 19×16 `image 1` rectangle sits loose on the Components page; the *Supplier Portal* page is empty. | Remove / fill. |
| 13 | Themes | Figma is **dark only**. Every portal page ships a `-Light` twin. | Add a Light mode (see §4 follow-ups). |

## 3. In the product but missing from Figma

These 83 were archived because Figma does not carry them. The ones a Next.js build will
need first are **bold** — they are primitives, not page compositions.

- **Selection:** **Toggle switch**, **Segmented control**, Percentage slider + number
- **Navigation:** **Tabs**, **Breadcrumb**, Inline breadcrumb tabs, Sidebar user footer
- **Tables:** **Pager / pagination**, **Sortable header**, **Bulk-selection bar**, **Column chooser**, **Empty state & search highlight** (hidden in Figma), Data grid toolkit, Products listing
- **Overlays:** **Dialog surface + heading/body** (hidden in Figma), Confirmation dialog, Side panel, List picker, Inline confirm popover, **Tooltip / Stat tooltip**, Hovercard, Notification dropdown, Searchable action menu
- **Feedback & progress:** **Spinner**, Auto-save chip, Stepper, Component step chips, Inline notes & warnings
- **Forms:** Login input, Read-only input, Form row grid, **Upload dropzone**
- **Buttons:** Button group, Reminder button
- **Cards:** Recap card, Selectable tier cards, Packaging thumbnail / row cards, Card with header action
- **Domain:** packaging detail section, material rows, document chips, AI review field & sidebar, document thumbnails & preview, notification row, welcome hub, invite block, login card, activity timeline, coach bubble & tour highlight
- **Foundations:** **spacing, radius & elevation scale**, ink/line/surface and status colours (only the accent is in Figma), theme toggle, light presets, motion (focus ring, ripple, entrance cascade, press, shake)

## 4. What was done in Figma

- New page **Library** holds the main components, one section per category:
  **28 main components** — 24 variant sets (`State=…`, `Tone=…`, `Confidence=…`, `Status=…`, `Type=…`)
  plus Identifier, Notification count badge, Toast, Post-MVP note — **97 variants** in all.
- On **Components**, every drawing was replaced by an **instance** of its variant
  (97 instances), so the page looks the same but now updates from the library.
  Status pill, Badges, Health dot and Alert banner were split into one variant per tone.
- **13 text styles** (Heading/Eyebrow, H1–H4, Body ×4, Numeric ×3, Mono/ID), applied to the
  typography specimens.
- **Color** variable collection: `accent/base`, `accent/light`, `accent/dark`, with web code
  syntax `var(--gs)`, `var(--gs-l)`, `var(--gs-d)`, bound to the Accent swatches.
- Repaired along the way: the Editable dropdown's open list (its rows had been mirrored by the
  conversion and were rebuilt with the original text layers) and the Status pill row positions.

### 4b. Supplier Portal page — Login (2026-10-13)

- Frame **Supplier Portal / Login** (1440×900) on the *Supplier Portal* page, built from
  `Supplier_Portal/04-greenstreets_supplier_portal_Login.html` with measurements taken from the
  live page (card 378×526, radius 18, zone paddings, gaps 4/18/16/16/10/16).
- Built only from Library instances: **Button/Secondary** ×2 (Google, Microsoft),
  **Input/Text field** ×2 (email, password), **Button/Primary** (“Access supplier portal”).
  The card, background, divider and texts are page layers, not components (the library has no
  login card).
- To make that possible without changing how the Components page looks, the Library gained:
  - **Button/Primary** and **Button/Secondary**: `Label` (text), `Show icon` (boolean, off by
    default) and `Icon` (instance swap).
  - **Input/Text field**: `Show label`, `Show hint`, `Show notes field` (booleans, on by default).
  - A new **Icons** section with `Icon/Google`, `Icon/Microsoft`, `Icon/Sign in`.
  - Two text styles: `Heading/Login title` (19 Bold), `Body/Caption` (11 Regular, 14 line).
- **10 of the 13 text styles had disappeared from the file** (only Table value, Fraction and
  Mono/ID survived) and the typography specimens had lost their links. They were recreated with
  the same values and re-applied.
- Not drawn: the animated contour on the card, the cursor spotlight, the canvas particle effect
  and the floating light/dark toggle. These are behaviours, or not in the library.
- Links: the primary button is named **Access supplier portal** and is ready to receive a
  prototype link to *Getting started* or *Products* once those frames exist.

### 4c. Main components moved onto the Components page; Getting started (2026-10-13)

- At the user's request the **Components page is the single source of truth**: every main
  component (24 variant sets, 4 single components) now sits on it, each variant in the state
  cell its instance used to occupy, and the instances were removed. The variant sets are
  positioned absolutely over their row of cells (the cells and labels are unchanged), and the
  empty cells are fixed to their original heights. The **Library page is deleted**.
- The icons moved to a new frame **Page Component — Icons** on the Components page, with three
  more: `Icon/Upload`, `Icon/Assign`, `Icon/Arrow right`.
- Fixed while moving: the Editable dropdown's *Focus* and *Open* variants were 1340 px wide (left
  over from the conversion), which pushed the field out of its cell; both are 642 px now.
- **Button/Primary** gained `Show trailing icon` + `Trailing icon` (off by default).
- New frame **Supplier Portal / Getting started** (from `04-…_Welcome.html`, first-visit state:
  step 1 current). Built from Button/Primary, Button/Secondary and Status pill (Grey) instances.
  New text styles: `Heading/Display`, `Heading/Header bar title`, `Heading/Step title`.
- **Discrepancy:** the product's Getting started buttons are `.onb-cta` — a flat green
  (`#4ebb81`, radius 9, 35 px tall), which is **not** the gradient Primary button in Figma. The
  Figma screen uses the library's Primary/Secondary buttons; either add the flat style to the
  library or move the product to `.btn-p`/`.btn-g`. The eyebrow (11 px, 2.86 letter-spacing)
  also differs from `Heading/Eyebrow` (10 px).

### 4d. Products page + library additions (2026-10-13)

- Button hierarchy: **Button/Primary** (gradient) = the one highlighted action; **Button/Accent**
  (flat green, from `.onb-cta`) = standard green action; **Button/Tinted** (green tint, from
  `.prod-markcomplete-btn` / header "Getting started" / active filter) = soft action. All three
  share the Label / icon / trailing-icon properties.
- New: **Nav item** (Default / Active, Label + Icon), **Sidebar / Supplier Portal** (built from
  Nav item + Notification count badge), **Supplier Page Component chip → State=Suggested**
  (AI-suggested amber pill), 7 icons, text style `Label/Table header`. Show-label booleans
  added to **Checkbox** and **Dropdown list**. These sit in *Page Component — Additions*
  (Nav item, Sidebar) or in their existing specimen cards (buttons, chip).
- Standardised to Figma (product differs): status filter pills → Secondary/Tinted buttons
  (radius 20 → 8/10); chip labels use the Figma green semibold, not white regular;
  Getting-started eyebrow uses `Heading/Eyebrow`.
- Not in the library, built locally on the page: the products **table** (Figma's *Table* is a
  fixed sample, not table primitives), the component-count/required stepper, the theme toggle
  (omitted).

**Not done yet (next steps):** bind component fills/strokes to variables (surfaces, ink, status
colours), add a Light mode, add TEXT / BOOLEAN / INSTANCE_SWAP component properties (labels,
icons), paint styles for the portal gradients, descriptions on each component, Code Connect.
