# Next.js data-fetching and caching options for a small static dataset

Research for [02-nextjs-data-fetching-options](../issues/02-nextjs-data-fetching-options.md). This file covers facts and trade-offs only. The strategy decision is made in a separate grilling ticket.

Researched 2026-10-21. Sources: the official Next.js docs (the pages cited were last updated between 2026-06 and 2026-10-15), the Next.js release blog, `npm view`, and a scaffold made with `create-next-app@16.4.2 --yes` in a scratch directory.

## 0. Version baseline

| Fact | Value | Source |
|---|---|---|
| Current stable `next` (`latest` dist-tag) | **16.4.2** (published 2026-10-15) | `npm view next dist-tags` |
| Canary | 16.5.0-canary.21 | same |
| Previous major still patched | 15.5.28 (`backport` tag) | same |
| React shipped by create-next-app | 19.3.0 | scaffolded `package.json` |
| Next.js 16.0 release | 2025-10-21 | https://nextjs.org/blog/next-16 |
| Next.js 16.4 release | 2026-10-06 | https://nextjs.org/blog/next-16-4 |

The sections below apply to **Next.js 16.4.x with the App Router**, unless a different version is named.

## 1. The big change: Cache Components is now the default for new apps

- **Cache Components became stable in 16.0.0.** It is enabled with the top-level `cacheComponents: true`, which replaces `experimental.dynamicIO`, `experimental.useCache` and `experimental.ppr`. The `experimental_ppr` segment export is removed. Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents (version history: 16.0.0).
- **From 16.4, `create-next-app` turns on Cache Components by default**, and the docs recommend it "as the best choice for every Next.js app". It "will become the default in Next.js 17". Source: https://nextjs.org/blog/next-16-4.
- **Partial Prefetching is now considered part of the model.** New apps get both flags. If `partialPrefetching` is left unset, Next.js logs a warning. Both options "will be enabled everywhere in the next major release, and the options will be removed". Source: https://nextjs.org/docs/app/getting-started/caching.
- I verified this against the scaffolded `next.config.ts` from `create-next-app@16.4.2 --yes`:
  ```ts
  const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
  };
  ```
- The docs now split caching into two models:
  - **Cache Components:** https://nextjs.org/docs/app/getting-started/caching
  - **"Caching and Revalidating (Previous Model)":** https://nextjs.org/docs/app/guides/caching-without-cache-components. The Previous Model is not marked deprecated. It is what you get when `cacheComponents` is off.

### What changed across 14 → 15 → 16

| Version | Change | Source |
|---|---|---|
| 14 | `fetch` cached by default, `GET` Route Handlers cached by default, and the client Router Cache cached Page segments. `images.domains` deprecated. | https://nextjs.org/blog/next-15, image docs version history |
| 15.0 | **Breaking:** `fetch`, `GET` Route Handlers and client navigations are "no longer cached by default". `params`, `searchParams`, `cookies()` and `headers()` became async. `"use cache"` introduced as experimental. | https://nextjs.org/blog/next-15, https://nextjs.org/docs/app/api-reference/directives/use-cache |
| 16.0 | Cache Components stable (`cacheComponents`). `"use cache"`, `cacheLife` and `cacheTag` stable, and `unstable_cacheLife`/`unstable_cacheTag` deprecated. `revalidateTag(tag)` with one argument deprecated, so it now needs a profile, e.g. `revalidateTag(tag, 'max')`. New `updateTag()` and `refresh()`. Sync access to `params`/`searchParams` removed. Turbopack is the default bundler. `next lint` removed. `middleware.ts` deprecated in favour of `proxy.ts`. Node 20.9+ required. | https://nextjs.org/blog/next-16 |
| 16.3 | Instant-navigation validation and Partial Prefetching. The App Shell is served for unlisted params; earlier versions waited for a full server render. | https://nextjs.org/blog/next-16-3-instant-navigations, ISR guide below |
| 16.4 | Cache Components on by default in create-next-app. New `ensureStatic` segment config. New `navigation()`/`prefetch()` functions in `next/cache` for deferring work. React 19.3. | https://nextjs.org/blog/next-16-4 |

## 2. Caching under Cache Components (16.x, current default)

**Core rule:** "Data fetching is dynamic by default, and you choose what to cache at the page, component, or function level." You opt in with `'use cache'`. Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents.

- **`'use cache'`** can go at file level, component level or function level. The function must be async. Arguments and closed-over values become part of the cache key. Arguments and return values must be serializable: plain objects, arrays, primitives, Date, Map and Set are allowed. Class instances and `URL` instances are not. Source: https://nextjs.org/docs/app/api-reference/directives/use-cache.
- **`cacheLife(profile)`** sets the lifetime. The docs recommend one in every `use cache` scope. Without it, the `default` profile applies (stale 5 min, revalidate 15 min, never expires). Source: https://nextjs.org/docs/app/api-reference/functions/cacheLife.

  | Profile | stale | revalidate | expire |
  |---|---|---|---|
  | `default` | 5 min | 15 min | never |
  | `hours` | 5 min | 1 h | 1 day |
  | `days` | 5 min | 1 day | 1 week |
  | `weeks` | 5 min | 1 week | 30 days |
  | `max` ("rarely changes") | 5 min | 30 days | 1 year |

  Prerendering thresholds:
  - Content is excluded from prerenders (it becomes a "dynamic hole") if `revalidate` is 0 or `expire` is under 5 minutes.
  - Content is also excluded if `stale` is under 30 seconds.
  - Of the presets, only `seconds` falls under these thresholds. You can define custom profiles, or redefine built-ins, under `cacheLife` in `next.config.ts`.
- **`cacheTag(tag)`** marks entries for on-demand invalidation with `revalidateTag(tag, profile)` or `updateTag(tag)`. `updateTag` works only in Server Actions. A rarely-changing dataset will probably never need this.
- **`fetch` behaviour:**
  - A fetch inside a `use cache` scope is cached as part of that scope.
  - A fetch outside one is uncached and runs at request time. It must sit behind `<Suspense>`, otherwise the dev overlay or build flags a **blocking-route** insight.
  - The `fetch` options `cache: 'force-cache'` and `next: { revalidate, tags }` "keep working". The migration guide maps them to `use cache` + `cacheLife` + `cacheTag`.
  - Source: https://nextjs.org/docs/app/guides/migrating-to-cache-components.
- **Route segment configs that are not allowed with Cache Components:** `dynamic`, `revalidate`, `fetchCache`, `dynamicParams` and `runtime` all error. `unstable_noStore` is unnecessary. `unstable_cache` still works. Same source.
- **Where entries live:**
  - Build-time prerenders become static HTML plus an RSC payload.
  - Runtime `use cache` entries are kept in an in-memory LRU per instance. That is fine for `next start` or `next dev` on one machine.
  - Cache keys include the build ID, so a new build starts with empty caches.
  - Source: https://nextjs.org/docs/app/getting-started/caching ("Where cached content is stored").
- **Dev behaviour:**
  - The cache key includes an "HMR refresh hash (development only)", so editing code invalidates entries. Otherwise entries are reused across requests in the dev server.
  - The dev console prefixes logs from cached functions with `Cache`.
  - Source: the use-cache docs above.
- **Predictable values:** module-scope reads, `import`ed JSON and synchronous I/O complete during prerender and go into the static shell with no `use cache` needed. This matters if PokéAPI data is snapshotted to a local JSON file. Source: https://nextjs.org/docs/app/getting-started/caching ("Predictable values").
- **`ensureStatic` (16.4+):** `export const ensureStatic = 'navigation'` on a page or layout **fails the build** if any dynamic content gets into the route. This is a guardrail for "this route must be fully static". Less strict levels are `'prefetch'` and `'shell'`. Source: https://nextjs.org/blog/next-16-4, https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic.
- **Navigation with `<Activity>`:**
  - With Cache Components on, a route you navigate away from is set to `hidden` instead of being unmounted.
  - `useState` values, form inputs and scroll position persist when you navigate back.
  - Example: search box state survives list → detail → back.
  - Source: the cacheComponents docs above, and https://nextjs.org/docs/app/guides/preserving-ui-state.

## 3. Static pre-rendering of `/pokemon/[id]` (151 pages)

### With Cache Components (default for a new app)

- **`generateStaticParams`** works as before (since v13). Returning all 151 ids prerenders all 151 pages at `next build`. Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params.
- **It must return at least one param.** An empty array is a build error (`empty-generate-static-params`). The `return []` idiom from the Previous Model meant "all paths at runtime", and it no longer works here. Same source, section "With Cache Components".
- **`dynamicParams` is not supported.** Exporting it fails the build with: "Route segment config "dynamicParams" is not compatible with `nextConfig.cacheComponents`." Params that `generateStaticParams` does not return "are rendered on request". To reject them, as `dynamicParams = false` used to, **call `notFound()` in the page when the param doesn't resolve to real data**. This applies directly to `/pokemon/999` and `/pokemon/abc`. Source: https://nextjs.org/docs/app/guides/migrating-to-cache-components ("`dynamicParams` is not supported").
- **Two ways to structure the page:**
  - **Await `params` at the top**, with data in `use cache` functions. Listed params become fully static pages. Docs example: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes ("With Cache Components → With `generateStaticParams`").
  - **Await `params` inside `<Suspense>`**. With Partial Prefetching on, Next.js prerenders a reusable **App Shell**. Unlisted URLs get that shell instantly and are then upgraded and cached after the first visit (ISR). Source: https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components. The docs recommend this for layouts: "Keep the read inside the boundary even for the [params] `generateStaticParams` covers."
- **Build-time validation** runs the route with each listed param. Uncached data or runtime APIs reached outside `<Suspense>` fail the build. Branches that only run for unlisted params are not validated until the first request for them. Source: the dynamic-routes docs above.
- **Links:** a default `<Link>` prefetches only the App Shell. `<Link prefetch={true}>` prefetches the param-specific cached content as well, at the cost of one server invocation per visible link. For a list of 151 links, this trade-off decides between "detail page appears instantly on click" and "151 prefetch requests". 16.4's `await navigation()` can keep heavy parts out of the prefetch. Source: https://nextjs.org/docs/app/getting-started/caching ("Prefetching"), https://nextjs.org/blog/next-16-4.
- **In `npm run dev`** (the only runtime the map targets), `generateStaticParams` "will be called when you navigate to a route". Pages are rendered on demand in dev and are not prerendered. Static generation therefore mostly affects `next build`. In dev, the thing that bounds PokéAPI traffic is the `use cache` in-memory entries.

### Previous Model (`cacheComponents: false`, still documented)

- `generateStaticParams` returning all 151 ids, plus `export const dynamicParams = false`, makes every other id a 404 automatically. Source: generateStaticParams docs ("Disable rendering for unspecified paths").
- `fetch` is uncached by default (since 15). Use `cache: 'force-cache'` or `next: { revalidate: N }`, or route-level `export const revalidate`, `dynamic = 'force-static'` and so on. Source: https://nextjs.org/docs/app/guides/caching-without-cache-components.
- Reading `searchParams` or `cookies()` makes the **whole route** dynamic. There is no partial prerendering.

### Fully static output (`output: 'export'`)

- Generates an `out/` folder of HTML, CSS and JS. Source: https://nextjs.org/docs/app/guides/static-exports.
- Unsupported with this option:
  - dynamic routes with `dynamicParams: true` or without `generateStaticParams`
  - Image Optimization with the default loader, so you need a custom `loader` or `unoptimized`
  - ISR, Proxy, rewrites, redirects, headers and Server Actions
- **`'use cache'` platform support lists "Static export: No".** Source: https://nextjs.org/docs/app/api-reference/directives/use-cache ("Platform Support"). The docs do not state any other compatibility between `cacheComponents` and `output: 'export'`, and I have not verified one. Deployment is out of scope for this app, so static export is optional.

## 4. Instant search with `?q=`

The facts, each with a source:

- **`useSearchParams()`** is a Client Component hook that returns a read-only `URLSearchParams`. Server Components cannot use it. Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params.
- **A Suspense boundary is required.**
  - In a prerendered route, the Client Component that calls it is client-rendered up to the nearest `<Suspense>`, and the fallback goes into the static HTML.
  - In a production build without a boundary, the Previous Model fails with "Missing Suspense boundary with useSearchParams".
  - Under Cache Components, the same mistake raises **blocking-prerender-client-hook**: "The `useSearchParams` hook triggers this error on any prerendered route because search params come from the request URL."
  - Dev does not suspend, so a missing boundary "may appear to work" until `next build`.
  - Sources: the useSearchParams docs above, and https://nextjs.org/docs/messages/blocking-prerender-client-hook.
- **Trade-off of the boundary:** the user sees the fallback on first paint, then the real value after hydration. The docs advise a fallback shaped like the final layout to avoid layout shift. For a Pokédex list, one natural fallback is the unfiltered list rendered from server data. Same source ("Trade-off").
- **Updating the URL without a server round trip:** `window.history.pushState` and `replaceState` "integrate into the Next.js Router, allowing you to sync with `usePathname` and `useSearchParams`". `router.push`/`router.replace` and `<Link>` instead trigger a navigation, so the page receives new `searchParams` and server work is re-run. Sources: https://nextjs.org/docs/app/guides/single-page-applications ("Shallow routing on the client"), the useSearchParams docs ("Updating `searchParams`").
- **Server-side `searchParams` page prop:** it is a promise. Under Cache Components it is runtime data, so it must be awaited inside `<Suspense>`. A cached `search(q)` function keyed by `q` can then fill a per-link prefetch. Source: https://nextjs.org/docs/app/getting-started/caching ("Prefetching", search page example), and the migration guide's `cookies`, `headers`, and `searchParams` section.

The options for this app, a list of 151 Species filtered by name substring or Pokédex number:

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **A. Client-side filtering** | A Server Component loads all 151 list entries (cached or static) and passes them as props to a Client Component. That component reads `q` with `useSearchParams` (inside `<Suspense>`), filters in memory, and writes `q` with `history.replaceState`. | Truly instant, with no network per keystroke. Filtering logic is a pure function, easy to unit-test with Vitest. The list data stays in the static shell. | All 151 entries are sent to the client (small). First paint shows the Suspense fallback until hydration, so the fallback should be the unfiltered list or a skeleton. |
| **B. Server-side filtering** | The page reads the `searchParams` prop inside `<Suspense>`. A cached `search(q)` runs on the server. The input calls `router.replace('?q=…')`. | Less client JS. A deep link `?q=char` server-renders the filtered result. | Each keystroke is a server round trip, so not instant without debouncing. Every distinct `q` is a separate cache entry. |
| **C. Hybrid** | Like A, but the server also reads `searchParams` to render the initial filtered HTML. | Correct HTML on a direct deep-link visit. | The most complex option. The server read makes that part request-time (inside Suspense). |

With 151 records, every option filters fast. The choice depends on what "instant" means, what the first-paint behaviour should be, and how to keep the logic testable.

## 5. Remote images (`next/image`)

Source: https://nextjs.org/docs/app/api-reference/components/image.

- **Remote `src` requires `images.remotePatterns`.** `images.domains` has been deprecated since v14, and the 16 blog repeats the deprecation. Since 15.3, `remotePatterns` also accepts `URL` objects:
  ```ts
  images: { remotePatterns: [new URL('https://raw.githubusercontent.com/PokeAPI/sprites/**')] }
  ```
  You can also use the object form: `{ protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/PokeAPI/sprites/**' }`.
  - Unmatched URLs return 400.
  - Fields left out (`protocol`, `port`, `pathname`, `search`) default to `**`, which the docs advise against.
  - `**` works only at the end of a path or the start of a hostname.
- **Sprite host (checked live with curl, not from Next.js docs):** PokéAPI's `sprites.front_default` and `sprites.other["official-artwork"].front_default` for #6 point to `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/...`. That host sends `cache-control: max-age=300`.
- **Defaults that changed in 16.0.0:**
  - `qualities` is now `[75]`. Other `quality` values are coerced to the nearest allowed value. Configuring `qualities` is now "required" for anything else.
  - `minimumCacheTTL` went from 60 s to 14400 s (4 h). The effective TTL is whichever is larger, this value or the upstream `Cache-Control`.
  - `16` was removed from `imageSizes`.
  - `maximumRedirects` defaults to 3.
  - `dangerouslyAllowLocalIP` defaults to false.
  - The `priority` prop is deprecated in favour of `preload`.
  - Sources: the image docs version history, https://nextjs.org/blog/next-16.
- `unoptimized` skips optimization, for one image or globally. Static export needs either `unoptimized` or a custom loader. SVG sources skip optimization automatically.

## 6. `create-next-app` defaults today (16.4.2)

Sources: https://nextjs.org/docs/app/api-reference/cli/create-next-app, verified by scaffolding with `--yes`.

- "Recommended defaults" prompt: **TypeScript, ESLint, No React Compiler, Tailwind CSS, No `src/` directory, App Router, Cache Components, AGENTS.md, Agent feedback.**
- Generated `package.json` (verified):
  - scripts: `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint`
  - deps: `next 16.4.2`, `react`/`react-dom 19.3.0`
  - devDeps: `typescript ^5`, `@types/node ^20`, `@types/react(-dom) ^19`, `eslint ^9`, `eslint-config-next 16.4.2`, `tailwindcss ^4`, `@tailwindcss/turbopack ^4`
- **Tailwind v4** (`tailwindcss` latest is 4.3.3). `globals.css` contains `@import "tailwindcss";`. **The scaffold has no `postcss.config.mjs`.** Tailwind is wired through a Turbopack CSS loader rule (`@tailwindcss/turbopack`, first published 2026-07-31) in `next.config.ts`. Older Tailwind and Next guides that tell you to create `postcss.config.mjs` with `@tailwindcss/postcss` describe a different setup.
- **Turbopack** has been the default bundler for `dev` and `build` since 16.0. There is no `--turbopack` flag in the scripts, and `--webpack` opts out. Source: https://nextjs.org/blog/next-16.
- **ESLint:** flat config `eslint.config.mjs` using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. `next lint` was removed in 16, and `next build` no longer lints. Biome is offered as an alternative linter.
- **`AGENTS.md`** is generated. It tells coding agents to read the version-matched docs bundled at `node_modules/next/dist/docs/` before writing code. `next dev` re-adds this block.
- **Agent feedback** (`experimental.agentFeedback`) is on with the recommended defaults (16.4). Pass `--no-agent-feedback` to opt out.
- `tsconfig.json`: `strict: true`, `moduleResolution: bundler`, `paths: { "@/*": ["./*"] }`, `jsx: react-jsx`. The root layout uses the generated global `LayoutProps<'/'>` type helper.
- **No test runner is included.**

### Adding Vitest

Source: https://nextjs.org/docs/app/guides/testing/vitest (last updated 2026-08-25).

- Quickstart: `npx create-next-app@latest --example with-vitest`. Manual setup: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`. Current npm versions: vitest 5.0.5, @vitejs/plugin-react 6.1.2, vite-tsconfig-paths 6.1.1, @testing-library/react 16.3.3, jsdom 30.1.3.
- `vitest.config.mts`:
  ```ts
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import tsconfigPaths from 'vite-tsconfig-paths'
  export default defineConfig({ plugins: [tsconfigPaths(), react()], test: { environment: 'jsdom' } })
  ```
  Add the script `"test": "vitest"`.
- **Limitation:** "Vitest currently does not support [async Server Components]". You can unit-test synchronous Server and Client Components. The docs recommend E2E for async ones. This project plans unit tests only, on pure domain logic (Type Matchups, search matching), which needs no React environment. `jsdom` and the RTL packages are only needed for component tests.
- I did not confirm from primary sources that `vitest@5` works with `@vitejs/plugin-react@6`. Check when installing.

## 7. Summary of options for this app (no decision made)

| Dimension | Options |
|---|---|
| Caching model | (1) **Cache Components** (scaffold default, recommended by Next.js, uses `use cache` + `cacheLife('max')`, PPR, `notFound()` for bad ids, `ensureStatic` available) or (2) **Previous Model** (turn `cacheComponents` off, use `fetch` `force-cache`/`revalidate` + `dynamicParams = false`; simpler mental model, but going against the default and the Next 17 direction). |
| Where data comes from | (a) **PokéAPI live at render time**, wrapped in `use cache` (in-memory per process, refilled on each restart, HMR edit or build), or (b) **a build-time snapshot to local JSON** imported as a module ("predictable value", so it goes into the static shell automatically with zero PokéAPI calls at runtime). A snapshot adds a script step to refresh the data. |
| Detail pages | `generateStaticParams` returns ids 1–151 (all prerendered at `next build`). Unknown ids are rejected with `notFound()`, because `dynamicParams` is unavailable under Cache Components. Choose whether to await `params` at the top or inside `<Suspense>` (App Shell). |
| List prefetching | Default `<Link>` (App Shell only) or `<Link prefetch>` (each detail's cached content prefetched, 151 links). |
| Search | A: client-side filter + `useSearchParams` + `history.replaceState`. B: server filter via the `searchParams` prop + `router.replace`. C: hybrid. All of them need a `<Suspense>` boundary. |
| Images | `next/image` + `remotePatterns` for `raw.githubusercontent.com/PokeAPI/sprites/**`, or `unoptimized`. |
| Static guarantee | Optionally `export const ensureStatic = 'navigation'` on the root or route layout (16.4+) to fail the build if anything dynamic gets in. With search option A, check whether a `useSearchParams` Suspense hole counts as dynamic under `ensureStatic`. I have not verified this. |

## Open points not settled here

- Whether `ensureStatic = 'navigation'` accepts a route that has a `useSearchParams` Suspense fallback. The docs say the hook "always needs a `<Suspense>` boundary" but do not say how `ensureStatic` treats client-hook holes. A quick prototype `next build` would settle it.
- Whether `output: 'export'` works with `cacheComponents: true` beyond "`use cache`: Static export: No". This only matters if static hosting comes back into scope.
- PokéAPI's fair-use and rate-limit policy, and how many requests one Species detail needs (pokemon + species + types + abilities). This belongs to the PokéAPI research, not here.
