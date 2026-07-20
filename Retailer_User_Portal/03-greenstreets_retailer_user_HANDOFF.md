# Retailer User — Developer Handoff Spec

Purpose: turn "reverse-engineer the prototype" into "implement this spec." These HTML pages
are a **design reference**, not shippable code — they show the intended look, components,
screens and flows. When you rebuild this in TypeScript, most of the static scaffolding (the
inline icon sprite, the per-page sidebar copy, the `go()` navigation, the dummy data) is meant
to be **replaced by components/router/API**, not ported.

> **Persona:** *Retailer User* — the non-admin retailer role. Read/contribute access:
> dashboard, suppliers, products, documents, request DoCs, notifications, own settings.
> No user-management, onboarding wizard or supplier-creation (those are Retailer **Admin**).
>
> Source of truth for pixels: the `.html` files + `css/greenstreets-theme.css` (shared design
> system) + `css/retailer-user.css` (this app's page styles). Behaviour hints:
> `js/greenstreets-theme.js` (shared widgets) + `js/retailer-user.js` (this app's logic).
>
> This portal shares the design system with the Retailer **Admin** portal — if you build both,
> the tokens, components and icons should be **one shared library**, not duplicated.

---

## 1. Prototype construct → target app

| Prototype construct | Rebuild as |
|---|---|
| Inline SVG sprite + `<use href="#gsi-N">` | One `<Icon name="…">` component (see §5) |
| `.sidebar` markup copied into every screen | One `<Sidebar activeItem>` layout component |
| `go(id)` + `GS_PAGES` map (`js/retailer-user.js`) | Router; each id → a route (see §6) |
| One HTML file per screen | One route + page component per screen |
| `:root` CSS variables | Theme tokens / design-system config (see §3) |
| `.btn-p`, `.fi`, `.tbl`, `.tgl`, `.pill-*` … | Reusable UI components (see §4) |
| `PRODUCTS_RU` / `PKG_LIBRARY` arrays in JS | Typed models + API calls (see §7) |
| `ptInit/ptRender` table engine, data-grid toolkit | Your table/data-grid component |
| Inline `style="…"` attributes | Component styles / utility classes — don't port verbatim |

**Rule of thumb:** if a thing is duplicated across pages, it's a component you build once.
Don't "clean up" the duplication in the prototype — the framework removes it for free.

---

## 2. Layout

Every authenticated screen is `.app-body` → `.sidebar` (fixed nav) + `.main` (scrolling
content). `.main` opens with a `.pg-hdr-bar` (title + optional actions), then a stack of `.grp`
cards. `ru_login` (Login) and `ru_welcome` (Welcome) are the standalone, sidebar-less screens.

```
<AppLayout>            // .app-body
  <Sidebar/>           // nav, notifications, user footer
  <PageHeader/>        // .pg-hdr-bar: title, subtitle, actions
  <Outlet/>            // the routed page, a stack of <Card> (.grp)
</AppLayout>
```

---

## 3. Design tokens

Colours/spacing/radii are CSS custom properties. `greenstreets-theme.css` is the authoritative
set; `retailer-user.css` re-declares the navy/brand values below for this app. Map straight
into your theme config.

### Brand & status
| Token | Value | Use |
|---|---|---|
| `--gs` / `--gs-l` / `--gs-d` | `#4ebb81` / `#8fe3b6` / `#2f9c62` | Brand green (primary, success, active nav) |
| `--bl` / `--bl-l` / `--bl-d` | `#5b9cf6` / `#9dc4ff` / `#3766b0` | Info / "Primary" level / links |
| `--amber` | `#f5a623` | Warning (incomplete, deadlines) |
| `--red` | `#e0605a` | Danger (overdue, missing data, errors) |
| `--teal` | `#43b3ad` | Secondary accent |

### Surfaces & text (dark theme)
| Token | Value | Use |
|---|---|---|
| `--nv` / `--nv2` / `--nv3` / `--nv4` | `#0c1a2e` → `#1c3356` | Background navy ramp |
| `--tw` / `--tw2` / `--tw3` / `--tw4` | `#fff` / 74% / 44% / 26% white | Text: primary → faintest |
| `--stroke` | `rgba(69,125,195,.35)` | Card / control borders |
| `--bw` | `rgba(255,255,255,.08)` | Hairline dividers |
| `--line` / `--line-2` | `rgba(148,180,230,.16 / .26)` | Table & row lines |

### Spacing / radius / shadow
| Token | Value |
|---|---|
| `--sp-1 … --sp-7` | `4 · 8 · 12 · 16 · 20 · 24 · 32` px |
| `--rs` / `--rm` / `--rl` | theme `10/13/18` px — **`retailer-user.css` overrides `--rs`/`--rl` to `8`/`12`** |
| `--sh-1` / `--sh-2` | card / elevated shadow |

Font: **Inter** (300–600) from Google Fonts. The theme file also carries motion/effect knobs
(`--anim-*`, `--ripple-*`, `--particle-*`, `--field-stroke-*`, card-glow, spotlight) — prototype
eye-candy; port only if wanted.

---

## 4. Component catalogue

Reusable classes → components to build. Variants and states noted. (Usage counts are how many of
the 11 screens use each — a hint at how central it is.)

### Buttons
- `.btn-p` — **primary** (green; `.btn-sw` swoosh overlay + `.btn-c` content span). `:active` scales to .955. (6 screens)
- `.btn-g` / `.btn-g-sm` — **secondary/ghost** outlined, and small. (9 screens) Icon-only buttons are `.btn-g` with an icon and no label.

### Forms
- `.fi` — text input / base field. Variants: `select.fi.fi-select` (dropdown), `.fi.fi-search` (search box), `input[type=number].fi` (themed stepper). (7 screens)
- `.fgrp` (field group), `.flbl` (label), `.req` (red asterisk), `.fg2` (two-column grid).
- `.tgl` — **toggle/switch**; add `.on` for checked. Row: `.tgl-row` (`.tgl-info` = label + `<small>`, then `.tgl`). (Settings only)

### Data display
- `.grp` / `.grp-hdr` / `.grp-body` — **Card** (section container with title). (9 screens)
- `.tbl` (+ `.tbl-wrap` scroll container) — **Table**. Cells: `.tbl-name` (bold), `.tbl-sub` (secondary line), `.tbl-muted` (dimmed), `.chev` (row-chevron). `.tbl-footer` = count. (7 screens)
- `.pill` + `.pill-green | -amber | -red | -blue | -grey | -gs` — **Badge/Status chip**. Convention: green=complete/ok, amber=incomplete/warning, red=overdue/missing, blue=info/"Primary" level, grey=neutral/pending. (7 screens)
- `.filter-toolbar` — search + filter-select bar above a table. (3 screens)

### Notifications (Notifications screen)
- `.notif-item` (+ `.notif-unread`, `data-type="urgent|warning|success|info"`), `.notif-stripe-*`, `.notif-icon-*`, `.notif-title`, `.notif-time`, `.notif-msg`, `.notif-actions`.
- `.notif-filter-btn` (+ `.active`, `.notif-f-*`) — the type filter chips; `gsNotifFilter(btn,type)` shows/hides items. Rebuild as filter state on a `<NotificationList>`.

### Navigation & chrome
- `.sidebar` + `.sb-logo-zone`, `.sb-section`, `.nav-item` (`.active`), `.sb-divider`, `.sb-notif-row` (bell + badge), `.sb-user` (avatar, name, role, `.sb-logout`). (9 screens)
- `.pg-hdr-bar` / `.pg-title` / `.pg-sub` / `.pg-actions` — **PageHeader**.
- `.bc-link` — inline text / breadcrumb link.

### Login / welcome
- `.login-wrap` (bg image), `.login-card`, `.login-logo-zone`, `.login-form-zone`, `.login-title`, `.mfa-fi` (OTP input).

### Shared behaviours in `greenstreets-theme.js` (rebuild as needed)
Themed `<select>` dropdowns, animated field focus ring, click ripple/particles, the
sortable/filterable/paginated data-grid toolkit, number steppers. Progressive enhancements over
plain HTML — your component library likely replaces them.

---

## 5. Icon inventory

Icons are an **inline `<svg><symbol id="gsi-N">` sprite** (15 symbols, `gsi-0`…`gsi-14`) injected
at the top of each page; every icon is `<svg><use href="#gsi-N"/></svg>`, so `currentColor` +
stroke-width theme it. **Rebuild as a single `<Icon name>` component.** Name→symbol map (names
derived from geometry + usage):

| Symbol | Semantic name | Where used |
|---|---|---|
| `gsi-0` | `check` | Save / confirm |
| `gsi-1` | `dashboard` (grid) | Sidebar: Dashboard |
| `gsi-2` | `suppliers` (truck) | Sidebar: Suppliers |
| `gsi-3` | `products` (box) | Sidebar: Products |
| `gsi-4` | `documents` (folder) | Sidebar: Documents |
| `gsi-5` | `bell` | Notifications |
| `gsi-6` | `logout` | Sidebar logout |
| `gsi-7`, `gsi-10` | `info` (circle-i) | Info notes (duplicate) |
| `gsi-8` | `export` (upload tray) | Export CSV / list |
| `gsi-9` | `search` | Search inputs |
| `gsi-11`, `gsi-12` | `file` | Documents / DoC request (duplicate) |
| `gsi-13` | `lock` | Security / settings |
| `gsi-14` | `plus` | Add / create |

> **Cleanup opportunity:** `gsi-7`/`gsi-10` (info) and `gsi-11`/`gsi-12` (file) are duplicates —
> the real set is ~13 distinct glyphs. A reference copy of the sprite is at
> `img/icons-03-greenstreets_retailer_user_v1.svg` (not referenced at runtime).

---

## 6. Screens / routes

11 screens. `go(id)` (in `js/retailer-user.js`) maps each id to a file; that map is your route
table. (`ru2` was unused in the original and is absent.)

| Screen id | File suffix | Screen | Notes |
|---|---|---|---|
| `ru_login` | `Login` | Login | SSO + email/OTP; no sidebar |
| `ru_welcome` | `Welcome` | First-run welcome | no sidebar |
| `ru1` | `Dashboard` | Dashboard | |
| `ru3` | `Suppliers` | Suppliers list | filter toolbar |
| `ru4` | `Supplier-Detail` | Supplier detail | |
| `ru5` | `DoC-Request` | Request a DoC | form |
| `ru6` | `Products` | Products list | paginated table engine, scope `ru` (`ptInit`) |
| `ru6_detail` | `Product-Detail` | Product detail | add-packaging modal, scope `ru` |
| `ru7` | `Documents` | Documents | |
| `ru8` | `Notifications` | Notifications | typed feed + filter chips |
| `ru9` | `Settings` | Settings | profile + toggles |

`03-greenstreets_retailer_user_index.html` is a dev-only hub linking all screens — drop it.

---

## 7. Data & state

There is **no backend**. All content is static HTML or small in-file JS arrays:
- `PRODUCTS_RU` (64 generated products, each with `sku/desc/cat/supplier/comps/status/missing`)
  and `PKG_LIBRARY` (26 packaging components) in `js/retailer-user.js` — treat as the **shape of
  the API models**, not real data.
- Table sort/filter/pagination is client-side in the prototype (`ptInit/ptRender`); in the app
  this is server-side or a data-grid lib.
- Forms don't persist. Settings toggles flip a CSS class only. Notification filters are
  client-side show/hide.

Suggested first models to type: `Supplier`, `Product`, `PackagingComponent`, `Document`,
`DocRequest` (Declaration of Conformity request), `Notification`, `UserSettings`.

---

## 8. Things to drop / not port

- The inline SVG sprite (→ `<Icon>` component).
- The per-page duplicated `.sidebar` (→ layout component).
- `go()` / `GS_PAGES` / the index hub (→ router).
- Inline `style="…"` attributes and one-off `onclick="this.classList.toggle('on')"` handlers.
- Prototype motion knobs (ripple/particle/card-glow/spotlight) unless explicitly wanted.
- Cache-busting `?v=N` query strings (build tooling handles this).

> If you're also building the Retailer **Admin** portal, its handoff spec is the sibling of this
> one — share the token set, component library and `<Icon>` set across both rather than forking.
