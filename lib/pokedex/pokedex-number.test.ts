import { describe, expect, it } from "vitest";
import {
  formatPokedexNumber,
  parsePokedexNumber,
  POKEDEX_SIZE,
} from "@/lib/pokedex/pokedex-number";

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

describe("parsePokedexNumber", () => {
  it.each([
    ["6", 6],
    ["1", 1],
    ["151", 151],
  ])("parses the canonical %j as %i", (param, expected) => {
    expect(parsePokedexNumber(param)).toBe(expected);
  });

  it.each(["006", "0", "152", "abc", "6.5", "", "-6", " 6", "1e2"])(
    "rejects %j",
    (param) => {
      expect(parsePokedexNumber(param)).toBeNull();
    },
  );
});
