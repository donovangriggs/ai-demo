"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";

/** Shown inside the sidebar layout when the URL isn't a valid Pokédex Number. */
export default function SpeciesNotFound() {
  // not-found.tsx receives no props, so read the bad param on the client.
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
      <p className="text-lg font-semibold text-slate-700">No Species #{decodeURIComponent(id)}</p>
      <p>This Pokédex covers #1–{POKEDEX_SIZE}.</p>
      <Link href="/pokemon/1" className="font-medium text-slate-900 underline">
        Go to #1
      </Link>
    </div>
  );
}
