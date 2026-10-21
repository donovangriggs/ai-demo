# 01: Prefactor: thread a Pokédex filter through the links and sidebar

**What to build:** Replace the sidebar's search-only state with a Pokédex filter (`{ q, favoritesOnly }`), so that later tickets can add "Favorites only" without touching every link again. Nothing changes for the visitor: search, `?q=` syncing, Back/Forward, row links and the phone "← All Species" link all behave exactly as they do today.

Spec: [spec.md](../spec.md), "Pokédex filter", "Routes" and "Sidebar".

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] A pure domain module defines the `PokedexFilter` type and `parseFilter(params)`. It reads `?q=` (missing gives `""`), and sets `favoritesOnly` only when `?fav=` is exactly `"1"`.
- [x] The same module has `visibleSpecies(pokedex, filter)`, which keeps the Species matching the search, in Pokédex order. Favorites come in ticket 04.
- [x] `pokedexHref` and `speciesHref` take a `PokedexFilter` instead of a bare search string. They write `?q=` when it's non-empty and `fav=1` when `favoritesOnly`, in that order.
- [x] The sidebar keeps its state as a `PokedexFilter`, read with `parseFilter` on pathname changes and `popstate`, and written with `history.replaceState`. Its list and the "N/151" count come from `visibleSpecies`.
- [x] Every existing `routes.test.ts` case moves to the filter-object signature with the same expected output. New cases cover `fav=1` alone, and `q` with `fav=1`, including order and encoding.
- [x] New `parseFilter` and `visibleSpecies` tests cover: no params, `q` only, `fav=1`, `fav` values `0`/`true`/empty treated as off, and an empty filter returning all 151 in order.
- [x] `npm test`, lint, the type check and `npm run build` all pass. Loading `/?q=char` still shows only Charmander, Charmeleon and Charizard.

## Comments
