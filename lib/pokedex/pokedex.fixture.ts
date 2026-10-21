import { displayName } from "./display-name";
import type { PokedexNumber } from "./pokedex-number";
import type { SpeciesSummary } from "./types";

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

/** Test fixture: the 151 Species in Pokédex order, with the fields search reads. */
export const POKEDEX: Pick<SpeciesSummary, "id" | "slug" | "displayName">[] = SLUGS.map(
  (slug, i) => ({
    id: (i + 1) as PokedexNumber,
    slug,
    displayName: displayName(slug),
  }),
);
