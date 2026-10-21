# Choose the data-fetching strategy

Type: grilling
Status: resolved
Blocked by: 01, 02
Parent: [Pokédex app map](../map.md)

## Question

How does the app get PokéAPI data, and when? The options are build-time static generation, Server Components fetching on request with caching, client-side fetching, or a mix. Where does search filtering run? The choice should show off modern Next.js and stay within PokéAPI fair use, using the facts from [PokéAPI endpoints, data shapes and fair-use for the v1 feature set](01-pokeapi-data-shape.md) and [Current Next.js data-fetching and caching options for a small static dataset](02-nextjs-data-fetching-options.md).

Inputs from resolved tickets: [Look and feel of the list and detail pages](04-look-and-feel.md) settled on a `/pokemon/[id]` route under a shared sidebar layout, where every list row shows Type badges (all 151 Species' Types are needed up front). The 18 `type/{name}` calls cover both the badges and the matchups.

## Answer

**Live PokéAPI calls behind Cache Components**, with server functions scoped to one PokéAPI resource each. ADR: [Live PokéAPI behind Cache Components, not a committed JSON snapshot](../../../docs/adr/0001-live-pokeapi-with-cache-components.md).

- **Caching model**: Cache Components (`cacheComponents: true` + `partialPrefetching: true`, the 16.4 scaffold default). Don't export route segment configs (`dynamic`, `revalidate`, `dynamicParams`, …) because they error under this model.
- **Data access**: `'use cache'` + `cacheLife('max')` server functions, one per PokéAPI resource: `getSpeciesList()` (the 151 names and ids), `getType(name)` (the 18 Types only, ids 1–18), `getPokemon(id)`, and `getAbility(name)`. Each one fetches and **trims** to the fields the app uses: drop `moves` and every `past_*` field, and keep only English short effect text. Cached values must be serialisable (plain objects and arrays). Pages compose these functions, so shared Types and Abilities are fetched once.
- **List + search**: the sidebar layout (a Server Component) loads the 151 list entries and the 18 Types, and derives each Species' Types from `type.pokemon[].slot`. It passes them to a client `SearchableList` that filters **in memory** as you type. That component reads `?q=` through `useSearchParams` inside `<Suspense>` (the fallback is the unfiltered list) and writes it with `history.replaceState`, so there's no server round trip. Cache Components' `<Activity>` keeps search state when navigating list → detail → back.
- **Detail**: `/pokemon/[id]`, where `generateStaticParams` returns all 151 ids, so every detail page is prerendered at `next build` (about 284 PokéAPI calls per build). Any `id` that isn't an integer from 1 to 151 calls `notFound()` **before** any fetch.
- **Prefetch**: default `<Link>`, which prefetches only the App Shell. There is no per-link `prefetch`, which avoids 151 prefetches fanning out to PokéAPI.
- **Images**: `next/image` with `images.remotePatterns` set to `https://raw.githubusercontent.com/PokeAPI/sprites/**`. Sprite and artwork URLs are built from the id.
- **Not used**: GraphQL (beta, 100 calls/h), a JSON snapshot (see the ADR), and `ensureStatic` (its interaction with the search Suspense boundary is unverified).
