# 05: Type Matchups on the detail page

**What to build:** The detail pane gains a Type Matchups section. It shows which attacking Types the Species is **Weak to** (2×/4×), **Resists** (½×/¼×) and is **Immune to** (0×), as Type badges with multipliers. 1× Types are hidden, and empty groups are omitted. The matchups are computed from the cached Type Chart, not a hard-coded table.

Spec: [spec.md](../../pokedex/spec.md), §4 `getTypeChart`, §5 `type-matchups.ts`, §6 `TypeMatchups`. Decision: [How Type Matchups are computed and presented](../../pokedex/issues/05-type-matchups.md).

**Blocked by:** 04 (Species detail: header, Base Stats, Abilities).

**Status:** ready-for-agent

- [ ] `getTypeChart()` is public and returns the 18 Types with their damage-from lists, reusing the cached Type fetcher.
- [ ] The domain module provides `TYPE_NAMES` (in PokéAPI id order), `typeMatchups(defending, chart)` and `groupTypeMatchups(matchups)`. Groups are sorted strongest first, then by Type id.
- [ ] Tests use a hand-written minimal Type Chart fixture (fire, flying, water) and make no network calls. They cover:
  - Charmander: weak to Water, Ground and Rock. Resists Bug, Steel, Fire, Grass, Ice and Fairy.
  - Charizard: Rock 4×. Grass and Bug ¼×. Ground 0×. Ice hidden.
  - Gyarados: Electric 4×. Ground 0×. Grass hidden.
  - Charizard's `weakTo` order is Rock, Water, Electric.
- [ ] The page computes the groups. The `TypeMatchups` component is presentational and receives pre-grouped data.
- [ ] Charizard's page shows Weak to Rock 4×, Water 2×, Electric 2×. Resists Bug ¼×, Grass ¼×, Fighting, Steel, Fire and Fairy ½×. Immune to Ground.
