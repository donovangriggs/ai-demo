"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { readFavorites } from "@/lib/favorites-store";
import { parseFilter, randomPick, visibleSpecies } from "@/lib/pokedex/filter";
import { speciesHref } from "@/lib/pokedex/routes";
import type { SpeciesSummary } from "@/lib/pokedex/types";

/** Tailwind's `md` breakpoint (48rem): the split layout, where `/` shows an empty detail pane. */
const SPLIT_LAYOUT = "(min-width: 48rem)";

/**
 * On desktop, replaces `/` with a random Species from those the sidebar shows,
 * keeping the filter, so the detail pane is never empty on arrival. Renders
 * nothing. Below `md`, `/` is the list, so it does nothing. The URL is read in
 * the effect rather than with `useSearchParams`, so `/` stays prerendered and
 * the pick only ever happens in the browser.
 */
export function RandomSpeciesPick({ species }: { species: SpeciesSummary[] }) {
  const router = useRouter();
  // StrictMode runs the effect twice, which would replace `/` twice with
  // different picks: pick once per mount.
  const picked = useRef(false);

  useEffect(() => {
    if (picked.current || !window.matchMedia(SPLIT_LAYOUT).matches) return;
    picked.current = true;
    const filter = parseFilter(new URL(window.location.href).searchParams);
    // Read once rather than with `useFavorites`, whose hydration render sees no
    // Favorites and would pick again when they arrive.
    const pick = randomPick(visibleSpecies(species, filter, readFavorites()));
    // `replace`, so Back leaves the Pokédex instead of landing on `/` to pick again.
    if (pick) router.replace(speciesHref(pick.id, filter));
  }, [router, species]);

  return null;
}
