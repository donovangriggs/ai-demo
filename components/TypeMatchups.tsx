import type { TypeMatchup, TypeMatchupGroups } from "@/lib/pokedex/type-matchups";
import type { Multiplier } from "@/lib/pokedex/types";
import { TypeBadge } from "./TypeBadge";

const MULTIPLIER_LABELS: Record<Multiplier, string> = {
  0: "0×",
  0.25: "¼×",
  0.5: "½×",
  1: "1×",
  2: "2×",
  4: "4×",
};

/** One labelled group of Type badges, each with its multiplier. */
function MatchupGroup({ label, matchups }: { label: string; matchups: TypeMatchup[] }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-20 shrink-0 pt-0.5 text-slate-500">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {matchups.map(({ type, multiplier }) => (
          <span key={type} className="inline-flex items-center gap-1">
            <TypeBadge type={type} className="px-2 py-0.5 text-[10px]" />
            <span className="font-mono text-xs font-semibold text-slate-600">
              {MULTIPLIER_LABELS[multiplier]}
            </span>
          </span>
        ))}
      </dd>
    </div>
  );
}

/** Pre-grouped Type Matchups: Weak to, Resists and Immune to. Empty groups are omitted. */
export function TypeMatchups({ groups }: { groups: TypeMatchupGroups }) {
  const shown = [
    { label: "Weak to", matchups: groups.weakTo },
    { label: "Resists", matchups: groups.resists },
    { label: "Immune to", matchups: groups.immuneTo },
  ].filter((group) => group.matchups.length > 0);
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Type Matchups
      </h2>
      <dl className="space-y-2">
        {shown.map((group) => (
          <MatchupGroup key={group.label} {...group} />
        ))}
      </dl>
    </section>
  );
}
