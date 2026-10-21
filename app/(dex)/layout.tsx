import { Suspense } from "react";
import { PokedexSidebar, PokedexSidebarFallback } from "@/components/PokedexSidebar";
import { getPokedex } from "@/lib/pokeapi";

export default async function DexLayout({ children }: LayoutProps<"/">) {
  const species = await getPokedex();
  return (
    <div className="flex h-screen bg-white text-sm text-slate-900">
      <Suspense fallback={<PokedexSidebarFallback species={species} />}>
        <PokedexSidebar species={species} />
      </Suspense>
      <main className="flex flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
