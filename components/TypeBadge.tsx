import type { TypeName } from "@/lib/pokedex/types";

/** Type colours from the look-and-feel prototype. */
const TYPE_COLOURS: Record<TypeName, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

/** A rounded uppercase pill in the Type's colour. */
export function TypeBadge({
  type,
  className = "px-1.5 py-0.5 text-[10px]",
}: {
  type: TypeName;
  /** Size classes (padding and text size); defaults to the list-row size. */
  className?: string;
}) {
  return (
    <span
      className={`${className} rounded-full font-semibold uppercase tracking-wide text-white`}
      style={{ backgroundColor: TYPE_COLOURS[type] }}
    >
      {type}
    </span>
  );
}
