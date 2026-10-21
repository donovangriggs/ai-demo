# How Type Matchups are computed and presented

Type: grilling
Status: resolved
Blocked by: 01
Parent: [Pokédex app map](../map.md)

## Question

How is a Species' Type Matchup against each attacking Type derived from PokéAPI's `damage_relations` (see [PokéAPI endpoints, data shapes and fair-use for the v1 feature set](01-pokeapi-data-shape.md)), combining dual Types into 0×, ¼×, ½×, 1×, 2× or 4×? Should it be computed from the cached `getType` data ([Choose the data-fetching strategy](03-data-fetching-strategy.md)) or from a hard-coded chart? What is the pure function's signature, where does it live so Vitest can test it, and which cases must the tests cover (dual-type 4× and ¼×, an immunity cancelling a weakness, Gen 1 edge cases)? Presentation is already settled in [Look and feel of the list and detail pages](04-look-and-feel.md): grouped Weak to / Resists / Immune to, with 1× hidden.

## Answer

**Type Matchups are computed from the cached PokéAPI Type data by a pure domain function.** There is no hard-coded chart. The **Type Chart** has been added to `GLOSSARY.md`.

- **Input**: `getType(name)` (see [Choose the data-fetching strategy](03-data-fetching-strategy.md)) trims each Type to `{ id, name, damageFrom: { double, half, none } }`, where each field is a list of attacking Type names. It reads the top-level `damage_relations.*_damage_from`, never `past_damage_relations`. The Type Chart is the 18 of these, which the sidebar layout already loads and caches, so detail pages reuse the same data.
- **Pure domain module**, with no Next.js or fetch imports. The exact path is decided in [Module boundaries and folder layout](08-module-boundaries.md).
  - `TYPE_NAMES`: the 18 Types in PokéAPI id order (normal, fighting, flying, poison, ground, rock, bug, ghost, steel, fire, water, grass, electric, psychic, ice, dragon, dark, fairy). This is the canonical attacking order.
  - `typeMatchups(defending: TypeName[], chart: TypeChart): Record<TypeName, Multiplier>`, where `Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4`. For each attacking Type it multiplies the factors from each defending Type: `double` gives 2, `half` gives 0.5, `none` gives 0, and an unlisted Type gives 1.
  - `groupTypeMatchups(matchups)` returns `{ weakTo, resists, immuneTo }`. Each is a list of `{ type, multiplier }`, with 1× dropped, sorted strongest first (4× before 2×, ¼× before ½×) and then by Type id.
- **Presentation**: as decided in [Look and feel of the list and detail pages](04-look-and-feel.md), the three groups are shown as Type badges with their multipliers, and any empty group is omitted.
- **Vitest**, run against a **hand-written minimal Type Chart fixture** (the fire, flying and water defending entries only). It makes no network calls.
  - Charmander (Fire): weak to Water, Ground and Rock (2×). Resists Bug, Steel, Fire, Grass, Ice and Fairy (½×, in id order).
  - Charizard (Fire/Flying): Rock 4×. Grass and Bug ¼×. **Ground 0×**, because Fire's 2× is cancelled by Flying's immunity. Ice is 1×, so it doesn't appear in any group.
  - Gyarados (Water/Flying): Electric 4×, Ground 0×. Grass is 1× (Water's 2× times Flying's ½×), so it's hidden.
  - Grouping order: Charizard `weakTo` = `[rock 4×, water 2×, electric 2×]`.
- Fairy and Steel edge cases (Clefairy, Magnemite) are not required tests.
