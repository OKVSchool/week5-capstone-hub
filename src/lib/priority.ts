export type HasPriority = { id: string; priority?: number }

/**
 * Returns the highest star level (5→1) that isn't already claimed.
 * If all five slots are full, returns 5 — the cascade will bump everything down.
 */
export function getHighestAvailable(items: HasPriority[]): number {
  const taken = new Set(items.map(i => i.priority).filter((p): p is number => p !== undefined))
  for (let level = 5; level >= 1; level--) {
    if (!taken.has(level)) return level
  }
  return 5 // all slots full — cascade from 5 downward, booting the 1-star
}

/**
 * Compute all priority changes needed when assigning `newPriority` to `targetId`.
 * The new item claims the slot; the displaced holder bumps DOWN one level.
 * Chain: 5 → 4 → 3 → 2 → 1 → unstarred (booted below 1).
 */
export function computeBumpChain(
  items: HasPriority[],
  targetId: string,
  newPriority: number
): Map<string, number | undefined> {
  const result = new Map<string, number | undefined>()

  function assign(id: string, level: number) {
    if (level < 1) { result.set(id, undefined); return } // booted below 1-star
    const displaced = items.find(
      i => i.id !== id && !result.has(i.id) && i.priority === level
    )
    result.set(id, level)
    if (displaced) assign(displaced.id, level - 1) // bump displaced DOWN
  }

  assign(targetId, newPriority)
  return result
}

/** Sort prioritized items first (5-star at top, then 4→1), then apply fallback for unstarred. */
export function sortByPriority<T extends { priority?: number }>(
  items: T[],
  fallback: (a: T, b: T) => number
): T[] {
  return [...items].sort((a, b) => {
    if (a.priority && b.priority) return b.priority - a.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return fallback(a, b)
  })
}
