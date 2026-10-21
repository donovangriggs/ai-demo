import "server-only";
import { displayName } from "@/lib/pokedex/display-name";
import { speciesTypesById } from "@/lib/pokedex/species-types";
import { TYPE_NAMES } from "@/lib/pokedex/type-matchups";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { fetchSpeciesList, fetchType } from "./fetchers";

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
