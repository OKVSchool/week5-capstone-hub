import type { Idea } from "@/data/idea"

declare global {
  var __ideaStore: Idea[] | undefined
}

if (!global.__ideaStore) {
  global.__ideaStore = []
}

export const ideaStore = global.__ideaStore
