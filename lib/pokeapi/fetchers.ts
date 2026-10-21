import "server-only";
import { cacheLife } from "next/cache";
import { POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import type { TypeMembership } from "@/lib/pokedex/species-types";
import type { BaseStats, StatName, TypeChartEntry, TypeName } from "@/lib/pokedex/types";

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

/** Trimmed Type: its Type Chart entry plus its Species membership. */
export interface TypeData extends TypeChartEntry, TypeMembership {}

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

/**
 * Raw `GET /pokemon/{id}` response (only the fields we read). `moves` and the
 * `past_*` fields are never read or returned.
 */
interface RawPokemon {
  id: number;
  name: string;
  types: { slot: number; type: { name: TypeName } }[];
  stats: { base_stat: number; stat: { name: StatName } }[];
  abilities: { slot: number; is_hidden: boolean; ability: { name: string } }[];
}

/** Trimmed Pokémon: the default Variety's current Types, Base Stats and Abilities. */
export interface PokemonData {
  id: number;
  slug: string;
  /** In slot order (primary Type first). */
  types: TypeName[];
  baseStats: BaseStats;
  /** In slot order. */
  abilities: { name: string; hidden: boolean }[];
}

/** Raw `GET /ability/{name}` response (only the fields we read). */
interface RawAbility {
  name: string;
  names: { name: string; language: { name: string } }[];
  effect_entries: { short_effect: string; language: { name: string } }[];
}

/** Trimmed Ability: its English name and short effect, if PokéAPI has them. */
export interface AbilityData {
  slug: string;
  englishName: string | null;
  shortEffect: string | null;
}

/** A Species' default Variety (`/pokemon/{id}`), trimmed to Types, Base Stats and Abilities. */
export async function fetchPokemon(id: number): Promise<PokemonData> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawPokemon>(`/pokemon/${id}`);
  const bySlot = <T extends { slot: number }>(list: T[]) =>
    [...list].sort((a, b) => a.slot - b.slot);
  return {
    id: raw.id,
    slug: raw.name,
    types: bySlot(raw.types).map((t) => t.type.name),
    baseStats: Object.fromEntries(
      raw.stats.map((s) => [s.stat.name, s.base_stat]),
    ) as BaseStats,
    abilities: bySlot(raw.abilities).map((a) => ({
      name: a.ability.name,
      hidden: a.is_hidden,
    })),
  };
}

/** One Ability (`/ability/{name}`), trimmed to its English name and short effect. */
export async function fetchAbility(name: string): Promise<AbilityData> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawAbility>(`/ability/${name}`);
  const english = <T extends { language: { name: string } }>(list: T[]) =>
    list.find((entry) => entry.language.name === "en");
  return {
    slug: raw.name,
    englishName: english(raw.names)?.name ?? null,
    shortEffect: english(raw.effect_entries)?.short_effect ?? null,
  };
}
