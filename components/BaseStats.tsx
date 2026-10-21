import { BASE_STAT_MAX, baseStatRows } from "@/lib/pokedex/base-stats";
import type { BaseStats as BaseStatsData, TypeName } from "@/lib/pokedex/types";
import { TYPE_COLOURS } from "./TypeBadge";

/** One bar per Base Stat, scaled to 255 and tinted with the primary Type, plus a Total. */
export function BaseStats({ stats, type }: { stats: BaseStatsData; type: TypeName }) {
  const { rows, total } = baseStatRows(stats);
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Base Stats
      </h2>
      <dl className="space-y-1">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <dt className="w-16 shrink-0 text-slate-500">{label}</dt>
            <dd className="w-8 shrink-0 text-right font-mono font-semibold">{value}</dd>
            <dd className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
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
        <div className="flex items-center gap-3 border-t border-slate-200 pt-1">
          <dt className="w-16 shrink-0 font-semibold text-slate-700">Total</dt>
          <dd className="w-8 shrink-0 text-right font-mono font-semibold">{total}</dd>
        </div>
      </dl>
    </section>
  );
}
