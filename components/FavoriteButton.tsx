"use client";

import { toggleStoredFavorite, useFavorites } from "@/lib/favorites-store";
import type { PokedexNumber } from "@/lib/pokedex/pokedex-number";

/** The detail header's star, marking the Species as a Favorite or unmarking it. */
export function FavoriteButton({
  pokedexNumber,
  name,
}: {
  pokedexNumber: PokedexNumber;
  /** The Species' display name, for the accessible name. */
  name: string;
}) {
  const favorite = useFavorites().has(pokedexNumber);
  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={`Favorite ${name}`}
      onClick={() => toggleStoredFavorite(pokedexNumber)}
      className={`ml-auto shrink-0 self-start rounded-full border px-2.5 py-1 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        favorite
          ? "border-amber-400 bg-amber-100 text-amber-500"
          : "border-slate-300 bg-white/70 text-slate-400 hover:text-slate-600"
      }`}
    >
      <span aria-hidden>{favorite ? "★" : "☆"}</span>
    </button>
  );
}
