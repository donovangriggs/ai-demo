import { describe, expect, it } from "vitest";
import { NO_FILTER } from "@/lib/pokedex/filter";
import { parsePokedexNumber, type PokedexNumber } from "@/lib/pokedex/pokedex-number";
import { isSpeciesPath, pokedexHref, speciesHref } from "@/lib/pokedex/routes";

const six = parsePokedexNumber("6") as PokedexNumber;

/** A search-only filter, with Favorites only off. */
const search = (q: string) => ({ ...NO_FILTER, q });

describe("pokedexHref", () => {
  it("links to the bare Pokédex when there is no search", () => {
    expect(pokedexHref(NO_FILTER)).toBe("/");
  });

  it("keeps the search text in ?q=", () => {
    expect(pokedexHref(search("char"))).toBe("/?q=char");
  });

  it("encodes spaces, punctuation and #", () => {
    expect(pokedexHref(search("mr. mime"))).toBe("/?q=mr.+mime");
    expect(pokedexHref(search("#6"))).toBe("/?q=%236");
  });

  it("keeps Favorites only in ?fav=1", () => {
    expect(pokedexHref({ ...NO_FILTER, favoritesOnly: true })).toBe("/?fav=1");
  });

  it("writes ?q= before fav=1, encoding the search", () => {
    expect(pokedexHref({ q: "mr. mime", favoritesOnly: true })).toBe("/?q=mr.+mime&fav=1");
  });
});

describe("speciesHref", () => {
  it("links to the Species' detail page by Pokédex Number", () => {
    expect(speciesHref(six)).toBe("/pokemon/6");
  });

  it("drops an empty search", () => {
    expect(speciesHref(six, NO_FILTER)).toBe("/pokemon/6");
  });

  it("carries the search text in ?q= so a reload restores the filter", () => {
    expect(speciesHref(six, search("char"))).toBe("/pokemon/6?q=char");
    expect(speciesHref(six, search("mr. mime"))).toBe("/pokemon/6?q=mr.+mime");
  });

  it("carries Favorites only in fav=1, after ?q=", () => {
    expect(speciesHref(six, { ...NO_FILTER, favoritesOnly: true })).toBe("/pokemon/6?fav=1");
    expect(speciesHref(six, { q: "#6", favoritesOnly: true })).toBe("/pokemon/6?q=%236&fav=1");
  });
});

describe("isSpeciesPath", () => {
  it.each(["/pokemon/6", "/pokemon/151", "/pokemon/999", "/pokemon/abc"])(
    "%s is a detail route",
    (path) => {
      expect(isSpeciesPath(path)).toBe(true);
    },
  );

  it.each(["/", "/pokemon", "/pokemonx/6"])("%s is not a detail route", (path) => {
    expect(isSpeciesPath(path)).toBe(false);
  });
});
