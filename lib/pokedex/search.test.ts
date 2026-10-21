import { describe, expect, it } from "vitest";
import { displayName } from "@/lib/pokedex/display-name";
import { matchesQuery } from "@/lib/pokedex/search";
import type { PokedexNumber } from "@/lib/pokedex/pokedex-number";
import type { SpeciesSummary } from "@/lib/pokedex/types";

/** The 151 PokéAPI slugs, in Pokédex Number order. */
const SLUGS = `bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle
wartortle blastoise caterpie metapod butterfree weedle kakuna beedrill pidgey
pidgeotto pidgeot rattata raticate spearow fearow ekans arbok pikachu raichu
sandshrew sandslash nidoran-f nidorina nidoqueen nidoran-m nidorino nidoking
clefairy clefable vulpix ninetales jigglypuff wigglytuff zubat golbat oddish
gloom vileplume paras parasect venonat venomoth diglett dugtrio meowth persian
psyduck golduck mankey primeape growlithe arcanine poliwag poliwhirl poliwrath
abra kadabra alakazam machop machoke machamp bellsprout weepinbell victreebel
tentacool tentacruel geodude graveler golem ponyta rapidash slowpoke slowbro
magnemite magneton farfetchd doduo dodrio seel dewgong grimer muk shellder
cloyster gastly haunter gengar onix drowzee hypno krabby kingler voltorb
electrode exeggcute exeggutor cubone marowak hitmonlee hitmonchan lickitung
koffing weezing rhyhorn rhydon chansey tangela kangaskhan horsea seadra goldeen
seaking staryu starmie mr-mime scyther jynx electabuzz magmar pinsir tauros
magikarp gyarados lapras ditto eevee vaporeon jolteon flareon porygon omanyte
omastar kabuto kabutops aerodactyl snorlax articuno zapdos moltres dratini
dragonair dragonite mewtwo mew`.split(/\s+/);

const POKEDEX: Pick<SpeciesSummary, "id" | "slug" | "displayName">[] = SLUGS.map((slug, i) => ({
  id: (i + 1) as PokedexNumber,
  slug,
  displayName: displayName(slug),
}));

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
