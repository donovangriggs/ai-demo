import { describe, expect, it } from "vitest";
import { POKEDEX } from "@/lib/pokedex/pokedex.fixture";
import { matchesQuery } from "@/lib/pokedex/search";

/** Display names of the Species that match `q`, in Pokédex order. */
function search(q: string): string[] {
  return POKEDEX.filter((s) => matchesQuery(s, q)).map((s) => s.displayName);
}

/** Pokédex Numbers of the Species that match `q`. */
function searchIds(q: string): number[] {
  return POKEDEX.filter((s) => matchesQuery(s, q)).map((s) => s.id);
}

describe("matchesQuery", () => {
  it("fixture covers the 151 Species", () => {
    expect(POKEDEX).toHaveLength(151);
    expect(POKEDEX[150]).toMatchObject({ id: 151, slug: "mew" });
  });

  it.each(["char", "CHAR"])("finds the Charmander line for %j", (q) => {
    expect(search(q)).toEqual(["Charmander", "Charmeleon", "Charizard"]);
  });

  it.each(["mr mime", "mr.mime"])("ignores spacing and punctuation: %j", (q) => {
    expect(search(q)).toEqual(["Mr. Mime"]);
  });

  it.each(["farfetch'd", "farfetchd"])("ignores apostrophes: %j", (q) => {
    expect(search(q)).toEqual(["Farfetch\u2019d"]);
  });

  it("finds both Nidoran for 'nidoran'", () => {
    expect(search("nidoran")).toEqual(["Nidoran\u2640", "Nidoran\u2642"]);
  });

  it("matches the slug, so 'nidoran f' finds only Nidoran\u2640", () => {
    expect(search("nidoran f")).toEqual(["Nidoran\u2640"]);
  });

  it.each(["6", "#6"])("number query %j matches a prefix of the Pokédex Number", (q) => {
    expect(searchIds(q)).toEqual([6, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69]);
  });

  it("zero-padded '006' matches only #6", () => {
    expect(searchIds("006")).toEqual([6]);
  });

  it("'15' matches #15, #150 and #151", () => {
    expect(searchIds("15")).toEqual([15, 150, 151]);
  });

  it.each(["", "   ", "#", "\u2640", "!!"])("query %j matches all 151", (q) => {
    expect(search(q)).toHaveLength(151);
  });

  it("'zzz' matches nothing", () => {
    expect(search("zzz")).toEqual([]);
  });
});
