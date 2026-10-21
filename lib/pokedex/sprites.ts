const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** Small front sprite for a Species, built from its Pokédex Number. */
export function spriteUrl(id: number): string {
  return `${SPRITES}/${id}.png`;
}

/** Official artwork for a Species, built from its Pokédex Number. */
export function artworkUrl(id: number): string {
  return `${SPRITES}/other/official-artwork/${id}.png`;
}
