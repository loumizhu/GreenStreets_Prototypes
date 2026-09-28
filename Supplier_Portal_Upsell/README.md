# Supplier Portal: "Library Pro" upsell exploration

A **throwaway copy** of `Supplier_Portal/` for exploring how to upsell a paid tier that
exports and shares the whole packaging library. Nothing here goes back into the main prototypes.

Everything added lives in two files, linked from every page (both themes):
- `css/gs-upsell.css` (all classes are prefixed `up-`)
- `js/gs-upsell.js` (touchpoints, rules and a demo control)

To remove the exploration, delete those two `<link>`/`<script>` lines.

## Touchpoints
| Page | Touchpoint | Type |
|---|---|---|
| Every page with the sidebar | Library meter (size + readiness), opens the export preview | passive |
| Confirmation | Card under "All components accepted" | proactive |
| Packaging | "Export library" button (Pro chip) + readiness banner above the table | passive + proactive |
| Packaging (after a Component Wizard save) | Toast: "Saved to your library…" | proactive |
| Packaging-* detail | "Share spec" next to Download DoC: one free export, then the whole library on Pro | passive |
| AI Upload | Hint under "Download blank template" | passive |
| Documents | Hint under the drop zone | passive |
| Welcome | Optional "+" step after the three required ones | passive |
| Settings | "Plan & billing" card | passive |
| AI Processing / AI Review 1–3 | **nothing, on purpose** | none |

## Rules
- Nothing the retailer asked for is gated. Submitting data and downloading a DoC stay free.
- Proactive prompts only appear after a success, **one per session**. A dismissal snoozes the prompt for 14 days, and after 2 dismissals it stops appearing.
- The value comes before the price: the drawer previews the user's own pack (file tree + sheet rows) before any plan is shown.
- There is one free taste: a single-component export.

## Demo control
The dashed "Upsell demo" pill (bottom-left) switches **Free / Pro** and **Reset**s dismissals and
the session cap. It is a reviewer aid, not product UI. Pricing (`£29`) is a placeholder.
