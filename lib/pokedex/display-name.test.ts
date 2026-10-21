import { describe, expect, it } from "vitest";
import { displayName } from "@/lib/pokedex/display-name";

describe("displayName", () => {
  it("title-cases a single-word slug", () => {
    expect(displayName("bulbasaur")).toBe("Bulbasaur");
  });

  it("title-cases each hyphen-separated part", () => {
    expect(displayName("solar-power")).toBe("Solar Power");
  });

  it.each([
    ["nidoran-f", "Nidoran\u2640"],
    ["nidoran-m", "Nidoran\u2642"],
    ["farfetchd", "Farfetch\u2019d"],
    ["mr-mime", "Mr. Mime"],
  ])("uses the override for %s", (slug, expected) => {
    expect(displayName(slug)).toBe(expected);
  });
});
