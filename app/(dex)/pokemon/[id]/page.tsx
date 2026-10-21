import Image from "next/image";
import { notFound } from "next/navigation";
import { Abilities } from "@/components/Abilities";
import { BaseStats } from "@/components/BaseStats";
import { TypeBadge } from "@/components/TypeBadge";
import { TypeMatchups } from "@/components/TypeMatchups";
import { getSpecies, getTypeChart } from "@/lib/pokeapi";
import {
  formatPokedexNumber,
  parsePokedexNumber,
  POKEDEX_SIZE,
} from "@/lib/pokedex/pokedex-number";
import { artworkUrl } from "@/lib/pokedex/sprites";
import { groupTypeMatchups, typeMatchups } from "@/lib/pokedex/type-matchups";

/** Prerender every Species' detail page at build time. */
export function generateStaticParams() {
  return Array.from({ length: POKEDEX_SIZE }, (_, i) => ({ id: String(i + 1) }));
}

export default async function SpeciesPage({ params }: PageProps<"/pokemon/[id]">) {
  const id = parsePokedexNumber((await params).id);
  // Reject anything that isn't a canonical Pokédex Number before fetching.
  if (id === null) notFound();

  const [species, chart] = await Promise.all([getSpecies(id), getTypeChart()]);
  const matchups = groupTypeMatchups(typeMatchups(species.types, chart));

  return (
    <article className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <header className="flex items-center gap-6">
        <Image
          src={artworkUrl(species.id)}
          alt={species.displayName}
          width={160}
          height={160}
          preload
          className="size-40 shrink-0 rounded-xl bg-slate-50"
        />
        <div className="space-y-2">
          <p className="font-mono text-slate-400">{formatPokedexNumber(species.id)}</p>
          <h1 className="text-3xl font-black">{species.displayName}</h1>
          <div className="flex gap-1.5">
            {species.types.map((type) => (
              <TypeBadge key={type} type={type} className="px-2.5 py-1 text-xs" />
            ))}
          </div>
        </div>
      </header>

      <BaseStats stats={species.baseStats} type={species.types[0]} />

      <TypeMatchups groups={matchups} />

      <Abilities abilities={species.abilities} />
    </article>
  );
}
