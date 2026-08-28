# Dashboards 02 & 03 — research, question framework, and what changed

**Deliverable pages**
- **v02 — the full picture:** [Dashboard-02](02-Greenstreets_retailer_admin_Dashboard-02.html) ·
  [-Light](02-Greenstreets_retailer_admin_Dashboard-02-Light.html) · router id `ra1_v2`
- **v03 — the essentials:** [Dashboard-03](02-Greenstreets_retailer_admin_Dashboard-03.html) ·
  [-Light](02-Greenstreets_retailer_admin_Dashboard-03-Light.html) · router id `ra1_v3`

**Supersedes nothing** — the v1 dashboard (`…_Dashboard.html`, id `ra1`) is untouched, so all three
can be compared side by side. v02 carries a "Compare with v1" chip; v03 carries a "More detail" link
to v02. Sections 1–4 below are the research and the v02 design; **section 5 is v03**.
**Date:** 2026-08-28

---

## 1. What the research says

Six sources were consulted; the four that actually shaped the design are marked ★.

| Source | What it contributed |
|---|---|
| ★ Stephen Few, *Information Dashboard Design* + *Common Pitfalls in Dashboard Design* | The 13 classic mistakes: exceeding one screen, **inadequate context for the data**, excessive precision, **deficient measures**, inappropriate display media, **meaningless variety**, poor layout, failure to highlight what matters, visual clutter, colour misuse. Also the perceptual case for focal points and Gestalt grouping. |
| ★ Pencil & Paper, *UX Pattern Analysis: Data Dashboards* | Dashboard archetypes (reporting / monitoring / exploration / functional / product-home); the pre-design validation questions ("what questions do they need the dashboard to answer?", "what needs their attention?"); card anatomy; deltas needing a chosen baseline; **accessibility beyond colour** (glyphs, textures, line styles); designed empty and loading states; "always allow export as CSV" as data etiquette; the "wall of data / we-have-it-so-why-not-show-it / missing baselines / unexplained jargon" failure list. |
| ★ NN/g-derived dashboard guidance (via UX Pilot, Aufait, Figr syntheses) | Operational vs analytical split driven by **decision frequency**; attention concentrates top and left; cap competing elements above the fold; progressive disclosure to cut cognitive load; dashboards built around one clear user goal measurably outperform. |
| ★ Executive-dashboard practice (Customer Science, Den Otter, Salesforce/Winning Presentations) | The **five-second rule** — a reader should know what is happening and what to do next within five seconds. Each metric needs five things: the number, the trend against the prior period, the target or threshold, and a one-line plain-language reason for movement. |
| Arkatechture, *10 Questions to Ask When Designing a Dashboard*; Explo; The Spot | The stakeholder questions that expose a useless metric: "what decision would you make differently if this number changed?", "where are targets stored and who sets them?", "if this metric moved 50% overnight, what would be your first action?" |
| Toptal, Digiteum, Improvado, DataCamp | Confirmation and mobile-context framing ("is all of this relevant on the go?"). |

**Sources**
- [Common Pitfalls in Dashboard Design — Stephen Few (Perceptual Edge)](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf)
- [Information Dashboard Design — book review (UXmatters)](https://www.uxmatters.com/mt/archives/2007/04/book-review-information-dashboard-design.php)
- [UX Pattern Analysis: Data Dashboards — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [12 Dashboard Design Principles For Better UX — UX Pilot](https://uxpilot.ai/blogs/dashboard-design-principles)
- [30 Proven Dashboard Design Principles — Aufait UX](https://www.aufaitux.com/blog/dashboard-design-principles/)
- [Dashboard Design Best Practices for Product Teams — Figr](https://figr.design/blog/dashboard-design-best-practices)
- [The 5-second rule for executive dashboards — Customer Science](https://customerscience.com.au/customer-experience-2/designing-actionable-dashboards-the-5-second-rule-for-executives/)
- [Dashboard design 5 seconds rule — Den Otter Solutions](https://denottersolutions.com/en/data-insights/dashboard-design-5-seconds-rule/)
- [KPI Dashboard Presentation: Why Five Metrics Beat Fifteen — Winning Presentations](https://winningpresentations.com/kpi-dashboard-presentation-five-metrics/)
- [10 Questions to Ask When Designing a Dashboard — Arkatechture](https://www.arkatechture.com/blog/10-questions-to-ask-when-designing-a-dashboard)
- [5 questions to ask yourself for effective dashboard design — Explo](https://www.explo.co/blog/user-dashboard-design)
- [Dashboard Design: Best Practices With Examples — Toptal](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [Dashboard Design Patterns for Modern Web Apps — Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)

---

## 2. The question framework

The literature is mostly phrased as rules. Rules are hard to apply and easy to argue with, so it is
restated here as **17 questions a designer should be able to answer before drawing anything** — and
that a reviewer can use as a checklist afterwards. Each has this dashboard's answer.

The same 17 are readable in the page itself: the **"17 design questions"** tab, bottom-right.

### A · Purpose — who, what decision, how fast

**1. Who is the one person this screen is for, and what is their actual job?**
A retailer compliance admin (persona: Keith O'Sullivan, Primark). Their job is not analysis — it is
*chasing evidence before a filing date*. One primary user. Finance and supplier views are separate
screens, not extra widgets; multi-audience dashboards get ignored role by role.

**2. What decision does it drive, and how often is that decision made?**
"Who do I chase today so the return files on time?" — **daily**. Decision frequency determines the
dashboard type: daily → **operational**. That means ranked work and live status, not free exploration.
An analytical dashboard here would be the wrong product.

**3. What must a reader understand in the first five seconds?**
Three things: **not ready to file · 182 items sit with you · 12 days left.** The verdict block exists
only to say that. Everything below it is the explanation, in the order that supports the claim.

### B · Every number — is it good, is it moving, is it real

**4. For each metric: is that good? Compared with what?**
No bare numbers anywhere. Every tile carries value, denominator, percentage, **target, target date and
the remaining gap**, plus a progress track: "48/64 · 75% · target 64 by 30 Sep · 16 to go".
A number with no comparison cannot be judged, so it cannot be acted on.

**5. Which way is it moving — and fast enough to make the date?**
Week-on-week delta and an 8-week sparkline on every tile. The chart goes further and converts the
*rate* into a *date*: 61 approvals a week means the queue clears on 18 Sep, nine days after the
deadline. A rate the reader has to do arithmetic on is not an insight.

**6. Would anyone behave differently if this number changed? If not, cut it.**
v1's three-series bar chart ("approved / submitted / in progress") changed no decision — all three
went up together. Replaced with **submitted vs approved**, the one comparison that reveals the
bottleneck is internal. Four KPIs, not eight.

**7. Is every number on the same denominator — and does it agree with the page it drills into?**
All product figures are **/64** (the Products catalogue's real total) and supplier figures **/380**.
v1 mixed `/20` tiles with a "Showing 5 of 380 products" footer over a 64-product catalogue — three
different totals for the same set of things on one screen.

### C · Structure — where the eye lands

**8. Does the single most important thing occupy the top-left?**
Readers scan F/Z and spend most of their attention on the top and the left. The verdict runs across
the top, the four comparable KPIs sit second, tables sit last.

**9. Can the decision be made without scrolling?**
Verdict + KPI row + the head of the queue occupy the first ~550px — the **decision layer**. Trend,
funnel and tables are deliberately below the fold as the **explain layer**. Few's "single screen"
rule is honoured for the decision, not for the whole page; a product dashboard that refuses to scroll
just hides its detail somewhere worse.

**10. Is each display medium the right one — and is any variety meaningful?**
One bar chart (two series over time), four identical sparklines, one funnel. No second chart type
doing the same job. v1's 38px conic-gradient donut encoded three shares in a space too small to
compare them — removed.

### D · Action — can they do anything about it

**11. Can the reader act here, or only look?**
Every queue row, deadline and document carries its action inline: chase, remind, request, open the
queue. Nothing is a dead end, and the outcome replaces the button in place rather than flashing a
toast that disappears before it is read.

**12. Does each item say why it matters, in plain language?**
Each row states the **consequence and the date it bites** — "blocks 41 of 64 Declarations",
"becomes a blocker on 14 Oct" — not just the fault. This is the "one-line reason for the movement,
in plain language" from the executive-dashboard literature, applied per item.

**13. What does this screen look like on a good day?**
The empty state is designed, not left to chance, and it is *reachable*: handle both Documents items
in the queue, then switch to the Documents tab. Handled rows drop out of category counts and stay
readable under "All", struck through, with the outcome in place of the button.

### E · Trust — would you bet a filing on it

**14. How old is this data, and what scope am I looking at?**
A freshness stamp ("Updated 09:12 · 4 min ago") and explicit scope chips (period, markets, counts in
scope) sit above the verdict. An undated dashboard cannot be trusted, and an untrusted dashboard is
not acted on.

**15. Does it survive being read with no colour?**
Every status is a **glyph + a word**: ✓ Conformant · ! At risk · ✕ Non-conformant. v1 used bare
coloured dots — meaning carried in hue alone, WCAG 1.4.1.

**16. Does it survive small text, a tablet, and a screen reader?**
Nothing below **11px** (v1 ran 9–11px on 62% white); secondary text on `--tw2` (74%) not `--tw3`
(62%); breakpoints at 1180 / 900 / 680 with a scrolling table wrapper and 40px touch targets;
a real `h1`/`h2` outline instead of styled divs; `prefers-reduced-motion` honoured.

**17. Can the reader take the data away?**
"Export CSV" exports the view as shown, filters and all. Never trap the numbers inside the picture.

---

## 3. What changed, v1 → v02

| # | v1 | v02 | Question it answers |
|---|---|---|---|
| 1 | Opens with four coverage tiles — the reader assembles the conclusion | **Verdict banner**: headline claim, the reasoning in one sentence, two actions, a 12-day countdown | 3 |
| 2 | Tiles show `15/20` with a "review 5 outstanding" hint | Tiles show value, denominator, %, **target + target date + gap**, week delta, 8-week sparkline | 4, 5 |
| 3 | Three totals on one screen (`/20`, `380 products`, catalogue holds 64) | One denominator per thing: products `/64`, suppliers `/380` | 7 |
| 4 | 38px conic donut encoding 3 shares | Removed | 10 |
| 5 | No prioritised work anywhere — reader scans two tables | **"Act now" queue**: 7 items ranked by risk × deadline, each with the consequence and an inline action, filterable by category | 2, 11, 12 |
| 6 | No deadlines on the page at all | **Filing deadlines** rail — next 60 days, each with what it needs and what is outstanding | 1, 2, 14 |
| 7 | 7-row supplier invitations table (a listing, on a dashboard) | **Funnel band** — invited → opened → submitted → approved, with the "approved by you" stage flagged **Bottleneck**; the listing stays on the Tracker page where it belongs | 6, 9 |
| 8 | Chart: 3 series × 7 days, no baseline, no words | Chart: 2 series, a **"needed: 13/day"** target line, and a written takeaway that converts the rate into a date | 5, 6, 10 |
| 9 | Status = coloured `●` | Status = glyph + word chip | 15 |
| 10 | ~40 hardcoded status hex values inline, already drifted (`#ff9c96` vs `#e05252` both meaning "red") | Every colour a token (`--status-ok/warn/danger/info`); the Light twin needs only a surface reassertion block | audit P2 |
| 11 | 9–11px text on 62% white | 11px floor (the only 10px left is a glyph inside a 14px status disc), secondary text on 74% | 16 |
| 12 | Fixed `repeat(4,1fr)` grid, 5- and 7-column tables, no breakpoints | 1180 / 900 / 680 breakpoints, scrolling table wrapper, 40px targets under 680 | 16 |
| 13 | `.pg-title` and card headers are `div`s | `h1` + eight `h2`s | 16 |
| 14 | Entrance engine pre-hides with `opacity:0` and never checks `prefers-reduced-motion`; a background tab freezes it permanently | Reduced motion jumps to the end state; a hidden tab plays on first reveal; a safety timer force-clears every hidden state after the timeline | 16 |
| 15 | An action fires and the row looks unchanged | Every action's outcome is written back into the row (done chip, struck-through title, category count drops) | 11, 13 |
| 16 | No freshness, no scope, no export | Freshness stamp, period + market scope chips, Export CSV | 14, 17 |
| 17 | No empty state | Designed and reachable empty state | 13 |

## 4. Known gaps / deliberately not done

- **The numbers are still mock data**, now internally consistent (64 products = 51 + 8 + 5;
  380 suppliers = 47 pending + 62 in progress + 182 submitted + 77 approved + 12 overdue;
  143 submitted − 61 approved = the 82-item weekly queue growth quoted in the takeaway).
  They do **not** match the v1 dashboard's numbers, on purpose — v1's were mutually contradictory.
- **Loading / stale / error states** are not built. The research calls for them; only the empty
  state was in scope here.
- **Personalisation** (reorder or hide modules) is not built. Category filters and the density of
  the queue cover the useful 20% of it.
- The reviewer-aid drawer (`.d2-rat*`, the "17 design questions" tab and its `<aside>`) is **not
  product UI** — delete that block and its CSS to ship the page.
- `greenstreets-theme.js` in this portal is a fork that lacks `ensureMain()`, the skip-link and
  `GSKeyboardEnable()` (present in the repo-root copy). So this page has no `main` landmark and no
  skip link — same as every other Retailer Admin page. Fixing that belongs in the portal's theme
  file, not here.


---

## 5. Dashboard 03 — the essentials cut

**The brief:** far less information, absolute essentials only, so the reader is not overwhelmed —
plus a clear view of (a) the products/packaging that do not meet PPWR and (b) the suppliers who are
not sending their packaging data.

### What it is

Four things on the page and nothing else:

1. **Header** — title, "Updated 09:12", a bell, and one "More detail" link to v02.
2. **The verdict** — two sentences and two buttons that scroll to the two lists, plus the 12-day
   countdown to the Repak Ireland return.
3. **Products that do not meet PPWR** — all 13, with the article, the measured value against the
   required value, a Fails/At-risk chip, and one action per row.
4. **Suppliers who have not sent their packaging data** — the 12 overdue, worst first, with what is
   missing, how many products it blocks, how late it is, last activity, and one action per row.

### What was removed from v02, and why

| Removed | Why it is not essential here |
|---|---|
| The 4-tile KPI band + sparklines | Coverage percentages describe the situation; they are not the work. The two counts now live in the card headers. |
| Submitted-vs-approved trend chart | A rate question, not a "who do I chase" question. |
| Supplier funnel band | Same information as "12 overdue" at five times the pixels. |
| Filing-deadlines rail (4 rows) | Only the nearest deadline changes today's behaviour — it is the countdown in the verdict. |
| Documents-expiring card + preview modal | A different job (document hygiene), not PPWR conformity or supplier chasing. |
| Notification dropdown, scope chips, Export chip | Chrome. The bell still links to the Notifications page. |
| The "Act now" ranked queue | v03's two lists *are* the queue, sorted by severity and by lateness. |
| The 17-question reviewer drawer | Reviewer aid; it belongs on v02. |

Result: **8 content blocks → 3**, and the file is roughly half v02's size (53 KB vs 99 KB).

### Two decisions worth challenging

- **Both lists are complete — 13 rows and 12 rows, not "top 5 + view all".** Truncating a
  25-item problem list does not reduce the work, it just moves it to another page, which is more
  clicks and more overwhelm, not less. The page is ~2.9 screens tall as a result; the verdict and the
  head of the first list are above the fold, so the *answer* is still immediate. If you would rather
  cap each list at 5 rows with a "show the other N" disclosure, that is a one-line change.
- **The one filter kept is "which PPWR article".** Chips for Art. 5 · 2, Art. 7 · 6, Art. 9 · 3,
  Art. 10 · 2 — because "which requirement is biting us" is the second question every reader asks
  after "how many". The footer restates the count in words when a chip is active, and there is a
  designed empty state for an article with no failures.

### PPWR article numbering

The articles follow **this portal's own PPWR checklist** (the Generate-DoC page), not the published
regulation's numbering, so the dashboard agrees with the page it drills into:

| | |
|---|---|
| Art. 5 | PFAS limits for food-contact packaging |
| Art. 6 | Restrictions on hazardous substances |
| Art. 7 | Recycled content minimum targets |
| Art. 9 | Recyclability by design |
| Art. 10 | Packaging minimisation |

If the real EU numbering is ever adopted, change it in the Generate-DoC checklist first and let the
dashboards follow.

### Numbers (internally consistent, and consistent with v02)

- 13 of 64 products fail or risk failing PPWR = **5 non-conformant + 8 at risk**; the other 51 pass.
  Same split as v02.
- By article: 2 + 6 + 3 + 2 = 13.
- 12 of 380 suppliers are overdue; between them they block **21 products**
  (4+3+2+3+2+1+1+1+1+1+1+1). 109 have not submitted, so 97 are still inside their window.
- The verdict keeps the two failure modes distinct: 13 products **fail a check**, while another 21
  **cannot be checked at all** because the data has not arrived.

### Carried over from v02

Status is always glyph + word; every colour is a token so the `-Light` twin needs only a surface
reassertion block; type floor 11.5px (the only 10px is a glyph inside a 15px status disc); `h1` + `h2`
outline; breakpoints at 1100 / 900 / 680 with a scrolling table wrapper and 40px touch targets; and
the same three entrance-animation safeguards (reduced motion, hidden tab, safety timer).
