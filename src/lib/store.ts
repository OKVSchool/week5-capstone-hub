import { projects as seedData } from "@/data/projects"
import type { Project } from "@/data/projects"

declare global {
  var __store: Project[] | undefined
}

// Attach to global so all modules share the same instance
if (!global.__store) {
  global.__store = [...seedData]
}

export const store = global.__store
