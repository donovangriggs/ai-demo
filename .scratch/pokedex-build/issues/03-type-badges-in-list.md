# 03: Type badges in the list

**What to build:** Every sidebar row shows the Species' Types as coloured badges, in slot order (e.g. Bulbasaur: Grass, Poison). The Types come from the 18 PokéAPI Types, which are fetched and cached once. That same data will later supply the Type Chart.

Spec: [spec.md](../../pokedex/spec.md), §4 Data module, §6 `TypeBadge` and Type colours. Decisions: [Look and feel](../../pokedex/issues/04-look-and-feel.md), [Choose the data-fetching strategy](../../pokedex/issues/03-data-fetching-strategy.md).

**Blocked by:** 01 (Tracer bullet: the 151 Species list).

**Status:** resolved

- [x] A cached per-Type fetcher (`'use cache'` + `cacheLife('max')`, throws on non-2xx) is called for the 18 real Types only (ids 1–18; `stellar`, `unknown` and `shadow` are excluded). It is trimmed to the Type's id, name, its Species membership with slots, and the top-level `*_damage_from` lists. Every `past_*` field is ignored.
- [x] `getPokedex()` summaries now include each Species' Types, derived from Type membership, ordered by slot, and limited to Pokédex Numbers ≤ 151.
- [x] The domain types include the `TypeName` union of the 18 Types.
- [x] A presentational `TypeBadge` renders a rounded uppercase pill in the spec's Type colour palette.
- [x] Spot checks: Bulbasaur shows Grass + Poison, Charizard shows Fire + Flying, Clefairy shows Fairy only, and Magnemite shows Electric + Steel.
- [x] A cold list render fetches the list once and each of the 18 Types once, with no per-Species requests.

## Comments

- Implemented on integration branch `pokedex-build` in 15a749f (merged in a073e24). Code-review fixes across all tickets are in 9028692. On `pokedex-build`, 81 tests pass, and tsc, lint and the build (151 prerendered detail pages) are clean.
