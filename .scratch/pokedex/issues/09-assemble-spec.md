# Assemble the build-ready spec

Type: task
Status: resolved
Blocked by: 08
Parent: [Pokédex app map](../map.md)

## Question

Write `.scratch/pokedex/spec.md` from the resolved tickets on the [Pokédex app map](../map.md). It reaches the destination: a spec ready to split into implementation tickets.

- Scope and Out of scope.
- Glossary pointer.
- Stack and scaffold (Next.js 16.4 with Cache Components, Tailwind v4, Vitest).
- Routes and files.
- Data access functions.
- Domain functions with their test cases.
- UI per state.
- A suggested ordering of implementation slices.

The spec links back to each deciding ticket and to the ADR instead of re-deciding anything. If writing it exposes a gap, raise it as a new ticket rather than deciding it inline. AFK, with a final read-through by the human.

## Answer

Wrote [spec.md](../spec.md). It has 9 sections: scope, stack, routes and files, data module, domain module with every test case, UI components and Type colours, 7 implementation slices, "done when" checks, and items to verify during implementation. Every section links to the ticket that decided it. Writing it exposed no gaps, so there are no new tickets. Two layout details (sidebar width, breakpoint) are marked as suggestions, not decisions. Waiting on the human's read-through.
