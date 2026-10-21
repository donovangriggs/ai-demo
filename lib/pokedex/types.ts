/** One of the 18 battle Types. */
export type TypeName =
  | "normal"
  | "fighting"
  | "flying"
  | "poison"
  | "ground"
  | "rock"
  | "bug"
  | "ghost"
  | "steel"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "psychic"
  | "ice"
  | "dragon"
  | "dark"
  | "fairy";

/** The damage multiplier a Species takes from one attacking Type (a Type Matchup). */
export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

/** One defending Type in the Type Chart: the attacking Types that deal it 2×, ½× or 0×. */
export interface TypeChartEntry {
  /** PokéAPI Type id (1–18). */
  id: number;
  name: TypeName;
  /** Attacking Type names; any Type not listed deals 1×. */
  damageFrom: { double: TypeName[]; half: TypeName[]; none: TypeName[] };
}

/** The Type Chart: the 18 Types as defenders. */
export type TypeChart = TypeChartEntry[];

/** One Species as shown in the Pokédex list. */
export interface SpeciesSummary {
  /** Pokédex Number (1–151). */
  id: number;
  /** PokéAPI slug, e.g. `mr-mime`. */
  slug: string;
  /** English display name, e.g. `Mr. Mime`. */
  displayName: string;
  /** The Species' one or two Types, in slot order (primary Type first). */
  types: TypeName[];
}

/** PokéAPI's slug for each of the six Base Stats. */
export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

/** A Species' six Base Stats, keyed by stat slug. */
export type BaseStats = Record<StatName, number>;

/** One of a Species' Abilities, as shown on its detail page. */
export interface SpeciesAbility {
  /** English display name, e.g. `Solar Power`. */
  displayName: string;
  /** Whether this is the Species' Hidden Ability. */
  hidden: boolean;
  /** English short effect text. */
  shortEffect: string;
}

/** One Species as shown on its detail page. */
export interface SpeciesDetail extends SpeciesSummary {
  baseStats: BaseStats;
  /** In slot order, so a Hidden Ability comes last. */
  abilities: SpeciesAbility[];
}
