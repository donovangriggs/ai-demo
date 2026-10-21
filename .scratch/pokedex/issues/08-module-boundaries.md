# Module boundaries and folder layout

Type: grilling
Status: resolved
Blocked by: 05, 06
Parent: [Pokédex app map](../map.md)

## Question

Where do the parts sit, and what are the interfaces between them?

- The PokéAPI resource functions from [Choose the data-fetching strategy](03-data-fetching-strategy.md): `getSpeciesList`, `getType`, `getPokemon`, `getAbility`, with their trimmed return types.
- The pure domain logic: Type Matchups from [How Type Matchups are computed and presented](05-type-matchups.md), and search matching from [Species display names and search matching](06-display-names-and-search.md).
- The UI components: sidebar layout, `SearchableList`, and the detail sections.

Which folders do they go in (for example `lib/pokeapi/`, `lib/domain/`, `app/`, `components/`)? Which types cross each seam, so that the domain logic has no Next.js or fetch imports and Vitest can test it directly?

Also settle the following, from [Loading, error and not-found states](07-loading-error-not-found-states.md): does the sidebar live in the root layout or in a nested route-group layout? This decides whether the full-page error boundary is `error.tsx` or `global-error.tsx`. Also decide which segment holds the in-layout `not-found.tsx`, the `[id]` `loading.tsx` and the `error.tsx`, given that `/` also shows the sidebar.

## Answer

There are three modules with a one-way dependency direction: `app → components → lib/pokedex` and `app → lib/pokeapi → lib/pokedex`. **Pokédex Number** has been added to `GLOSSARY.md`.

### Routes: the sidebar lives in a `(dex)` route group

```
app/
  layout.tsx            <html>/<body>, fonts only
  error.tsx             full-page "Couldn't load the Pokédex" + Retry (catches (dex)/layout failures)
  not-found.tsx         plain 404 for unknown URLs (no sidebar)
  (dex)/
    layout.tsx          getPokedex() → <Suspense fallback={unfiltered list}><PokedexSidebar/></Suspense> + {children}
    page.tsx            /: <EmptyPane/> (desktop only; narrow screens show the list only)
    pokemon/[id]/
      page.tsx          parsePokedexNumber → notFound() | getSpecies + getTypeChart → detail
      loading.tsx       <DetailSkeleton/>
      error.tsx         "Couldn't reach PokéAPI" + Retry (reset)
      not-found.tsx     "No Species #999. This Pokédex covers #1–151" + link to #1
```

Because the sidebar is in a nested layout, the root `error.tsx` (not `global-error.tsx`) handles list failures. This fulfils [Loading, error and not-found states](07-loading-error-not-found-states.md). `generateStaticParams` returns `1..POKEDEX_SIZE`.

### `lib/pokeapi/`: a deep data module (server-only)

The public interface is three functions that return domain types. Pages never see PokéAPI JSON.

- `getPokedex(): Promise<SpeciesSummary[]>`: the 151 Species as `{ id, slug, displayName, types }`, with Types derived from `type.pokemon[].slot`.
- `getSpecies(id: number): Promise<SpeciesDetail>`: the summary plus `baseStats` and `abilities: { displayName, hidden, shortEffect }[]`. It accepts only a parsed Pokédex Number.
- `getTypeChart(): Promise<TypeChart>`.

Private implementation:
- The per-resource `fetchSpeciesList`, `fetchType`, `fetchPokemon` and `fetchAbility`, each `'use cache'` + `cacheLife('max')`. These are the per-resource cache units from [Choose the data-fetching strategy](03-data-fetching-strategy.md).
- They throw on non-2xx responses and trim to the fields used.
- The raw PokéAPI response types.
- The module starts with `import 'server-only'`.

### `lib/pokedex/`: pure domain logic

It imports nothing from Next.js or fetch. It owns the domain types that `lib/pokeapi` maps into. Tests sit next to the code as `*.test.ts`.

- `types.ts`: `TypeName`, `Multiplier`, `TypeChart`, `SpeciesSummary`, `SpeciesDetail`.
- `type-matchups.ts`: `TYPE_NAMES`, `typeMatchups` and `groupTypeMatchups` (see [How Type Matchups are computed and presented](05-type-matchups.md)).
- `display-name.ts`: `displayName` (see [Species display names and search matching](06-display-names-and-search.md)).
- `search.ts`: `matchesQuery` (same ticket).
- `pokedex-number.ts`: `POKEDEX_SIZE = 151` and `parsePokedexNumber(param: string): number | null`. `'6'` gives 6. `'006'`, `'0'`, `'152'`, `'abc'`, `'6.5'` and `''` give `null`, so the canonical URL is `/pokemon/6`. Covered by Vitest.

### `components/`

- `PokedexSidebar` (`'use client'`) is the single client component. It receives `SpeciesSummary[]` and owns:
  - the search input and `?q=` sync (`useSearchParams` + `history.replaceState`)
  - filtering via `matchesQuery`
  - the empty-search message and Clear button
  - the selected-row highlight (`useParams`)
  - hiding itself on detail routes at narrow widths (`usePathname`)
- Presentational, server-renderable components: `SpeciesRow`, `TypeBadge`, `BaseStats`, `TypeMatchups`, `Abilities`, `DetailSkeleton` and `EmptyPane`.
- **Type Matchups are computed in the page.** The page calls `groupTypeMatchups(typeMatchups(species.types, chart))` and passes the groups to the presentational `<TypeMatchups groups>`. Components hold no domain logic.
