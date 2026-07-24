# Retailer Admin — Developer Handoff Spec

Purpose: turn "reverse-engineer the prototype" into "implement this spec." These HTML pages
are a **design reference**, not shippable code — they exist to show the intended look,
components, screens and flows. When you rebuild this in TypeScript, most of the static
scaffolding (the inline icon sprite, the per-page sidebar copy, the `go()` navigation, the
dummy data) is meant to be **replaced by components/router/API**, not ported.

> Source of truth for pixels: the `.html` files + `css/greenstreets-theme.css` (shared design
> system) + `css/retailer-admin.css` (this app's page styles). Behaviour hints:
> `js/greenstreets-theme.js` (shared widgets) + `js/retailer-admin.js` (this app's logic).

---

## 1. Prototype construct → target app

| Prototype construct | Rebuild as |
|---|---|
| Inline SVG sprite + `<use href="#gsi-N">` | One `<Icon name="…">` component (see §5) |
| `.sidebar` markup copied into every page | One `<Sidebar activeItem>` layout component |
| `go(id)` + `GS_PAGES` map (`js/retailer-admin.js`) | Router; each id → a route (see §6) |
| One HTML file per screen | One route + page component per screen |
| `:root` CSS variables | Theme tokens / design-system config (see §3) |
| `.btn-p`, `.fi`, `.tbl`, `.tgl`, `.pill-*` … | Reusable UI components (see §4) |
| Static rows / `PRODUCTS_RA` / `PKG_LIBRARY` in JS | Typed models + API calls (see §7) |
| `ptInit/ptRender` table engine, `gsFilterToolbar`, data-grid toolkit | Your table/data-grid library or a `<DataTable>` component |
| Inline `style="…"` attributes | Component styles / utility classes — do not carry inline styles over verbatim |

**Rule of thumb:** if a thing is duplicated across pages, it's a component you build once.
Don't "clean up" the duplication in the prototype — the framework removes it for free.

---

## 2. Layout

Every authenticated screen is `.app-body` → `.sidebar` (fixed nav) + `.main` (scrolling
content). `.main` opens with a `.pg-hdr-bar` (title + optional actions/stat chips), then a
stack of `.grp` cards. Login (`ra_login`) is the only screen with no sidebar.

Suggested shell:
```
<AppLayout>            // .app-body
  <Sidebar/>           // nav, notifications, user footer, logout
  <PageHeader/>        // .pg-hdr-bar: title, subtitle, actions, stat chips
  <Outlet/>            // the routed page, a stack of <Card> (.grp)
</AppLayout>
```

---

## 3. Design tokens

All colours/spacing/radii are CSS custom properties. `greenstreets-theme.css` is the
authoritative set; `retailer-admin.css` re-declares a few navy/brand values for this app.
Map these straight into your theme config.

### Brand & status
| Token | Value | Use |
|---|---|---|
| `--gs` | `#4ebb81` | Primary brand green (primary buttons, accents, active nav) |
| `--gs-l` | `#8fe3b6` | Light green (success highlights, active-nav glow) |
| `--gs-d` | `#2f9c62` | Dark green (gradients/hover) |
| `--bl` / `--bl-l` / `--bl-d` | `#5b9cf6` / `#9dc4ff` / `#3766b0` | Info / "Primary" level / links |
| `--amber` | `#f5a623` | Warning (incomplete, deadlines) |
| `--red` | `#e0605a` | Danger (overdue, delete, errors) |
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
| `--rs` / `--rm` / `--rl` | `10 / 13 / 18` px (small/medium/large radius) |
| `--sh-1` / `--sh-2` | card / elevated shadow |

> Note: `retailer-admin.css` overrides `--rs`/`--rl` to `8px`/`12px` for this app's tighter
> cards. Decide one scale for the rebuild.

Font: **Inter** (300–600), loaded from Google Fonts. The theme file also carries knobs for
motion/effects (`--anim-*`, `--ripple-*`, `--particle-*`, `--field-stroke-*`, card-glow,
spotlight). Those are prototype eye-candy — port only if you want them.

---

## 4. Component catalogue

Each reusable class → the component to build. Variants and states noted.

### Buttons
- `.btn-p` — **primary** (green, has a `.btn-sw` swoosh overlay + `.btn-c` content span). Props: icon?, label. State: `:active` scales to .955.
- `.btn-g` — **secondary/ghost** (outlined). `.btn-g-sm` = small.
- `.btn-reminder`, `.btn-reminder-urgent` — contextual (Suppliers "send reminder"); urgent = amber.
- Icon-only buttons are just `.btn-g` with an icon and no label.

### Forms
- `.fi` — text input / base field. Variants: `select.fi.fi-select` (dropdown), `.fi.fi-search` (search box), `input[type=number].fi` (gets a themed stepper).
- `.fgrp` — field group (label + control). `.flbl` — field label. `.req` — red required asterisk. `.fg2` — two-column field grid.
- `.tgl` — **toggle/switch**; add `.on` for checked. Rows: `.tgl-row` (`.tgl-info` = label+`<small>` description, then the `.tgl`).
- `.search-wrap` — search input with leading icon.

### Data display
- `.grp` / `.grp-hdr` / `.grp-body` — **Card** (section container with title).
- `.tbl` (+ `.tbl-wrap` scroll container) — **Table**. Cells: `.tbl-name` (bold primary), `.tbl-sub` (secondary line), `.tbl-muted` (dimmed). `.tbl-footer` = count line.
- `.pill` + `.pill-green | -amber | -red | -blue | -grey | -gs` — **Badge/Status chip**. Convention: green=complete/ok, amber=incomplete/warning, red=overdue/error, blue=info/"Primary" level, grey=neutral/pending.
- `.stat-mini` (in `.hdr-stat-row`) with `.stat-lbl` + `.stat-val` — **KPI chip** in the header.
- `.filter-toolbar` — search + filter-select bar above a table.

### Navigation & chrome
- `.sidebar` + `.sb-logo-zone`, `.sb-section`, `.nav-item` (`.active`), `.sb-divider`, `.sb-notif-row` (bell + badge), `.sb-user` (avatar + name + role + `.sb-logout`).
- `.pg-hdr-bar` / `.pg-title` / `.pg-sub` / `.pg-actions` — **PageHeader**.
- `.bc-link` — inline text link / breadcrumb link.

### Login
- `.login-wrap` (bg image), `.login-card`, `.login-logo-zone`, `.login-form-zone`, `.login-title`, `.mfa-fi` (OTP input).

### Shared behaviours already wired in `greenstreets-theme.js` (rebuild as needed)
Themed `<select>` dropdowns, animated focus ring on fields, click ripple/particles,
sortable/filterable/paginated data-grid toolkit, number steppers. These are progressive
enhancements over plain HTML — your component library likely replaces them.

---

## 5. Icon inventory

Icons live as an **inline `<svg><symbol id="gsi-N">` sprite** (32 symbols, `gsi-0`…`gsi-31`)
injected at the top of each page; every icon in the UI is `<svg><use href="#gsi-N"/></svg>`,
so `currentColor` + stroke-width theme it. **Rebuild as a single `<Icon name>` component.**
Below is the name→symbol map (semantic names derived from usage; several symbols are visual
duplicates — collapse them to one name):

| Symbol | Semantic name | Where used |
|---|---|---|
| `gsi-0` | `dashboard` | Sidebar: Dashboard |
| `gsi-1` | `suppliers` (truck) | Sidebar: Suppliers |
| `gsi-2` | `products` (bag) | Sidebar: Products |
| `gsi-3` | `packagings` (box) | Sidebar: Packagings |
| `gsi-4` | `documents` (folder) | Sidebar: Documents |
| `gsi-5` | `report` (file-text) | Sidebar: EPR & Reports |
| `gsi-6` | `users` | Sidebar: Users; team |
| `gsi-7` | `settings` (gear) | Sidebar: Config; onboarding |
| `gsi-8` | `audit` (file-check) | Sidebar: Audit log |
| `gsi-9`, `gsi-18` | `bell` | Notifications bell |
| `gsi-10` | `logout` | Sidebar logout |
| `gsi-11` | `trash` | Delete actions |
| `gsi-12`, `gsi-16`, `gsi-31` | `plus` | Add / create (3 dupes) |
| `gsi-13`, `gsi-26` | `send` (paper plane) | Send invite/reminder (dupe) |
| `gsi-14`, `gsi-25` | `upload` | Import / upload (dupe) |
| `gsi-15` | `chevron-down` | Dropdowns, accordions |
| `gsi-17` | `search` | Search inputs |
| `gsi-19` | `check` | Success / done |
| `gsi-20` | `tag` | Labels / SKU |
| `gsi-21` | `package` (cube) | Packaging item |
| `gsi-22` | `trash-can` | Delete (variant) |
| `gsi-23` | `shield-alert` | Compliance / warning |
| `gsi-24`, `gsi-28`, `gsi-29` | `file` | Document (3 dupes) |
| `gsi-27` | `info` | Info tooltip |
| `gsi-30` | `lock` | Password / security |

> **Cleanup opportunity:** `gsi-12/16/31` (plus), `gsi-13/26` (send), `gsi-14/25` (upload),
> `gsi-24/28/29` (file), `gsi-9/18` (bell) are duplicates. The real icon set is ~24 distinct
> glyphs. A reference copy of the sprite is at `img/icons-02-Greenstreets_retailer_admin_v1.svg`
> (not referenced at runtime — it's there so you can lift the geometry).

---

## 6. Screens / routes

23 screens. `go(id)` (in `js/retailer-admin.js`) maps each id to a file; that map is your
route table. Sidebar order first, then flow/sub-screens.

| Screen id | File suffix | Screen | Notes |
|---|---|---|---|
| `ra_login` | `Login` | Login | SSO + email/OTP; no sidebar |
| `ra_onboard1/2/3` | `Setup-1/2/3` | First-run setup wizard | 3-step flow |
| `ra1` | `Dashboard` | Compliance dashboard | KPI chips |
| `ra4` | `Suppliers` | Suppliers list | data-grid, reminders |
| `ra_addsup` | `Add-Supplier` | Add supplier | dynamic contact rows |
| `ra4_validate` | `Validate-Import` | CSV import preview | |
| `ra6` | `Products` | Products list | paginated table engine (`ptInit`) |
| `ra5` | `Packagings` | Packagings | list/grid toggle |
| `ra_product` | `Product-Detail` | Product detail | add-packaging modal |
| `ra7` | `Users` | Users | roles |
| `ra8` | `Send-Invites` | Send invites | |
| `ra9` | `Tracker` | DoC tracker | |
| `ra10` | `DoC-Request` | Request a DoC | |
| `ra11` | `Compliance` | Compliance | |
| `ra12` | `Generate-DoC` | Generate DoC | |
| `ra13` | `Documents` | Documents | |
| `ra14` | `EPR-Reports` | EPR & Reports | |
| `ra15` | `Audit-Log` | Audit log | filterable feed |
| `ra16` | `Notifications` | Notifications | typed feed + filters |
| `ra_config` | `Settings` | Settings / config | profile, compliance, security, danger zone |
| `ra_custom_invite` | `Custom-Invite` | Custom invite | |

`index.html` is a dev-only hub linking all screens — drop it.

---

## 7. Data & state

There is **no backend**. All content is static HTML or small in-file JS arrays:
- `PRODUCTS_RA` (64 generated products) and `PKG_LIBRARY` (26 packaging components) in
  `js/retailer-admin.js` — treat as the **shape of the API models**, not real data.
- Table sorting/filtering/pagination is done client-side by the prototype engines; in the
  app this is server-side or a data-grid lib.
- Forms don't persist. Toggles flip a CSS class only.

Suggested first models to type: `Supplier`, `Product`, `PackagingComponent`, `Document`,
`DoC` (Declaration of Conformity), `User`, `AuditEvent`, `Notification`, `EprReport`.

---

## 8. Things to drop / not port

- The inline SVG sprite (→ `<Icon>` component).
- The per-page duplicated `.sidebar` (→ layout component).
- `go()` / `GS_PAGES` / the index hub (→ router).
- Inline `style="…"` attributes and one-off `onclick="this.classList.toggle('on')"` handlers.
- Prototype motion knobs (ripple/particle/card-glow/spotlight) unless explicitly wanted.
- Cache-busting `?v=N` query strings (build tooling handles this).
