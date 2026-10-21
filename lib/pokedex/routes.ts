/** The list URL (`/`), carrying the search text in `?q=` so going back keeps it. */
export function listHref(q: string): string {
  return q ? `/?${new URLSearchParams({ q })}` : "/";
}

/**
 * Whether a pathname is a Species detail route (`/pokemon/<anything>`),
 * including not-found ones, so narrow screens show the detail pane only.
 */
export function isSpeciesPath(pathname: string): boolean {
  return /^\/pokemon\/[^/]+/.test(pathname);
}
