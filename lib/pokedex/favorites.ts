import { isPokedexNumber, type PokedexNumber } from "./pokedex-number";

/**
 * Reads the stored Favorites (a JSON array of Pokédex Numbers). Never throws:
 * a missing or unreadable value gives no Favorites, and entries that aren't
 * Pokédex Numbers (damaged, or from a bigger Pokédex) are dropped while the
 * rest are kept.
 */
export function parseFavorites(raw: string | null): ReadonlySet<PokedexNumber> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw ?? "");
  } catch {
    return new Set();
  }
  if (!Array.isArray(parsed)) return new Set();
  return new Set(
    parsed.filter((n): n is PokedexNumber => typeof n === "number" && isPokedexNumber(n)),
  );
}

/** Writes Favorites as a JSON array in Pokédex order, e.g. `[6,25]`. */
export function serializeFavorites(favorites: ReadonlySet<PokedexNumber>): string {
  return JSON.stringify([...favorites].sort((a, b) => a - b));
}

/** Marks a Species as a Favorite, or unmarks it, returning a new set. */
export function toggleFavorite(
  favorites: ReadonlySet<PokedexNumber>,
  n: PokedexNumber,
): ReadonlySet<PokedexNumber> {
  const next = new Set(favorites);
  if (!next.delete(n)) next.add(n);
  return next;
}
