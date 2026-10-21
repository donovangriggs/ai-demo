import type { ReactNode } from "react";

const bar = "rounded bg-slate-100";

/** Placeholder shaped like the Species detail pane: artwork box, Base Stat bars and badge rows. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading Species" className="w-full animate-pulse">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="size-28 shrink-0 rounded-3xl bg-slate-100 md:size-40" />
          <div className="space-y-2">
            <div className={`h-4 w-12 ${bar}`} />
            <div className={`h-9 w-48 ${bar}`} />
            <BadgeRow count={2} />
          </div>
        </div>

        <Card>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className={`h-3 w-16 shrink-0 ${bar}`} />
              <div className={`h-3 w-10 shrink-0 ${bar}`} />
              <div className="h-2.5 flex-1 rounded-full bg-slate-100" />
            </div>
          ))}
        </Card>

        <Card>
          {[3, 6, 1].map((count, i) => (
            <div key={i} className="space-y-1.5 pb-2">
              <div className={`h-3 w-16 ${bar}`} />
              <BadgeRow count={count} />
            </div>
          ))}
        </Card>

        <Card>
          <div className={`h-4 w-32 ${bar}`} />
          <div className={`mt-2 h-4 w-full ${bar}`} />
        </Card>
      </div>
    </div>
  );
}

/** Matches the detail page's `<Section>` card, with a title bar. */
function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className={`mb-4 h-4 w-28 ${bar}`} />
      {children}
    </div>
  );
}

function BadgeRow({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-6 w-16 rounded-full bg-slate-100" />
      ))}
    </div>
  );
}
