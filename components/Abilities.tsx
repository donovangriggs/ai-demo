import type { SpeciesAbility } from "@/lib/pokedex/types";

/** Each Ability's name, a "Hidden" marker for a Hidden Ability, and its short effect. */
export function Abilities({ abilities }: { abilities: SpeciesAbility[] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Abilities
      </h2>
      <ul className="space-y-2">
        {abilities.map((ability) => (
          <li key={ability.displayName}>
            <p className="font-semibold">
              {ability.displayName}
              {ability.hidden && (
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Hidden
                </span>
              )}
            </p>
            {ability.shortEffect && <p className="text-slate-600">{ability.shortEffect}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
