import Link from "next/link";

/** Plain 404 for URLs outside the Pokédex; renders without the sidebar. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-2 bg-white p-6 text-center text-sm text-slate-500">
      <p className="text-lg font-semibold text-slate-700">404: Page not found</p>
      <Link href="/" className="font-medium text-slate-900 underline">
        Go to the Pokédex
      </Link>
    </div>
  );
}
