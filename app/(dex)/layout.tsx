import { Suspense } from "react";
import { PokedexSidebar, PokedexSidebarFallback } from "@/components/PokedexSidebar";
import { getPokedex } from "@/lib/pokeapi";

export default async function DexLayout({ children }: LayoutProps<"/">) {
  const species = await getPokedex();
  return (
    // Side by side from `md`; below it the sidebar (list) and the detail pane
    // stack, and each route shows only one of them.
    <div className="flex h-dvh flex-col bg-white text-sm text-slate-900 md:flex-row">
      <Suspense fallback={<PokedexSidebarFallback species={species} />}>
        <PokedexSidebar species={species} />
      </Suspense>
      {/* The sidebar marks the list route; narrow screens then show the list only. */}
      <main className="flex min-h-0 flex-1 overflow-y-auto max-md:peer-data-list-route:hidden">
        {children}
      </main>
    </div>
  );
}
