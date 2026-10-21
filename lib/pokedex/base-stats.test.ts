import { describe, expect, it } from "vitest";
import { baseStatRows, BASE_STAT_MAX } from "@/lib/pokedex/base-stats";
import type { BaseStats } from "@/lib/pokedex/types";

/** Charizard's current Base Stats from PokéAPI `pokemon/6`. */
const charizard: BaseStats = {
  hp: 78,
  attack: 84,
  defense: 78,
  "special-attack": 109,
  "special-defense": 85,
  speed: 100,
};

describe("baseStatRows", () => {
  it("labels the six Base Stats in display order", () => {
    expect(baseStatRows(charizard).rows).toEqual([
      { label: "HP", value: 78 },
      { label: "Attack", value: 84 },
      { label: "Defense", value: 78 },
      { label: "Sp. Atk", value: 109 },
      { label: "Sp. Def", value: 85 },
      { label: "Speed", value: 100 },
    ]);
  });

  it("totals them (Charizard is 534)", () => {
    expect(baseStatRows(charizard).total).toBe(534);
  });

  it("scales bars to a maximum of 255", () => {
    expect(BASE_STAT_MAX).toBe(255);
  });
});
