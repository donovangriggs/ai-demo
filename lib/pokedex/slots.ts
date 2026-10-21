/** A copy of `list` in slot order (slot 1 first), e.g. a Species' Types or Abilities. */
export function bySlot<T extends { slot: number }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => a.slot - b.slot);
}
