import { useSyncExternalStore } from "react";
import { parseFavorites, serializeFavorites, toggleFavorite } from "./pokedex/favorites";
import type { PokedexNumber } from "./pokedex/pokedex-number";

/** The localStorage key holding the serialised Favorites. */
const STORAGE_KEY = "pokedex:favorites";

const NO_FAVORITES: ReadonlySet<PokedexNumber> = new Set();
const listeners = new Set<() => void>();

// Set once a write fails (storage blocked or full): from then on this tab
// keeps its Favorites in memory, so the star still works for the session.
let unsaved: string | undefined;

// The last value read and its parse, so the snapshot stays referentially
// stable until the stored string actually changes.
let snapshotRaw: string | null = null;
let snapshot = NO_FAVORITES;

function readRaw(): string | null {
  if (unsaved !== undefined) return unsaved;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** This browser's Favorites right now, for effects that read them once rather than subscribe. */
export function readFavorites(): ReadonlySet<PokedexNumber> {
  const raw = readRaw();
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = parseFavorites(raw);
  }
  return snapshot;
}

/** Prerendered HTML never shows Favorites; they appear after hydration. */
function getServerSnapshot(): ReadonlySet<PokedexNumber> {
  return NO_FAVORITES;
}

/** Changes in this tab notify directly; other tabs' changes arrive as `storage` events. */
function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** This browser's Favorites, kept in sync across tabs. */
export function useFavorites(): ReadonlySet<PokedexNumber> {
  return useSyncExternalStore(subscribe, readFavorites, getServerSnapshot);
}

/** Marks a Species as a Favorite, or unmarks it, and saves the result. */
export function toggleStoredFavorite(n: PokedexNumber): void {
  const raw = serializeFavorites(toggleFavorite(readFavorites(), n));
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    unsaved = raw;
  }
  listeners.forEach((listener) => listener());
}
