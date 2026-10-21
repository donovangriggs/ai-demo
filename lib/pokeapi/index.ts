import "server-only";
import { displayName } from "@/lib/pokedex/display-name";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { fetchSpeciesList } from "./fetchers";

/** All 151 Species in Pokédex Number order. */
export async function getPokedex(): Promise<SpeciesSummary[]> {
  const list = await fetchSpeciesList();
  return list.map(({ id, slug }) => ({ id, slug, displayName: displayName(slug) }));
}
