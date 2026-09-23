# Retailer ⇄ Supplier switcher — demo

One person, one sign-in, two portals. Shows the pattern proposed in
[../DUAL-ROLE-WORKSPACE-SWITCHING.md](../DUAL-ROLE-WORKSPACE-SWITCHING.md).

| Open | Mode |
|---|---|
| [retailer/02-Greenstreets_retailer_admin_Products.html](retailer/02-Greenstreets_retailer_admin_Products.html) (+ `-Light`) | Retailer mode · Primark |
| [supplier/04-greenstreets_supplier_portal_Products.html](supplier/04-greenstreets_supplier_portal_Products.html) (+ `-Light`) | Supplier mode · Luntai Packaging Co. |

## Two ways to switch

1. **Logo (top left).** Hover it and the logo gives way to "Switch to *Supplier* mode →". The cursor also becomes a revolving-door icon. Click to switch.
2. **Avatar (bottom left).** Click the avatar, like the workspace menu in Slack. The menu shows:
   - **Current portal:** its icon, the mode, and an **Active** tick.
   - **The other portal:** its icon, the mode, and any pending work, such as "3 requests · due 26 Jul".
   - **Other options:** open the other portal in a new tab, Account settings, and Log out.

   The avatar always shows the current portal's icon.

A switch keeps the theme (dark → dark, Light → Light). It plays a short transition, then the page you arrive on shows a "Now in … mode · **Switch back**" toast. Keyboard support:
- Tab to the logo or the avatar, then press Enter.
- In the menu, ↑/↓ move between items and Esc closes it.

## How it's built

- The pages are copies of the portals' Products pages. They link the **real** portal CSS/JS (`../../Retailer_Admin_Portal/…`, `../../Supplier_Portal/…`), so nothing is forked.
- Only `img/` is copied, because the portal scripts load images relative to the page.
- Everything new is in `shared/rs-switcher.css` + `shared/rs-switcher.js`. The demo data (person, organisations, pending counts) is in `CFG` at the top of the JS.
- The sidebar links still work: they go to the real portal pages.
