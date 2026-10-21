import type { TypeName } from "./types";

/** The 18 battle Types in PokéAPI id order (normal is 1, fairy is 18). */
export const TYPE_NAMES = [
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
] as const satisfies readonly TypeName[];

// Compile-time check that TYPE_NAMES lists every TypeName.
type MissingTypeNames = Exclude<TypeName, (typeof TYPE_NAMES)[number]>;
const _allTypeNamesListed: MissingTypeNames extends never ? true : never = true;
void _allTypeNamesListed;
