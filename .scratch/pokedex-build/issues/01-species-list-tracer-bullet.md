# 01: Tracer bullet: the 151 Species list

**What to build:** Opening the app at `/` shows a sidebar listing all 151 Species in Pokédex Number order. Each row shows the sprite, `#NNN` and the Species' display name (e.g. "Nidoran♀", "Mr. Mime"). This sets up the whole stack end to end: the scaffold, the PokéAPI data module with its first cached fetcher, the pure domain module with its first tests, and the `(dex)` route-group layout that holds the sidebar.

Spec: [spec.md](../../pokedex/spec.md), §2 Stack and scaffold, §3 Routes, §4 Data module (`getPokedex`), §5 `display-name` and `pokedex-number`, §6 `PokedexSidebar` / `SpeciesRow`. ADR: [0001](../../../docs/adr/0001-live-pokeapi-with-cache-components.md).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The app is scaffolded with the Next.js 16.4 `create-next-app` defaults (TypeScript, Tailwind v4, App Router, Cache Components). No route segment configs are exported.
- [ ] Vitest runs domain tests in a node environment through `npm test`, with the `@/` alias resolving.
- [ ] Remote images from `raw.githubusercontent.com/PokeAPI/sprites/**` are allowed for `next/image`, and the data module is guarded as server-only.
- [ ] The data module's public `getPokedex()` returns 151 Species summaries (Pokédex Number, slug, display name) in domain types. The underlying list fetch is cached (`'use cache'` + `cacheLife('max')`), throws on non-2xx responses, and returns trimmed plain objects. Pages never see raw PokéAPI shapes.
- [ ] `displayName` handles the 4 overrides (Nidoran♀, Nidoran♂, Farfetch’d with U+2019, Mr. Mime) and otherwise title-cases each hyphen part. Tests cover the 4 overrides, `bulbasaur` and `solar-power`.
- [ ] `POKEDEX_SIZE = 151` exists in the domain module.
- [ ] The root layout holds only the html, body and fonts. The sidebar lives in a `(dex)` route-group layout, with the list rendered by the client `PokedexSidebar` from summaries passed in as props.
- [ ] `npm run dev` shows all 151 rows at `/`, and `npm test` passes.
