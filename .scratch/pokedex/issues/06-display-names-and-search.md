# Species display names and search matching

Type: grilling
Status: resolved
Blocked by: 03
Parent: [Pokédex app map](../map.md)

## Question

PokéAPI slugs differ from display names for 4 of the 151 Species: `nidoran-f` is "Nidoran♀", `nidoran-m` is "Nidoran♂", `farfetchd` is "Farfetch’d", and `mr-mime` is "Mr. Mime" (see [PokéAPI endpoints, data shapes and fair-use for the v1 feature set](01-pokeapi-data-shape.md)). Where do display names come from: 151 `pokemon-species/{id}` calls, a hard-coded override for the four, or title-casing the slug? And what does search match against: slug, display name, or a normalised form of both, so that "mr mime", "farfetchd" and "nidoran" all find the expected Species? Which matching cases get Vitest coverage?

## Answer

**Display names are derived in code (no extra PokéAPI calls), and search uses a normalised match over both the display name and the slug.** Both functions are pure domain logic, with no Next.js or fetch imports. The path is settled in [Module boundaries and folder layout](08-module-boundaries.md).

- **`displayName(slug)`**: a 4-entry override map, `{ "nidoran-f": "Nidoran♀", "nidoran-m": "Nidoran♂", "farfetchd": "Farfetch’d" (U+2019), "mr-mime": "Mr. Mime" }`. Every other slug is title-cased per hyphen part. This is safe because scope is fixed at #1–151. No `pokemon-species` calls are made.
- **Ability display names**: taken from the English entry of the Ability's `names[]`, which is already in the `getAbility` response, so `getAbility` keeps it when trimming. No override map is needed.
- **`matchesQuery(species, q)`**:
  1. Trim the query and strip one leading `#`. An empty query matches all 151.
  2. **All digits → number query**: it matches if `String(id)` **or** the 3-digit zero-padded id starts with `q`. `'15'` → #15, #150, #151. `'006'` → #6 only. `'6'` → #6, #60–69.
  3. **Otherwise → name query**: normalise both sides by lowercasing, stripping accents (NFKD) and keeping only `a–z0–9`. It matches if the normalised query is a substring of the normalised display name **or** the normalised slug. A query that normalises to empty (`'♀'`, `'!!'`) matches all.
- **Vitest cases**:
  - `'char'` and `'CHAR'` → Charmander, Charmeleon, Charizard.
  - `'mr mime'` and `'mr.mime'` → Mr. Mime.
  - `'farfetch'd'` and `'farfetchd'` → Farfetch’d.
  - `'nidoran'` → both Nidoran. `'nidoran f'` → Nidoran♀ only, matched through slug `nidoranf`.
  - `'6'` → #6, #60–69. `'006'` → #6 only. `'#6'` → same as `'6'`. `'15'` → #15, #150, #151.
  - `''` → all 151. `'zzz'` → none.
  - `displayName` for each of the 4 overrides, a plain slug (`bulbasaur` → Bulbasaur), and a hyphenated Ability-style slug (`solar-power` → Solar Power) as a title-casing check.
