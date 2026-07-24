export type Category =
  | "Inspiration"
  | "Feature"
  | "Bug Fix"
  | "Research"
  | "Change"
  | "Other"

export const CATEGORIES: Category[] = [
  "Inspiration",
  "Feature",
  "Bug Fix",
  "Research",
  "Change",
  "Other",
]

export type Thought = {
  id: string
  title?: string
  category?: Category
  text?: string
  createdAt: string
  ideaId?: string     // belongs to an Idea (mutually exclusive with projectId)
  projectId?: string  // belongs to a Project or RemovedProject
  priority?: number   // 1 (lowest) – 5 (highest); only meaningful in the Thoughts tab
}

export function getThoughtLabel(t: Thought): string {
  if (t.title) return t.title
  if (t.text) {
    const words = t.text.split(" ").filter(Boolean)
    const preview = words.slice(0, 4).join(" ")
    return words.length > 4 ? preview + "…" : preview
  }
  return t.category ?? "Untitled thought"
}
