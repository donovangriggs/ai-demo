# Look and feel of the list and detail pages

Type: prototype
Status: resolved
Parent: [Pokédex app map](../map.md)

## Question

What should the Pokédex list page (search box and grid or list of 151 Species) and the Species detail page (Base Stats, Types, Type Matchups, Abilities) look like? Build rough UI to react to: layout, density, how Base Stats are shown (bars versus numbers), Type colours, and how search results update. Link the prototype as an asset. It's throwaway and won't be the production code.

## Answer

Prototype: [look-and-feel.prototype.html](../prototypes/look-and-feel.prototype.html) (throwaway, three variants, live PokéAPI data; kept in `.scratch` since this isn't a git repo).

**Verdict: Variant B's master–detail layout, with Variant A's detail components.**

- **Layout**: a persistent sidebar (title, count "N/151", search box, scrolling Species list) next to a detail pane.
- **Routing**: one route per Species, `/pokemon/[id]`, under a shared layout that keeps the sidebar and search. Detail pages are deep-linkable. `/` shows the list with no Species selected (or #1; decide while writing the spec).
- **Narrow screens**: below a breakpoint the split stacks. `/` shows the list only, and `/pokemon/[id]` shows the detail only, with a back link.
- **List rows**: small sprite, `#NNN`, display name, and Type **badges** (not dots). The selected row is highlighted.
- **Base Stats**: label, value, and a bar tinted by the primary Type (scaled to 255), plus a Total.
- **Type Matchups**: grouped as **Weak to** (2×/4×), **Resists** (½×/¼×) and **Immune to** (0×), each Type badge with its multiplier. 1× is hidden.
- **Abilities**: name, a "Hidden" marker, and the short effect text.
- **Search**: instant filtering of the sidebar list as you type; the query lives in `?q=` (see the map Notes).

Facts surfaced while building:
- Fetching all 18 `type/{name}` endpoints gives every list row's Types (via each Type's `pokemon[]` + `slot`) **and** every Type Matchup, so the list page doesn't need 151 detail fetches.
- Artwork and sprite URLs can be built from the id, with no call needed: `raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` (sprite) and `.../other/official-artwork/{id}.png`.
