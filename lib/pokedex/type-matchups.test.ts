import { describe, expect, it } from "vitest";
import { groupTypeMatchups, typeMatchups } from "@/lib/pokedex/type-matchups";
import type { TypeChart, TypeName } from "@/lib/pokedex/types";

/**
 * Minimal hand-written Type Chart: only the fire, flying and water defending
 * entries, copied from PokéAPI's current `damage_relations.*_damage_from`.
 */
const chart: TypeChart = [
  {
    id: 3,
    name: "flying",
    damageFrom: {
      double: ["rock", "electric", "ice"],
      half: ["fighting", "bug", "grass"],
      none: ["ground"],
    },
  },
  {
    id: 10,
    name: "fire",
    damageFrom: {
      double: ["ground", "rock", "water"],
      half: ["bug", "steel", "fire", "grass", "ice", "fairy"],
      none: [],
    },
  },
  {
    id: 11,
    name: "water",
    damageFrom: {
      double: ["grass", "electric"],
      half: ["steel", "fire", "water", "ice"],
      none: [],
    },
  },
];

describe("typeMatchups", () => {
  it("Charmander (Fire) takes 2× from Water, Ground and Rock, ½× from six Types, 1× otherwise", () => {
    expect(typeMatchups(["fire"], chart)).toEqual({
      normal: 1,
      fighting: 1,
      flying: 1,
      poison: 1,
      ground: 2,
      rock: 2,
      bug: 0.5,
      ghost: 1,
      steel: 0.5,
      fire: 0.5,
      water: 2,
      grass: 0.5,
      electric: 1,
      psychic: 1,
      ice: 0.5,
      dragon: 1,
      dark: 1,
      fairy: 0.5,
    });
  });

  it("Charizard (Fire/Flying) takes 4× from Rock and ¼× from Grass and Bug", () => {
    const matchups = typeMatchups(["fire", "flying"], chart);
    expect(matchups.rock).toBe(4);
    expect(matchups.grass).toBe(0.25);
    expect(matchups.bug).toBe(0.25);
  });

  it("Charizard is immune to Ground: Flying's 0× cancels Fire's 2×", () => {
    expect(typeMatchups(["fire", "flying"], chart).ground).toBe(0);
  });

  it("Charizard takes 1× from Ice: Flying's 2× times Fire's ½×", () => {
    expect(typeMatchups(["fire", "flying"], chart).ice).toBe(1);
  });

  it("Gyarados (Water/Flying) takes 4× from Electric, 0× from Ground and 1× from Grass", () => {
    const matchups = typeMatchups(["water", "flying"], chart);
    expect(matchups.electric).toBe(4);
    expect(matchups.ground).toBe(0);
    expect(matchups.grass).toBe(1);
  });
});

describe("groupTypeMatchups", () => {
  it("groups Charmander into Weak to and Resists, in Type id order, with no Immune to", () => {
    expect(groupTypeMatchups(typeMatchups(["fire"], chart))).toEqual({
      weakTo: [
        { type: "ground", multiplier: 2 },
        { type: "rock", multiplier: 2 },
        { type: "water", multiplier: 2 },
      ],
      resists: [
        { type: "bug", multiplier: 0.5 },
        { type: "steel", multiplier: 0.5 },
        { type: "fire", multiplier: 0.5 },
        { type: "grass", multiplier: 0.5 },
        { type: "ice", multiplier: 0.5 },
        { type: "fairy", multiplier: 0.5 },
      ],
      immuneTo: [],
    });
  });

  it("sorts strongest first, then by Type id: Charizard is weak to Rock 4×, Water 2×, Electric 2×", () => {
    const groups = groupTypeMatchups(typeMatchups(["fire", "flying"], chart));
    expect(groups.weakTo).toEqual([
      { type: "rock", multiplier: 4 },
      { type: "water", multiplier: 2 },
      { type: "electric", multiplier: 2 },
    ]);
    expect(groups.resists).toEqual([
      { type: "bug", multiplier: 0.25 },
      { type: "grass", multiplier: 0.25 },
      { type: "fighting", multiplier: 0.5 },
      { type: "steel", multiplier: 0.5 },
      { type: "fire", multiplier: 0.5 },
      { type: "fairy", multiplier: 0.5 },
    ]);
    expect(groups.immuneTo).toEqual([{ type: "ground", multiplier: 0 }]);
  });

  it("hides 1× Types: Charizard's Ice and Gyarados's Grass appear in no group", () => {
    const shown = (defending: TypeName[]) =>
      Object.values(groupTypeMatchups(typeMatchups(defending, chart)))
        .flat()
        .map((m) => m.type);
    expect(shown(["fire", "flying"])).not.toContain("ice");
    expect(shown(["water", "flying"])).not.toContain("grass");
  });
});
