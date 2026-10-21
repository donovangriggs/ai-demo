import type { BaseStatName, BaseStats } from "./types";

/** The highest possible Base Stat; Base Stat bars are scaled to it. */
export const BASE_STAT_MAX = 255;

/** The six Base Stats in display order, with their labels. */
const BASE_STAT_LABELS: [BaseStatName, string][] = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["special-attack", "Sp. Atk"],
  ["special-defense", "Sp. Def"],
  ["speed", "Speed"],
];

/** A Species' Base Stats as labelled rows in display order, plus their Total. */
export function baseStatRows(baseStats: BaseStats): {
  rows: { label: string; value: number }[];
  total: number;
} {
  const rows = BASE_STAT_LABELS.map(([name, label]) => ({ label, value: baseStats[name] }));
  return { rows, total: rows.reduce((sum, row) => sum + row.value, 0) };
}
