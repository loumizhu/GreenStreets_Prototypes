# Greenstreets — Retailer User (split prototype)

The original single-file prototype `03-greenstreets_retailer_user_v1.html` has been split
into **one HTML file per screen** so it can be handed to developers. This
`Retailer_User_Portal/` folder is **fully self-contained** — it carries its own `css/`,
`js/` and `img/`. The original monolith is kept unchanged as a reference in the parent
`Prototypes/` folder.

> **Persona:** the *Retailer User* is the day-to-day (non-admin) retailer role — it can view
> the dashboard, suppliers, products and documents, request Declarations of Conformity, read
> notifications and manage its own settings. It has no user-management / onboarding / supplier-
> creation screens (those live in the Retailer **Admin** portal).

## How to open

Open any page directly in a browser, **or** open the hub:

- **`index.html`** — a directory of all 11 screens. Start here.

Tip: for best results serve over HTTP (relative asset paths behave better than `file://`):

```
# from inside the Retailer_User_Portal/ folder:
python -m http.server 8777
# then visit http://localhost:8777/index.html
```

## File layout

```
index.html      ← screen directory / hub
03-greenstreets_retailer_user_<Screen>.html   ← 11 screen pages (one each)

css/
  greenstreets-theme.css   ← shared design system (copy of the repo-wide theme)
  retailer-user.css         ← page-specific styles for THIS prototype (extracted once)
js/
  greenstreets-theme.js     ← shared behaviour (focus ring, selects, ripple, data-grid…)
  retailer-user.js          ← THIS prototype's logic (extracted once, see below)
img/
  greenstreets-logo.png     ← extracted from the old inline base64 blob
  swoosh.png, BackgroundGreenStreets.jpg, icons-03-…svg (reference sprite)
```

Every screen page links, in order: `greenstreets-theme.css`, then `retailer-user.css` in the
head; and `retailer-user.js`, then `greenstreets-theme.js` before `</body>`. **There is no
per-page CSS/JS duplication** — edit the shared files once and every page updates. Bump the
`?v=N` query on the `<link>`/`<script>` tags when you change a shared file (browsers cache
them aggressively).

## The 11 screens

| Page suffix | Screen id | Screen |
|---|---|---|
| `Login` | `ru_login` | Login (no sidebar) |
| `Welcome` | `ru_welcome` | First-run welcome |
| `Dashboard` | `ru1` | Dashboard |
| `Suppliers` | `ru3` | Suppliers list |
| `Supplier-Detail` | `ru4` | Supplier detail |
| `DoC-Request` | `ru5` | Request a Declaration of Conformity |
| `Products` | `ru6` | Products list (paginated table) |
| `Product-Detail` | `ru6_detail` | Product detail + add-packaging modal |
| `Documents` | `ru7` | Documents |
| `Notifications` | `ru8` | Notifications |
| `Settings` | `ru9` | Settings |

> Screen ids follow the original prototype; `ru2` was unused there and is intentionally absent.

## Navigation between screens

In the original, `go(id)` toggled which `.screen` div was visible. Now each screen is its own
page, so **`go(id)` navigates to the matching HTML file** (via a `GS_PAGES` id→filename map at
the top of `retailer-user.js`). Every existing `onclick="go('ru3')"` still works unchanged —
it's now a real page load. In-app navigation is via the sidebar nav items and in-screen
buttons (all real product UI). The demo-only prototype nav bar has been removed.

To add or rename a screen: create the HTML file, then add its entry to the `GS_PAGES` map in
`js/retailer-user.js`.

## What changed vs. the original (behaviour is identical)

- Extracted the two inline `<style>` blocks → `css/retailer-user.css`.
- Extracted all inline `<script>` → `js/retailer-user.js`, with `go()` rewritten to navigate.
  All init code is guarded, so the one shared script loads safely on every page.
- The inline base64 logo/swoosh/background blob was removed; images load from `img/` files.
- The demo-only top prototype nav bar was removed.

## Note for a production build

See **`03-greenstreets_retailer_user_HANDOFF.md`** for the full dev spec (design tokens,
component catalogue, icon map, route table, data models). The operator sidebar markup is still
repeated inside each screen page (as in the original) — the natural first step in a real build
is to make the sidebar and page header shared components.
