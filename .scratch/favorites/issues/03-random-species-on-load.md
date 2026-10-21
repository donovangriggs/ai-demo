# 03: Random Species on load (desktop)

**What to build:** At desktop widths (Tailwind `md` and up), opening the Pokédex at `/` jumps to a random Species from the list the sidebar is showing, so the detail pane is never empty on arrival. The jump replaces `/` in history and keeps `?q=`. Every load or reload of `/` picks again. On phones `/` stays the list, and links like `/pokemon/6` always open that Species.

Spec: [spec.md](../spec.md), user stories 24–26 and 28–32; "Random pick on `/`".

**Blocked by:** 01 (Prefactor: thread a Pokédex filter through the links and sidebar).

**Status:** ready-for-agent

- [ ] The Pokédex filter module gains `randomPick(visible, random = Math.random)`, which returns one Species or `null` for an empty list.
- [ ] `randomPick` tests: an empty list gives `null`; `random` returning `0` picks the first; `0.999…` picks the last; a mid value picks the expected index.
- [ ] The Pokédex home renders a client component alongside the empty pane. On mount, at `md` width and up only (the media query matches Tailwind's `md`, 48rem), it reads the filter from the URL, picks from `visibleSpecies`, and calls `router.replace(speciesHref(pick.id, filter))`. With nothing to pick, it does nothing.
- [ ] `/` stays prerendered, and nothing random runs on the server.
- [ ] Manual check, desktop: `/` opens a random Species; reloading picks again; `/?q=char` lands on Charmander, Charmeleon or Charizard with `?q=char` kept; `/?q=zzz` stays on "Select a Pokémon"; Back after a pick leaves the Pokédex instead of returning to `/`.
- [ ] Manual check, phone width: `/` shows the list, and "← All Species" from a detail page returns to the list without a pick.
- [ ] `npm test`, lint, the type check and `npm run build` all pass.

## Comments
