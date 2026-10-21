import { matchesQuery } from "./search";
import type { SpeciesSummary } from "./types";

/** What the sidebar shows: the search text and whether only Favorites are listed. */
export type PokedexFilter = { q: string; favoritesOnly: boolean };

/** The unfiltered Pokédex: no search, Favorites only off. */
export const NO_FILTER: PokedexFilter = { q: "", favoritesOnly: false };

/**
 * Reads the Pokédex filter from a URL's search params: `?q=` (missing gives
 * `""`), and `?fav=1` for Favorites only. Any other `fav` value is off.
 */
export function parseFilter(params: Pick<URLSearchParams, "get">): PokedexFilter {
  return { q: params.get("q") ?? "", favoritesOnly: params.get("fav") === "1" };
}

/** The Species the sidebar shows for a filter, in Pokédex order. */
export function visibleSpecies<S extends Pick<SpeciesSummary, "id" | "slug" | "displayName">>(
  pokedex: readonly S[],
  filter: PokedexFilter,
): S[] {
  return pokedex.filter((s) => matchesQuery(s, filter.q));
}

/** One Species picked at random from a list, or `null` when it's empty. */
export function randomPick<S>(visible: readonly S[], random = Math.random): S | null {
  return visible[Math.floor(random() * visible.length)] ?? null;
}
