# 04: Species detail: header, Base Stats, Abilities

**What to build:** Clicking a sidebar row opens that Species' detail page at `/pokemon/<number>`. The sidebar stays in place with the row highlighted. The detail pane shows:
- the official artwork, `#NNN`, display name and Type badges
- the Base Stats as bars tinted by the primary Type, with a Total
- the Abilities, each with its short effect and a "Hidden" marker for a Hidden Ability

On desktop, `/` shows a quiet "Select a Pokémon" pane. A URL that isn't a valid Pokédex Number shows a not-found message inside the layout. All 151 detail pages are prerendered at build time.

Spec: [spec.md](../../pokedex/spec.md), §3 Routes, §4 `getSpecies`, §5 `pokedex-number.ts`, §6 components. Decisions: [Look and feel](../../pokedex/issues/04-look-and-feel.md), [Module boundaries](../../pokedex/issues/08-module-boundaries.md), [Loading, error and not-found states](../../pokedex/issues/07-loading-error-not-found-states.md).

**Blocked by:** 03 (Type badges in the list).

**Status:** resolved

- [x] `parsePokedexNumber(param)` returns `6` for `'6'`, and `null` for `'006'`, `'0'`, `'152'`, `'abc'`, `'6.5'` and `''`. All of these are covered by tests.
- [x] The detail page calls `notFound()` **before any fetch** when the param doesn't parse. `/pokemon/999`, `/pokemon/abc` and `/pokemon/006` show "No Species #… This Pokédex covers #1–151" with a link to #1, and the sidebar stays visible.
- [x] `getSpecies(number)` returns the summary plus Base Stats and Abilities (display name from the English `names[]` entry, `hidden`, and the English short effect). It uses cached Pokémon and Ability fetchers that throw on non-2xx responses and drop `moves` and every `past_*` field. Each shared Ability is fetched once.
- [x] `generateStaticParams` returns 1…`POKEDEX_SIZE`, and `npm run build` prerenders all 151 detail pages.
- [x] Sidebar links use the default prefetch, with no per-link `prefetch`. The selected row is highlighted.
- [x] Base Stats show the labels HP, Attack, Defense, Sp. Atk, Sp. Def and Speed, each with a value and a bar scaled to 255 in the primary Type's colour, plus a Total.
- [x] Abilities show the display name, the Hidden marker where it applies, and the short effect. Gengar shows a single Ability, and Bulbasaur shows Overgrow plus Chlorophyll (Hidden).
- [x] `/` on desktop shows the empty "Select a Pokémon" pane next to the sidebar.

## Comments

- Implemented on integration branch `pokedex-build` in 1fd8b56. Code-review fixes across all tickets are in 9028692. On `pokedex-build`, 81 tests pass, and tsc, lint and the build (151 prerendered detail pages) are clean.
