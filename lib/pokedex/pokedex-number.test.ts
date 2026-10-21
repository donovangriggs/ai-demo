import { describe, expect, it } from "vitest";
import { formatPokedexNumber, POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";

describe("POKEDEX_SIZE", () => {
  it("covers the original 151 Species", () => {
    expect(POKEDEX_SIZE).toBe(151);
  });
});

describe("formatPokedexNumber", () => {
  it.each([
    [1, "#001"],
    [25, "#025"],
    [151, "#151"],
  ])("formats %i as %s", (id, expected) => {
    expect(formatPokedexNumber(id)).toBe(expected);
  });
});
