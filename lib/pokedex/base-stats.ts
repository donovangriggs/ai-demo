import type { BaseStats, StatName } from "./types";

/** The highest possible Base Stat; Base Stat bars are scaled to it. */
export const BASE_STAT_MAX = 255;

/** The six Base Stats in display order, with their labels. */
const BASE_STAT_LABELS: [StatName, string][] = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["special-attack", "Sp. Atk"],
  ["special-defense", "Sp. Def"],
  ["speed", "Speed"],
];

/** A Species' Base Stats as labelled rows in display order, plus their Total. */
export function baseStatRows(stats: BaseStats): {
  rows: { label: string; value: number }[];
  total: number;
} {
  const rows = BASE_STAT_LABELS.map(([name, label]) => ({ label, value: stats[name] }));
  return { rows, total: rows.reduce((sum, row) => sum + row.value, 0) };
}
