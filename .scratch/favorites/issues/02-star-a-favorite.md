# 02: Star a Favorite

**What to build:** A star button in the detail page header lets a visitor mark a Species as a Favorite, or unmark it. Favorites are kept in that browser's localStorage, survive reloads, and update live in other open tabs. Each Favorite's sidebar row shows a small star, which is only a marker: clicking anywhere on the row still opens the Species. If the browser blocks storage, the Pokédex keeps working.

Spec: [spec.md](../spec.md), user stories 1–9 and 22–23; "Favorites codec", "Storage", "Favorites store", "Detail header" and "Sidebar".

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] A pure Favorites codec has `parseFavorites(raw)`, `serializeFavorites(set)` and `toggleFavorite(set, n)`, as the spec describes. Parsing never throws, drops invalid or out-of-range entries and duplicates, and keeps the valid ones. Serialising sorts ascending.
- [x] Codec tests cover: `null`, `""`, invalid JSON, `{}` and `"6"` giving an empty set; `[6, 25]` round-tripping; duplicates collapsing; `0`, `152`, `-1`, `6.5`, `"6"` and `null` entries dropped while valid ones stay; and toggle not mutating its input.
- [x] A client Favorites store reads through `useSyncExternalStore`. Its server snapshot is empty, and its client snapshot stays stable for the same stored value. It notifies on changes in this tab and on the `storage` event. All localStorage access is wrapped in try/catch, and a failed write still updates the in-memory value.
- [x] Favorites are stored under the localStorage key `pokedex:favorites`.
- [x] The detail header has a `<button>` with `aria-pressed` and an accessible name naming the Species (e.g. "Favorite Charizard"). The two states look clearly different. The detail page stays prerendered, and only the button is a client component.
- [x] Sidebar rows for Favorites show a filled star, hidden from assistive tech. Rows stay single links.
- [x] Manual check: star #6, reload, and it is still starred. A second open tab updates without a reload. With storage blocked, nothing crashes.
- [x] `npm test`, lint, the type check and `npm run build` all pass.

## Comments

Manual checks run against `npm run start` on the LAN IP: #6 stayed starred after a reload, a second open tab showed the row star without a reload, and with `Storage.prototype.getItem`/`setItem` throwing the star still toggled with no errors. Once storage worked again, the next toggle saved and the star followed it.
