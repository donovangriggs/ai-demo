import "server-only";
import { displayName } from "@/lib/pokedex/display-name";
import type { PokedexNumber } from "@/lib/pokedex/pokedex-number";
import { speciesTypesByPokedexNumber } from "@/lib/pokedex/species-types";
import { TYPE_NAMES } from "@/lib/pokedex/type-matchups";
import type { SpeciesDetail, SpeciesSummary, TypeChart } from "@/lib/pokedex/types";
import {
  fetchAbility,
  fetchPokemon,
  fetchSpeciesList,
  fetchType,
  type TypeWithSpecies,
} from "./fetchers";

/** The 18 battle Types in Type id order, each through the cached `fetchType`. */
function fetchAllTypes(): Promise<TypeWithSpecies[]> {
  return Promise.all(TYPE_NAMES.map((name) => fetchType(name)));
}

/** All 151 Species in Pokédex Number order, each with its Types. */
export async function getPokedex(): Promise<SpeciesSummary[]> {
  const [list, types] = await Promise.all([fetchSpeciesList(), fetchAllTypes()]);
  const typesByNumber = speciesTypesByPokedexNumber(
    types.map(({ name, species }) => ({ type: name, species })),
  );
  return list.map(({ id, slug }) => {
    const speciesTypes = typesByNumber.get(id);
    if (!speciesTypes) throw new Error(`No Types found for Species #${id} (${slug})`);
    return { id, slug, displayName: displayName(slug), types: speciesTypes };
  });
}

/**
 * One Species' detail: its summary plus Base Stats and Abilities. Takes only a
 * checked Pokédex Number (see `parsePokedexNumber`). Each Ability is fetched
 * through the cached `fetchAbility`, so an Ability shared by several Species
 * is fetched once.
 */
export async function getSpecies(pokedexNumber: PokedexNumber): Promise<SpeciesDetail> {
  const variety = await fetchPokemon(pokedexNumber);
  const abilities = await Promise.all(
    variety.abilities.map(async ({ slug, hidden }) => {
      const ability = await fetchAbility(slug);
      return {
        displayName: ability.englishName ?? displayName(ability.slug),
        hidden,
        shortEffect: ability.shortEffect ?? "",
      };
    }),
  );
  return {
    id: variety.id,
    slug: variety.slug,
    displayName: displayName(variety.slug),
    types: variety.types,
    baseStats: variety.baseStats,
    abilities,
  };
}

/**
 * The Type Chart: the 18 Types as defenders, in Type id order, each with the
 * attacking Types that deal it 2×, ½× or 0×. Built from the same cached
 * `fetchType` calls as `getPokedex`, so it costs no extra requests.
 */
export async function getTypeChart(): Promise<TypeChart> {
  const types = await fetchAllTypes();
  return types.map(({ id, name, damageFrom }) => ({ id, name, damageFrom }));
}
