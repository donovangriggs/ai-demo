import Image from "next/image";
import { notFound } from "next/navigation";
import { Abilities } from "@/components/Abilities";
import { BaseStats } from "@/components/BaseStats";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TYPE_COLOURS, TypeBadge } from "@/components/TypeBadge";
import { TypeMatchups } from "@/components/TypeMatchups";
import { getSpecies, getTypeChart } from "@/lib/pokeapi";
import {
  formatPokedexNumber,
  parsePokedexNumber,
  POKEDEX_SIZE,
} from "@/lib/pokedex/pokedex-number";
import { primaryType } from "@/lib/pokedex/species-types";
import { artworkUrl } from "@/lib/pokedex/sprites";
import { groupTypeMatchups, typeMatchups } from "@/lib/pokedex/type-matchups";

/** Prerender every Species' detail page at build time. */
export function generateStaticParams() {
  return Array.from({ length: POKEDEX_SIZE }, (_, i) => ({ id: String(i + 1) }));
}

export default async function SpeciesPage({ params }: PageProps<"/pokemon/[id]">) {
  const pokedexNumber = parsePokedexNumber((await params).id);
  // Reject anything that isn't a canonical Pokédex Number before fetching.
  if (pokedexNumber === null) notFound();

  const [species, chart] = await Promise.all([getSpecies(pokedexNumber), getTypeChart()]);
  const matchups = groupTypeMatchups(typeMatchups(species.types, chart));
  const primary = primaryType(species);

  return (
    <article
      className="w-full"
      style={{
        background: `linear-gradient(180deg, ${TYPE_COLOURS[primary]}33, transparent 420px)`,
      }}
    >
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <header className="flex items-center gap-4 md:gap-6">
          <Image
            src={artworkUrl(species.id)}
            alt={species.displayName}
            width={160}
            height={160}
            preload
            className="size-28 shrink-0 rounded-3xl bg-white/70 drop-shadow-xl md:size-40"
          />
          <div className="space-y-2">
            <p className="font-mono text-slate-500">{formatPokedexNumber(species.id)}</p>
            <h1 className="text-3xl font-black md:text-4xl">{species.displayName}</h1>
            <div className="flex gap-1.5">
              {species.types.map((type) => (
                <TypeBadge key={type} type={type} className="px-2.5 py-1 text-xs" />
              ))}
            </div>
          </div>
          <FavoriteButton pokedexNumber={pokedexNumber} name={species.displayName} />
        </header>

        <BaseStats baseStats={species.baseStats} type={primary} />

        <TypeMatchups groups={matchups} />

        <Abilities abilities={species.abilities} />
      </div>
    </article>
  );
}
