"use client";

import { RetryPanel } from "@/components/RetryPanel";

/** Shown in the detail pane, inside the sidebar layout, when a Species fails to load. */
export default function SpeciesError({ error, retry }: { error: unknown; retry: () => void }) {
  return <RetryPanel error={error} retry={retry} title="Couldn't reach PokéAPI" />;
}
