/** How many Species this Pokédex covers: the original 151. */
export const POKEDEX_SIZE = 151;

/** Formats a Pokédex Number for display, e.g. `6` → `#006`. */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/**
 * Parses a `/pokemon/[id]` route param into a Pokédex Number, or `null` if it
 * isn't one. Only the canonical form is accepted: `'6'` → `6`, but `'006'`,
 * `'0'`, `'152'`, `'6.5'` and `'abc'` → `null`.
 */
export function parsePokedexNumber(param: string): number | null {
  if (!/^[1-9]\d*$/.test(param)) return null;
  const id = Number(param);
  return id <= POKEDEX_SIZE ? id : null;
}
