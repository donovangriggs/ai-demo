# Spec: Pokédex (Next.js + PokéAPI)

Status: ready to split into implementation tickets
Map: [Pokédex app map](map.md) · Glossary: [`GLOSSARY.md`](../../GLOSSARY.md) · ADR: [0001 Live PokéAPI behind Cache Components](../../docs/adr/0001-live-pokeapi-with-cache-components.md)

This spec gathers decisions made in the map's tickets. Each section links to the ticket that decided it, and that ticket is the source of truth. If something here seems wrong or missing, raise it rather than deciding it while building.

## 1. What we're building

A local-only (`npm run dev`) Pokédex of the **original 151 Species**, using current data and the default Variety only. It is a demo of AI-assisted development that should also show off modern Next.js, so it should look good but doesn't need to be production-hardened.

- **List**: a sidebar listing all 151 Species with instant search by name or Pokédex Number. The query lives in `?q=`.
- **Detail**: `/pokemon/[id]` shows artwork, Base Stats, Types, Type Matchups, and Abilities with short effect text and a Hidden Ability marker.

### Out of scope

Species beyond #151 · non-default Varieties (Megas, regional forms) · Red/Blue-era data · moves, evolution chains, flavor text, shiny sprites · Type/generation filters and sorting · team builder or games · deployment · E2E tests · GraphQL · a JSON data snapshot ([ADR 0001](../../docs/adr/0001-live-pokeapi-with-cache-components.md)).

## 2. Stack and scaffold

Sources: [Current Next.js data-fetching and caching options](issues/02-nextjs-data-fetching-options.md) and [research notes](research/nextjs-data-fetching-options.md).

- `npx create-next-app@16.4 --yes`, which gives **Next.js 16.4.x** with React 19.3, TypeScript (strict), App Router, **Tailwind v4** wired through `@tailwindcss/turbopack` (no PostCSS config), ESLint 9 flat config, Turbopack, `AGENTS.md`, and **Cache Components** (`cacheComponents: true`, `partialPrefetching: true`). Keep these defaults.
- **Never export route segment configs** (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`, `runtime`), because they error under Cache Components.
- `next.config.ts` also gets `images.remotePatterns: [new URL('https://raw.githubusercontent.com/PokeAPI/sprites/**')]`.
- Add `server-only`.
- **Vitest**, for domain tests only: `vitest` + `vite-tsconfig-paths` (for the `@/` alias), environment `node`, script `"test": "vitest"`. jsdom and Testing Library aren't needed, because no component tests are planned.

## 3. Routes and files

Sources: [Module boundaries and folder layout](issues/08-module-boundaries.md), [Loading, error and not-found states](issues/07-loading-error-not-found-states.md), [Look and feel](issues/04-look-and-feel.md).

```
app/
  layout.tsx            <html>/<body>, fonts only
  error.tsx             full-page "Couldn't load the Pokédex" + Retry (catches (dex)/layout failures)
  not-found.tsx         plain 404 for unknown URLs (no sidebar)
  (dex)/
    layout.tsx          getPokedex() → <Suspense fallback={unfiltered list}><PokedexSidebar/></Suspense> + {children}
    page.tsx            /  → <EmptyPane/> on desktop; narrow screens show the list only
    pokemon/[id]/
      page.tsx          parsePokedexNumber → notFound() | getSpecies + getTypeChart → detail
      loading.tsx       <DetailSkeleton/>
      error.tsx         "Couldn't reach PokéAPI" + Retry (reset)
      not-found.tsx     "No Species #999. This Pokédex covers #1–151" + link to #1
lib/
  pokeapi/              server-only data module (§4)
  pokedex/              pure domain logic and tests (§5)
components/             UI (§6)
```

- `generateStaticParams` in `pokemon/[id]/page.tsx` returns ids `1..POKEDEX_SIZE`, so all 151 pages are prerendered at `next build`.
- The page calls `notFound()` **before any fetch** when `parsePokedexNumber(params.id)` is `null`.
- The canonical URL is `/pokemon/6`. `/pokemon/006` gives not-found.
- Sidebar `<Link>`s use the **default prefetch** (no `prefetch` prop), so 151 links don't each trigger PokéAPI calls.

## 4. Data module: `lib/pokeapi/`

Sources: [Choose the data-fetching strategy](issues/03-data-fetching-strategy.md), [PokéAPI endpoints and data shapes](issues/01-pokeapi-data-shape.md) ([research notes](research/pokeapi-data-shape.md)), [ADR 0001](../../docs/adr/0001-live-pokeapi-with-cache-components.md).

The module starts with `import 'server-only'`. Its **public interface** is three functions that return domain types from `lib/pokedex/types.ts`:

| Function | Returns | Composed from |
|---|---|---|
| `getPokedex()` | `SpeciesSummary[]` (151 × `{ id, slug, displayName, types }`) | `fetchSpeciesList` + 18 × `fetchType`. Each Species' Types come from `type.pokemon[]`, ordered by `slot`, keeping only ids ≤ 151. `displayName` comes from `lib/pokedex`. |
| `getSpecies(id: number)` | `SpeciesDetail` = summary + `baseStats` + `abilities: { displayName, hidden, shortEffect }[]` | `fetchPokemon(id)` + `fetchAbility` per Ability. Takes only a parsed Pokédex Number. |
| `getTypeChart()` | `TypeChart` (18 × `{ id, name, damageFrom: { double, half, none } }`) | 18 × `fetchType` |

**Private implementation**:
- Four fetchers: `fetchSpeciesList` (`/pokemon?limit=151`), `fetchType(name)`, `fetchPokemon(id)` and `fetchAbility(name)`.
  - Each is `'use cache'` + `cacheLife('max')`.
  - Each **throws on any non-2xx response**, so a failure is never cached as data. Verify that a thrown error inside `'use cache'` leaves no cache entry.
  - Each **trims** to the fields used and returns plain serialisable objects.
- Trimming rules:
  - Drop `moves` (it makes `pokemon/{id}` 374–675 KB) and every `past_*` field.
  - Use top-level `types`, `stats`, `abilities` (`is_hidden`) and `damage_relations.*_damage_from`.
  - Take Ability names from the `names[]` entry for language `en`, and short effect text from the `effect_entries[]` entry for `en`.
  - Fetch only the 18 real Types (ids 1–18). Ignore `stellar`, `unknown` and `shadow`.
- Raw PokéAPI response types stay private to this module.

**Request budget**: about 284 PokéAPI calls for a full build (1 list + 151 Pokémon + 114 Abilities + 18 Types). A failure during `next build` must fail the build. Images make no API calls: sprite `…/sprites/pokemon/{id}.png` and artwork `…/sprites/pokemon/other/official-artwork/{id}.png` on `raw.githubusercontent.com/PokeAPI/sprites/master`.

## 5. Domain module: `lib/pokedex/`

The module is pure, with **no Next.js or fetch imports**. Tests sit next to the code as `*.test.ts`. Dependency direction: `app → components → lib/pokedex` and `app → lib/pokeapi → lib/pokedex`.

### `types.ts`
`TypeName` (union of the 18), `Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4`, `TypeChart`, `SpeciesSummary`, `SpeciesDetail`.

### `pokedex-number.ts` ([Module boundaries](issues/08-module-boundaries.md))
- `POKEDEX_SIZE = 151`.
- `parsePokedexNumber(param: string): number | null`: `'6'` gives `6`. `'006'`, `'0'`, `'152'`, `'abc'`, `'6.5'` and `''` give `null`.

### `type-matchups.ts` ([How Type Matchups are computed](issues/05-type-matchups.md))
- `TYPE_NAMES`: the 18 Types in PokéAPI id order (normal, fighting, flying, poison, ground, rock, bug, ghost, steel, fire, water, grass, electric, psychic, ice, dragon, dark, fairy).
- `typeMatchups(defending: TypeName[], chart: TypeChart): Record<TypeName, Multiplier>`: for each attacking Type, multiply the factor from each defending Type (`double` = 2, `half` = 0.5, `none` = 0, unlisted = 1).
- `groupTypeMatchups(matchups)` returns `{ weakTo, resists, immuneTo }`, each a list of `{ type, multiplier }`. 1× is dropped, and each list is sorted strongest first, then by Type id.
- **Tests**, against a hand-written minimal Type Chart fixture (fire, flying, water):
  - Charmander (Fire): weak to Water, Ground and Rock (2×). Resists Bug, Steel, Fire, Grass, Ice and Fairy (½×, in id order).
  - Charizard (Fire/Flying): Rock 4×. Grass and Bug ¼×. Ground 0× (Fire's 2× cancelled by Flying's immunity). Ice 1×, so hidden.
  - Gyarados (Water/Flying): Electric 4×. Ground 0×. Grass 1×, so hidden.
  - Charizard `weakTo` = `[rock 4×, water 2×, electric 2×]`.

### `display-name.ts` ([Species display names and search matching](issues/06-display-names-and-search.md))
- `displayName(slug)`: overrides `nidoran-f` → "Nidoran♀", `nidoran-m` → "Nidoran♂", `farfetchd` → "Farfetch’d" (U+2019) and `mr-mime` → "Mr. Mime". Every other slug is title-cased per hyphen part.
- **Tests**: the 4 overrides, `bulbasaur` → "Bulbasaur", and `solar-power` → "Solar Power".

### `search.ts` (same ticket)
- `matchesQuery(species: SpeciesSummary, q: string): boolean`:
  1. Trim the query and strip one leading `#`. An empty query matches all.
  2. **All digits → number query**: it matches when `String(id)` **or** the 3-digit zero-padded id starts with `q`.
  3. **Otherwise → name query**: normalise both sides (lowercase, strip accents via NFKD, keep only `a–z0–9`). It matches when the query is a substring of the normalised display name **or** the normalised slug. A query that normalises to empty matches all.
- **Tests**:
  - `'char'` and `'CHAR'` → Charmander, Charmeleon, Charizard.
  - `'mr mime'` and `'mr.mime'` → Mr. Mime.
  - `'farfetch'd'` and `'farfetchd'` → Farfetch’d.
  - `'nidoran'` → both Nidoran. `'nidoran f'` → Nidoran♀ only.
  - `'6'` and `'#6'` → #6 and #60–69. `'006'` → #6 only. `'15'` → #15, #150, #151.
  - `''` → all 151. `'zzz'` → none.

## 6. UI: `components/`

Sources: [Look and feel](issues/04-look-and-feel.md) (prototype: [look-and-feel.prototype.html](prototypes/look-and-feel.prototype.html), variant B for layout, variant A for the detail sections), [Loading, error and not-found states](issues/07-loading-error-not-found-states.md).

### Layout
A master–detail split: a persistent sidebar next to a detail pane. The prototype used `w-72` for the sidebar, which is a suggestion. **Below a breakpoint** it stacks: `/` shows the list only, and `/pokemon/[id]` shows the detail only, with a back link to the list. `md` is the suggested breakpoint.

### Components

| Component | Kind | Responsibility |
|---|---|---|
| `PokedexSidebar` | `'use client'` | Receives `SpeciesSummary[]`. Shows the title and "N/151" count, and owns the search input. Syncs `?q=` via `useSearchParams` + `history.replaceState` (no server round trip). Filters with `matchesQuery`. Shows the empty-search message "No Species match “zzz”" with a **Clear search** button. Highlights the selected row (`useParams`) and hides itself on detail routes at narrow widths (`usePathname`). Must be rendered inside `<Suspense>`, with the unfiltered list as the fallback. |
| `SpeciesRow` | presentational | Sprite (32px), `#NNN`, display name, Type **badges**. |
| `TypeBadge` | presentational | Rounded uppercase pill in the Type colour (see below). |
| `BaseStats` | presentational | One row per stat: label, value, and a bar scaled to 255 and tinted with the **primary Type** colour. Total at the bottom. Labels: HP, Attack, Defense, Sp. Atk, Sp. Def, Speed. |
| `TypeMatchups` | presentational | Takes **pre-grouped** `{ weakTo, resists, immuneTo }`. Shows **Weak to**, **Resists** and **Immune to** groups of badges, each with its multiplier (¼× ½× 2× 4× 0×). Empty groups are omitted. |
| `Abilities` | presentational | Display name, a "Hidden" marker for a Hidden Ability, and the short effect text. |
| `DetailSkeleton` | presentational | Used by `loading.tsx`. Shaped like the detail pane: artwork box, stat bars, badge rows. |
| `EmptyPane` | presentational | The `/` desktop pane: a quiet "Select a Pokémon" hint. |

The **detail page** shows the header (artwork via `next/image`, `#NNN`, display name, Type badges), then Base Stats, Type Matchups and Abilities. **The page computes Type Matchups** with `groupTypeMatchups(typeMatchups(species.types, chart))` and passes the groups to `<TypeMatchups>`. Components contain no domain logic.

**Type colours** (from the prototype): normal `#A8A77A`, fire `#EE8130`, water `#6390F0`, electric `#F7D02C`, grass `#7AC74C`, ice `#96D9D6`, fighting `#C22E28`, poison `#A33EA1`, ground `#E2BF65`, flying `#A98FF3`, psychic `#F95587`, bug `#A6B91A`, rock `#B6A136`, ghost `#735797`, dragon `#6F35FC`, dark `#705746`, steel `#B7B7CE`, fairy `#D685AD`.

## 7. Suggested implementation slices

Each slice can become one implementation ticket. Slices 2 and 3 can run in parallel once slice 1 is done.

1. **Scaffold**: `create-next-app` with defaults, `remotePatterns`, `server-only`, Vitest setup, `npm test` passing on an empty suite.
2. **Domain logic (test-first)**: `lib/pokedex` types, `pokedex-number`, `display-name`, `search` and `type-matchups`, with every test case listed in §5.
3. **Data module**: the four private `fetch*` functions (`'use cache'`, throw on non-2xx, trim) and the three public functions. Check them by hand from a temporary page or a script.
4. **List and search**: root layout, the `(dex)` layout, `PokedexSidebar` + `SpeciesRow` + `TypeBadge`, and `EmptyPane` at `/`.
5. **Detail page**: `pokemon/[id]/page.tsx` with `generateStaticParams`, the `parsePokedexNumber` → `notFound()` check, and `BaseStats`, `TypeMatchups` and `Abilities`.
6. **States**: both `not-found.tsx`, `loading.tsx` + `DetailSkeleton`, both `error.tsx`, and the empty search state.
7. **Responsive stacking and polish**: narrow-screen list/detail split with the back link, and a visual pass against the prototype.

## 8. Done when

- `npm test` passes, covering every case in §5.
- `npm run build` succeeds and prerenders 151 `/pokemon/[id]` pages.
- In `npm run dev`:
  - Typing in search filters instantly and updates `?q=`.
  - Clicking a row opens `/pokemon/[id]` with the sidebar kept and the row highlighted.
  - List → detail → back keeps the search text.
- `/pokemon/999`, `/pokemon/abc` and `/pokemon/006` show the in-layout not-found page. `/foo` shows the plain 404.
- Charizard's detail page shows Weak to Rock 4×, Water 2×, Electric 2×. Resists ¼× Bug and Grass, then ½× Fighting, Steel, Fire and Fairy. Immune to Ground.
- At phone width, `/` is list-only and `/pokemon/6` is detail-only with a back link.

## 9. Verify during implementation

These points were left unconfirmed by the research:

- A thrown error inside a `'use cache'` function leaves no cache entry. If it does leave one, the throw-don't-cache rule needs another mechanism. Raise it rather than working around it.
- Whether the `useSearchParams` Suspense boundary causes any build-time warning under Cache Components. `ensureStatic` is deliberately not used.
