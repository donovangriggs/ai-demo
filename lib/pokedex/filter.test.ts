import { describe, expect, it } from "vitest";
import { parseFilter, randomPick, visibleSpecies } from "@/lib/pokedex/filter";
import { POKEDEX } from "@/lib/pokedex/pokedex.fixture";

describe("parseFilter", () => {
  it("is the empty filter with no params", () => {
    expect(parseFilter(new URLSearchParams())).toEqual({ q: "", favoritesOnly: false });
  });

  it("reads the search text from ?q=", () => {
    expect(parseFilter(new URLSearchParams("q=mr.+mime"))).toEqual({
      q: "mr. mime",
      favoritesOnly: false,
    });
  });

  it("turns Favorites only on for ?fav=1", () => {
    expect(parseFilter(new URLSearchParams("fav=1"))).toEqual({ q: "", favoritesOnly: true });
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
  it("returns all 151 Species in Pokédex order for the empty filter", () => {
    const visible = visibleSpecies(POKEDEX, { q: "", favoritesOnly: false });
    expect(visible.map((s) => s.id)).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
  });

  it("keeps the Species matching the search, in Pokédex order", () => {
    const visible = visibleSpecies(POKEDEX, { q: "char", favoritesOnly: false });
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
    const visible = visibleSpecies(POKEDEX, { q: "char", favoritesOnly: false });
    expect(randomPick(visible, () => 0.5)?.displayName).toBe("Charmeleon");
  });
});
