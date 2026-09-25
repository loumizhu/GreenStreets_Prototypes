# Retailer ⇄ Supplier switcher — demo

One person, one sign-in, two portals. Shows the pattern proposed in
[../DUAL-ROLE-WORKSPACE-SWITCHING.md](../DUAL-ROLE-WORKSPACE-SWITCHING.md).

**Start here:** [login/Login.html](login/Login.html) (+ `-Light`).

| Page | What it is |
|---|---|
| `login/Login` | The Retailer login, used as the one front door for both portals |
| `login/Choose-Portal` | Shown after sign-in: pick **Retailer** or **Supplier**, with an option to *always open the portal I choose* |
| `retailer/02-…Products` | Retailer mode · Primark |
| `supplier/04-…Products` | Supplier mode · Primark |

## The flow

1. **Sign in.** The Sign in button, Google, Microsoft and Enter all work.
2. **Choose a portal.** The screen greets you ("Hello, Keith · Log in as?"). Each choice shows what you do there and what's waiting ("4 new notifications", "3 requests due 26 Jul"). One click opens that portal.
   - Tick **Always open the portal I choose** (under the two choices) before you click one, to skip this screen at every sign-in after that.
3. **Arrive.** A message confirms which portal you're in, with a one-click switch to the other one.
4. **Switch any time.** Click the account block at the bottom left (avatar, name or role), as in Slack. The menu shows:
   - **Current portal:** its icon, the mode, and an **Active** tick.
   - **The other portal:** its icon, the mode, and its pending work. Click it to switch.
   - **Open this portal at sign-in:** the same preference as the chooser's checkbox; turn it on or off here.
   - **Other options:** open the other portal in a new tab, Account settings, and Log out (back to `login/Login`).

A switch keeps the theme (dark → dark, Light → Light). It plays a short transition, then the page you arrive on shows a "Now in … mode · **Switch back**" toast. Keyboard support:
- Tab to the avatar, then press Enter. On the chooser, ←/→ move between the two choices.
- In the menu, ↑/↓ move between items and Esc closes it.

## How it's built

- The pages are copies of the portals' Products pages. They link the **real** portal CSS/JS (`../../Retailer_Admin_Portal/…`, `../../Supplier_Portal/…`), so nothing is forked.
- Only `img/` is copied, because the portal scripts load images relative to the page.
- Everything new is in `shared/`: `rs-switcher.*` (the in-portal menu), `rs-chooser.*` (the portal picker) and `rs-login.js` (sign-in routing). The saved default is `localStorage.rsDefaultPortal`. The demo data (person, organisations, pending counts) is in `CFG` at the top of the JS.
- The sidebar links still work: they go to the real portal pages.
