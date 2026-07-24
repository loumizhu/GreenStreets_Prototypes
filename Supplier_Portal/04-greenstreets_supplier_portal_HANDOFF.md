# Supplier Portal — Developer Handoff Spec

Purpose: turn "reverse-engineer the prototype" into "implement this spec." These HTML
pages are a **design reference**, not shippable code — they show the intended look,
components, screens and flows. When you rebuild this in TypeScript, most of the static
scaffolding (the inline icon sprite, the `go()` navigation, the dummy data, the
`sessionStorage` hand-off) is meant to be **replaced by components/router/store/API**.

> Source of truth for pixels: the `.html` files + `css/greenstreets-theme.css` (shared
> design system) + `css/supplier-portal.css` (this app's page styles). Behaviour hints:
> `js/greenstreets-theme.js` (shared widgets) + `js/supplier-portal.js` (this app's logic).

---

## 1. Prototype construct → target app

| Prototype construct | Rebuild as |
|---|---|
| Inline SVG sprite + `<use href="#gsi-N">` | One `<Icon name>` component (see §5) |
| `go(id)` + `GS_PAGES` map | Router; each id → a route (see §6) |
| `sessionStorage` (`gs_pi`/`gs_wiz`/`gs_flash`/`gs_tab`) | Router params + a state store |
| One HTML file per screen | One route + page component per screen |
| `:root` CSS variables | Theme tokens / design-system config |
| `.btn-p`, `.fi`, `.pill`, `.pshell`/`.ph`/`.pbody`, `.landing-tab*` … | Reusable UI components |
| `PRODUCTS_JS` / `COMPONENT_LIBRARY_JS` static arrays | Typed models + API calls (see §7) |
| The AI-upload → review → confirmation screens | A guided import wizard flow |
| The `wiz5tpl`-derived Component-Wizard | A multi-step form/wizard component |

---

## 2. Layout

The authenticated screens use the supplier shell: `.pshell` → `.ph` (sticky header) +
`.pbody` (scrolling content). Login (`sp1`) is the only screen with no shell — it uses the
shared `.login-wrap`/`.login-card`. The Component-Wizard is a full-viewport standalone
layout (`.layout` = `.snav` progress rail + `.main` steps + a sticky `.actbar`).

---

## 3. The flows

**AI import:** `AI-Upload (s_upload_0)` → `AI-Processing (sp_ai)` → `AI-Review-1/2/3
(air-0/1/2)` → `Confirmation (sp9)`. Each review screen's *accept* (`aiAccept(idx)`)
advances to the next component with a toast; the last accept lands on Confirmation.

**Manual component entry (Component Wizard, `wiz5`):** launched from a product row
(`openNewCompWizard(pi)`) or from the packaging-components listing
(`openStandaloneCompWizard()`), both via `launchWizard(code,name,origin,pi)`. The wizard is
a sectioned form (name & ID, level & format, materials, recycled content, dimensions,
weight, compliance …) with a live progress rail, prefill, and a review-before-save step.
On save it returns to Landing and flashes the new row; Back returns to the origin tab.

**Landing (`sp2`)** has three tabs (`switchLandingTab`): **Products** (paginated/sortable
`prodRender()` table with inline packaging-component chips + the `.pcmp-menu` add-component
picker), **Packaging Components** (the saved-components table with level filters + search),
and **Supporting Documents**.

**Product detail (`proddetail`)** renders a product's packaging components as expandable,
fully-editable cards (`renderProductDetail(pi)`), plus packing/palletisation.

**Packaging detail (`pkgdetail-*`, 16 pages)** — read/edit view of one saved component with
a Declaration-of-Conformity download.

---

## 4. Component catalogue (selected)

- Buttons: `.btn-p` (primary, green + `.btn-sw` swoosh), `.btn-g` (ghost).
- Forms: `.fi` (input/select/search), themed `select.fi`, number steppers, `.fi-ai-*`
  (AI-suggested field states), `.air-feat` (AI review field).
- Data: `.pshell`/`.ph`/`.pbody` shell, `.landing-tab*`, `.prod-tbl`, `.pkg-lib-table`,
  `.pkg-row-card`, `.pkg-level-pill-sm`, `.pkg-status-pill`, `.pd-card`/`.pd-field`,
  `.pill`, `.pcmp-menu` (component picker).
- Login: `.login-wrap`, `.login-card`, `.login-logo-zone`, `.login-form-zone`.
- Wizard: `.layout`/`.snav`/`.main`/`.actbar`, `.sec`, `.prog-*`, `.rv-*` (review),
  `.sx-*` (success).

Shared behaviours in `greenstreets-theme.js` (themed selects, focus ring, ripple/particles,
data-grid toolkit, steppers) are progressive enhancements — your component library likely
replaces them.

---

## 5. Icon inventory

Icons live as an **inline `<svg><symbol id="gsi-N">` sprite** (`gsi-0`…`gsi-31`) copied into
every page; every icon is `<svg><use href="#gsi-N"/></svg>`, so `currentColor` + stroke
theme it. **Rebuild as a single `<Icon name>` component.** A reference copy of the sprite is
`img/icons-04-greenstreets_Supplier_Portal_v6.3.svg` (not referenced at runtime). Some
symbols are visual duplicates — collapse to ~24 distinct glyphs.

---

## 6. Screens / routes

26 screens. `GS_PAGES` (in `js/supplier-portal.js`) maps each id to a file; that map is
your route table.

| Screen id | File suffix | Screen |
|---|---|---|
| `Login` | `sp1` | Login |
| `Landing` | `sp2` | Landing |
| `AI-Upload` | `s_upload_0` | AI Upload |
| `AI-Processing` | `sp_ai` | AI Processing |
| `AI-Review-1` | `air-0` | AI Review 1 of 3 |
| `AI-Review-2` | `air-1` | AI Review 2 of 3 |
| `AI-Review-3` | `air-2` | AI Review 3 of 3 |
| `Confirmation` | `sp9` | Confirmation |
| `Product-Detail` | `proddetail` | Product detail |
| `Component-Wizard` | `wiz5` | Component wizard |
| `Packaging-Swing-Tag` | `pkgdetail-swing_tag` | Swing Tag |
| `Packaging-Hanger` | `pkgdetail-hanger` | Hanger |
| `Packaging-Poly-Bag` | `pkgdetail-poly_bag` | Poly Bag |
| `Packaging-Display-Box` | `pkgdetail-display_box` | Display Box |
| `Packaging-Wrap-Band` | `pkgdetail-wrap_band` | Wrap Band |
| `Packaging-Tissue-Paper` | `pkgdetail-tissue_paper` | Tissue Paper |
| `Packaging-Shipping-Carton` | `pkgdetail-shipping_carton` | Shipping Carton |
| `Packaging-Shelf-Tray` | `pkgdetail-shelf_tray` | Shelf-Ready Tray |
| `Packaging-Carton-Divider` | `pkgdetail-carton_divider` | Carton Divider |
| `Packaging-Padding` | `pkgdetail-padding` | Padding |
| `Packaging-Goh-Polybag` | `pkgdetail-goh_polybag` | GOH Polybag |
| `Packaging-Cdu` | `pkgdetail-cdu` | CDU Display Unit |
| `Packaging-Pallet` | `pkgdetail-pallet` | Pallet |
| `Packaging-Pallet-Wrap` | `pkgdetail-pallet_wrap` | Pallet Wrap / Stretch |
| `Packaging-Pallet-Label` | `pkgdetail-pallet_label` | Pallet Label |
| `Packaging-Fastener` | `pkgdetail-fastener` | Fastener |

`index.html` is a dev-only hub linking all screens — drop it.

---

## 7. Data & state

There is **no backend**. All content is static HTML or small in-file JS arrays in
`js/supplier-portal.js`:
- `PRODUCTS_JS` / `PRODUCTS` — the product catalogue (code, name, category, packing,
  units-per-case/pallet, packaging components, status).
- `COMPONENT_LIBRARY_JS` — the 16 seed packaging components (key, name, pkg_type, material,
  weight, recycled %, colour, cert, level, doc_ref) — the shape of a `PackagingComponent`.
- The Component-Wizard's `STEPS` model — the field/section schema for a component.

Treat these as the **shape of the API models**, not real data. Suggested first types:
`Product`, `PackagingComponent`, `Document`, `AiExtraction`, `WizardStep`.

Cross-page hand-off uses `sessionStorage` (`gs_pi`/`gs_wiz`/`gs_flash`/`gs_tab`) purely to
survive the per-page navigation of this split — in a real SPA this is router state + a store.

---

## 8. Things to drop / not port

- The inline SVG sprite (→ `<Icon>` component).
- `go()` / `GS_PAGES` / the `sessionStorage` hand-off / the index hub (→ router + store).
- Inline `style="…"` attributes and one-off `onclick="…classList.toggle('on')"` handlers.
- Prototype motion knobs (ripple/particle/card-glow/spotlight) unless explicitly wanted.
- Cache-busting `?v=N` query strings (build tooling handles this).
