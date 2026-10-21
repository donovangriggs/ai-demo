# Loading, error and not-found states

Type: grilling
Status: resolved
Parent: [Pokédex app map](../map.md)

## Question

What does the user see in each state that isn't the happy path, given [Choose the data-fetching strategy](03-data-fetching-strategy.md) and [Look and feel of the list and detail pages](04-look-and-feel.md)?

- `/pokemon/999` and `/pokemon/abc`: a `not-found.tsx` design, and whether it sits inside the sidebar layout.
- A search with no matches.
- The detail pane while an uncached page renders (`loading.tsx`, Suspense skeleton, or nothing, given that all 151 are prerendered).
- PokéAPI being unreachable or returning an error during dev or build (`error.tsx` in the layout and the page, and whether a build should fail).
- What `/` shows before a Species is selected.

## Answer

- **`/` before a Species is selected (desktop)**: the sidebar plus an **empty-state detail pane** with a quiet "Select a Pokémon" hint. There's no redirect. On narrow screens `/` stays list-only, as decided in [Look and feel of the list and detail pages](04-look-and-feel.md).
- **Not found (`/pokemon/999`, `/pokemon/abc`)**: the page calls `notFound()` before fetching (see [Choose the data-fetching strategy](03-data-fetching-strategy.md)). This renders a `not-found.tsx` in the pokemon segment, **inside the sidebar layout**, saying: "No Species #999. This Pokédex covers #1–151", with a link to #1. Any other unknown URL gets a plain root `not-found.tsx`.
- **Empty search**: the sidebar shows "No Species match “zzz”" and a **Clear search** button that empties the input and removes `?q=`. The detail pane is unaffected.
- **Loading**: `loading.tsx` in the `[id]` segment shows a **skeleton shaped like the detail pane** (artwork box, Base Stat bars, badge rows), while the sidebar stays interactive. In practice this shows in `npm run dev` on a first visit, because builds prerender all 151.
- **PokéAPI failures**:
  - **Detail data fails**: `error.tsx` in the `[id]` segment says "Couldn't reach PokéAPI", with a **Retry** button (`reset`). The sidebar stays.
  - **Sidebar list or Types fail**: a layout can't catch its own errors, so a **full-page** boundary above the sidebar layout says "Couldn't load the Pokédex", with Retry. If the sidebar layout is a nested (route-group) layout, that boundary is the root `error.tsx`. If the sidebar lives in the root layout, it must be `global-error.tsx`. This is settled in [Module boundaries and folder layout](08-module-boundaries.md).
  - **Resource functions throw on any non-2xx response**, so a failure is never cached as data. Verify during implementation that a thrown error inside `'use cache'` leaves no cache entry.
  - **`next build` fails loudly** if any PokéAPI call fails, so no partial or empty pages are produced.
