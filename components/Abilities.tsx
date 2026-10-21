import type { SpeciesAbility } from "@/lib/pokedex/types";
import { Section } from "./Section";

/** Each Ability's name, a "Hidden" marker for a Hidden Ability, and its short effect. */
export function Abilities({ abilities }: { abilities: SpeciesAbility[] }) {
  return (
    <Section title="Abilities">
      <ul>
        {abilities.map((ability) => (
          <li
            key={ability.displayName}
            className="border-t border-slate-100 py-2 first:border-0 first:pt-0 last:pb-0"
          >
            <p className="font-semibold">
              {ability.displayName}
              {ability.hidden && (
                <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-white">
                  Hidden
                </span>
              )}
            </p>
            {ability.shortEffect && <p className="text-slate-600">{ability.shortEffect}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
