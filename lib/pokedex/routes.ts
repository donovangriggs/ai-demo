import type { PokedexNumber } from "./pokedex-number";

/** `?q=<search>`, or nothing for an empty search. */
function searchSuffix(q: string): string {
  return q ? `?${new URLSearchParams({ q })}` : "";
}

/** The Pokédex URL (`/`), carrying the search text in `?q=` so going back keeps it. */
export function pokedexHref(q: string): string {
  return `/${searchSuffix(q)}`;
}

/**
 * A Species' detail URL (`/pokemon/6`), carrying the search text in `?q=` so a
 * reload or a shared link restores the sidebar's filter.
 */
export function speciesHref(pokedexNumber: PokedexNumber, q = ""): string {
  return `/pokemon/${pokedexNumber}${searchSuffix(q)}`;
}

/**
 * Whether a pathname is a Species detail route (`/pokemon/<anything>`),
 * including not-found ones, so narrow screens show the detail pane only.
 */
export function isSpeciesPath(pathname: string): boolean {
  return /^\/pokemon\/[^/]+/.test(pathname);
}
