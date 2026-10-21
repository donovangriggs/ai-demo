import Image from "next/image";
import { formatPokedexNumber } from "@/lib/pokedex/pokedex-number";
import { spriteUrl } from "@/lib/pokedex/sprites";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { TypeBadge } from "./TypeBadge";

export function SpeciesRow({ species }: { species: SpeciesSummary }) {
  return (
    <div className="flex items-center gap-2 border-l-4 border-transparent px-3 py-1 hover:bg-slate-50">
      <Image
        src={spriteUrl(species.id)}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 [image-rendering:pixelated]"
      />
      <span className="w-10 font-mono text-slate-400">
        {formatPokedexNumber(species.id)}
      </span>
      <span className="flex-1 font-medium">{species.displayName}</span>
      <span className="flex gap-1">
        {species.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </span>
    </div>
  );
}
