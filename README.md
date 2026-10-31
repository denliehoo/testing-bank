# Meridian Banking — Denlie Hoo

- Deployed: https://testing-bank-rosy.vercel.app/
- Run locally: `npm install && npm run dev`
- Checks: `npm run check` (lint, typecheck, tests) · `npm run build` · `npm run test:e2e` (one-off setup: `npx playwright install chromium`)

A single-page banking dashboard with a three-step transfer dialog. React 19, TypeScript (strict), Vite, TanStack Query, React Hook Form + Zod, MSW, Vitest. The only dependency added to the starter is `@playwright/test` (dev), for the one end-to-end test.

## Project structure

```
src/
  api/            apiFetch client, response types, query definitions, shared query keys, sendTransfer
  lib/            pure helpers: formatMoney/formatShortDate, balance maths, theme + segment hooks
  components/     reusable UI that knows nothing about banking: Button, Dialog, Stepper, Field,
                  SearchInput, Skeleton, EmptyState, InlineError, Layout, VisuallyHidden
  features/
    shell/        header, segment switch, theme toggle, avatar
    dashboard/    page, balance hero, accounts, recent transactions, daily limit, useDashboard
    transfer/     schema.ts (every validation rule), the three steps, success panel,
                  transfer-dialog/ (the form, step list, send mutation, request mapping)
  e2e/            Playwright test of the main flow, run against the production build
  test/           test setup, MSW server, shared helpers, <dialog> stand-in for jsdom
public/theme-init.js   sets the theme and segment before the first paint
```

A component is a folder (`index.tsx` + `index.module.css`). Code used by one component sits in that component's folder; code shared by several components of a feature sits at the feature root. Conventions are written down in `CLAUDE.md`.

## Decisions and trade-offs

**Server state vs UI state.** All server data lives in TanStack Query, read through `queryOptions` that unwrap the response envelopes. Totals, the deposit-account count and the remaining daily limit are derived on every render and never stored. `useState` only holds UI state: the search text, the step, whether the dialog is open.

**Search asks the API.** Typing waits 300ms for a pause, then requests `GET /api/transactions?q=…&limit=8`: the latest eight transactions whose description or category matches, across all history, so "netflix" finds a payment that isn't among the eight on screen. The panel keeps its size, and the previous results stay up, dimmed and marked `aria-busy`, while the next ones load, but only if they can stand in for the new search, i.e. you're adding characters (`g`, then `gr`: the rows for `gr` are a subset of those for `g`). After deleting characters, clearing the box or typing a new word, the recent list shows (dimmed) until the right results arrive, so a longer or different search's rows (or its "no matches") are never shown for the wrong text. Clearing the box goes straight back to the recent list. The list is capped at eight rows, so when more than that matched, the count in the search field (D6) reads `8+ results`; otherwise it's the exact number. I chose that over the API's `total` ("14 results" above eight rows looked odd) and over a plain "8 results" (it would read as if that were all there are), and it needs no "showing 8 of 14" line. The rows are always the most recent matches. With the search box empty the panel shows the normal recent list. The API contract also allows filtering the eight loaded rows in the browser; I tried that first and rejected it because a search that can't see older transactions felt wrong. The cost is a debounce, one query key per term and a small error state; search requests share the `transactions` key prefix, so a transfer invalidates them too.

**After a transfer I invalidate** customer, accounts and transactions instead of patching the cache from the response. A balance in a bank should never drift from the server, and the response has no transaction object to insert anyway. The mutation returns the invalidation promise, so "Transfer sent" only appears once the dashboard behind it is already up to date. The cost is three refetches and a slightly longer `Sending…`.

**One form, one schema.** A single `useForm` spans the three steps, so `Back` keeps everything. Every rule and message from the brief lives once in `createTransferSchema`, which is a factory because two rules need live data (the chosen account's balance and the remaining daily limit). It is a single `superRefine` because the amount rule reads two fields. Continue validates only the current step's fields and focuses the first invalid one; fields are checked on blur and then as you fix them. The amount and account number are `type="text"` with `inputMode`, not `type="number"`: no scroll-wheel or arrow-key changes, no `e` or `-`, leading zeros are kept, and our own error messages can fire.

**Native `<dialog>`.** The browser provides the focus trap, the inert background and Esc. We add the layout (centred on desktop, full-screen below 1024px) and return focus to the `New transfer` button through an explicit ref, because Safari doesn't focus a button on click. All closes (Esc, ✕, Cancel, Back to dashboard) go through the dialog's `close` event so that focus handling lives in one place. Closing is blocked while a transfer is sending, so the success screen can't be lost. jsdom has no `showModal`, so `src/test/dialog-stub.ts` provides a small stand-in. The transfer form is mounted only while the dialog is open, so each opening starts fresh with no reset code.

**Send errors.** As the brief asks, a failed send stays on the review step with the data intact, shows a `role="alert"` and lets the user retry. If the API rejects with a reason (400/422) the alert shows its message; anything else (500, the `#fail` note, network) shows the standard copy. I deliberately did not add special handling per error type; see "Not done".

**Theme and segment.** `public/theme-init.js` is a render-blocking classic script, because a module is deferred (and `main.tsx` waits for MSW), which would flash the wrong theme. It duplicates the storage keys because a plain script can't import from `src/`. The `data-*` attributes on `<html>` are the source of truth, and React reads them with `useSyncExternalStore` + `MutationObserver`.

*Segment on first load.* The segment is the user's stored choice, else the API's `customer.segment`, else retail. A returning visitor's choice is applied before the first paint, so refreshing never changes colour. On a first visit with nothing stored, the segment isn't known until the customer request returns. Instead of painting a default colour and then switching (e.g. Retail blue, then Premium crimson on refresh), the header, greeting and hero card show neutral placeholders until the customer loads, and the brand colour is applied once. I preferred this to a full-screen loader because the brief asks for loading states that keep the layout still, and most of the page's structure is segment-independent. I did not save the API's default into storage: "stored" should mean the user's own choice, so a later change on the server still applies. The customer request still runs in parallel with the others.

**Layout.** Only the brief's two breakpoints are used. At 1024px the page goes from one column (and a full-screen dialog) to a main column plus a 300px rail, and the Retail/Premium switch moves into the header. At 640px the switch moves onto the greeting's row. Between 360 and 1023px nothing else needed to change; I checked for horizontal overflow and layout shift at 360/390/639/640/760/1023/1280. Media queries can't read CSS variables, so the values are literals; `@custom-media` would define them once but needs a build plugin. The hero card uses the brief's gradient tokens, so the segment is visible on the main card; on the gradient the primary button is inverted so it (and its focus ring) don't blend in.

**Assumptions and choices the brief leaves open**
- The fee is `SGD 0.00`, fixed in the review step as the brief states. There's no fee in the API; a real app would get it from the API and add it to the total.
- Payees: the API has no paging or search and the seed has four. All payees are listed and filtered in the browser. A real bank would need server-side search and paging.
- The bank `<select>` is hard-coded (alphabetical, the four banks in the seed data plus three more). There is no banks endpoint; a real app would load the list from one. A native select supports type-to-jump, so I didn't build a searchable combobox.
- The dashboard shows its error state if any of its three requests fails (also after a refetch), rather than showing balances that might be stale.
- No React Compiler and no `useMemo`/`memo`: the lists are tiny and nothing was measured.
- No hamburger menu on mobile: it would hold only the inert Cards/Payments/Insights items.

**Accessibility.** Every input has a label, errors are linked with `aria-describedby`, the send error is `role="alert"`, the success panel sits in a persistent `aria-live` region, and the payee list is a radio group usable by keyboard. I checked in headless Chrome against the production build: no horizontal overflow and tap targets of at least 44px from 360 to 1280px, text contrast at WCAG AA in all four theme × segment combinations, a visible focus ring on every focusable element, and no console errors during a full transfer.

## Loading, empty and error states

All three are built for the dashboard. Skeletons use the same CSS as the real content (heights in `lh`), so nothing jumps when data arrives. Add the hooks from the API contract to the page URL; `apiFetch` forwards them to every request.

| To see | Open |
| --- | --- |
| Loading | `/?delay=1500` |
| Dashboard error + Retry | `/?scenario=error` (Retry fails again while the parameter is in the URL; remove it and reload to recover) |
| Empty accounts / transactions / payees | `/?scenario=empty` (the transfer dialog then shows "You don't have any saved payees yet.") |
| Send failure | In the transfer, type `#fail` in the note |
| Search results | Type `grab` in Recent transactions (`1 result`) |
| More matches than rows | Type `t` (`8+ results`, the list is capped at eight) |
| No search results | Type `zzz` |
| Search loading | Open `/?delay=1500`, then type: the list dims until the results arrive |

## Tests

`npm test` renders the real app against the mock API and asserts what the user sees.

- The three required ones: an amount over the balance shows the message and sends **no request** (a handler counts calls); a successful transfer shows `Transfer sent` and the dashboard shows the new balance, transaction and remaining limit; a failed dashboard request shows the error and `Retry` loads it.
- A `#fail` transfer stays on review with an alert; an API rejection shows its reason.
- A table-driven test of the schema (empty/invalid/too many decimals/below minimum/over balance/over limit, 8-digit account number, name and note length).
- Search (by description and category, including a match older than the eight rows first shown, the count, and no results), theme and segment switching (including that they're remembered), and using the payee list from the keyboard. These cover required behaviour that is easy to break unnoticed.

I checked that the tests can fail: removing the balance rule or the invalidation makes the relevant ones fail. Not covered: dialog focus handling (jsdom has no real `<dialog>`; I checked it by hand in Chrome) and visual checks such as contrast and the theme flash. 

**End-to-end.** `npm run test:e2e` builds the app, serves it with `vite preview` and runs a single happy-path test in Chromium: open the dashboard, send SGD 120 to Jamie Tan through the three steps, check the success screen and reference, and check that the balance, the new transaction and the remaining limit have updated, with no console errors. The mock API runs in the service worker exactly as on the deployed site, so it exercises the real build. I kept it to one test on purpose: the Vitest tests cover the cases and the edge cases, and this one only needs to prove the whole thing is wired together. Playwright is the one added dependency (dev only); it isn't part of `npm run check` because it needs a browser download.

## AI use

I used Claude Code throughout: reading the brief, planning the work, writing first versions of components, and running checks. I worked one step at a time, reviewed the code before every commit, and kept the conventions in `CLAUDE.md` so the tool followed them. I also had a second AI session with no prior context review the finished code against the brief, the wireframes and the API contract, and I checked the tests by breaking the code on purpose to see them fail.

Examples of things I rejected or fixed:

- **Search.** The AI built extra UI around the count (a longer result list and a "Showing X of Y" line), and I removed it. I also noticed that searching only the eight rows on screen can't find an older transaction, so I had it search through the API, still showing at most eight rows. Testing that turned up two bugs in how it kept the previous results on screen while typing: the old search's rows reappeared after clearing the box, and a shorter search showed "no matches" because a longer one had none. The rule that fixes both is described under Decisions.
- **Error handling.** It mapped API field errors back onto the form inputs and sent the user back to an earlier step. That went beyond the brief (stay on the review step, show an alert, allow retry), so I had it removed. The idea is under "Not done".
- **Smaller things I found by using the app:** a clipped search placeholder at 390px, the header resizing across 1024px, the `New transfer` button floating over the sticky header, a bright line down the hero card's edge, and a hard-coded avatar.

## Not done / known issues

**Known issues and gaps**

- **Error handling beyond the brief.** With stable error codes from the backend, I'd handle them specifically: on `INSUFFICIENT_FUNDS` or `DAILY_LIMIT_EXCEEDED` refetch the customer and accounts (the cached figures are stale, which is probably why it happened), show the API's field message under the input, and return the user to that step.
- A payee that is selected and then hidden by the payee search stays selected (the review step shows who it is). Moving between steps doesn't move focus or announce the new step to screen readers.
- Input borders use the brief's `--border-strong`, which is about 1.5:1 against the surface (light) and 1.8:1 (dark), below the 3:1 WCAG suggests for UI boundaries. I may only use the brief's tokens; a real design system would darken it. No screen-reader pass (VoiceOver/NVDA) was done.
- While search results load, the transaction list is dimmed to 40% opacity, which is below AA contrast for that moment (like a disabled control); it returns to full contrast when the results arrive.
- With `?scenario=empty` there are no accounts, so a transfer can't be completed from that state.
- A failure in any one of the three dashboard requests hides the whole dashboard. Isolating the transactions panel (inline error + Retry) would be a small change.
- The greeting is always `Good evening, Ava`. I noticed that this is odd at other times of day, but the brief says to use it as written and that it doesn't need to change with the time of day, so I followed it (which is also why I left out the optional date line, which would sit awkwardly under it). In production I'd choose the greeting from the user's local time.
- Cards, Payments and Insights are intentionally disabled (out of scope). No favicon asset was supplied, so the page uses an empty icon to avoid a 404 in the console.

**Optional items from the brief**

- Done: `Make another transfer` on the success screen (marked optional in the wireframe), and one end-to-end test.
- Not done: the daily-limit progress bar, the `Discard this transfer?` confirmation, a debug menu for the error/empty states (the hooks work from the URL, see above), a balance-hide toggle, a third segment, a `#transfer` deep link, a CI workflow (`npm run check` and `npm run build` on pull requests) and the optional date line under the greeting. I put my time into the required flows, tests and states instead.
