# Current Next.js data-fetching and caching options for a small static dataset

Type: research
Status: resolved
Parent: [Pokédex app map](../map.md)

## Question

For the current stable Next.js release (App Router), what are the supported ways to fetch and cache third-party API data for a small dataset that rarely changes (151 detail pages and one list)?

- **Static pre-rendering**: `generateStaticParams`, `dynamicParams`, and how fully static output works.
- **Caching**: the current caching model (`fetch` cache options, `use cache` / Cache Components, `revalidate`), and what changed from earlier versions.
- **Client-side search**: how instant search driven by a `?q=` URL param fits with Server Components (`useSearchParams`, Suspense requirements, server-side filtering versus client-side filtering).
- **Remote images**: `next/image` remote image configuration.
- **Defaults**: what `create-next-app` sets up today (TypeScript, Tailwind version, ESLint, Turbopack), and how to add Vitest.

Capture the findings in `.scratch/pokedex/research/nextjs-data-fetching-options.md`, citing the official Next.js docs with the version they apply to.

## Answer

Current stable is **Next.js 16.4.2**. Since 16.4, `create-next-app` turns on **Cache Components** by default (`cacheComponents: true` + `partialPrefetching: true`). Under it, data is uncached unless you wrap it in `'use cache'` + `cacheLife(...)` (the `'max'` profile suits rarely-changing data). The route segment configs `dynamic`, `revalidate`, `fetchCache` and **`dynamicParams`** all error. The old `fetch`/segment-config model is still documented as the "Previous Model".

- **Detail pages:** `generateStaticParams` can prerender all 151 ids, but it must return at least one param, and unknown ids have to be rejected with `notFound()` because `dynamicParams = false` is unavailable.
- **Search:** `?q=` read through `useSearchParams` always needs a `<Suspense>` boundary. The options are client-side filtering with `history.replaceState`, server-side filtering via the `searchParams` prop, or a hybrid.
- **Images:** remote images need `images.remotePatterns` (PokéAPI sprites come from `raw.githubusercontent.com`).
- **Scaffold:** the default app has TypeScript, Tailwind v4 (wired through a Turbopack loader, with no postcss config), ESLint 9 flat config, Turbopack and AGENTS.md. There is no test runner; Vitest is added manually as in the docs guide.

Full findings with sources: [nextjs-data-fetching-options.md](../research/nextjs-data-fetching-options.md)
