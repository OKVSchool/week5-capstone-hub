import type { Thought } from "@/data/thoughts"

declare global {
  var __thoughtStore: Thought[] | undefined
}

if (!global.__thoughtStore) {
  global.__thoughtStore = []
}

export const thoughtStore = global.__thoughtStore
