# Component Library — `components.html`

A single page cataloguing **every UI component used across the four GreenStreets portals**, built for
the developers porting these prototypes to Next.js. Open
[components.html](components.html) directly in a browser (double-click works — no server needed).

**113 components in 26 categories — 66 base, 47 composed.**

## Reading order

The catalogue opens with the same primitive set (and in the same order) as the client's staging
`/components` page, so the two can be read side by side:

> **typography → buttons → form inputs → selection → alerts → cards → data tables → modals/dialogs**
> → then everything that combines them → then tokens, theming, motion and scaffolding as reference

Headings come first because everything else is typography plus a box. Design tokens moved to the back:
they are the layer to port first, but they are reference material, not something to look at first.

## Next.js / Tailwind cards (in progress)

A section marked `data-tsx` in `components.html` renders the **three-column card**
a developer asked for, instead of the CSS panel:

| Column | Contents |
|---|---|
| **1 — Live preview** | The component, centred and interactive (hover included) — and *nothing else*. No class names, no annotations, no copy chrome. The class list moves to the card footer. |
| **2 — Component code (TSX)** | A reusable typed React component using Tailwind utilities inline, no CSS file. Syntax-highlighted, with a **Copy** button top-right. |
| **3 — Usage** | `import { Button } from '@/components/Button'` plus an example JSX line with real props. **Copy** button too. |

The card header carries the component name, a one-line statement of its purpose, its
`<Component />` tag, the Base/Composed chip and the *Used in* links. The design notes stay
behind the `i` tooltip.

Below the three columns, a converted card carries a **docs strip** of three more panels,
all expanded:

| Panel | Contents |
|---|---|
| **Props** | Every prop, its TypeScript type, its default (folded into the type cell) and what it does. Required props are starred; the name and the type are each click-to-copy. |
| **States** | Default, hover, focus, active, disabled, loading, error — the trigger and the visual effect for each. |
| **Responsive** | What the prototypes measurably do at each width, then what is *recommended* for the port, then a "watch out" callout where there is a real problem. |

Three rules the data in `tsx_overrides.py` follows, and the UI depends on:

- **A state a component does not have is recorded as `None` with the reason**, and renders
  muted and italic as *not applicable*. A button has no error state — validation error belongs
  to the field or the form summary — so `Error` says that rather than inventing one. The panel
  header counts how many actually apply ("6 of 7 apply"). Never fill an absent state in to make
  the table look complete; a developer will build whatever is written there.
- **`rs.now` is measured, `rs.rec` is a recommendation, and the UI labels the second one.**
  This matters because the prototypes are **desktop-only**: the four portals carry 13 media
  queries between them (`640px`, `820px`, `1000px`, plus `prefers-reduced-motion`) and *not one*
  touches a button, input, table or card. There is no mobile or tablet design to document. So
  the amber `RECOMMENDATION` badge is load-bearing — without it the strip would launder a guess
  into a spec.
- **States are an ordered *list*, not an object.** `build-tsx.py` dumps the index with
  `sort_keys=True`, which recurses into nested dicts and silently alphabetised the states into
  "Active, Default, Disabled, Error, Focus, Hover, Loading". A list survives the round trip.

The docs strip lays out three-across at ≥1341px, two-across with Props full-width down to
1081px, and one column below that — Props reads far better wide than narrow, so it takes the
full width as soon as three tracks stop fitting. Each panel body caps at 360px and scrolls, so
one long panel cannot stretch the card. That layout is what keeps a fully documented card near
1000px instead of the 1349px it hit when Props stacked above the other two.

**Only the six Buttons components carry this content.** It is hand-authored per component in
`tools/tsx_overrides.py`, deliberately: a generated states section would say "hover → `hover:bg-white/[0.08]`"
and a generated responsive section would say "no change at any breakpoint" for nearly everything,
which is true and useless. When you convert the next section, write its docs the same way. If
that ever needs to scale, the honest automatic version is to derive `st` from the state rules
`tsx_css.tw_for()` already extracts — real CSS, not filler — and leave `rs` hand-written.

**One card per component, not per family.** The Buttons section is six cards — `PrimaryButton`,
`SecondaryButton`, `DangerButton`, `IconButton`, `ButtonGroup`, `ReminderButton` — each with a
single button in its preview and its own component file. Size, icon, disabled and loading are
*props*, shown in each card's Usage column, because a small primary is the same style as a large
one. The three coloured buttons differ only in their colour block and each says so, so collapsing
them into one `variant` prop is a one-minute edit if that is preferred.

**Converted so far: Buttons** (6 of 113 specimens). Everything else still shows the CSS
panel and has no props/states/responsive strip yet. Roll a section forward by adding
`data-tsx` to its `<section>`, checking the generated TSX is worth shipping (hand-author an
override where it is not — see below), and writing its `pr`/`st`/`rs` docs.

### How the code is generated

`tools/build-tsx.py` → `js/tsx-index.js`, run by `regenerate.sh`:

- **`tools/tsx_css.py`** translates a component's *real* declarations (from `js/css-index.js`)
  into Tailwind utilities, resolving every `var(--token)` to its literal so a snippet pastes
  into any Tailwind project with **no config and no CSS file**. Anything with no Tailwind
  utility falls back to arbitrary-property syntax (`[mask-composite:exclude]`) rather than
  being dropped, so a rule is never silently lost.
- **`tools/tsx_skeletons.py`** supplies the JSX per component *kind* (button, input, select,
  badge, alert, card, table, dialog, …) with a real prop contract. It is deliberately **not**
  a transliteration of the prototype's demo markup: a developer needs a component with props,
  not a snapshot of a demo row.
- **`tools/tsx_overrides.py`** is hand-authored TSX that wins over the generator. Use it when
  the mechanical output would mislead: the specimen name is a catalogue label ("Button
  variants") but the component is `Button`; the generator cannot know `.btn-g` is the
  *secondary* of `.btn-p`; or the CSS bakes colour and geometry into one class while React
  wants `variant` and `size` apart. All four Buttons components are overrides.

Two quoting rules the generated code depends on, both of which have already bitten:

- A generated class string may contain a **single** quote (`content-['']` is the only spelling
  Tailwind has) but never a **double** one, because every skeleton hosts it in a double-quoted
  JS string.
- Any value going into an HTML attribute goes through `escAttr()`, not `esc()`. `esc()` leaves
  `"` alone, which silently truncated a `data-copy` at the first double quote in the TSX it
  carried.

## One specimen per style

Where the codebase has several classes that render the *same* style, **only one appears here** and the
survivor's tooltip names the rest. `.gs-tool-btn`, `.btn-g-sm`, `.doc-add-btn`, `.pkg-edit-toggle-btn`,
`.prod-filter-btn` and `.docs-vbtn` are all `.btn-g` at other sizes, so there is one Buttons specimen,
not six. Likewise one status pill (not four), one stepper (not two), one toggle (not two), one tab row
(not two), one hovercard (not two), one list-picker dialog (not two). This is the point: a duplicate
specimen tells the port to build a duplicate component.

## Base vs composed

Every specimen is labelled:

- **Base** — one component, one class contract. Port it as a component of its own.
- **Composed** — base elements plus typography, carrying no CSS of its own. Port it as a *pattern*;
  it needs no component and no stylesheet, only the parts it names.

A composed specimen lists its parts as links under the render (`Composed of …`), so you can jump
straight to the base elements it needs. The rail has an **All / Base / Composed** filter.

`data-parts` is **`|`-separated, not `;`** — `;` terminates an HTML entity, so a name containing
`&amp;` split in half and produced dead links.

The clearest example is the confirmation dialog: it *looks* like a component, but it is the dialog
surface + the dialog heading/body block + a `.faction` button pair, and nothing in it carries a class
that only a confirmation dialog uses. So `sec-dialogs` catalogues **Dialog surface** and **Dialog
heading & body** as base elements first, and the confirmation dialog after them, as a composition.

## What each specimen gives you

| | |
|---|---|
| **Live render** (left) | The component rendered by the *actual* portal stylesheets, not a re-creation. |
| **CSS panel** (right) | Its real declarations, always open. See below. Sections converted to the Next.js cards show TSX + usage here instead, plus a props/states/responsive strip beneath. |
| **Base / Composed chip** | Which of the two it is; hover it for what that means for the port. |
| **Tooltip** (the `i` beside the name) | What the component is for, the rules that govern it, and the reasoning behind anything non-obvious. |
| **Class list** | The exact class names to port, in the header line. |
| **Composed of** | For compositions: links to the base specimens it is assembled from. |
| **Source file** | Which stylesheet the declarations came from. |
| **Used in** | Portal-coloured chips linking to the real prototype pages that use it. |
| **HTML button** | Floats over the render on hover — copies the authored markup. The markup is not *shown*; the panel beside it is for CSS. |

## The CSS panel

To the right of every render, always expanded, and **every line is its own copy target**:

- click a **declaration** → copies `color: var(--tw);`
- click the **selector** → copies the whole rule, formatted
- click **All** in the panel header → copies every rule shown
- a value using `var()` carries a dim resolved chip (`#fff`) → clicking *that* copies the literal,
  so you can lift just the colour or just the size. The chip follows the Dark/Light switch, because
  the token resolves differently per theme.
- colour-ish values get a swatch

The declarations are generated by `tools/extract-css-index.py` into `js/css-index.js` — read out of
the real stylesheets, base rule first, then the modifier and state rules (`:hover`, `.on`, `::after`).
A rule only counts as "defining" a class when it targets the element itself, so
`.tbl td.gs-check-col input` is not offered as "the CSS for `.gs-check-col`".

It is **baked at build time, not read from `document.styleSheets`**: Chrome refuses `cssRules` on a
linked stylesheet over `file://`, and these pages are opened by double-click — the panel would be
empty exactly where it is most likely to be used. Re-run `tools/regenerate.sh` after a stylesheet
change.

Five specimens legitimately show *no CSS of their own* — a proposed class that does not exist yet, a
native `title` tooltip, a bare `button:active`, and two JS behaviours. For a composed specimen that
message is the point: it has no CSS, only parts.

Plus: a searchable table of contents (press `/` to focus the search), and a **Dark / Light** switch in
the rail — one file carries both themes. Section numbers are generated by JS from document order, so
reordering the catalogue never means renumbering badges by hand.

## How it is built

The page is a flat list of specimens. Each one is authored like this:

```html
<article class="cx-item"
         data-name="Primary action"
         data-kind="base"
         data-cls=".btn-p .btn-c .btn-sw"
         data-src="css/greenstreets-theme.css"
         data-tip="What it is. `backticks` render as code."
         data-used="SP:Products|../Supplier_Portal/04-…_Products.html">
  <script type="text/html" class="cx-src">
    <button class="btn-p"><span class="btn-c">Save</span></button>
  </script>
</article>
```

A composition adds `data-kind="composed"` plus a pipe-separated `data-parts` naming the base
specimens it is built from — the names are slugified to anchors, so they must match a `data-name`
exactly (a mismatch shows as a dead link; the check in *Keeping it current* below catches it):

```html
<article class="cx-item"
         data-name="Confirmation dialog"
         data-kind="composed"
         data-parts="Dialog surface|Dialog heading &amp; body|Button variants|Form action footer"
         …>
```

`js/components-page.js` turns that into the finished card at load time.

**Why the snippet lives in a `<script type="text/html">` and not a `<template>`:** a template only
exposes its *parsed* DOM, so reading it back re-serialises the markup (`readonly` → `readonly=""`)
**and** returns whatever `greenstreets-theme.js` has since done to it — themed selects, injected
pagers, focus rings. A script block keeps the authored text byte-exact, so the copy button always
hands over the source, never the enhanced DOM.

**Load order is deliberate:** `gs-schema.js` → `css-index.js` → `tsx-index.js` → `components-page.js` → `greenstreets-theme.js`.
`components-page.js` hydrates every specimen synchronously at parse time, so the theme JS then finds
real markup to upgrade and the specimens behave exactly as they do in a portal — themed selects,
number steppers, the data-grid toolkit, the animated focus ring, the click ripple, keyboard
operability. It also claims `window.gsToggleTheme` first, replacing the prototypes'
navigate-to-the-`-Light`-twin behaviour with an in-place `body.lt` toggle.

### Optional attributes

- `data-stage="cx-ov"` — pins overlays, dropdowns, tooltips and toasts open so they can be inspected.
  This is the only place the page bends a component's own CSS; each such specimen's tooltip says how
  it is really shown in the app.
- `data-clamp` — caps a very tall specimen with a *Show full specimen* button.

## Files

```
Component_Library/
├── components.html              the catalogue
├── css/
│   ├── greenstreets-theme.css   ┐ copies of the Supplier Portal's stylesheets
│   ├── supplier-portal.css      │ (the richest of the four forks) — the base
│   ├── greenstreets-light.css   ┘ system + its light layer
│   ├── portal-extras.css        auto-extracted rules for components that live
│   ├── portal-extras-light.css  in ONE portal only (see below)
│   └── components-page.css      the gallery chrome — everything prefixed cx-
├── js/
│   ├── gs-schema.js             the packaging source of truth (copy)
│   ├── greenstreets-theme.js    the shared behaviour layer (copy)
│   ├── css-index.js             GENERATED — the declarations the CSS panel shows
│   ├── tsx-index.js             GENERATED — the Next.js/Tailwind code + usage
│   └── components-page.js       this page's engine
└── img/                         logos, login background, swoosh texture
```

### About `portal-extras.css`

The four portals' theme files **have forked** and 187 class names overlap between them, so the other
three portals' stylesheets cannot simply be linked alongside the Supplier Portal's — they would
restyle shared primitives. Instead, `portal-extras.css` is generated by keeping only those rules
whose **every** selector is anchored on a class that does *not* exist in the Supplier Portal base
(theme + supplier-portal + pkg-detail). That makes it structurally impossible for the extras file to
change a shared component, while still bringing in the genuinely portal-specific ones: notifications,
onboarding, the identicon IDs, the appearance panel, modals, packaging thumbnails, reminder buttons.
`portal-extras-light.css` is the same extraction over each portal's `greenstreets-light.css`.

Both are generated, not hand-written. Regenerate them rather than editing them.

## Checks worth re-running after an edit

Paste into the browser console on the page:

```js
// every panel built, every "Composed of" link resolves, nothing overflows
JSON.stringify({
  panelsFilled: document.querySelectorAll('.cx-css[data-filled]').length,
  items: document.querySelectorAll('.cx-item').length,
  brokenParts: [...document.querySelectorAll('.cx-part')]
    .filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.textContent),
  emptyStages: [...document.querySelectorAll('.cx-item')]
    .filter(i => i.querySelector('.cx-stage').getBoundingClientRect().height < 44).map(i => i.id),
  hScrollPanels: [...document.querySelectorAll('.cx-css-body')]
    .filter(b => b.scrollWidth > b.clientWidth + 2).length,
  overflowing: [...document.querySelectorAll('.cx-main *')]
    .filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 2
                 && e.getBoundingClientRect().width > 40).length
})
```

`panelsFilled` must equal `items` — the panels are built eagerly in idle batches rather than on
scroll, because in a zero-height or hidden context (background tab, print, embed) an
IntersectionObserver never fires and every panel would stay empty.

All three should come back empty / zero. And from the repo root, that every `Used in` link exists:

```bash
python - <<'PY'
import io,re,os
s=io.open('Component_Library/components.html',encoding='utf-8').read()
h={e.split('|',1)[1].strip() for m in re.finditer(r'data-used="([^"]*)"',s) for e in m.group(1).split(';') if '|' in e}
print('missing:',[x for x in sorted(h) if not os.path.exists(os.path.join('Component_Library',x))])
PY
```

## Keeping it current

This page is a **snapshot of copies**. It does not read the portals' live stylesheets — that is
deliberate, because they are forked and mutually incompatible. When a portal's theme changes in a way
worth reflecting here, re-copy the base files and re-run the extras extraction.

There is intentionally **no `components-Light.html` twin.** The repo-wide dark/light twin rule exists
because the prototypes have no router; this page carries both themes in one file, which is also the
shape the Next.js port should use.
