import Link from "next/link";
import { CenteredMessage } from "@/components/CenteredMessage";
import { pokedexHref } from "@/lib/pokedex/routes";

/** Plain 404 for URLs outside the Pokédex; renders without the sidebar. */
export default function NotFound() {
  return (
    <CenteredMessage title="404: Page not found" className="min-h-screen bg-white text-sm">
      <Link href={pokedexHref()} className="font-medium text-slate-900 underline">
        Go to the Pokédex
      </Link>
    </CenteredMessage>
  );
}
