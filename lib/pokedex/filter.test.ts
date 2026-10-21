import { describe, expect, it } from "vitest";
import { parseFavorites } from "@/lib/pokedex/favorites";
import { NO_FILTER, parseFilter, randomPick, visibleSpecies } from "@/lib/pokedex/filter";
import { POKEDEX } from "@/lib/pokedex/pokedex.fixture";

describe("parseFilter", () => {
  it("is the empty filter with no params", () => {
    expect(parseFilter(new URLSearchParams())).toEqual(NO_FILTER);
  });

  it("reads the search text from ?q=", () => {
    expect(parseFilter(new URLSearchParams("q=mr.+mime"))).toEqual({ ...NO_FILTER, q: "mr. mime" });
  });

  it("turns Favorites only on for ?fav=1", () => {
    expect(parseFilter(new URLSearchParams("fav=1"))).toEqual({
      ...NO_FILTER,
      favoritesOnly: true,
    });
  });

  it.each(["fav=0", "fav=true", "fav="])("treats %s as off", (params) => {
    expect(parseFilter(new URLSearchParams(params)).favoritesOnly).toBe(false);
  });

  it("reads both together", () => {
    expect(parseFilter(new URLSearchParams("q=char&fav=1"))).toEqual({
      q: "char",
      favoritesOnly: true,
    });
  });
});

describe("visibleSpecies", () => {
  const noFavorites = parseFavorites(null);

  it("returns all 151 Species in Pokédex order for the empty filter", () => {
    const visible = visibleSpecies(POKEDEX, NO_FILTER, noFavorites);
    expect(visible.map((s) => s.id)).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
  });

  it("keeps the Species matching the search, in Pokédex order", () => {
    const visible = visibleSpecies(POKEDEX, { ...NO_FILTER, q: "char" }, noFavorites);
    expect(visible.map((s) => s.displayName)).toEqual(["Charmander", "Charmeleon", "Charizard"]);
  });

  it("keeps only Favorites when Favorites only is on, in Pokédex order", () => {
    const favorites = parseFavorites("[150,6,25]");
    const visible = visibleSpecies(POKEDEX, { ...NO_FILTER, favoritesOnly: true }, favorites);
    expect(visible.map((s) => s.displayName)).toEqual(["Charizard", "Pikachu", "Mewtwo"]);
  });

  it("searches within the Favorites when both are set", () => {
    const favorites = parseFavorites("[4,6,25]");
    const visible = visibleSpecies(POKEDEX, { q: "char", favoritesOnly: true }, favorites);
    expect(visible.map((s) => s.displayName)).toEqual(["Charmander", "Charizard"]);
  });

  it("excludes Favorites that don't match the search", () => {
    const favorites = parseFavorites("[25,150]");
    expect(visibleSpecies(POKEDEX, { q: "char", favoritesOnly: true }, favorites)).toEqual([]);
  });

  it("is empty with Favorites only on and no Favorites", () => {
    expect(visibleSpecies(POKEDEX, { ...NO_FILTER, favoritesOnly: true }, noFavorites)).toEqual([]);
  });

  it("ignores Favorites when Favorites only is off", () => {
    const favorites = parseFavorites("[6]");
    const visible = visibleSpecies(POKEDEX, { ...NO_FILTER, q: "char" }, favorites);
    expect(visible.map((s) => s.displayName)).toEqual(["Charmander", "Charmeleon", "Charizard"]);
  });
});

describe("randomPick", () => {
  it("is null for an empty list", () => {
    expect(randomPick([], () => 0)).toBeNull();
  });

  it("picks the first Species when random gives 0", () => {
    expect(randomPick(POKEDEX, () => 0)?.displayName).toBe("Bulbasaur");
  });

  it("picks the last Species when random gives just under 1", () => {
    expect(randomPick(POKEDEX, () => 0.9999999)?.displayName).toBe("Mew");
  });

  it("picks the Species at random × length, rounded down", () => {
    const visible = visibleSpecies(POKEDEX, { ...NO_FILTER, q: "char" }, parseFavorites(null));
    expect(randomPick(visible, () => 0.5)?.displayName).toBe("Charmeleon");
  });
});
