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
| **4 — CSS** *(collapsed)* | The real declarations the Tailwind utilities were translated from, as plain CSS with one **Copy** for the lot. Half the width of the Usage pane, on a slightly different surface, and shut until clicked. |

The card header carries the component name, a one-line statement of its purpose, its
`<Component />` tag, the Base/Composed chip and the *Used in* links. The design notes stay
behind the `i` tooltip.

The CSS pane is a **drawer, not a panel**. Three things about it:

- While it is shut its grid track collapses to the width of its own header, so a closed drawer
  costs the card nothing — cards stay ~1000px, and only opening one grows it (to ~1072px).
  That is why the track lives in `.cx-codes` / `.cx-codes-css-open` rather than being a fixed
  third column.
- It is deliberately **not** the interactive `.cx-css` panel the other 107 specimens use.
  That one is per-declaration copy buttons with resolved `var()` literals and it fills a whole
  column; at half width it would be unreadable. This is a plain code block, same shape as the
  TSX and Usage panes, built structurally from `ruleText()` output rather than regex-highlighted
  (the text comes out in a known shape, so hand-tokenising it is exact and reuses the existing
  `.cx-sel`/`.cx-p`/`.cx-v`/`.cx-pn` classes, already themed for both modes).
- At ~150px it **wraps** (`white-space:pre-wrap; overflow-wrap:anywhere`) instead of scrolling
  sideways, and it carries a standing note that these are the **base** declarations —
  `js/css-index.js` is generated from the three base sheets only (see `SHEETS` in
  `tools/extract-css-index.py`), and `greenstreets-light.css` really does restyle some of them
  (`.btn-p` becomes a flat `--lt-accent-ink` fill). Without that note someone ports the green
  gradient and loses the light theme. Adding the light overrides to the index is the obvious
  follow-up if the drawer should show both themes.

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

**All 26 sections are converted.** The Buttons six are hand-authored; the other 107 are
generated — see "What every card carries now" below for what that means and where it is
thin. Hand-author an override in `tools/tsx_overrides.py` whenever the generated component
or its docs are not good enough for the component in front of you.

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

## Naming: a specimen is named after the control it IS

The catalogue used to name several base components after their wrapper class or
their theming — `Field group`, `Themed select`, `Search field` — which tells a
developer nothing about what to build. A base specimen is now named after the
standard control:

| was | now | why |
|---|---|---|
| Field group | **Text input** | It is a labelled text input; `.fgrp` is just the wrapper that adds the label and hint. |
| Themed select | **Dropdown list** | "Themed" describes how it is implemented, not what it is. |
| Search field | **Search input** | The same `.fi` text input with a leading icon in `.search-wrap`. |
| Editable picklist (combo) | **Editable dropdown list** | "Picklist" and "combo" are two different jargons for a dropdown you can type into. |
| Number field with stepper & unit | **Number input** | Stepper and unit are parts, not the name. |
| Read-only & copy-link fields | **Read-only input** | |
| Login fields | **Login input** | |
| Field grid rows | **Form row grid** | Composed; it is the row layout, not a field. |
| Themed checkbox | **Checkbox** | |
| Segmented choice | **Segmented control** | The standard name for the pattern. |
| Plain table | **Table** | "Plain" only meant "not the data grid". |
| Status pill set | **Status pill** | One specimen per style — "set" implied variants. |

**A rename is not just an attribute.** The name is the key into BOTH generated
indexes (`CX_TSX`, `CX_CSS_INDEX.specimens`), it is referenced by `data-parts`
on every composed specimen, it appears in tooltip prose, and it is a key in
`build-tsx.py`'s `NAME_KIND`. So rename by replacing the string across the whole
document *and* `build-tsx.py`, then regenerate — in that order, or the indexes
key off names that no longer exist and every affected card loses its code and
CSS. (`data-q`, the search haystack, is built at runtime from the name and needs
no maintenance.)

Still candidates, not yet done — say if you want them: `Body & muted copy`,
`Inline code & numerics`, `Health dot & RAG`, `Notification count badge`,
`Dialog heading & body`, `Empty state & search highlight`, `Identifier with
identicon`, `Native title tooltip`.

## Base is the default view

The rail filter opens on **Base**, not All: the primitives are what a port
starts from, and opening on all 113 buries 66 base elements under 47
compositions. `kindFilter` starts at `'base'`, the Base button ships with `.on`,
and `wireSearch()` calls `run()` once on load so the default actually applies.

## What every card carries now

All 26 sections are on the four-pane card (the old interactive CSS panel is
gone from the page). Per specimen: **preview · TSX · Usage · collapsed CSS
drawer**, then the **Props / States / Responsive** strip.

The six Buttons components are hand-authored in `tsx_overrides.py`. The other
107 are generated by `tools/tsx_docs.py` on one rule: **generate from measured
facts, hand-write only what is a judgement.**

- **Props** — per KIND (18 tables), mirroring the prop contract the skeleton in
  `tsx_skeletons.py` actually emits. Not per specimen, because every specimen of
  a kind gets the same generated signature.
- **States** — per SPECIMEN, from real CSS. Three distinct outcomes, and the
  difference is the point: *has it* (the rule is quoted), *not applicable* (the
  component cannot have it, with the reason — grey), *not defined yet* (it could,
  but nothing defines it — amber, a gap for the port).
  Two traps handled: the CSS index only keeps rules targeting the element
  itself, so `state_scan()` re-scans the full sheets for descendant rules —
  without it the panel concluded "no hover rule" for `Table`, which is false
  (`.tbl tbody tr:hover` exists). And a rule whose only effect is
  `outline:none` is **skipped**, because printing
  `.tbl th.gs-sortable:focus{outline:none}` as the focus state tells a developer
  the opposite of the truth.
- **Responsive** — `rs.now` is per SPECIMEN and measured: `media_index()` indexes
  every `@media` block in all four portals by the classes it targets, so a card
  either quotes its real breakpoint rules or states factually that it has none.
  This is not decoration: **8 specimens do have breakpoint rules** (`Card`,
  `Recap card`, `Selectable tier cards`, `Stat cards`, `Form row grid`,
  `Page header bar`, `Data grid`, `Review sidebar`) and 99 have none. A blanket
  "desktop-only" line would have been a lie on those eight. `rs.rec` is per kind
  and the UI badges it as a recommendation.

**Cards stack when the preview cannot fit.** The 300px preview column was sized
for a single button; a data grid or a login card cannot live in it. `layoutStages()`
decides per specimen on two signals — inherently wide markup (`WIDE_SEL`) or
measured overflow — and stacks the preview onto its own full-width row (29 of
113 today). It runs **synchronously**, not in a `requestAnimationFrame`: rAF is
throttled and in a hidden tab may never fire, which left every card unstacked
until the tab was focused.

## base-kit.html — the base components as a design sheet, for Figma

**Four** standalone pages — `base-kit-1.html` … `base-kit-4.html`: base
components only, no code, laid out as UI-kit sheets to be imported into Figma.
55 frames in 19 sections, split across the four by FRAME count so the parts come
out a similar length; a section is never split across two parts. There are
**deliberately no links between them** — four separate pages import as four
artboards, where one 17,000px page converts as a single unwieldy frame. The
"Behaviours, not drawings" appendix sits once, on part 4. Each frame is a
handoff entry — component name, one-line purpose, then one labelled cell per
state the component actually has. Generated by `tools/build-base-kit.py` (wired
into `regenerate.sh`) from the same `cx-src` specimen markup as
`components.html` — **do not hand-edit the pages**, and do not fork the
specimens into them.

**No class names anywhere on the sheet**, and it takes two passes because they
appear in two places:

* the **purpose line** — the tooltips are written for developers and often open
  with the implementation ("Author a plain select.fi.fi-select"), so `purpose()`
  takes the first sentence containing no selector, class, CSS declaration or
  function call, and strips code tokens from the first sentence only if every
  sentence has some;
* the **drawn content** — the typography specimens label themselves with their
  class ("Heading 1 · .pg-title", "Page subtitle · .pg-sub — one line of context
  under a title"), which is useful in the catalogue and meaningless on a sheet
  bound for Figma. `strip_code_text()` removes those annotations from **text
  nodes only**, splitting on tags so `class="…"` survives — which matters,
  because the classes are what draw the components.

Verified after every build: **0 code tokens** in any drawn text or purpose line
across the four parts.

**One control per frame.** Several specimens documented the same control twice —
the dropdown had two selects, the number input two identical fields, the
checkbox drew checked/unchecked/indeterminate side by side (which the state
CELLS now do), and the login specimen repeated its icon-field shape. Each is now
a single control, so the frame reads as one component in several states rather
than a small form.

**The themed dropdown is BAKED, not scripted.** `theme_select()` in the
generator emits the enhancer's own output — `.cs-wrap` > hidden `<select>` +
`.fi.cs-trigger` + `.cs-menu` — with the option list rendered where the cell
asks to be open, and marks the select `data-cs="1"` so the real
`GSEnhanceSelects` leaves it alone. That matters for an export artefact: while
the open cell was realised at runtime, a stale or blocked script drew a *closed*
control under a label reading "Open", which is worse than drawing nothing.

**Focus rings every control in the cell**, not one marked target. A spec sheet
documents the treatment, so a frame holding a text input and a textarea shows
the ring on both — even though a browser can only focus one. Two exceptions,
both principled: `[tabindex="-1"]` never rings (the number stepper's arrows and
the combo caret are not keyboard-focusable), and that suppression must be
emitted **last**, because the rules it overrides sit at the same specificity.

The bug behind that: `rules_for()` was reading classes inside `:not()` as
**target** classes, so the product's generic keyboard rule —
`[tabindex]:not(.fi):not(.btn-p):not(.btn-g):not(.btn-g-sm):not(tr):focus-visible`
— was attributed to every specimen declaring `.fi` or a button class, and at
`(0,7,0)` it outranked the kit's own focus rules. `:not()` groups are now
stripped before the target classes are read.

**purpose(): a code-free sentence, a hand-written line, or nothing.** Stripping
code out of a technical sentence produces gibberish ("On load, swaps it for a (a
div + a themed ), keeps the real hidden for its value"), which on a handoff
sheet is worse than silence. So: the first tooltip sentence containing no code;
else a hand-written line from `PURPOSE`; else nothing, and the name carries the
frame. Verified after every build: **0 code tokens** in any purpose line or
drawn text, and 0 blank purposes.

**An open list is drawn WITH one item hovered.** A plain open list plus a
separate hover cell was two near-identical drawings of the same menu — and the
hover cell drew *nothing*, because this component's hover lives on `.cs-opt`,
which only exists once the list is open. One cell now carries both, showing
three option states at once: hovered, selected, plain. That needed `STRUCTURAL`
entries to accept an optional CSS state, i.e. `(label, css state, action)` as
well as `(label, action)`. One trap: suppressing the standalone hover **cell**
must not suppress its **rules** — `SKIP_CSS_STATE` still collects them, because
the combined cell needs `.bk-st-hover .cs-opt:first-child` to exist in the
generated stylesheet. Dropping both is why the hovered option first drew
nothing.

**Deliberately NOT linked from the repo `index.html`.** It is an export
artefact, not a prototype to review.

It leaves out 11 of the 66 base specimens, listed on the page in a
"Behaviours, not drawings" appendix with the reason for each: a motion
behaviour (focus ring, ripple, entrance cascade, press feedback, shake,
rotating placeholder), a build technique (icon sprite), an OS-drawn control
(native title tooltip), a behaviour layer (keyboard operability), or prototype
scaffolding (nav bar, screens). Each would import as an **empty frame**, which
is worse than an honest omission.

### Figma-import hygiene — the part that matters

All of it lives at the bottom of `css/base-kit.css`, and every rule is there
for a measured reason, not a hunch:

1. **`backdrop-filter` is neutralised** on everything (23 declarations across
   the three base sheets). Figma cannot import a backdrop blur, and a
   capture-based import bakes in a blur of whatever sat behind — so the glass
   surfaces would arrive as smeared noise. Off, they show the solid fill they
   should *become* in Figma.
2. **Nothing is `position:fixed`.** Fixed elements import as detached layers
   parked over the artboard. Three specimens were still fixed after the first
   pass — the toast, the coach hint and the stat tooltip — found by measuring
   computed `position` across the built page, not by reading the CSS.
3. **The frames do not clip** (`overflow:visible`). Two specimens overflow
   their frame: a tooltip's pointer tail (an `::after` at `bottom:-6px`) and a
   demo table's toolbar. A clipping frame silently truncates those in the
   export, which is the single failure this sheet exists to avoid. A few pixels
   past the border is honest — it is the component's real size — and the
   artboard's 48px padding absorbs it, so nothing overlaps a neighbour.
4. **All animation and transition is off**, so a capture cannot catch a
   component mid-tween and import a half-faded layer.
5. **The FX layer is removed** and the ripple/particle/focus-ring tokens are
   zeroed by `js/base-kit.js`, so there is no stray full-viewport layer.
6. **Flat canvas fill, not the product gradient** — a gradient behind every
   frame imports as one huge image layer.
7. **Column spans are decided at BUILD time**, not measured at runtime, so two
   exports of the same file are identical. `SPAN_OVERRIDE` in the generator is
   the place to change one.

### Every state a component actually has, drawn

A handoff sheet has to show more than a resting component, so each frame draws
one cell per state, labelled. **101 cells across 55 frames; 28 frames carry more
than one.** The dropdown list, for example, is *Collapsed · Focus · Open · Value
selected*; the checkbox is *Unchecked · Hover · Checked · Indeterminate*.

Two different problems, solved two different ways:

**CSS states — hover, focus, active, disabled.** `:hover` cannot be forced, so
`tools/kit_states.py` reads the real declarations out of the stylesheets and
re-applies them under a wrapper class — `.btn-p:hover{...}` becomes
`.bk-st-hover .btn-p{...}`, verbatim — into a generated `css/base-kit-states.css`
(43 rules). What the sheet draws is the real state by construction, and being
regenerated it cannot drift from the CSS.

**Structural states — collapsed/open, selected, checked, filled, sorted.** These
are a different DOM, not a pseudo-class. The product CSS already styles them
(`.on` 31 rules, `.active` 38, `.open` 19, `:checked` 12), so nothing is
generated: `base-kit.js` puts the markup into the state by doing what a user
would do — click the trigger, choose the option, tick the box. The list lives in
`STRUCTURAL` in `kit_states.py` and the actions in `ACTIONS` in `base-kit.js`;
**keep the two in step.**

Rules the data follows, each because the naive version was wrong:

1. **A state must target the specimen's OWN primary classes** (`data-cls`).
   Without that test a colour-swatch grid gained a hover from a `.gs-lp` that
   merely appeared in its markup.
2. **It must change something visible** — a rule that only sets `cursor` is not
   a state. And a rule whose only effect is `outline:none` is skipped: that is
   the *absence* of a focus ring, and quoting it would say the opposite.
3. **Motion is stripped from the re-applied rules.** This stylesheet loads after
   `base-kit.css`, so an `animation` carried over with `!important` would defeat
   the no-motion rule and let a capture catch a mid-tween.
4. **A state on a repeated child is pinned to one of them.** `.tbl tbody tr:hover`
   across a table drew every row hovered, which reads as a bug.
5. **Focus is singular.** The focus rules require a `.bk-st-target` marker that
   `base-kit.js` puts on exactly one element per cell — without it a two-field
   specimen drew two focus rings at once, which no browser can produce.
6. **`error` is not drawn at all.** The system has two error rules and both are
   `.gs-shake`, a keyframe animation. There is no static error appearance, and
   inventing one would put a state in front of a developer that does not exist.

#### The focus ring, and why it was missing

Focus in this system is **not a per-class rule**, which is why the sheet had it
almost nowhere. `.fi`, `.btn-p`, `.btn-g` and `.btn-g-sm` get the animated
`.fs-ring` **overlay** drawn by `greenstreets-theme.js`; everything else
focusable gets the generic keyboard rule in `greenstreets-theme.css`
(`outline:2px solid var(--field-stroke-color); outline-offset:2px`, which
deliberately excludes those four classes so they don't get a double ring).

The kit removed the overlay for export hygiene — a positioned overlay imports as
a detached layer — and only planned a Focus cell where a specimen owned a
`:focus` rule. Between the two, a focused field showed nothing but its faint
inner glow and buttons showed nothing at all. Three fixes:

1. `SYSTEM_FOCUS` in `kit_states.py` reproduces both real treatments statically,
   using **`outline`** rather than `box-shadow` so it stacks with the field's own
   focus glow instead of overwriting it.
2. A Focus cell is planned for anything **focusable**, not only for
   rule-bearers — which is what gave the buttons theirs back.
3. `--field-stroke-weight` is no longer zeroed by `deFx()`. It was, which made
   every ring 0px wide.

**The ring is the ACCENT, not the stylesheet default.** `greenstreets-theme.css`
declares `--field-stroke-color:#5b9cf6` (blue), but no portal ever renders that:
`gs-appearance.js:64` overwrites it at runtime with the active accent, and the
default preset is emerald `#4ebb81`. The kit doesn't load that script (it injects
a whole settings panel), so `.bk-artboard` sets the token to `var(--gs)` — which
*is* the accent — and the ring follows the accent exactly as the product does.
Reading the stylesheet alone would have shipped a blue ring the product never
shows.

The focus target is marked on **one** element per cell (`.bk-st-target`), because
focus is singular; a two-field specimen otherwise drew two rings at once. The
marker falls back through real focusables, then likely-clickable classes
(`.gs-crumb`, `.nav-item`, `.landing-tab`…), then the cell box — the middle step
exists because a breadcrumb crumb is an `<a>` with no `href` in the specimen, so
nothing matched and three real focus states were being dropped.

#### The open state is BUILT, never clicked

The open cells were originally realised by clicking the trigger, because the
enhancer renders its options on the real open path. That cost three things the
sheet could not carry, and all three were reported as bugs:

* clicking moved **focus** into the dropdown, and the same handler re-ran on
  every click and scroll, so focus was dragged back there constantly — nothing
  else on the page could be focused;
* the same click **collapsed any text selection**, so you could not select a
  label to copy it;
* the enhancer's menu is a `position:fixed` portal appended to `<body>`, so
  every open had to be chased and moved back into its frame.

So `buildMenu()` constructs the menu instead, from the real `<select>` options
(or `GS_VOCAB` for the editable combo) using the enhancer's own classes. **The
sheet is now fully static: no synthetic clicks, no focus theft, no portals**, and
`sweep()` no longer re-opens anything — it only removes what must not exist in an
export. Verified: nothing is focused on load, no `<body>` portals, and text
selection survives.

Four layout traps this exposed, each fixed in `css/base-kit.css`:

1. An **unopened `.cs-menu`** exists in every enhanced wrap; forced into flow by
   the no-fixed rule it rendered as an empty 12x12 stub in every non-open cell.
   Hidden unless `.open`.
2. `.pkg-detail-grid` is a **two-column** form grid, but a kit frame holds one
   field — so the control got half the width.
3. The cell is a flex container, so `.pkg-detail-section` sized to its
   **content** (196px) rather than to the cell (598px); widening the cell alone
   did nothing until the section was told to stretch.
4. The material vocabulary holds values up to **84 characters**, so no 4-up row
   of cells can show one on a single line. That one frame's cells carry a large
   `min-width` so the row wraps 2-up and each field is ~600px, at which every
   option fits.

#### The verification pass is the load-bearing part

`verifyStates()` in `base-kit.js` diffs every state cell against its default on
computed style, element count, text, and the `checked`/`indeterminate`/`value`
properties. **A cell that renders identically is removed**, because it would
otherwise assert a state the component does not have — and it is reported to the
console and on `window.BK_DROPPED`. It runs at runtime because it needs computed
styles, and it is deterministic, so two exports of the same file still match.

That check has earned its place repeatedly. It caught, and forced fixes for:
`:first-of-type` being evaluated independently of `:not()` (so
`:not(.on):first-of-type` matched nothing wherever the first item is the selected
one — true in both the segmented control and tabs); a breadcrumb's
`:last-of-type` landing on the *current* crumb; a stylesheet rule written
`button.gs-crumb:hover` not applying to a specimen whose crumbs are `<a>`; the
themed select's menu being a `position:fixed` portal appended to `<body>` whose
options only render on the real open path, so a hand-added `.open` opened an
*empty* menu; the progress bar's fill being `.prog-f` with an unclassed `<span>`
for its percentage, so a guessed `[class*="-fill"]` selector was a no-op; and the
number input already shipping with values, which made its "Filled" cell a
duplicate of its default (it now draws *With a value · Empty* instead).

Five cells remain dropped, all honestly: `Primary button / Focus` and
`Secondary button / Focus` (the buttons have no CSS focus rule — the ring is the
JS overlay layer, which is not reproduced), `Icon button / Active` and
`Number input / Active`, and `Dropdown list / Hover` (its hover lives on
`.cs-opt`, which only exists in the Open cell).

Menus are moved out of `<body>` into their frame and capped to a **6-option
sample** with the remaining count stated. Drawn in full, the editable dropdown's
47-value vocabulary rendered per cell made that frame 1728px tall against a 457px
next-largest — it had stopped documenting the control and started dumping data.

**The export hygiene is idempotent.** `sweep()` runs after every interaction,
not once at boot: the theme JS re-creates its fixed full-viewport FX layer
lazily on the first pointer event, and re-opening a menu can leave a portal on
`<body>`. Measured after a single theme toggle before this was fixed: one fixed
element and one stray body child, both of which would import as detached layers
over the artboard.

### Fidelity

The frames are drawn by the real portal stylesheets, and the real portal JS
runs first, so a dropdown list is the themed control (its hidden native
`<select>` stays `display:none`, so it does not export as a duplicate layer),
number fields have their steppers, and the editable dropdown is built by
`gs-pkg-controls.js`. One file carries both themes via the cover's toggle — the
same exception `components.html` documents.
