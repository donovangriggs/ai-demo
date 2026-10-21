import type { Multiplier, TypeChart, TypeChartEntry, TypeName } from "./types";

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

/**
 * The Type Matchup against every attacking Type for a Species with the given
 * defending Types: the product of each defending Type's factor (2, ½, 0 or 1).
 */
export function typeMatchups(
  defending: TypeName[],
  chart: TypeChart,
): Record<TypeName, Multiplier> {
  const entries = defending.map((name) => {
    const entry = chart.find((e) => e.name === name);
    if (!entry) throw new Error(`Type Chart has no entry for ${name}`);
    return entry;
  });
  const factor = ({ damageFrom }: TypeChartEntry, attacking: TypeName) =>
    damageFrom.none.includes(attacking)
      ? 0
      : damageFrom.double.includes(attacking)
        ? 2
        : damageFrom.half.includes(attacking)
          ? 0.5
          : 1;
  return Object.fromEntries(
    TYPE_NAMES.map((attacking) => [
      attacking,
      entries.reduce<number>((product, entry) => product * factor(entry, attacking), 1),
    ]),
  ) as Record<TypeName, Multiplier>;
}

/** One attacking Type and the multiplier it deals, as shown in a Type Matchups group. */
export interface TypeMatchup {
  type: TypeName;
  multiplier: Multiplier;
}

/** A Species' Type Matchups grouped for display; 1× Types are left out. */
export interface TypeMatchupGroups {
  /** 4× and 2×. */
  weakTo: TypeMatchup[];
  /** ¼× and ½×. */
  resists: TypeMatchup[];
  /** 0×. */
  immuneTo: TypeMatchup[];
}

/**
 * Splits Type Matchups into Weak to, Resists and Immune to, dropping 1×. Each
 * group is sorted strongest first (4× before 2×, ¼× before ½×), then by Type id.
 */
export function groupTypeMatchups(
  matchups: Record<TypeName, Multiplier>,
): TypeMatchupGroups {
  // Built in Type id order; the stable sorts below keep it as the tie-break.
  const all = TYPE_NAMES.map((type) => ({ type, multiplier: matchups[type] }));
  return {
    weakTo: all.filter((m) => m.multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
    resists: all
      .filter((m) => m.multiplier > 0 && m.multiplier < 1)
      .sort((a, b) => a.multiplier - b.multiplier),
    immuneTo: all.filter((m) => m.multiplier === 0),
  };
}
