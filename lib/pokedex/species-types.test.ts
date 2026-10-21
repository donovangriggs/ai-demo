import { describe, expect, it } from "vitest";
import type { PokedexNumber } from "@/lib/pokedex/pokedex-number";
import {
  primaryType,
  speciesTypesByPokedexNumber,
  type TypeMembers,
} from "@/lib/pokedex/species-types";

/** Test shorthand: these literals are all within 1–151. */
const n = (pokedexNumber: number) => pokedexNumber as PokedexNumber;

describe("speciesTypesByPokedexNumber", () => {
  it("orders a Species' Types by slot, not by Type order", () => {
    const members: TypeMembers[] = [
      { type: "poison", species: [{ pokedexNumber: n(1), slot: 2 }, { pokedexNumber: n(23), slot: 1 }] },
      { type: "grass", species: [{ pokedexNumber: n(1), slot: 1 }] },
    ];
    const byNumber = speciesTypesByPokedexNumber(members);
    expect(byNumber.get(n(1))).toEqual(["grass", "poison"]); // Bulbasaur
    expect(byNumber.get(n(23))).toEqual(["poison"]); // Ekans
  });

  it("gives the ticket's spot-check Species their real Types", () => {
    // Types listed in PokéAPI id order, as getPokedex() fetches them.
    const byNumber = speciesTypesByPokedexNumber([
      { type: "flying", species: [{ pokedexNumber: n(6), slot: 2 }] },
      { type: "poison", species: [{ pokedexNumber: n(1), slot: 2 }] },
      { type: "steel", species: [{ pokedexNumber: n(81), slot: 2 }] },
      { type: "fire", species: [{ pokedexNumber: n(6), slot: 1 }] },
      { type: "grass", species: [{ pokedexNumber: n(1), slot: 1 }] },
      { type: "electric", species: [{ pokedexNumber: n(81), slot: 1 }] },
      { type: "fairy", species: [{ pokedexNumber: n(35), slot: 1 }] },
    ]);
    expect(byNumber.get(n(1))).toEqual(["grass", "poison"]); // Bulbasaur
    expect(byNumber.get(n(6))).toEqual(["fire", "flying"]); // Charizard
    expect(byNumber.get(n(35))).toEqual(["fairy"]); // Clefairy
    expect(byNumber.get(n(81))).toEqual(["electric", "steel"]); // Magnemite
  });
});

describe("primaryType", () => {
  it("is a dual-Type Species' slot-1 Type: Charizard is Fire", () => {
    expect(primaryType({ types: ["fire", "flying"] })).toBe("fire");
  });

  it("is a single-Type Species' only Type: Clefairy is Fairy", () => {
    expect(primaryType({ types: ["fairy"] })).toBe("fairy");
  });
});
