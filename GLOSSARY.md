# Pokédex

A browsable Pokédex of the original 151 Pokémon species, backed by PokéAPI.

## Language

**Species**:
A single kind of Pokémon, identified by its National Pokédex number (e.g. #6 Charizard). One Species is one entry in the Pokédex.
_Avoid_: Pokémon (ambiguous), entry, monster

**Pokédex Number**:
A Species' position in the National Pokédex (1–151 in this app), which uniquely identifies it.
_Avoid_: Id, dex number, index

**Variety**:
A distinct version of a Species with its own stats or types, such as a Mega Evolution or regional form. Every Species has exactly one default Variety.
_Avoid_: Form, alternate, version

**Type**:
An elemental category (e.g. Fire, Water) that a Species has one or two of. Types determine damage taken from attacks.
_Avoid_: Element, class

**Type Matchup**:
The damage multiplier (0×, ¼×, ½×, 1×, 2×, 4×) a Species takes from an attacking Type, combining both of its Types.
_Avoid_: Weakness chart, effectiveness, resistances

**Type Chart**:
The fixed table of how much damage each attacking Type deals to each defending Type (2×, ½×, 0× or 1×). Type Matchups are derived from it.
_Avoid_: Damage relations, effectiveness table

**Ability**:
A passive trait a Species can have; each Species has one to three.
_Avoid_: Skill, power, trait

**Hidden Ability**:
An Ability a Species can have only under special circumstances, distinct from its regular Abilities.
_Avoid_: Secret ability, dream ability

**Base Stats**:
The six fixed values (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed) that characterise a Species.
_Avoid_: Stats (alone), attributes

**Pokédex**:
The ordered collection of Species this app presents, numbered by National Pokédex number.
_Avoid_: Dex, catalogue, list
