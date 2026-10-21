import { describe, expect, it } from "vitest";
import { isSpeciesPath, listHref } from "@/lib/pokedex/routes";

describe("listHref", () => {
  it("links to the bare list when there is no search", () => {
    expect(listHref("")).toBe("/");
  });

  it("keeps the search text in ?q=", () => {
    expect(listHref("char")).toBe("/?q=char");
  });

  it("encodes spaces, punctuation and #", () => {
    expect(listHref("mr. mime")).toBe("/?q=mr.+mime");
    expect(listHref("#6")).toBe("/?q=%236");
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
