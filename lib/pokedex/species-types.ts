import { POKEDEX_SIZE } from "./pokedex-number";
import type { TypeName } from "./types";

/** A Type and the Species that have it, with the slot it occupies on each. */
export interface TypeMembership {
  name: TypeName;
  pokemon: { id: number; slot: number }[];
}

/**
 * Each Species' Types, keyed by Pokédex Number, in slot order. Only Pokédex
 * Numbers up to 151 are kept, which drops later Species and alternate forms.
 */
export function speciesTypesById(memberships: TypeMembership[]): Map<number, TypeName[]> {
  const slotted = new Map<number, { name: TypeName; slot: number }[]>();
  for (const { name, pokemon } of memberships) {
    for (const { id, slot } of pokemon) {
      if (id > POKEDEX_SIZE) continue;
      const entries = slotted.get(id) ?? [];
      entries.push({ name, slot });
      slotted.set(id, entries);
    }
  }
  return new Map(
    [...slotted].map(([id, entries]) => [
      id,
      entries.sort((a, b) => a.slot - b.slot).map((e) => e.name),
    ]),
  );
}
