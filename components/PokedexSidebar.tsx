"use client";

import { POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { SpeciesRow } from "./SpeciesRow";

export function PokedexSidebar({ species }: { species: SpeciesSummary[] }) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200">
      <div className="border-b border-slate-200 p-3">
        <h1 className="text-lg font-black">
          Pokédex{" "}
          <span className="text-xs font-normal text-slate-400">
            {species.length}/{POKEDEX_SIZE}
          </span>
        </h1>
      </div>
      <ul className="flex-1 overflow-y-auto py-1">
        {species.map((s) => (
          <li key={s.id}>
            <SpeciesRow species={s} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
