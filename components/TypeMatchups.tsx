import type { TypeMatchup, TypeMatchupGroups } from "@/lib/pokedex/type-matchups";
import type { Multiplier } from "@/lib/pokedex/types";
import { Section } from "./Section";
import { TypeBadge } from "./TypeBadge";

const MULTIPLIER_LABELS: Record<Multiplier, string> = {
  0: "0×",
  0.25: "¼×",
  0.5: "½×",
  1: "1×",
  2: "2×",
  4: "4×",
};

/** One labelled group of Type badges, each with its multiplier in the group's tone. */
function MatchupGroup({
  label,
  matchups,
  tone,
}: {
  label: string;
  matchups: TypeMatchup[];
  tone: string;
}) {
  return (
    <div>
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="flex flex-wrap gap-x-2.5 gap-y-1.5">
        {matchups.map(({ type, multiplier }) => (
          <span key={type} className="inline-flex items-center gap-1">
            <TypeBadge type={type} className="px-2 py-0.5 text-xs" />
            <span className={`font-mono text-xs font-bold ${tone}`}>
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
    { label: "Weak to", matchups: groups.weakTo, tone: "text-red-600" },
    { label: "Resists", matchups: groups.resists, tone: "text-emerald-600" },
    { label: "Immune to", matchups: groups.immuneTo, tone: "text-slate-600" },
  ].filter((group) => group.matchups.length > 0);
  return (
    <Section title="Type Matchups">
      <dl className="space-y-3">
        {shown.map((group) => (
          <MatchupGroup key={group.label} {...group} />
        ))}
      </dl>
    </Section>
  );
}
