# 07: Narrow-screen stacking and final polish

**What to build:** At phone widths the master–detail split stacks. `/` shows the list only. `/pokemon/<number>` shows the detail only, with a back link to the list, and the search text is still there when you come back. A final visual pass brings the app in line with the look-and-feel prototype, and the spec's "done when" checklist is walked end to end.

Spec: [spec.md](../../pokedex/spec.md), §6 Layout, §8 Done when. Prototype: [look-and-feel.prototype.html](../../pokedex/prototypes/look-and-feel.prototype.html) (variant B layout, variant A detail sections). Decision: [Look and feel](../../pokedex/issues/04-look-and-feel.md).

**Blocked by:** 02 (Instant search), 05 (Type Matchups on the detail page), 06 (Loading and error states).

**Status:** ready-for-agent

- [ ] Below the breakpoint (suggested `md`), `/` shows only the list, and `/pokemon/6` shows only the detail with a back link. The sidebar hides itself on detail routes using the current pathname.
- [ ] Going list → detail → back keeps the search text and scroll position.
- [ ] The visual pass against the prototype is done: sidebar density, badge and colour usage, Base Stat bars, Type Matchup groups, Abilities.
- [ ] Every item in spec §8 "Done when" is checked and passes: `npm test`, `npm run build` with 151 prerendered pages, search, navigation, not-found cases, the Charizard matchups, and phone-width behaviour.
