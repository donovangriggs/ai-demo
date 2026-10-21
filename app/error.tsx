"use client";

import { RetryPanel } from "@/components/RetryPanel";

/** Full-page boundary above the `(dex)` layout: catches failures loading the sidebar list. */
export default function PokedexError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <RetryPanel
      error={error}
      retry={retry}
      title="Couldn't load the Pokédex"
      className="min-h-screen bg-white text-sm text-slate-900"
    />
  );
}
