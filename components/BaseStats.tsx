import { BASE_STAT_MAX, baseStatRows } from "@/lib/pokedex/base-stats";
import type { BaseStats as BaseStatsData, TypeName } from "@/lib/pokedex/types";
import { Section } from "./Section";
import { TYPE_COLOURS } from "./TypeBadge";

/** One bar per Base Stat, scaled to 255 and tinted with the primary Type, plus a Total. */
export function BaseStats({ baseStats, type }: { baseStats: BaseStatsData; type: TypeName }) {
  const { rows, total } = baseStatRows(baseStats);
  return (
    <Section title="Base Stats">
      <dl>
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 py-1">
            <dt className="w-16 shrink-0 text-slate-500">{label}</dt>
            <dd className="w-10 shrink-0 text-right font-mono font-bold">{value}</dd>
            <dd className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(value / BASE_STAT_MAX) * 100}%`,
                  backgroundColor: TYPE_COLOURS[type],
                }}
              />
            </dd>
          </div>
        ))}
        <div className="mt-2 flex justify-end gap-1.5 text-slate-500">
          <dt>Total</dt>
          <dd className="font-bold text-slate-900">{total}</dd>
        </div>
      </dl>
    </Section>
  );
}
