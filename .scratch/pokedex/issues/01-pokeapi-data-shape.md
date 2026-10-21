# PokéAPI endpoints, data shapes and fair-use for the v1 feature set

Type: research
Status: resolved
Parent: [Pokédex app map](../map.md)

## Question

Which PokéAPI REST calls, at minimum, cover the v1 feature set for Species #1–151 (default Variety), and what do the responses look like?

- **List + search**: names and National Pokédex numbers for all 151, plus the artwork/sprite URL each list row needs.
- **Detail**: Base Stats, Types, Abilities (with `is_hidden`), and English short effect text for each Ability.
- **Type Matchups**: the shape of `type/{name}` `damage_relations`, and whether 18 type fetches cover every matchup.
- **Totals**: how many requests a full build or crawl of all 151 takes, and which calls are shared or cacheable.
- **Fair use**: rate limits and caching guidance from PokéAPI's docs.
- **Images**: where official artwork is hosted (domain, for `next/image` remote patterns).
- **GraphQL**: whether PokéAPI's GraphQL endpoint is stable enough to cut the request count, or should be avoided.

Capture the findings in `.scratch/pokedex/research/pokeapi-data-shape.md`, with example response excerpts.

## Answer

- Minimal REST set: `pokemon?limit=151` (list), `pokemon/{id}` (Base Stats, Types, Abilities with `is_hidden`), `ability/{id}` (English `short_effect`), `type/{name}` (`damage_relations.*_damage_from`). Add `pokemon-species/{id}` only for display names.
- Full crawl: 1 + 151 + 114 unique Abilities + 18 Types = **284 requests** (435 with species). Fetching all 18 Types covers every Type Matchup. Note that `/type` lists 21 entries, so filter to ids 1–18.
- Fair use: the REST API has no rate limit, but you must cache locally. Responses come back with `max-age=86400`. Artwork is on `raw.githubusercontent.com/PokeAPI/sprites/...`, and the URL can be built from the id.
- GraphQL (`graphql.pokeapi.co/v1beta2`) works and returns all 151 in one 138 KB call. It is beta, capped at 100/h per IP, reboots daily, and has already been renamed once.
- Quirks: 4 display names don't match their slugs (Nidoran♀/♂, Farfetch’d with U+2019, Mr. Mime). Current Types include Fairy and Steel. 6 Species have no Hidden Ability.

Details: [pokeapi-data-shape.md](../research/pokeapi-data-shape.md)
