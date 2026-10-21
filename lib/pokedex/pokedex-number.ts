/** How many Species this Pokédex covers: the original 151. */
export const POKEDEX_SIZE = 151;

/** Formats a Pokédex Number for display, e.g. `6` → `#006`. */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}
