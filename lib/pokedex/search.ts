import type { SpeciesSummary } from "./types";

/** Lowercases, strips accents and keeps only `a–z0–9`, so `Mr. Mime` → `mrmime`. */
function normalise(text: string): string {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Whether a Species matches the sidebar's search query.
 *
 * A leading `#` is ignored. An all-digit query matches a prefix of the
 * Pokédex Number, plain (`6` → #6, #60–69) or zero-padded (`006` → #6 only).
 * Any other query is matched, normalised, as a substring of the display name
 * or slug. An empty query matches every Species.
 */
export function matchesQuery(
  species: Pick<SpeciesSummary, "id" | "slug" | "displayName">,
  q: string,
): boolean {
  const trimmed = q.trim().replace(/^#/, "");
  if (/^\d+$/.test(trimmed)) {
    const id = String(species.id);
    return id.startsWith(trimmed) || id.padStart(3, "0").startsWith(trimmed);
  }

  const query = normalise(trimmed);
  return (
    normalise(species.displayName).includes(query) ||
    normalise(species.slug).includes(query)
  );
}
