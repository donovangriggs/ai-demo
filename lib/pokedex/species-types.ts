import type { PokedexNumber } from "./pokedex-number";
import { bySlot } from "./slots";
import type { SpeciesSummary, TypeName } from "./types";

/** A Type and the Species that have it, with the slot it occupies on each. */
export interface TypeMembers {
  type: TypeName;
  species: { pokedexNumber: PokedexNumber; slot: number }[];
}

/** Each Species' Types, keyed by Pokédex Number, in slot order (primary Type first). */
export function speciesTypesByPokedexNumber(
  members: TypeMembers[],
): Map<PokedexNumber, TypeName[]> {
  const slotted = new Map<PokedexNumber, { type: TypeName; slot: number }[]>();
  for (const { type, species } of members) {
    for (const { pokedexNumber, slot } of species) {
      slotted.set(pokedexNumber, [...(slotted.get(pokedexNumber) ?? []), { type, slot }]);
    }
  }
  return new Map(
    [...slotted].map(([pokedexNumber, entries]) => [
      pokedexNumber,
      bySlot(entries).map((e) => e.type),
    ]),
  );
}

/** A Species' primary Type: the one in slot 1, which tints its detail page. */
export function primaryType(species: Pick<SpeciesSummary, "types">): TypeName {
  const [primary] = species.types;
  if (!primary) throw new Error("A Species has at least one Type");
  return primary;
}
