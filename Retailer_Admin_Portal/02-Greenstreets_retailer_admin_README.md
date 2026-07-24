# Greenstreets — Retailer Admin (split prototype)

The original single-file prototype `02-Greenstreets_retailer_admin_v1.html` has been split
into **one HTML file per screen** so it can be handed to developers. This
`Retailer_Admin_Portal/` folder is **fully self-contained** — it carries its own
`css/`, `js/` and `img/`. The original monolith is kept unchanged as a reference in the
parent `Prototypes/` folder.

## How to open

Open any page directly in a browser, **or** open the hub:

- **`index.html`** — a directory of all 23 screens. Start here.

Tip: for best results serve over HTTP (relative asset paths behave better than `file://`):

```
# from inside the Retailer_Admin_Portal/ folder:
python -m http.server 8777
# then visit http://localhost:8777/index.html
```

## File layout

```
index.html      ← screen directory / hub
02-Greenstreets_retailer_admin_<Screen>.html   ← 23 screen pages (one each)

css/
  greenstreets-theme.css   ← shared design system (copy of the repo-wide theme)
  retailer-admin.css        ← page-specific styles for THIS prototype (extracted once)
js/
  greenstreets-theme.js     ← shared behaviour (focus ring, selects, ripple, data-grid…)
  retailer-admin.js         ← THIS prototype's logic (extracted once, see below)
img/
  greenstreets-logo.png     ← extracted from the old inline base64 blob
  swoosh.png, BackgroundGreenStreets.jpg
```

Every screen page links, in order: `greenstreets-theme.css`, then `retailer-admin.css`
in the head; and `retailer-admin.js`, then `greenstreets-theme.js` before `</body>`.
**There is no per-page CSS/JS duplication** — edit the shared files once and every page
updates. Bump the `?v=N` query on the `<link>`/`<script>` tags when you change a shared
file (browsers cache them aggressively).

## The 23 screens

| Page suffix | Screen id | Screen |
|---|---|---|
| `Login` | `ra_login` | Login |
| `Setup-1` / `Setup-2` / `Setup-3` | `ra_onboard1..3` | First-run setup wizard |
| `Dashboard` | `ra1` | Dashboard |
| `Suppliers` | `ra4` | Suppliers list |
| `Add-Supplier` | `ra_addsup` | Add supplier |
| `Validate-Import` | `ra4_validate` | CSV import preview |
| `Products` | `ra6` | Products list (paginated table) |
| `Packagings` | `ra5` | Packagings (list/grid) |
| `Product-Detail` | `ra_product` | Product detail + add-packaging modal |
| `Users` | `ra7` | Users |
| `Send-Invites` | `ra8` | Send invites |
| `Tracker` | `ra9` | DoC tracker |
| `DoC-Request` | `ra10` | Request a DoC |
| `Compliance` | `ra11` | Compliance |
| `Generate-DoC` | `ra12` | Generate DoC |
| `Documents` | `ra13` | Documents |
| `EPR-Reports` | `ra14` | EPR & Reports |
| `Audit-Log` | `ra15` | Audit log |
| `Notifications` | `ra16` | Notifications |
| `Settings` | `ra_config` | Settings / config |
| `Custom-Invite` | `ra_custom_invite` | Custom invite |

## Navigation between screens

In the original, `go(id)` toggled which `.screen` div was visible. Now each screen is its
own page, so **`go(id)` navigates to the matching HTML file** (via a `GS_PAGES` id→filename
map at the top of `retailer-admin.js`).

This means **every existing `onclick="go('ra4')"` still works unchanged** — it's now a real
page load. In-app navigation is via the sidebar nav items and the in-screen buttons (all
real product UI). The demo-only prototype nav bar has been removed.

To add or rename a screen: create the HTML file, then add its entry to the `GS_PAGES` map
in `js/retailer-admin.js`.

## What changed vs. the original (behaviour is identical)

- Extracted the two inline `<style>` blocks → `css/retailer-admin.css`.
- Extracted all inline `<script>` → `js/retailer-admin.js`, with `go()` rewritten to
  navigate. All init code is guarded (`if(!el) return`), so the one shared script loads
  safely on every page.
- The 216 KB inline base64 logo/swoosh/background blob was removed; images now load from
  `img/` files.
- The audit-log screen (previously injected at runtime via JS) is now plain static HTML
  in `02-Greenstreets_retailer_admin_Audit-Log.html`.

## Note for a production build

The operator **sidebar** markup is still repeated inside each screen page (as it was in the
original). If this moves toward a real app, the natural next step is to make the sidebar
(and the top nav) a shared component — a framework partial/include, or a small JS mount —
rather than duplicated HTML. Left as-is here to keep the prototype faithful.
