/** One Species as shown in the Pokédex list. */
export interface SpeciesSummary {
  /** Pokédex Number (1–151). */
  id: number;
  /** PokéAPI slug, e.g. `mr-mime`. */
  slug: string;
  /** English display name, e.g. `Mr. Mime`. */
  displayName: string;
}
