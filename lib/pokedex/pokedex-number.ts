/** How many Species this Pokédex covers: the original 151. */
export const POKEDEX_SIZE = 151;

/**
 * A Pokédex Number this Pokédex covers (1–151). Branded, so only a checked
 * number (`parsePokedexNumber`, `isPokedexNumber`) can be passed where one is
 * required.
 */
export type PokedexNumber = number & { readonly __brand: "PokedexNumber" };

/** The first Species' Pokédex Number (#1 Bulbasaur). */
export const FIRST_POKEDEX_NUMBER = 1 as PokedexNumber;

/** Whether `n` is a whole number from 1 to 151. */
export function isPokedexNumber(n: number): n is PokedexNumber {
  return Number.isInteger(n) && n >= 1 && n <= POKEDEX_SIZE;
}

/** A Pokédex Number zero-padded to 3 digits, e.g. `6` → `006`. */
export function padPokedexNumber(n: number): string {
  return String(n).padStart(3, "0");
}

/** Formats a Pokédex Number for display, e.g. `6` → `#006`. */
export function formatPokedexNumber(n: number): string {
  return `#${padPokedexNumber(n)}`;
}

/**
 * Parses a `/pokemon/[id]` route param into a Pokédex Number, or `null` if it
 * isn't one. Only the canonical form is accepted: `'6'` → `6`, but `'006'`,
 * `'0'`, `'152'`, `'6.5'` and `'abc'` → `null`.
 */
export function parsePokedexNumber(param: string): PokedexNumber | null {
  if (!/^[1-9]\d*$/.test(param)) return null;
  const n = Number(param);
  return isPokedexNumber(n) ? n : null;
}
