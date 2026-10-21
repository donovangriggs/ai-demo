# PokéAPI data shape for the v1 feature set

Research for [ticket 01](../issues/01-pokeapi-data-shape.md). Facts only. The data-fetching-strategy decision is left to its own grilling ticket; facts that bear on it are marked **[strategy]**.

All live responses below were fetched on 2026-10-21 (≈10 REST calls + 1 GraphQL call). Excerpts are trimmed with `…`.

## TL;DR

- **Minimal REST set:** `GET /pokemon?limit=151` (list), `GET /pokemon/{id}` (Base Stats, Types, Abilities with `is_hidden`), `GET /ability/{id}` (English `short_effect`), `GET /type/{name}` (Type Matchups). `GET /pokemon-species/{id}` is only needed for proper English display names (4 of the 151 Species have names their slug can't produce).
- **Full crawl of all 151:** 1 + 151 + 114 + 18 = **284 REST requests** (435 if you also fetch species for display names). Abilities and Types are shared across Species.
- **Fair use:** the REST API has no rate limit. Its one rule is "locally cache resources whenever you request them". Responses come back with `cache-control: public, max-age=86400`.
- **Images:** `raw.githubusercontent.com`, path `/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png` (475×475 PNG). You can build the URL from the id alone.
- **GraphQL:** `https://graphql.pokeapi.co/v1beta2` works. One query returned everything for all 151 (138 KB). It is labelled beta, is limited to 100 calls/h per IP, reboots daily, and has already had one breaking rename (v1beta → v1beta2, June 2025).

## Minimal endpoint list

| Feature | Endpoint | Fields used | Calls |
|---|---|---|---|
| List + search | `GET /api/v2/pokemon?limit=151` | `results[].name`, id parsed from `results[].url` | 1 |
| List row image | none (URL is built from the id) | `sprites/pokemon/other/official-artwork/{id}.png` | 0 |
| Display name (optional) | `GET /api/v2/pokemon-species/{id}` | `names[]` where `language.name == "en"` | 151 |
| Detail: Base Stats, Types, Abilities | `GET /api/v2/pokemon/{id}` | `stats`, `types`, `abilities[].is_hidden` | 151 |
| Detail: Ability short effect | `GET /api/v2/ability/{name or id}` | `effect_entries[]` en → `short_effect` | 114 unique |
| Type Matchups | `GET /api/v2/type/{name}` | `damage_relations.*_damage_from` | 18 (17 strictly needed) |

For Species #1–151, the **default Variety's `pokemon` id equals the National Pokédex number** (`/pokemon/6` is Charizard, `is_default: true`). Don't use the `order` field as the Pokédex number, because it differs (Charizard has `pokemon.order = 7` but `species.order = 6`).

## Response excerpts

### `GET /pokemon?limit=151` (10 KB)

```json
{
  "count": 1351,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=151&limit=151",
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" },
    …
    { "name": "mew",       "url": "https://pokeapi.co/api/v2/pokemon/151/" }
  ]
}
```

The list holds names and URLs only, with no sprites or types. Names are lowercase slugs. The default page size is 20, and `limit`/`offset` page through the list ([docs: Resource Lists/Pagination](https://pokeapi.co/docs/v2#resource-listspagination-section)).

### `GET /pokemon/6` (374 KB, mostly `moves`)

```json
{
  "id": 6, "name": "charizard", "order": 7, "is_default": true,
  "species": { "name": "charizard", "url": "https://pokeapi.co/api/v2/pokemon-species/6/" },
  "types": [
    { "slot": 1, "type": { "name": "fire",   "url": "https://pokeapi.co/api/v2/type/10/" } },
    { "slot": 2, "type": { "name": "flying", "url": "https://pokeapi.co/api/v2/type/3/" } }
  ],
  "abilities": [
    { "is_hidden": false, "slot": 1, "ability": { "name": "blaze",       "url": "https://pokeapi.co/api/v2/ability/66/" } },
    { "is_hidden": true,  "slot": 3, "ability": { "name": "solar-power", "url": "https://pokeapi.co/api/v2/ability/94/" } }
  ],
  "stats": [
    { "base_stat": 78,  "effort": 0, "stat": { "name": "hp" } },
    { "base_stat": 84,  "stat": { "name": "attack" } },
    { "base_stat": 78,  "stat": { "name": "defense" } },
    { "base_stat": 109, "stat": { "name": "special-attack" } },
    { "base_stat": 85,  "stat": { "name": "special-defense" } },
    { "base_stat": 100, "stat": { "name": "speed" } }
  ],
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    "other": {
      "official-artwork": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
        "front_shiny": "…/official-artwork/shiny/6.png"
      },
      "home": { "front_default": "…/other/home/6.png" },
      "dream_world": { "front_default": "…/other/dream-world/6.svg" },
      "showdown": { "front_default": "…/other/showdown/6.gif" }
    },
    "versions": { … }
  },
  "past_types": [],
  "past_abilities": [ { "generation": { "name": "generation-iv" }, "abilities": [ { "is_hidden": true, "slot": 3, "ability": null } ] } ],
  "past_stats": [ … ],
  "moves": [ … 131 entries … ],
  …
}
```

Top-level keys: `abilities, base_experience, cries, forms, game_indices, height, held_items, id, is_default, location_area_encounters, moves, name, order, past_abilities, past_stats, past_types, species, sprites, stats, types, weight`.

- The top-level `types`, `abilities` and `stats` hold **current** data. The `past_*` fields hold older generations and can be ignored, since Red/Blue-era data is out of scope.
- The Hidden Ability is always `slot: 3` with `is_hidden: true`.
- Stat names are slugs (`special-attack`), so the UI needs a label map to show "Sp. Atk" and similar.
- **[strategy]** Payloads are large because of `moves`: Charizard is 374 KB and Mew (`/pokemon/151`, 375 moves) is 675 KB. The REST API has no field selection. (Next.js's fetch data cache is documented to skip items over 2 MB. I didn't check that against the project's Next version, but every payload I saw was under 1 MB.)

### `GET /pokemon-species/6` (35 KB)

```json
{
  "id": 6, "name": "charizard", "order": 6,
  "names":  [ …, { "name": "Charizard", "language": { "name": "en" } }, … ],
  "genera": [ …, { "genus": "Flame Pokémon", "language": { "name": "en" } }, … ],
  "pokedex_numbers": [ { "entry_number": 6, "pokedex": { "name": "national" } }, { "entry_number": 6, "pokedex": { "name": "kanto" } }, … ],
  "varieties": [
    { "is_default": true,  "pokemon": { "name": "charizard",        "url": ".../pokemon/6/" } },
    { "is_default": false, "pokemon": { "name": "charizard-mega-x", "url": ".../pokemon/10034/" } },
    { "is_default": false, "pokemon": { "name": "charizard-mega-y", "url": ".../pokemon/10035/" } },
    { "is_default": false, "pokemon": { "name": "charizard-gmax",   "url": ".../pokemon/10196/" } }
  ],
  …
}
```

The detail page doesn't need anything here except `names` (en). The Variety confirms that `/pokemon/{1..151}` is the default.

### `GET /ability/66` (26 KB)

```json
{
  "id": 66, "name": "blaze", "is_main_series": true,
  "effect_entries": [
    {
      "effect": "When this Pokémon has 1/3 or less of its HP remaining, its Fire-type moves inflict 1.5× as much regular damage.",
      "short_effect": "Strengthens Fire moves to inflict 1.5× damage at 1/3 max HP or less.",
      "language": { "name": "en" }
    }
  ],
  "flavor_text_entries": [ …, { "flavor_text": "Powers up Fire-type moves when the Pokémon's HP is low.", "language": { "name": "en" }, "version_group": { "name": "scarlet-violet" } } ],
  "names": [ … ], "pokemon": [ … 32 entries … ], "effect_changes": [ … ], "generation": { … }
}
```

`effect_entries` is a per-language array, so filter on `language.name == "en"`. All 114 Abilities used by #1–151 have an English `short_effect` (checked through GraphQL, see below). The ability's display name is in `names[]` (en); the `name` field is a slug (`solar-power`).

### `GET /type/fire` (21 KB)

```json
{
  "id": 10, "name": "fire",
  "damage_relations": {
    "double_damage_from": [ { "name": "ground" }, { "name": "rock" }, { "name": "water" } ],
    "half_damage_from":   [ { "name": "bug" }, { "name": "steel" }, { "name": "fire" }, { "name": "grass" }, { "name": "ice" }, { "name": "fairy" } ],
    "no_damage_from":     [],
    "double_damage_to":   [ { "name": "bug" }, { "name": "steel" }, { "name": "grass" }, { "name": "ice" } ],
    "half_damage_to":     [ { "name": "rock" }, { "name": "fire" }, { "name": "water" }, { "name": "dragon" } ],
    "no_damage_to":       []
  },
  "past_damage_relations": [
    { "generation": { "name": "generation-i" }, "damage_relations": { … no steel/fairy entries … } }
  ],
  "pokemon": [ … ], "moves": [ … ], …
}
```

(Each relation entry also carries a `url`, trimmed here.)

**Do 18 type fetches cover every Type Matchup?** Yes. A Type Matchup is about the defender, so the defending Type's `*_damage_from` lists are enough: `double_damage_from` = 2×, `half_damage_from` = ½×, `no_damage_from` = 0×, and any attacking Type not listed is 1×. For a dual-typed Species, multiply the two defending Types' multipliers to get ¼× to 4×. The `*_damage_to` lists are the same data seen from the attacker's side. Fetching all 18 real Types covers every pairing. Only 17 Types appear on #1–151 (Dark doesn't), but Dark is still needed as an *attacking* Type in the matchup grid, and you get it for free from the other Types' `_from` lists.

**`GET /type` lists 21 entries**, not 18:

```json
{ "count": 21, "results": [ "normal", "fighting", …, "dark", "fairy", "stellar", "unknown", "shadow" ] }
```

`stellar` (id 19), `unknown` (10001) and `shadow` (10002) are not battle Types for this app and have to be filtered out. The 18 real ones are ids 1–18.

`past_damage_relations` keeps the Gen 1 chart. Use the top-level `damage_relations`, which is the current chart and includes Steel and Fairy.

## Request-count totals

These come from the GraphQL snapshot of all 151 default Varieties:

| Item | Count |
|---|---|
| Species / default `pokemon` | 151 |
| Ability slots across all 151 | 395 (6 Species have 1 Ability, 46 have 2, 99 have 3) |
| **Unique Abilities** | **114** |
| Types (real) | 18 (17 used as defending Types) |
| Single-typed Species | 84, so 67 are dual-typed |

| Scenario | REST requests |
|---|---|
| List page only | 1 |
| One detail page, cold | 1 `pokemon` + 1–3 `ability` + 1–2 `type` (+1 `pokemon-species` for display name) = 3–7 |
| Full crawl, deduped | 1 + 151 + 114 + 18 = **284** |
| Full crawl incl. species names | **435** |
| Full crawl, *not* deduping Abilities/Types | 1 + 151 + 395 + 218 = 765 |

**[strategy]** What can be shared or cached:
- The 18 `type/*` responses are shared by every Species, and the whole Type chart is small and effectively static.
- The 114 `ability/*` responses are shared across Species: the 395 Ability slots collapse to 114 fetches.
- The `pokemon?limit=151` list is one call that rarely changes.
- REST responses carry `cache-control: public, max-age=86400, s-maxage=86400` and an `etag`, and are served through a CDN (`server: cloudflare`, `cf-cache-status: HIT`).

## Fair use

From [pokeapi.co/docs/v2 → Fair Use Policy](https://pokeapi.co/docs/v2#fairuse):

> "Since the move to static hosting in November 2018, rate limiting has been removed entirely, but we still encourage you to limit the frequency of requests to limit our hosting costs."

> "People not complying with the fair use policy will have their IP address permanently banned. … Rules: **Locally cache resources whenever you request them.** Be nice and friendly to your fellow PokéAPI developers. …"

The REST API needs no authentication and accepts only GET. Responses include `access-control-allow-origin: *`, so browser-side fetches work.

## Images

- Official artwork is hosted in the [PokeAPI/sprites](https://github.com/PokeAPI/sprites) GitHub repo and served from **`raw.githubusercontent.com`**:
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- I checked `…/official-artwork/6.png`: HTTP 200, `image/png`, 475×475 RGBA, 144 KB, `cache-control: max-age=300`, `access-control-allow-origin: *`.
- The path is built from the Pokédex number, so the list page can show artwork without a per-Species API call. **[strategy]**
- Other options in the same repo: the small 96 px sprite (`/sprites/pokemon/{id}.png`), `other/home/{id}.png`, and `other/dream-world/{id}.svg`.
- A `next/image` remote pattern would be hostname `raw.githubusercontent.com` with pathname `/PokeAPI/sprites/**`.

## GraphQL

From [pokeapi.co/docs/graphql](https://pokeapi.co/docs/graphql):

- Endpoint: `https://graphql.pokeapi.co/v1beta2`, POST only. It has a GraphiQL console at `/v1beta2/console/`. "This endpoint can be subject to changes in the future."
- v1beta2 was released in June 2025 and stripped the `pokemon_v2_` prefix from every type name, which was a breaking schema change. v1beta (`beta.pokeapi.co/graphql/v1beta`) was "scheduled to be removed in summer 2025".
- "Beta status": hosted on a GCP e2-micro free instance, with **"A 100 calls/h per IP rate-limit"**. The instance "is set to reboot every day at 1 AM UTC with a consequent 2 minutes of downtime", and "sporadic maintenance and testing might stop the service".
- ⚠️ The [repo README](https://github.com/PokeAPI/pokeapi#graphql) still points to the old `beta.pokeapi.co/graphql/v1beta` endpoint. The docs site and the README disagree, so the docs page looks like the current one.

I ran this query live and it returned all 151 with everything the detail page needs in **one request (138 KB, HTTP 200)**:

```graphql
query {
  pokemon(where: {id: {_lte: 151}}, order_by: {id: asc}) {
    id name
    pokemonspecy { name pokemonspeciesnames(where: {language_id: {_eq: 9}}) { name } }
    pokemontypes { slot type { name } }
    pokemonabilities { is_hidden slot ability { name abilityeffecttexts(where: {language_id: {_eq: 9}}) { short_effect } } }
    pokemonstats { base_stat stat { name } }
  }
}
```

```json
{"data":{"pokemon":[{"id":1,"name":"bulbasaur","pokemonspecy":{"name":"bulbasaur","pokemonspeciesnames":[{"name":"Bulbasaur"}]},
 "pokemontypes":[{"slot":1,"type":{"name":"grass"}},{"slot":2,"type":{"name":"poison"}}],
 "pokemonabilities":[{"is_hidden":false,"slot":1,"ability":{"name":"overgrow","abilityeffecttexts":[{"short_effect":"Strengthens Grass moves to inflict 1.5× damage at 1/3 max HP or less."}]}},
                     {"is_hidden":true,"slot":3,"ability":{"name":"chlorophyll","abilityeffecttexts":[{"short_effect":"Doubles Speed during strong sunlight."}]}}],
 "pokemonstats":[{"base_stat":45,"stat":{"name":"hp"}}, …]}, …]}}
```

Notes:
- `language_id: 9` is English (from `language.url` `/language/9/` in the REST responses).
- The response had `cache-control: max-age=1800` and `cf-cache-status: DYNAMIC`.
- **Unverified:** I didn't query the Type-efficacy tables through GraphQL, so I haven't confirmed their names in v1beta2 or that they match REST `damage_relations`.
- **[strategy]** Facts that pull in opposite directions: GraphQL turns about 284 calls into 1–2 and avoids the `moves` bulk. But it is beta, has a 100/h cap, has a daily outage window, and has already been renamed once. REST is unthrottled, CDN-cached, and the documented stable API.

## Gen 1 data quirks (current data)

- **Display names vs slugs.** Four Species have English names that the slug can't produce:
  - #29 `nidoran-f` → "Nidoran♀"
  - #32 `nidoran-m` → "Nidoran♂"
  - #83 `farfetchd` → "Farfetch’d" (with a **U+2019 curly apostrophe**, not `'`)
  - #122 `mr-mime` → "Mr. Mime"

  The other 147 are just the slug capitalised. This affects search matching: should a typed "farfetch'd", "mr mime" or "nidoran" match?
- **Current Types differ from Red/Blue.** For example, Clefairy is now pure Fairy and Magnemite is Electric/Steel. Fairy and Steel both appear on Gen 1 Species, and Dark is the only Type that appears on none of them.
- **Six Species have no Hidden Ability:** Metapod, Kakuna, Gastly, Haunter, Gengar and Mew. Gengar has only *one* Ability now (Cursed Body), because Levitate was removed in Gen 7 (that part is from memory; the data itself only shows one Ability). The UI has to handle Ability counts of 1, 2 or 3, with or without a hidden one.
- **Every Species has all 6 Base Stats.** All 114 Abilities have an English `short_effect`.
- The **`past_*` fields** (`past_types`, `past_abilities`, `past_stats`, `past_damage_relations`) are populated and could be picked up by mistake. Use the top-level fields.
- **`/type` includes `stellar`, `unknown` and `shadow`.** Filter to ids 1–18.

## Sources

- PokéAPI REST docs: https://pokeapi.co/docs/v2 (sections: Information, Fair Use Policy, Resource Lists/Pagination, Pokémon, Pokémon Species, Abilities, Types)
- PokéAPI GraphQL docs: https://pokeapi.co/docs/graphql
- PokéAPI repo README (GraphQL section): https://github.com/PokeAPI/pokeapi/blob/master/README.md
- Sprites repo: https://github.com/PokeAPI/sprites
- Live responses (2026-10-21): `https://pokeapi.co/api/v2/pokemon?limit=151`, `/pokemon/6`, `/pokemon/151`, `/pokemon-species/6`, `/ability/66`, `/type/fire`, `/type?limit=100`; `https://graphql.pokeapi.co/v1beta2` (query above); `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png`
