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
