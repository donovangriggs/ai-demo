import "server-only";
import { cacheLife } from "next/cache";
import { isPokedexNumber, POKEDEX_SIZE, type PokedexNumber } from "@/lib/pokedex/pokedex-number";
import { bySlot } from "@/lib/pokedex/slots";
import type { TypeMembers } from "@/lib/pokedex/species-types";
import type {
  BaseStatName,
  BaseStats,
  TypeChartEntry,
  TypeName,
} from "@/lib/pokedex/types";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/** Raw `GET /pokemon?limit=N` response (only the fields we read). */
interface RawSpeciesList {
  results: { name: string; url: string }[];
}

/** A Species in the Pokédex, by Pokédex Number and slug. */
export interface PokedexSpecies {
  id: PokedexNumber;
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

/** A Type trimmed to its Type Chart entry plus the Pokédex's Species that have it. */
export interface TypeWithSpecies extends TypeChartEntry {
  species: TypeMembers["species"];
}

/**
 * Fetches JSON from PokéAPI. Throws on any non-2xx response so a failure is
 * never cached as data.
 */
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${POKEAPI_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`PokéAPI ${path} responded ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** `https://pokeapi.co/api/v2/pokemon/6/` → `6` (any resource id, including non-default Varieties). */
function resourceIdFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) throw new Error(`PokéAPI URL has no id: ${url}`);
  return Number(match[1]);
}

/** The first 151 Species as `{ id, slug }`, in Pokédex Number order. */
export async function fetchSpeciesList(): Promise<PokedexSpecies[]> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawSpeciesList>(`/pokemon?limit=${POKEDEX_SIZE}`);
  return raw.results
    .map((r) => {
      const id = resourceIdFromUrl(r.url);
      if (!isPokedexNumber(id)) throw new Error(`PokéAPI listed #${id} (${r.name}) outside the Pokédex`);
      return { id, slug: r.name };
    })
    .sort((a, b) => a.id - b.id);
}

/**
 * One of the 18 battle Types, trimmed to its id, name, the current
 * `*_damage_from` lists and the Pokédex's Species that have it (with slots).
 * Later Species and non-default Varieties are dropped here, so they never
 * reach the cache.
 */
export async function fetchType(name: TypeName): Promise<TypeWithSpecies> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawType>(`/type/${name}`);
  const relations = raw.damage_relations;
  const typeNames = (list: { name: TypeName }[]) => list.map((t) => t.name);
  return {
    id: raw.id,
    name: raw.name,
    damageFrom: {
      double: typeNames(relations.double_damage_from),
      half: typeNames(relations.half_damage_from),
      none: typeNames(relations.no_damage_from),
    },
    species: raw.pokemon.flatMap(({ slot, pokemon }) => {
      const pokedexNumber = resourceIdFromUrl(pokemon.url);
      return isPokedexNumber(pokedexNumber) ? [{ pokedexNumber, slot }] : [];
    }),
  };
}

/**
 * Raw `GET /pokemon/{id}` response (only the fields we read). `moves` and the
 * `past_*` fields are never read or returned.
 */
interface RawPokemon {
  name: string;
  types: { slot: number; type: { name: TypeName } }[];
  stats: { base_stat: number; stat: { name: BaseStatName } }[];
  abilities: { slot: number; is_hidden: boolean; ability: { name: string } }[];
}

/** A Species' default Variety, trimmed to its current Types, Base Stats and Abilities. */
export interface DefaultVariety {
  id: PokedexNumber;
  slug: string;
  /** In slot order (primary Type first). */
  types: TypeName[];
  baseStats: BaseStats;
  /** Ability slugs in slot order. */
  abilities: { slug: string; hidden: boolean }[];
}

/** Raw `GET /ability/{name}` response (only the fields we read). */
interface RawAbility {
  name: string;
  names: { name: string; language: { name: string } }[];
  effect_entries: { short_effect: string; language: { name: string } }[];
}

/** An Ability's English text: its name and short effect, if PokéAPI has them. */
export interface AbilityText {
  slug: string;
  englishName: string | null;
  shortEffect: string | null;
}

/** A Species' default Variety (`/pokemon/{id}`), trimmed to Types, Base Stats and Abilities. */
export async function fetchPokemon(id: PokedexNumber): Promise<DefaultVariety> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawPokemon>(`/pokemon/${id}`);
  return {
    id,
    slug: raw.name,
    types: bySlot(raw.types).map((t) => t.type.name),
    baseStats: Object.fromEntries(
      raw.stats.map((s) => [s.stat.name, s.base_stat]),
    ) as BaseStats,
    abilities: bySlot(raw.abilities).map((a) => ({
      slug: a.ability.name,
      hidden: a.is_hidden,
    })),
  };
}

/** One Ability (`/ability/{name}`), trimmed to its English name and short effect. */
export async function fetchAbility(name: string): Promise<AbilityText> {
  "use cache";
  cacheLife("max");

  const raw = await getJson<RawAbility>(`/ability/${name}`);
  const findEnglishEntry = <T extends { language: { name: string } }>(list: T[]) =>
    list.find((entry) => entry.language.name === "en");
  return {
    slug: raw.name,
    englishName: findEnglishEntry(raw.names)?.name ?? null,
    shortEffect: findEnglishEntry(raw.effect_entries)?.short_effect ?? null,
  };
}
