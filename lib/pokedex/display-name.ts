/** Species whose English name can't be produced by title-casing the slug. */
const OVERRIDES: Record<string, string> = {
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  farfetchd: "Farfetch’d",
  "mr-mime": "Mr. Mime",
};

/** Turns a PokéAPI slug (e.g. `solar-power`) into an English display name. */
export function displayName(slug: string): string {
  return (
    OVERRIDES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
