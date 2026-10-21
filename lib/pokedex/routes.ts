import { NO_FILTER, type PokedexFilter } from "./filter";
import type { PokedexNumber } from "./pokedex-number";

/** `?q=<search>&fav=1`, leaving out an empty search and `fav` when off. */
function filterSuffix({ q, favoritesOnly }: PokedexFilter): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (favoritesOnly) params.set("fav", "1");
  return params.size ? `?${params}` : "";
}

/** The Pokédex URL (`/`), carrying the filter in `?q=` and `?fav=` so going back keeps it. */
export function pokedexHref(filter = NO_FILTER): string {
  return `/${filterSuffix(filter)}`;
}

/**
 * A Species' detail URL (`/pokemon/6`), carrying the filter in `?q=` and
 * `?fav=` so a reload or a shared link restores the sidebar.
 */
export function speciesHref(pokedexNumber: PokedexNumber, filter = NO_FILTER): string {
  return `/pokemon/${pokedexNumber}${filterSuffix(filter)}`;
}

/**
 * Whether a pathname is a Species detail route (`/pokemon/<anything>`),
 * including not-found ones, so narrow screens show the detail pane only.
 */
export function isSpeciesPath(pathname: string): boolean {
  return /^\/pokemon\/[^/]+/.test(pathname);
}
