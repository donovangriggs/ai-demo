import { describe, expect, it } from "vitest";
import { parseFavorites, serializeFavorites, toggleFavorite } from "@/lib/pokedex/favorites";
import { parsePokedexNumber, type PokedexNumber } from "@/lib/pokedex/pokedex-number";

describe("parseFavorites", () => {
  it.each([null, "", "not json", "{}", '"6"'])("reads %j as no Favorites", (raw) => {
    expect(parseFavorites(raw)).toEqual(new Set());
  });

  it("round-trips [6, 25]", () => {
    expect(serializeFavorites(parseFavorites("[6,25]"))).toBe("[6,25]");
  });

  it("collapses duplicates", () => {
    expect(parseFavorites("[6,6,25,6]")).toEqual(new Set([6, 25]));
  });

  it.each(["0", "152", "-1", "6.5", '"6"', "null"])(
    "drops a %s entry and keeps the valid ones",
    (entry) => {
      expect(parseFavorites(`[6,${entry},25]`)).toEqual(new Set([6, 25]));
    },
  );
});

describe("serializeFavorites", () => {
  it("writes Pokédex Numbers in ascending order", () => {
    expect(serializeFavorites(parseFavorites("[151,6,25]"))).toBe("[6,25,151]");
  });
});

describe("toggleFavorite", () => {
  const six = parsePokedexNumber("6") as PokedexNumber;

  it("adds a Species that isn't a Favorite, leaving the input alone", () => {
    const before = parseFavorites("[25]");
    expect(toggleFavorite(before, six)).toEqual(new Set([6, 25]));
    expect(before).toEqual(new Set([25]));
  });

  it("removes a Species that is a Favorite, leaving the input alone", () => {
    const before = parseFavorites("[6,25]");
    expect(toggleFavorite(before, six)).toEqual(new Set([25]));
    expect(before).toEqual(new Set([6, 25]));
  });
});
