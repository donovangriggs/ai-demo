# Favorites and a random Species on load

**Status:** resolved

## Problem Statement

A visitor browsing the Pokédex can't keep track of the Species they care about. Every visit starts from 151 rows, and the only way to get back to a Species is to remember its name or Pokédex Number. On desktop, the Pokédex also opens to an empty "Select a Pokémon" pane, so the first thing a visitor sees is half a page of nothing.

## Solution

Visitors can mark any Species as a **Favorite** with a star button in the detail page header. Favorites are remembered in that browser (localStorage) and show as a small star on their sidebar rows. A "Favorites only" toggle in the sidebar narrows the list to Favorites, working alongside the search. Like the search, it lives in the URL (`?fav=1`), so reloads, Back/Forward and shared links keep it.

On desktop widths, opening the Pokédex at `/` jumps straight to a random Species from whatever the sidebar is showing. On phones, `/` stays the list.

## User Stories

1. As a visitor, I want a star button in a Species' detail header, so that I can mark it as a Favorite.
2. As a visitor, I want to press the star again, so that I can remove a Species from my Favorites.
3. As a visitor, I want the star to look clearly different when a Species is a Favorite, so that I can see its state at a glance.
4. As a keyboard user, I want to reach and toggle the star with Tab and Enter/Space, so that I can manage Favorites without a mouse.
5. As a screen-reader user, I want the star announced as a toggle button named for the Species, with its pressed state, so that I know what it does and whether it is on.
6. As a visitor, I want my Favorites to still be there after I reload or come back another day, so that I don't have to mark them again.
7. As a visitor, I want Favorites I mark in one tab to appear in my other open tabs straight away, so that the tabs never disagree.
8. As a visitor, I want a small star on the sidebar row of every Favorite, so that I can spot them while scrolling.
9. As a visitor, I want the row star to be a marker only, so that clicking anywhere on a row still opens that Species.
10. As a visitor, I want a "Favorites only" toggle in the sidebar, so that I can list just my Favorites.
11. As a visitor, I want "Favorites only" and the search to work together, so that I can search within my Favorites.
12. As a visitor, I want the "N/151" count to reflect what the sidebar is showing, so that I know how many Favorites (or matching Favorites) I have.
13. As a visitor, I want "Favorites only" kept in the URL, so that a reload keeps the filter on.
14. As a visitor, I want Back and Forward to restore the "Favorites only" state along with the search, so that history behaves predictably.
15. As a visitor, I want sidebar row links to carry "Favorites only", so that opening a Species doesn't lose my filter.
16. As a phone user, I want "← All Species" to carry "Favorites only", so that going back shows the same filtered list.
17. As a visitor, I want a shared link with "Favorites only" on to show the recipient their own Favorites, so that the link means "my Favorites view", not my particular list.
18. As a visitor with no Favorites yet, I want "Favorites only" to say "No Favorites yet" with a "Show all" button, so that I understand the empty list and can get out of it in one click.
19. As a visitor whose search matches none of their Favorites, I want "No Favorites match "…"" with a "Show all" button, so that I know why the list is empty.
20. As a visitor with "Favorites only" on, I want to un-star the open Species without the page changing under me, so that I can star it again if I change my mind.
21. As a visitor with "Favorites only" on, I want an un-starred Species to leave the sidebar right away, so that the list always matches the filter.
22. As a visitor in a browser that blocks storage (e.g. some private modes), I want the Pokédex to keep working, so that broken storage never breaks browsing.
23. As a visitor whose saved Favorites are damaged or outdated, I want the bad entries ignored and the rest kept, so that one bad entry doesn't wipe my Favorites.
24. As a desktop visitor opening `/`, I want a random Species opened for me, so that the detail pane is never empty when I arrive.
25. As a desktop visitor, I want each reload of `/` to pick again, so that I discover different Species.
26. As a desktop visitor opening `/?q=char`, I want the random pick to come from the Species matching "char", so that it is one the sidebar is showing.
27. As a desktop visitor opening `/?fav=1`, I want the random pick to come from my Favorites, so that I land on one of them.
28. As a desktop visitor whose filter shows nothing, I want no pick and the empty "Select a Pokémon" pane, so that I'm never sent to a Species the sidebar is hiding.
29. As a desktop visitor, I want the random pick to replace `/` in history, so that Back leaves the Pokédex instead of returning to an empty page that picks again.
30. As a desktop visitor, I want the picked URL to keep my `?q=` and `?fav=1`, so that the sidebar stays filtered after the jump.
31. As a visitor following a link like `/pokemon/6`, I want #6 to open, never a random Species, so that links are reliable.
32. As a phone user, I want `/` to show the list with no random pick, so that the list is there to browse and "← All Species" doesn't loop into another random Species.

## Implementation Decisions

- **Glossary.** "Favorite" is defined in `GLOSSARY.md` (a Species the visitor has marked, remembered only in their own browser). Use it everywhere: code, UI copy and tickets. Avoid starred, bookmarked, liked or saved.
- **Favorites codec (new pure module in the Pokédex domain layer).** It turns the stored string into a set of Pokédex Numbers and back, and toggles one:
  - `parseFavorites(raw: string | null): ReadonlySet<PokedexNumber>` accepts a JSON array and keeps only the entries that are valid Pokédex Numbers (integers 1–151, checked with the existing Pokédex Number parser), dropping duplicates. `null`, invalid JSON or a non-array give an empty set. It never throws.
  - `serializeFavorites(set)` writes a JSON array sorted ascending.
  - `toggleFavorite(set, n)` returns a new set.
- **Storage.** One localStorage key, `pokedex:favorites`, holding the serialised array.
- **Favorites store (client glue, not unit-tested).** A small module-level external store read with `useSyncExternalStore`:
  - The server snapshot is the empty set, so prerendered HTML never shows Favorites. Stars appear just after hydration, which is the agreed short delay.
  - The client snapshot is the parsed value, cached by its raw string so the snapshot stays referentially stable.
  - Subscribers are notified when the store changes in this tab and on the `storage` event, which covers other tabs.
  - Every localStorage access is wrapped in try/catch. If a read fails, there are no Favorites. If a write fails, the error is swallowed and the in-memory value still updates, so the star works for the rest of the session.
- **Pokédex filter (new pure module in the Pokédex domain layer).** It holds the state that decides what the sidebar shows:
  - `type PokedexFilter = { q: string; favoritesOnly: boolean }`.
  - `parseFilter(params)` reads `?q=` (missing gives `""`) and `?fav=` (`favoritesOnly` only when the value is exactly `"1"`).
  - `visibleSpecies(pokedex, filter, favorites)` keeps the Species where `matchesQuery` holds and, when `favoritesOnly` is on, that are Favorites. It preserves Pokédex order.
  - `randomPick(visible, random = Math.random)` returns one Species, or `null` for an empty list. `random` is passed in so tests are deterministic.
- **Routes (existing module, interface changes).** `pokedexHref` and `speciesHref` take a `PokedexFilter` instead of a bare search string. They write `?q=` when non-empty and `fav=1` when `favoritesOnly`, in that order, and output is unchanged when `favoritesOnly` is off. Update every caller (row links and the phone back link).
- **Sidebar.** The sidebar's search-only state becomes `PokedexFilter` state, with the same URL rules the search uses today:
  - Writes use `history.replaceState`.
  - On a pathname change the sidebar re-reads the filter from the URL, and on `popstate` too.
  - The Suspense fallback shows the unfiltered list.

  It gains:
  - A "Favorites only" toggle button (`aria-pressed`) next to the search input.
  - A filled star marker on Favorite rows, decorative to assistive tech since the detail button carries the meaning.
  - The two empty states from stories 18–19, each with a "Show all" button that turns `favoritesOnly` off. The existing "No Species match" and "Clear search" state stays for when "Favorites only" is off.

  The count shows `visibleSpecies(...).length`/151.
- **Detail header.** A small client star button sits in the prerendered detail page header. It is a `<button>` with `aria-pressed` and an accessible name naming the Species. It reads and writes through the Favorites store. The detail page stays prerendered (ADR 0001); only the button is a client component.
- **Random pick on `/` (client glue, not unit-tested).** The Pokédex home renders a client component alongside the empty pane. On mount it:
  1. Returns if the viewport is below `md` (`matchMedia` for Tailwind's `md` breakpoint).
  2. Reads the filter from the URL.
  3. Reads Favorites from the store when `favoritesOnly` is on. The client snapshot is synchronous, so there's nothing to wait for.
  4. Computes `visibleSpecies` and `randomPick`.
  5. Calls `router.replace(speciesHref(pick.id, filter))` when there is a pick, and does nothing otherwise.

  It runs whenever `/` renders at desktop width, so each load or reload picks again. It never runs on `/pokemon/[id]`. `/` stays prerendered under Cache Components, and randomness never touches the server.
- **No ADR.** Every choice above is cheap to reverse.

## Testing Decisions

- Good tests here call the domain layer's pure functions with plain data and assert on outputs. They never touch localStorage, React, the router or the DOM. They run in Vitest's Node environment like the existing suite. No new dependencies.
- **Pokédex filter tests** (new):
  - `parseFilter`: no params; `q` only; `fav=1`; `fav=0`, `fav=true` and an empty `fav` are all off; both together.
  - `visibleSpecies`: filter off returns all 151 in order; search only; Favorites only; both combined; Favorites only with no Favorites is empty; Favorites outside the search are excluded.
  - `randomPick`: empty list gives `null`; `random` returning `0` picks the first; `0.999…` picks the last; a mid value picks the expected index.
- **Favorites codec tests** (new):
  - `null`, `""`, invalid JSON, `{}` and `"6"` all give an empty set.
  - `[6, 25]` round-trips.
  - Duplicates collapse.
  - `0`, `152`, `-1`, `6.5`, `"6"` and `null` entries are dropped while valid entries are kept.
  - `serializeFavorites` sorts ascending.
  - `toggleFavorite` adds and removes without mutating its input.
- **Routes tests** (existing file, updated): every existing case moves to the filter-object signature with `favoritesOnly: false` and gives identical output. New cases cover `fav=1` alone, `q` and `fav=1` together (with order and encoding), and `speciesHref` carrying both.
- **Prior art:** `search.test.ts` (a full 151-Species fixture, useful for `visibleSpecies`) and `routes.test.ts`.
- **Manual browser checks** for the untested glue:
  - The star toggles and persists across reloads.
  - A second tab updates live.
  - Storage disabled doesn't crash.
  - At desktop width `/`, `/?q=char`, `/?fav=1` with and without Favorites, and Back after a pick all behave as the user stories say.
  - At phone width `/` shows the list, and "← All Species" doesn't loop.

## Out of Scope

- Syncing Favorites across devices or browsers, accounts, or any server-side storage.
- Starring from sidebar rows.
- Sorting Favorites to the top or reordering them.
- Favoriting individual Varieties.
- Exporting or importing Favorites.
- A "random Species" button, or a random pick on phones or on `/pokemon/[id]`.
- Component or end-to-end test tooling (jsdom, Testing Library, Playwright).

## Further Notes

- On desktop, the "Select a Pokémon" pane shows for a moment before the random pick replaces it. That's expected with a client-side pick on a prerendered `/`. Leave it unless it's distracting.
- A shared `?fav=1` link shows each visitor their own Favorites, since Favorites never leave the browser.
- Tailwind's `md` breakpoint is 48rem. The pick's media query has to match the layout's `md:` classes, or the two disagree about what counts as a phone.
