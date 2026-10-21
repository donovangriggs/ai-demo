# Pokédex app (Next.js + PokéAPI)

Label: wayfinder:map

## Destination

A build-ready spec at `.scratch/pokedex/spec.md` for a local-only Next.js + Tailwind Pokédex of Species #1–151 (current data, default Variety only): an instant name/number search list leading to a detail page with Base Stats, Types + Type Matchups, and Abilities (short effect text, Hidden Ability marker). Ready to split into implementation tickets.

## Notes

- Purpose: a demo of AI-assisted development that also shows off modern Next.js. It should look good, but it doesn't need to be production-hardened.
- Runs locally (`npm run dev`) only. Deployment is not a concern.
- Data source: https://pokeapi.co/ (REST, no auth).
- Styling: Tailwind CSS.
- Testing: Vitest unit tests on domain logic (Type Matchups, search matching). No E2E.
- Search: instant filtering as you type, matching on name substring or Pokédex number, with the query kept in the URL (`?q=`).
- Vocabulary: use `GLOSSARY.md` (Species, Variety, Type, Type Matchup, Ability, Hidden Ability, Base Stats, Pokédex).
- Skills: call `grilling` + `domain-modeling` on grilling tickets, and `prototype` on prototype tickets.
- Research findings live in `.scratch/pokedex/research/` (this dir isn't a git repo, so there are no research branches).

## Decisions so far

<!-- one line per closed ticket: [title](link): gist -->

- [PokéAPI endpoints, data shapes and fair-use for the v1 feature set](issues/01-pokeapi-data-shape.md): 4 REST endpoints, about 284 requests for a full crawl. No rate limit, but local caching is expected. GraphQL is beta and limited to 100 calls/h. Four Species have display names that don't match their slugs.
- [Current Next.js data-fetching and caching options for a small static dataset](issues/02-nextjs-data-fetching-options.md): Next.js 16.4.2. New apps get Cache Components by default, so data is cached only via `'use cache'` + `cacheLife`. `dynamicParams` is gone, so unknown ids need `notFound()`. Reading `?q=` with `useSearchParams` needs a `<Suspense>` boundary. Tailwind v4 is set up without PostCSS. No test runner is included.
- [Look and feel of the list and detail pages](issues/04-look-and-feel.md): a master–detail sidebar layout with a `/pokemon/[id]` route per Species, which stacks on narrow screens. Type badges in list rows, coloured Base Stat bars, and Type Matchups grouped with 1× hidden.
- [Choose the data-fetching strategy](issues/03-data-fetching-strategy.md): Cache Components, with cached server functions per PokéAPI resource that fetch live data and trim it (see [ADR 0001](../../docs/adr/0001-live-pokeapi-with-cache-components.md)). Search filters on the client with `?q=`. All 151 detail pages are prerendered at build, unknown ids get `notFound()`, and images use `next/image` with `remotePatterns`.
- [How Type Matchups are computed and presented](issues/05-type-matchups.md): a pure `typeMatchups(defending, typeChart)` function plus `groupTypeMatchups`, using the cached Type data with no hard-coded chart. Groups are sorted strongest first, then by Type id. Vitest runs Charmander, Charizard and Gyarados against a hand-written fixture.
- [Species display names and search matching](issues/06-display-names-and-search.md): `displayName` capitalises the slug, with 4 overrides and no extra calls. `matchesQuery` matches the start of the number (plain or zero-padded), or a normalised substring of the display name or slug. The Vitest cases are listed in the ticket.
- [Loading, error and not-found states](issues/07-loading-error-not-found-states.md): `/` shows an empty detail pane. The not-found page and loading skeleton sit inside the sidebar layout. An empty search shows a message and a Clear button. Detail errors get a Retry in the pane and list errors a full-page Retry. API failures are never cached, and a build fails loudly.
- [Module boundaries and folder layout](issues/08-module-boundaries.md): the sidebar lives in a `(dex)` route group. `lib/pokeapi` is server-only and exposes just `getPokedex`, `getSpecies` and `getTypeChart`. `lib/pokedex` holds the pure domain logic, with tests next to it, including `parsePokedexNumber`. One client `PokedexSidebar`; the page computes Type Matchups and the components only display them.
- [Assemble the build-ready spec](issues/09-assemble-spec.md): [spec.md](spec.md) is written, with 7 implementation slices. **Destination reached.**

## Not yet specified

_Nothing left: all remaining work is ticketed._

## Out of scope

- Species beyond #151 (Gen 2+): scope was limited to the original 151.
- Non-default Varieties (Megas, regional forms, Gigantamax): each Species shows its default Variety only.
- Red/Blue-era historical data: current types, stats and abilities are used instead.
- Moves/learnsets, evolution chains, flavor text, shiny sprites: not included in the v1 detail page.
- Type/generation filters and sorting: search is by name/number only.
- Team builder, guessing game, other utilities: this effort is a Pokédex browser.
- Deployment/hosting: local only.
- E2E tests: unit tests on domain logic only.
