"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFavorites } from "@/lib/favorites-store";
import { NO_FILTER, parseFilter, visibleSpecies, type PokedexFilter } from "@/lib/pokedex/filter";
import { parsePokedexNumber, POKEDEX_SIZE } from "@/lib/pokedex/pokedex-number";
import { isSpeciesPath, pokedexHref, speciesHref } from "@/lib/pokedex/routes";
import type { SpeciesSummary } from "@/lib/pokedex/types";
import { SpeciesRow } from "./SpeciesRow";

type Props = { species: SpeciesSummary[] };

/**
 * The Pokédex sidebar with instant search and a "Favorites only" toggle. The
 * Pokédex filter lives in `?q=` and `?fav=`, written with
 * `history.replaceState` so typing never round-trips to the server, and the
 * sidebar follows the URL whenever it changes some other way (back and
 * forward, or a link to another route). Row links carry the filter, so a
 * reload or a shared detail URL restores it. Uses `useSearchParams`, so render
 * it inside `<Suspense>` with `<PokedexSidebarFallback>` as the fallback.
 *
 * Below `md` the split stacks: on detail routes the sidebar hides itself and
 * renders a back link (carrying the filter) above the detail pane instead.
 */
export function PokedexSidebar({ species }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // Local state, not `searchParams` directly: typing must update the input
  // synchronously, while the router applies each `replaceState` in a transition.
  const [filter, setFilter] = useState(() => parseFilter(searchParams));

  // A navigation to another route (a link, or back/forward across routes) may
  // carry a different filter: adopt it. Typing never changes the pathname, so
  // the router's lagging echoes of our own `replaceState` calls are ignored.
  const [syncedPathname, setSyncedPathname] = useState(pathname);
  if (pathname !== syncedPathname) {
    setSyncedPathname(pathname);
    setFilter(parseFilter(searchParams));
  }

  // Back/forward between entries of the same route changes only the filter.
  useEffect(() => {
    const onPopState = () => setFilter(parseFilter(new URL(window.location.href).searchParams));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function changeFilter(next: PokedexFilter) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next.q) url.searchParams.set("q", next.q);
    else url.searchParams.delete("q");
    if (next.favoritesOnly) url.searchParams.set("fav", "1");
    else url.searchParams.delete("fav");
    window.history.replaceState(null, "", url);
  }

  return <SidebarView species={species} filter={filter} onFilterChange={changeFilter} />;
}

/** The unfiltered sidebar, shown until the search params are available. */
export function PokedexSidebarFallback({ species }: Props) {
  return <SidebarView species={species} filter={NO_FILTER} />;
}

function SidebarView({
  species,
  filter,
  onFilterChange,
}: Props & { filter: PokedexFilter; onFilterChange?: (filter: PokedexFilter) => void }) {
  const favorites = useFavorites();
  const visible = visibleSpecies(species, filter, favorites);
  const { id } = useParams<{ id?: string }>();
  const selected = id === undefined ? null : parsePokedexNumber(id);
  const onDetail = isSpeciesPath(usePathname());

  // On narrow screens the list is `display: none` on detail routes, which some
  // browsers (Firefox) treat as resetting its scroll offset. Keep the last
  // offset and put it back when the list shows again.
  const listRef = useRef<HTMLUListElement>(null);
  const scrollTop = useRef(0);
  useLayoutEffect(() => {
    if (!onDetail && listRef.current) listRef.current.scrollTop = scrollTop.current;
  }, [onDetail]);

  return (
    <>
      <aside
        // `data-pokedex-route` lets the `(dex)` layout's <main>, a later
        // sibling, hide itself on `/` at narrow widths (via `peer`).
        data-pokedex-route={onDetail ? undefined : ""}
        className={`${onDetail ? "max-md:hidden" : "max-md:min-h-0 max-md:flex-1"} peer flex shrink-0 flex-col border-slate-200 md:w-80 md:border-r`}
      >
        <div className="space-y-2 border-b border-slate-200 p-3">
          <h1 className="text-lg font-black">
            Pokédex{" "}
            <span className="text-xs font-normal text-slate-400">
              {visible.length}/{POKEDEX_SIZE}
            </span>
          </h1>
          <div className="flex gap-2">
            <input
              type="search"
              value={filter.q}
              readOnly={!onFilterChange}
              onChange={(e) => onFilterChange?.({ ...filter, q: e.target.value })}
              placeholder="Search name or #"
              aria-label="Search Species"
              className="min-w-0 flex-1 rounded-md bg-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              aria-pressed={filter.favoritesOnly}
              onClick={() => onFilterChange?.({ ...filter, favoritesOnly: !filter.favoritesOnly })}
              className={`shrink-0 rounded-md border px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                filter.favoritesOnly
                  ? "border-amber-400 bg-amber-100 text-amber-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span aria-hidden>{filter.favoritesOnly ? "★" : "☆"}</span> Favorites only
            </button>
          </div>
        </div>
        {visible.length > 0 ? (
          <ul
            ref={listRef}
            onScroll={(e) => {
              scrollTop.current = e.currentTarget.scrollTop;
            }}
            className="flex-1 overflow-y-auto py-1"
          >
            {visible.map((s) => (
              <li key={s.id}>
                <Link
                  href={speciesHref(s.id, filter)}
                  aria-current={s.id === selected ? "page" : undefined}
                  className="block"
                >
                  <SpeciesRow species={s} selected={s.id === selected} />
                </Link>
              </li>
            ))}
          </ul>
        ) : filter.favoritesOnly ? (
          <EmptyState
            message={favorites.size ? `No Favorites match “${filter.q}”` : "No Favorites yet"}
            action="Show all"
            onClick={() => onFilterChange?.({ ...filter, favoritesOnly: false })}
          />
        ) : (
          <EmptyState
            message={`No Species match “${filter.q}”`}
            action="Clear search"
            onClick={() => onFilterChange?.({ ...filter, q: "" })}
          />
        )}
      </aside>
      {onDetail && (
        <nav className="shrink-0 border-b border-slate-200 px-4 py-3 md:hidden">
          <Link href={pokedexHref(filter)} className="font-medium text-slate-600 hover:text-slate-900">
            ← All Species
          </Link>
        </nav>
      )}
    </>
  );
}

/** Why the list is empty, with one button that widens the filter. */
function EmptyState({
  message,
  action,
  onClick,
}: {
  message: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex-1 space-y-2 p-3 text-slate-500">
      <p>{message}</p>
      <button
        type="button"
        onClick={onClick}
        className="rounded-md border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
      >
        {action}
      </button>
    </div>
  );
}
