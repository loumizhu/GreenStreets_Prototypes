# Dual-role users: Retailer + Supplier without logging out

**Status:** Draft · 2026-09-23
**Method:** [User Flow Specs](https://github.com/rae-pendergrass/user-flow-specs). Each step answers *What they want / What they see / What they do / What happens*. Specs cover behaviour only; visual choices are left for the prototype and marked *(prototype-phase decision: …)*.

---

## 1. The problem

Two real situations:

| Case | Example |
|---|---|
| **A. One company, two roles** | A retailer with its own-brand manufacturing arm, which also supplies another retailer. |
| **B. One person, two companies** | A compliance consultant or group employee who works for a retailer *and* a supplier. |

Today each portal has its own login. Switching between them costs a logout and a login, the user loses their place, supplier deadlines slip, and people are tempted to share passwords.

## 2. Recommendation: one sign-in, many workspaces

| Option | Verdict | Why |
|---|---|---|
| Separate accounts with log out / log in (today) | ✗ Reject | Friction, lost context, password reuse |
| One merged portal (retailer + supplier menus in one sidebar) | ✗ Reject | Mixes two mental models, makes "whose data is this?" ambiguous, muddies the audit trail, and risks permissions leaking between roles |
| Separate browser profiles | ~ Workaround | It isn't a product answer |
| **One sign-in + a workspace switcher** | ✓ **Recommend** | A pattern people already know (Slack workspaces, Google account switcher, GitHub orgs, Shopify stores). No re-login, and each portal stays focused |

**Model:** one **Person** (one login, one MFA) has many **Memberships**. A membership is an *Organisation × Role* (Retailer Admin · Retailer User · Supplier). A **workspace** is one membership, and the active workspace decides which portal is shown. This covers both case A and case B.

## 3. Requirements

- **R1** One sign-in covers every membership. Switching never asks for the password or MFA again within the session.
- **R2** The switcher can be reached from every screen in 2 actions or fewer, and by keyboard.
- **R3** The active workspace (organisation + role) is always clear, in text and not only in colour.
- **R4** Pending work in the *other* workspaces is visible without switching.
- **R5** Deep links (email, notification) open in the right workspace automatically.
- **R6** Switching never discards unsaved input.
- **R7** Two workspaces can be open side by side in separate tabs, with the workspace carried in the URL.
- **R8** Every action is recorded against the workspace it was taken in, and permissions never cross workspaces.
- **R9** When a retailer request is addressed to a supplier organisation the user also belongs to, they can act on it directly.

**Out of scope:** reporting that merges data across organisations, and Super Admin *Impersonate* (the existing `s6` mechanism stays separate).

---

## Flow Spec 01: Do supplier work mid-task, then come back

**Goal:** A retailer admin who is also a supplier wants to clear an urgent supplier request now, then pick up their retailer work where they left it.
**Covers:** R1, R2, R3, R4, R6, R7, R8

### Entry Points
- **From any Retailer Admin screen:** the user sees that their supplier workspace has overdue work.
- **From the Supplier Portal:** the same flow in reverse (supplier to retailer).

### Step 1: Notice the other workspace needs them
**What they want:** to know whether anything is waiting elsewhere, without leaving.
**What they see:** the account area (the RA/RU sidebar `.sb-user` and the Supplier Portal header account menu) shows the current workspace (org + role) and an indicator counting open items in other workspaces.
**What they do:** open the workspace switcher by clicking it or using a keyboard shortcut. *(prototype-phase decision: the shortcut must not clash with browser shortcuts. A "Switch to…" entry in a command palette is an option.)*
**What happens:** the switcher opens and focus moves to the list.

### Step 2: Pick the workspace
**What they want:** to go straight to the one that is due.
**What they see:** workspaces grouped by organisation. Each row shows org name, role, open-item count and the soonest due date. The current workspace is marked, the most recent comes first, and a search field appears when there are more than 5 workspaces. Each row also has an "Open in new tab" action (R7).
**What they do:** choose "Acme Ltd · Supplier".
**What happens:** the portal changes in place with no login. The user lands on the last page they visited in that workspace (the dashboard the first time). A short notice confirms the switch and is announced to screen readers. The URL now names the workspace.

### Step 3: Do the work
**What they want:** to finish the request without doubting which company they are acting for.
**What they see:** the normal Supplier Portal, with the active workspace (org + role) always visible. Any confirmation for a send, submit or delete names the workspace (draft copy: "Submit as Acme Ltd · Supplier?").
**What they do:** complete and submit the packaging data.
**What happens:** the submission is saved and recorded under the supplier workspace (R8).

### Step 4: Return
**What they want:** to be back exactly where they were.
**What they see:** the switcher offers a one-step return to the previous workspace and page (draft copy: "Back to Primark · Retailer Admin — Products").
**What they do:** choose it.
**What happens:** the retailer workspace reopens on the same page, with its filters, sort and scroll position restored.

### Edge Cases
| Scenario | What the user sees |
|---|---|
| Unsaved input when switching | Drafts are autosaved. A dialog offers "Save draft & switch" or "Stay". There is no silent discard. |
| Switch is loading | The current workspace stays on screen with a progress notice, with no blank flash. |
| Switch fails (network error) | The user stays in the current workspace, with an error and a Retry action. |
| Membership revoked since sign-in | The row is disabled and gives the reason and who to contact. |
| Only one membership | The account area shows the workspace and no switch action. It is empty of switcher controls. |
| Session expired | The user re-authenticates once, then continues to the chosen workspace. |

### UX Notes
- The switcher lives where people look to answer "who am I?", the account area (Jakob's law, from familiar SaaS apps).
- A persistent, text-labelled workspace indicator is the main guard against acting in the wrong workspace. *(prototype-phase decision: whether each role also gets its own accent, always paired with the text label, WCAG 1.4.1)*
- Each workspace remembers its own last location, so switching is cheap enough to do casually.

### Prototype Scope
- The account area with the workspace indicator and a pending-work count, in RA, RU and SP.
- The open switcher: 3 workspaces across 2 organisations, the current one marked, with counts and due dates.
- The switch-confirmation notice and the "Back to…" return option.
- The unsaved-input dialog on the Component Wizard.
- Dark and `-Light` twins of each.

---

## Flow Spec 02: Answer a request addressed to my own supplier org

**Goal:** A retailer admin sending a data or DoC request to a supplier they also belong to wants to fulfil it straight away, with no email round-trip.
**Covers:** R5, R8, R9

### Entry Points
- **From RA DoC Request / Product Detail / Send Invites:** a supplier they are a member of has been selected.
- **From an email or notification deep link:** the request arrives addressed to their supplier workspace.

### Step 1: Send the request
**What they want:** to get the data they need for the product.
**What they see:** the supplier picker marks suppliers the user belongs to (draft copy: "You're a member").
**What they do:** send the request.
**What happens:** the request is created as normal and recorded under the retailer workspace. The confirmation adds a secondary action (draft copy: "Respond now as Acme Ltd").

### Step 2: Jump to respond
**What they want:** to skip waiting for their own email.
**What they see:** the "Respond now" action.
**What they do:** choose it.
**What happens:** the portal switches to the supplier workspace and opens that exact request, with a return link back to the retailer product.

### Step 3: Submit and return
**What they want:** to see the request close on the retailer side.
**What they see:** the standard supplier submission.
**What they do:** submit, then follow the return link.
**What happens:** the retailer product detail shows the updated request status. The audit trail shows two entries, one per role, by the same person.

### Edge Cases
| Scenario | What the user sees |
|---|---|
| The supplier membership is read-only | No "Respond now". "Notify Acme's team" is offered instead. |
| Deep link opened while in another workspace | The portal switches automatically and shows a notice naming the new workspace. |
| Deep link opened while signed out | Sign in, then land on the linked request, skipping the workspace chooser. |
| Link to a workspace the user doesn't belong to | An access message and "Request access". It reveals no request data. |
| Request already answered by a teammate | The request opens read-only and shows who answered it. The response form is empty of input fields. |
| Switch to respond is loading or fails | The same loading and error behaviour as Flow Spec 01: the current workspace stays on screen, with Retry. |

### UX Notes
- This removes a whole email loop for self-supplied products, which is the biggest time saving in case A.
- *(Pending Decision: when the same person is both requester and supplier, does the DoC need a second person to verify it? This is a compliance call for the product owner.)*

### Prototype Scope
- The RA supplier picker row showing "You're a member".
- The RA request-sent confirmation with "Respond now".
- The SP request view with a return link to the retailer product.
- The RA audit-log entry pair (same person, two roles).

---

## Flow Spec 03: Sign in with more than one workspace

**Goal:** A dual-role user wants to land where their work is as soon as they sign in.
**Covers:** R1, R4, R5

### Entry Point
- **From any portal's Login page:** every login page becomes one front door that accepts any account.

### Step 1: Sign in and choose
**What they want:** to start on the most urgent work.
**What they see:** with one membership, nothing extra, and they go straight in. With several, a workspace chooser like the switcher list (counts + due dates), with a "Make this my default" option.
**What they do:** pick a workspace.
**What happens:** they land in it. On later sign-ins the chooser is skipped and they go to the default (or last used) workspace. The switcher is always one step away.

### Edge Cases
| Scenario | What the user sees |
|---|---|
| Arrived through a deep link | The chooser is skipped and they go to the link's workspace. |
| No active memberships | An empty-state message with who to contact. |
| Counts still loading | The workspaces are listed and selectable straight away. Counts fill in once they load. |
| Chooser fails to load counts | The workspaces are listed without counts. Counts are never allowed to block sign-in. |

### UX Notes
- Remembering the default keeps the switch cost at zero for single-focus days.

### Prototype Scope
- The workspace chooser after login (3 workspaces), plus its "no memberships" empty state.

---

## Screens touched

| Screen | Flow specs |
|---|---|
| Account area / workspace switcher (RA, RU, SP) | 01, 02, 03 |
| Login → workspace chooser | 03 |
| RA DoC Request, Send Invites, Product Detail | 02 |
| SP request / packaging form, Component Wizard | 01, 02 |
| RA Audit Log | 01, 02 |

## Open decisions
1. **Data model:** is case A one organisation holding two roles, or two linked organisations? The membership model supports both, so this needs confirming with the backend team.
2. **Self-declared DoC:** is second-person verification required? (Flow Spec 02)
3. **Keyboard shortcut** for the switcher.
4. **Impersonate:** should Super Admin reuse the same workspace indicator, with a distinct "viewing as" label? Recommended.
