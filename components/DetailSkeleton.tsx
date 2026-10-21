const bar = "rounded bg-slate-100";

/** Placeholder shaped like the Species detail pane: artwork box, Base Stat bars and badge rows. */
export function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading Species"
      className="mx-auto w-full max-w-2xl animate-pulse space-y-6 p-6"
    >
      <div className="flex items-center gap-6">
        <div className="size-40 shrink-0 rounded-xl bg-slate-100" />
        <div className="space-y-2">
          <div className={`h-4 w-12 ${bar}`} />
          <div className={`h-8 w-48 ${bar}`} />
          <BadgeRow count={2} />
        </div>
      </div>

      <section className="space-y-2">
        <div className={`h-3 w-20 ${bar}`} />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-3 w-16 shrink-0 ${bar}`} />
            <div className={`h-3 w-8 shrink-0 ${bar}`} />
            <div className="h-2 flex-1 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <div className={`h-3 w-28 ${bar}`} />
        <BadgeRow count={4} />
        <BadgeRow count={3} />
        <BadgeRow count={1} />
      </section>

      <section className="space-y-2">
        <div className={`h-3 w-20 ${bar}`} />
        <div className={`h-4 w-32 ${bar}`} />
        <div className={`h-4 w-full ${bar}`} />
      </section>
    </div>
  );
}

function BadgeRow({ count }: { count: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-6 w-16 rounded-full bg-slate-100" />
      ))}
    </div>
  );
}
