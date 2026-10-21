import "server-only";
import { cacheLife } from "next/cache";
import { POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import type { TypeMembership } from "@/lib/pokedex/species-types";
import type { TypeName } from "@/lib/pokedex/types";

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

/** Raw `GET /type/{name}` response (only the fields we read; `past_*` ignored). */
interface RawType {
  id: number;
  name: TypeName;
  damage_relations: {
    double_damage_from: { name: TypeName }[];
    half_damage_from: { name: TypeName }[];
    no_damage_from: { name: TypeName }[];
  };
  pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}

/** Trimmed Type: its Species membership and the damage it takes as a defender. */
export interface TypeData extends TypeMembership {
  id: number;
  damageFrom: { double: TypeName[]; half: TypeName[]; none: TypeName[] };
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

/**
 * One of the 18 battle Types, trimmed to its id, name, Species membership
 * (with slots) and the current `*_damage_from` lists.
 */
export async function fetchType(name: TypeName): Promise<TypeData> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawType>(`/type/${name}`);
  const relations = raw.damage_relations;
  const names = (list: { name: TypeName }[]) => list.map((t) => t.name);
  return {
    id: raw.id,
    name: raw.name,
    pokemon: raw.pokemon.map((p) => ({ id: idFromUrl(p.pokemon.url), slot: p.slot })),
    damageFrom: {
      double: names(relations.double_damage_from),
      half: names(relations.half_damage_from),
      none: names(relations.no_damage_from),
    },
  };
}
