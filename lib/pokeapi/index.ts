import "server-only";
import { displayName } from "@/lib/pokedex/display-name";
import { speciesTypesById } from "@/lib/pokedex/species-types";
import { TYPE_NAMES } from "@/lib/pokedex/type-matchups";
import type { SpeciesDetail, SpeciesSummary } from "@/lib/pokedex/types";
import { fetchAbility, fetchPokemon, fetchSpeciesList, fetchType } from "./fetchers";

/** All 151 Species in Pokédex Number order, each with its Types. */
export async function getPokedex(): Promise<SpeciesSummary[]> {
  const [list, types] = await Promise.all([
    fetchSpeciesList(),
    Promise.all(TYPE_NAMES.map((name) => fetchType(name))),
  ]);
  const typesById = speciesTypesById(types);
  return list.map(({ id, slug }) => {
    const speciesTypes = typesById.get(id);
    if (!speciesTypes) throw new Error(`No Types found for Species #${id} (${slug})`);
    return { id, slug, displayName: displayName(slug), types: speciesTypes };
  });
}

/**
 * One Species' detail: its summary plus Base Stats and Abilities. Takes only a
 * parsed Pokédex Number (see `parsePokedexNumber`). Each Ability is fetched
 * through the cached `fetchAbility`, so an Ability shared by several Species
 * is fetched once.
 */
export async function getSpecies(id: number): Promise<SpeciesDetail> {
  const pokemon = await fetchPokemon(id);
  const abilities = await Promise.all(
    pokemon.abilities.map(async ({ name, hidden }) => {
      const ability = await fetchAbility(name);
      return {
        displayName: ability.englishName ?? displayName(ability.slug),
        hidden,
        shortEffect: ability.shortEffect ?? "",
      };
    }),
  );
  return {
    id: pokemon.id,
    slug: pokemon.slug,
    displayName: displayName(pokemon.slug),
    types: pokemon.types,
    baseStats: pokemon.baseStats,
    abilities,
  };
}
