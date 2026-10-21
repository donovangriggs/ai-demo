import { describe, expect, it } from "vitest";
import { speciesTypesById, type TypeMembership } from "@/lib/pokedex/species-types";

/** A hand-written slice of PokéAPI Type membership (slot per Species). */
const memberships: TypeMembership[] = [
  { name: "poison", pokemon: [{ id: 1, slot: 2 }, { id: 23, slot: 1 }] },
  {
    name: "grass",
    pokemon: [
      { id: 1, slot: 1 },
      { id: 152, slot: 1 }, // Chikorita
      { id: 10033, slot: 1 }, // Mega Venusaur
    ],
  },
  {
    name: "psychic",
    pokemon: [
      { id: 151, slot: 1 }, // Mew
    ],
  },
];

describe("speciesTypesById", () => {
  it("orders a Species' Types by slot, not by Type order", () => {
    expect(speciesTypesById(memberships).get(1)).toEqual(["grass", "poison"]);
  });

  it("keeps only Pokédex Numbers up to 151", () => {
    const byId = speciesTypesById(memberships);
    expect(byId.has(151)).toBe(true);
    expect(byId.has(152)).toBe(false);
    expect(byId.has(10033)).toBe(false);
  });

  it("gives the ticket's spot-check Species their real Types", () => {
    // Types listed in PokéAPI id order, as getPokedex() fetches them.
    const byId = speciesTypesById([
      { name: "flying", pokemon: [{ id: 6, slot: 2 }] },
      { name: "poison", pokemon: [{ id: 1, slot: 2 }] },
      { name: "steel", pokemon: [{ id: 81, slot: 2 }] },
      { name: "fire", pokemon: [{ id: 6, slot: 1 }] },
      { name: "grass", pokemon: [{ id: 1, slot: 1 }] },
      { name: "electric", pokemon: [{ id: 81, slot: 1 }] },
      { name: "fairy", pokemon: [{ id: 35, slot: 1 }] },
    ]);
    expect(byId.get(1)).toEqual(["grass", "poison"]); // Bulbasaur
    expect(byId.get(6)).toEqual(["fire", "flying"]); // Charizard
    expect(byId.get(35)).toEqual(["fairy"]); // Clefairy
    expect(byId.get(81)).toEqual(["electric", "steel"]); // Magnemite
  });
});
