"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { parsePokedexNumber, POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import { matchesQuery } from "@/lib/pokedex/search";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { SpeciesRow } from "./SpeciesRow";

type Props = { species: SpeciesSummary[] };

/**
 * The Pokédex sidebar with instant search. The query lives in `?q=`, written
 * with `history.replaceState` so typing never round-trips to the server.
 * Uses `useSearchParams`, so render it inside `<Suspense>` with
 * `<PokedexSidebarFallback>` as the fallback.
 */
export function PokedexSidebar({ species }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  function changeQuery(next: string) {
    setQuery(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  return (
    <SidebarView species={species} query={query} onQueryChange={changeQuery} />
  );
}

/** The unfiltered sidebar, shown until the search params are available. */
export function PokedexSidebarFallback({ species }: Props) {
  return <SidebarView species={species} query="" />;
}

function SidebarView({
  species,
  query,
  onQueryChange,
}: Props & { query: string; onQueryChange?: (q: string) => void }) {
  const visible = species.filter((s) => matchesQuery(s, query));
  const { id } = useParams<{ id?: string }>();
  const selectedId = id === undefined ? null : parsePokedexNumber(id);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200">
      <div className="space-y-2 border-b border-slate-200 p-3">
        <h1 className="text-lg font-black">
          Pokédex{" "}
          <span className="text-xs font-normal text-slate-400">
            {visible.length}/{POKEDEX_SIZE}
          </span>
        </h1>
        <input
          type="search"
          value={query}
          readOnly={!onQueryChange}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Search name or #"
          aria-label="Search Species"
          className="w-full rounded-md border border-slate-300 px-2 py-1"
        />
      </div>
      {visible.length > 0 ? (
        <ul className="flex-1 overflow-y-auto py-1">
          {visible.map((s) => (
            <li key={s.id}>
              <Link
                href={`/pokemon/${s.id}`}
                aria-current={s.id === selectedId ? "page" : undefined}
                className="block"
              >
                <SpeciesRow species={s} selected={s.id === selectedId} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 space-y-2 p-3 text-slate-500">
          <p>No Species match “{query}”</p>
          <button
            type="button"
            onClick={() => onQueryChange?.("")}
            className="rounded-md border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear search
          </button>
        </div>
      )}
    </aside>
  );
}
