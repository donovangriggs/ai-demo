import type { ReactNode } from "react";

/** A titled white card for one detail-page section (Base Stats, Type Matchups, Abilities). */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}
