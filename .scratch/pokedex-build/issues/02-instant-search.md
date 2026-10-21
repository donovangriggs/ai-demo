# 02: Instant search

**What to build:** Typing in the sidebar's search box filters the Species list instantly as you type. You can search by name (forgiving of case, spaces, punctuation and accents) or by Pokédex Number. The query is kept in `?q=`, so reloading or sharing the URL restores the filter. When nothing matches, the sidebar says so and offers a Clear search button.

Spec: [spec.md](../../pokedex/spec.md), §5 `search.ts`, §6 `PokedexSidebar`. Decisions: [Species display names and search matching](../../pokedex/issues/06-display-names-and-search.md), [Loading, error and not-found states](../../pokedex/issues/07-loading-error-not-found-states.md).

**Blocked by:** 01 (Tracer bullet: the 151 Species list).

**Status:** resolved

- [x] `matchesQuery(species, q)` is a pure domain function implementing the spec's rules: strip a leading `#`. A query of only digits matches a prefix of the plain or 3-digit zero-padded number. Any other query is normalised and substring-matched against the display name or slug. An empty query, or one that normalises to empty, matches all.
- [x] Tests cover every listed case: `'char'`/`'CHAR'`, `'mr mime'`/`'mr.mime'`, `'farfetch'd'`/`'farfetchd'`, `'nidoran'`, `'nidoran f'`, `'6'`/`'#6'`, `'006'`, `'15'`, `''`, `'zzz'`.
- [x] Filtering happens in the browser with no server round trip per keystroke. `?q=` is read with `useSearchParams` and written with `history.replaceState`.
- [x] The sidebar is rendered inside a `<Suspense>` boundary whose fallback is the unfiltered list. `npm run build` succeeds, with no missing-Suspense or blocking-prerender error.
- [x] Loading `/?q=char` shows only Charmander, Charmeleon and Charizard.
- [x] A no-match query shows "No Species match “…”" and a Clear search button, which empties the input and removes `?q=`.
- [x] The "N/151" count reflects the filtered list.

## Comments

- Implemented on integration branch `pokedex-build` in e69bd03. Code-review fixes across all tickets are in 9028692. On `pokedex-build`, 81 tests pass, and tsc, lint and the build (151 prerendered detail pages) are clean.
