# GreenStreets — Super Admin (split build)

The **platform-operator console** — the persona Confluence calls the **GreenStreet / GreenStreets
Admin** (Greenstreets staff, full cross-tenant control). This folder is the
`01-Greenstreets_GreenStreets_Admin_v7.html` monolith **split into one self-contained HTML file
per screen**, mirroring the layout of `Supplier_Portal/`.

## Layout

```
GreenStreets_Super_Admin/
├── index.html                                  ← screen hub (start here)
├── 01-greenstreets_super_admin_<Screen>.html   ← 20 screen pages
├── css/greenstreets-theme.css                  ← copy of the shared v6 glass theme
├── js/greenstreets-theme.js                    ← copy of the shared theme behaviour
├── js/super-admin.js                           ← the monolith's shared inline script, extracted
├── img/                                         ← copy of shared raster assets
├── 01-greenstreets_super_admin_README.md        ← this file
└── CLAUDE.md                                    ← guidance for future edits
```

## The 20 screens

| File | id | Screen |
|---|---|---|
| `…_Login.html` | `s1` | Login |
| `…_Retailers.html` | `s2` | Retailers (operator landing) |
| `…_Suppliers.html` | `s3` | Suppliers |
| `…_Add-Supplier.html` | `s14` | Add supplier |
| `…_Retailer-Detail.html` | `s4` | Retailer detail |
| `…_Add-Retailer-1.html` | `p1` | Add retailer 1/4 — company |
| `…_Add-Retailer-2.html` | `p2` | Add retailer 2/4 — jurisdiction |
| `…_Add-Retailer-3.html` | `p3` | Add retailer 3/4 — admin user |
| `…_Add-Retailer-4.html` | `p4` | Add retailer 4/4 — confirm |
| `…_Configure.html` | `s5` | Configure |
| `…_Impersonate.html` | `s6` | Impersonate |
| `…_Users.html` | `s7` | Users |
| `…_Products.html` | `s11` | Products |
| `…_Product-Detail.html` | `s12` | Product detail |
| `…_Packagings.html` | `s8` | Packagings |
| `…_Reports.html` | `s9` | Reports |
| `…_Supplier-Detail.html` | `s10` | Supplier detail |
| `…_Audit-Log.html` | `s15` | Audit log |
| `…_Notifications.html` | `s16` | Notifications |
| `…_Settings.html` | `s13` | Settings |

## How navigation works

In the monolith, `go(id)` toggled `.screen` visibility inside one document. Here it is a **real
page load**: `js/super-admin.js` overrides `go(id)` to `window.location.href = GS_PAGES[id]`, where
`GS_PAGES` is the id → filename map. Every existing `onclick="go('sN')"` (sidebar links, buttons,
table rows, the top prototype-nav bar) therefore navigates to the right page unchanged. **Add or
rename a screen → update `GS_PAGES` in `js/super-admin.js` and add a card to `index.html`.**

Each page keeps the top **prototype-nav bar** (`.pnav`) as a reviewer aid, with the current screen's
button pre-highlighted, plus the **theme customizer** panel (works on every page).

## Running

No build step. Open `index.html` (or any screen file) in a browser. For the in-repo preview
tooling, serve over HTTP from the repo root (`python -m http.server 8777`) and open
`http://localhost:8777/GreenStreets_Super_Admin/index.html`.

## Source of truth

The monolith `../01-Greenstreets_GreenStreets_Admin_v7.html` is kept as the **frozen pre-split
reference**. New work on this persona happens here. See `CLAUDE.md` for edit conventions.
