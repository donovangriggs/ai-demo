import { describe, expect, it } from "vitest";
import { parsePokedexNumber, type PokedexNumber } from "@/lib/pokedex/pokedex-number";
import { isSpeciesPath, pokedexHref, speciesHref } from "@/lib/pokedex/routes";

const six = parsePokedexNumber("6") as PokedexNumber;

describe("pokedexHref", () => {
  it("links to the bare Pokédex when there is no search", () => {
    expect(pokedexHref("")).toBe("/");
  });

  it("keeps the search text in ?q=", () => {
    expect(pokedexHref("char")).toBe("/?q=char");
  });

  it("encodes spaces, punctuation and #", () => {
    expect(pokedexHref("mr. mime")).toBe("/?q=mr.+mime");
    expect(pokedexHref("#6")).toBe("/?q=%236");
  });
});

describe("speciesHref", () => {
  it("links to the Species' detail page by Pokédex Number", () => {
    expect(speciesHref(six)).toBe("/pokemon/6");
  });

  it("drops an empty search", () => {
    expect(speciesHref(six, "")).toBe("/pokemon/6");
  });

  it("carries the search text in ?q= so a reload restores the filter", () => {
    expect(speciesHref(six, "char")).toBe("/pokemon/6?q=char");
    expect(speciesHref(six, "mr. mime")).toBe("/pokemon/6?q=mr.+mime");
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
