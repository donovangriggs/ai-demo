# 04: "Favorites only" filter

**What to build:** A "Favorites only" toggle in the sidebar narrows the list to Favorites, working alongside the search. It is kept in the URL as `?fav=1`, carried on row links and the phone "← All Species" link, and restored by reloads and Back/Forward. The "N/151" count and the desktop random pick follow it. When nothing is showing, the sidebar says "No Favorites yet" or "No Favorites match "…"", with a "Show all" button that turns the filter off. Un-starring the open Species removes its row from the sidebar but leaves its detail page open.

Spec: [spec.md](../spec.md), user stories 10–21 and 27; "Pokédex filter" and "Sidebar".

**Blocked by:** 01 (Prefactor), 02 (Star a Favorite) and 03 (Random Species on load).

**Status:** ready-for-agent

- [ ] `visibleSpecies(pokedex, filter, favorites)` also keeps only Favorites when `favoritesOnly` is on, and still preserves Pokédex order.
- [ ] Tests cover: Favorites only; search combined with Favorites only; Favorites only with no Favorites returning empty; and Favorites outside the search being excluded.
- [ ] The sidebar has a "Favorites only" toggle button with `aria-pressed` next to the search input. It writes `?fav=1` with `history.replaceState`, and reloads and Back/Forward restore it.
- [ ] Row links and "← All Species" carry `fav=1` when it's on.
- [ ] Empty states: "No Favorites yet" when there are no Favorites at all, and "No Favorites match "…"" when the search excludes every Favorite. Each has a "Show all" button that turns "Favorites only" off. The existing "No Species match"/"Clear search" state stays for when the filter is off.
- [ ] The random pick on `/` uses the Favorites from the store, so `/?fav=1` lands on a Favorite, or stays on "Select a Pokémon" when there are none.
- [ ] Manual check: with "Favorites only" on, un-starring the open Species removes its row and the detail stays open. A second tab's filtered list updates live.
- [ ] `npm test`, lint, the type check and `npm run build` all pass.

## Comments
