# Greenstreets — Supplier Portal (split prototype)

The original single-file prototype `04-greenstreets_supplier_portal_v9.html` has been
split into **one HTML file per screen** so it can be handed to developers. This
`Supplier_Portal/` folder is **fully self-contained** — it carries its own `css/`, `js/`
and `img/`. The original monolith is kept unchanged as a reference in the parent
`Prototypes/` folder.

## How to open

Open any page directly in a browser, **or** open the hub:

- **`04-greenstreets_supplier_portal_index.html`** — a directory of all 26 screens. Start here.

Tip: for best results serve over HTTP (relative asset paths behave better than `file://`):

```
# from the Prototypes/ root:
python -m http.server 8777
# then visit http://localhost:8777/Supplier_Portal/04-greenstreets_supplier_portal_index.html
```

## File layout

```
04-greenstreets_supplier_portal_index.html      ← screen directory / hub
04-greenstreets_supplier_portal_<Screen>.html   ← 26 screen pages (one each)

css/
  greenstreets-theme.css   ← shared design system (copy of the repo-wide theme)
  supplier-portal.css      ← page-specific styles for THIS prototype (extracted once)
js/
  greenstreets-theme.js    ← shared behaviour (focus ring, selects, ripple, data-grid…)
  supplier-portal.js       ← THIS prototype's logic (extracted once, see below)
img/
  Logo-WG.png, swoosh.png, BackgroundGreenStreets.jpg, icons-*.svg
```

Every screen page links, in order: `greenstreets-theme.css`, then `supplier-portal.css`
in the head; and `supplier-portal.js`, then `greenstreets-theme.js` before `</body>`.
`supplier-portal.js` loads **before** the shared theme script so its `go()` /
`launchWizard()` overrides are in place. **There is no per-page CSS/JS duplication** —
edit the shared files once and every page updates.

## The 26 screens

| Page suffix | Screen id | Screen |
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

## Navigation between screens

In the original, `go(id)` toggled which `.screen` div was visible. Now each screen is its
own page, so **`go(id)` navigates to the matching HTML file** (via a `GS_PAGES` id→filename
map appended to `js/supplier-portal.js`). Every existing `onclick="go('sp2')"` still works
unchanged — it's now a real page load.

State that used to live in one long-lived page is carried across pages via
**`sessionStorage`**:

| Key | Set by | Read by | Purpose |
|---|---|---|---|
| `gs_pi` | `openProductDetail(pi)` | Product-Detail on load | which product to render |
| `gs_wiz` | `launchWizard(code,name,origin,pi)` | Component-Wizard on load | wizard launch context |
| `gs_flash` | `gsWizardDone` / wizard `finishWizard()` | Landing on load | flash the newly-saved component |
| `gs_tab` | `gsGoLanding(tab)` / wizard `wizBack()` | Landing on load | which Landing tab to open |

The demo-only prototype nav bar (`.pnav`) and the wizard iframe have been removed; the
Component-Wizard is now a **top-level page** built from the old `wiz5tpl` template.

## What changed vs. the original (behaviour is identical)

- Extracted the two inline `<style>` blocks → `css/supplier-portal.css`.
- Extracted the inline app `<script>` blocks → `js/supplier-portal.js`; appended an
  override section that turns `go()` into navigation and wires the cross-page
  `sessionStorage` state above. The top-level `go('sp1')` bootstrap call was dropped.
- The `wiz5` iframe screen became a standalone `Component-Wizard` page built from the
  `wiz5tpl` template (`%%…%%` placeholders filled, `%%ENDSCRIPT%%` → `</script>`), with
  `finishWizard()`/`wizBack()` overridden to navigate the whole window instead of a parent.
- The Confirmation "View packaging components" button now calls `gsGoLanding('packaging')`
  so the Landing tab survives the page load.

## Note for a production build

See `04-greenstreets_supplier_portal_HANDOFF.md` for the developer-facing spec (routes, components, data models,
icon inventory). The per-page structure here is a design reference, not shippable code.
