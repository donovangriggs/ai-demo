"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CenteredMessage } from "@/components/CenteredMessage";
import { FIRST_POKEDEX_NUMBER, POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import { speciesHref } from "@/lib/pokedex/routes";

/** Shown inside the sidebar layout when the URL isn't a valid Pokédex Number. */
export default function SpeciesNotFound() {
  // not-found.tsx receives no props, so read the bad param on the client.
  const { id } = useParams<{ id: string }>();
  return (
    <CenteredMessage title={`No Species #${decodeURIComponent(id)}`}>
      <p>This Pokédex covers #1–{POKEDEX_SIZE}.</p>
      <Link href={speciesHref(FIRST_POKEDEX_NUMBER)} className="font-medium text-slate-900 underline">
        Go to #1
      </Link>
    </CenteredMessage>
  );
}
