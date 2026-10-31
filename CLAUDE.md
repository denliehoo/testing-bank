# Meridian Banking: project conventions

Spec lives in `brief/candidate-brief.md` (read it first), `brief/api-contract.md`, `wireframes/wireframe.md`. Working plan and workflow: `PLAN.md` (local only).

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck` · `npm run check` (lint + typecheck + tests) · `npm run build`

Run `npm run check` before proposing any commit.

## Commits

Use Conventional Commits: `<type>: <summary>` in lowercase imperative, e.g. `feat: add dashboard transaction list`, `fix: keep amount on back`, `chore: add project conventions`. Common types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`, `ci`. Don't commit without the owner's review.

## Hard rules

- **Don't edit** `mock-api/`, `src/mocks/`, or the seed data. Override responses inside a test with `server.use(...)`.
- **No new dependencies** without asking the user first. Prefer platform features (native `<dialog>`, inline SVG icons).
- **No React Compiler, no `useMemo`/`memo`/`useCallback`** unless a measured problem justifies it. The lists are tiny.
- **No hard-coded colours** in components or CSS Modules. Use only the CSS variables from `brief/design-tokens.css`. Check with: `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.css --include=*.tsx` (only the tokens import may match).
- **TypeScript strict, no `any`.** Use the types in `src/api/types.ts`.
- **Server data lives only in TanStack Query.** Never copy it into `useState` or a store. Don't compute-and-store totals; derive them.
- **No `fetch` in components and no data fetching in `useEffect`.** All calls go through `apiFetch` in a typed API layer.
- **Each validation rule is defined once** (one Zod schema), used for both inline errors and submit.
- **Use `formatMoney` / `formatShortDate`** from `src/lib/format.ts`. Use the exact copy strings in brief §4.
- **No console errors** when the app works normally.

## Structure

- `src/components/`: reusable, feature-agnostic UI (`Button`, `Skeleton`, `EmptyState`, `InlineError`, `SearchInput`, …). If a component knows nothing about banking or transfer data, it goes here.
- `src/features/dashboard/`, `src/features/transfer/`: feature components, hooks, queries, schema.
- `src/api/`: client, types, query functions. `src/lib/`: pure helpers.

## Style

- Styling with CSS Modules (`Component.module.css`) using tokens. Spacing on the 8px scale. Breakpoints 640px and 1024px.
- Function components, named props interfaces, ref as a prop (no `forwardRef`).
- Every input has a `<label>`. Field errors are linked with `aria-describedby`. Send error uses `role="alert"`. Success is announced via `aria-live`.
- Tests: Testing Library, query by role/label/text, assert behaviour not implementation. Compare money against `formatMoney(...)`.
- Match the surrounding code's naming and comment density. Comment the *why*, not the *what*.
