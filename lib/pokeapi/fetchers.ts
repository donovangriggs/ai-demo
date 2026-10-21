import "server-only";
import { cacheLife } from "next/cache";
import { POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";

const API = "https://pokeapi.co/api/v2";

/** Raw `GET /pokemon?limit=N` response (only the fields we read). */
interface RawSpeciesList {
  results: { name: string; url: string }[];
}

/** Trimmed list entry: Pokédex Number and slug. */
export interface SpeciesListEntry {
  id: number;
  slug: string;
}

/**
 * Fetches JSON from PokéAPI. Throws on any non-2xx response so a failure is
 * never cached as data.
 */
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    throw new Error(`PokéAPI ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** `https://pokeapi.co/api/v2/pokemon/6/` → `6` */
function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) throw new Error(`PokéAPI URL has no id: ${url}`);
  return Number(match[1]);
}

/** The first 151 Species as `{ id, slug }`, in Pokédex Number order. */
export async function fetchSpeciesList(): Promise<SpeciesListEntry[]> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawSpeciesList>(`/pokemon?limit=${POKEDEX_SIZE}`);
  return raw.results
    .map((r) => ({ id: idFromUrl(r.url), slug: r.name }))
    .sort((a, b) => a.id - b.id);
}
