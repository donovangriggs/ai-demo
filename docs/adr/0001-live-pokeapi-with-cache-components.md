# Live PokéAPI behind Cache Components, not a committed JSON snapshot

The Pokédex reads PokéAPI live, through server functions scoped to one PokéAPI resource each (`getSpeciesList`, `getType`, `getPokemon`, `getAbility`). Each function is marked `'use cache'` + `cacheLife('max')` under Next.js 16's Cache Components, and trims its response to the fields the app uses. All 151 `/pokemon/[id]` pages are prerendered at build time. We chose this over a build-time script that snapshots PokéAPI into committed JSON, even though a snapshot would mean zero runtime API calls, offline development and deterministic data. The app exists to show off modern Next.js, and a snapshot would leave almost no caching to demonstrate. Per-resource caching satisfies PokéAPI's fair-use rule to "locally cache resources" while keeping traffic low: about 284 calls for a full build, and the 18 Types and 114 Abilities are fetched once each.

## Consequences

- The cache is held in memory per process. Restarting `next dev`, editing a cached function, or making a new build fetches again.
- The app needs network access to PokéAPI to run or build.
- This relies on Cache Components semantics, so `dynamicParams` is unavailable and unknown ids are rejected with `notFound()`.
