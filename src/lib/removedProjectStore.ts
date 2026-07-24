import type { RemovedProject } from "@/data/removedProject"

declare global {
  var __removedProjectStore: RemovedProject[] | undefined
}

if (!global.__removedProjectStore) {
  global.__removedProjectStore = []
}

export const removedProjectStore = global.__removedProjectStore
