# Pokédex

A browsable Pokédex of the original 151 Species, built with Next.js (App Router, Cache Components) on live [PokéAPI](https://pokeapi.co) data. A sidebar lists every Species with instant search by name or Pokédex Number (kept in `?q=`). Each detail page shows the Species' Types, Base Stats, Type Matchups and Abilities.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the dev server on http://localhost:3000
CI=1 npm test    # run the Vitest suite once
npm run build    # production build; prerenders all 151 detail pages
```

## Where to read more

- [`.scratch/pokedex/spec.md`](.scratch/pokedex/spec.md): what's being built, routes, modules and the definition of done.
- [`GLOSSARY.md`](GLOSSARY.md): the domain vocabulary (Species, Pokédex Number, Variety, Type Matchup and so on) used in code and docs.
- [`docs/adr/`](docs/adr/): architecture decisions.
