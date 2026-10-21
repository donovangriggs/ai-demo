# 06: Loading and error states

**What to build:**
- While an uncached Species renders, the detail pane shows a skeleton shaped like the detail layout.
- If PokéAPI fails while loading a Species, the pane says "Couldn't reach PokéAPI" with a Retry button, and the sidebar stays usable.
- If the list itself can't load, a full-page "Couldn't load the Pokédex" with Retry is shown.
- Unknown URLs outside the Pokédex get a plain 404 without the sidebar.
- A failure is never cached, and a build with PokéAPI failures fails loudly.

Spec: [spec.md](../../pokedex/spec.md), §3 Routes, §8 Done when, §9 Verify during implementation. Decision: [Loading, error and not-found states](../../pokedex/issues/07-loading-error-not-found-states.md).

**Blocked by:** 04 (Species detail: header, Base Stats, Abilities).

**Status:** resolved

- [x] The detail segment's loading state renders a `DetailSkeleton` (artwork box, stat bars, badge rows) while the sidebar stays interactive. This is visible on a first visit in `npm run dev`.
- [x] The detail segment's error boundary shows "Couldn't reach PokéAPI" with Retry (`reset`) inside the layout.
- [x] The root error boundary, which sits above the `(dex)` layout, shows the full-page "Couldn't load the Pokédex" with Retry when `getPokedex()` fails.
- [x] The root not-found shows a plain 404 for URLs like `/foo`.
- [x] **Verified** that a thrown error inside a `'use cache'` fetcher leaves no cache entry: after simulating a failure and then restoring access, Retry succeeds without restarting the dev server. If it does leave an entry, stop and raise it instead of working around it.
- [x] A PokéAPI failure during `npm run build` makes the build fail, rather than producing partial or empty pages.

## Comments

- Implemented on integration branch `pokedex-build` in 95aae1b, a434345. Code-review fixes across all tickets are in 9028692. On `pokedex-build`, 81 tests pass, and tsc, lint and the build (151 prerendered detail pages) are clean.
