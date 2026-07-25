export type Lane = "content site" | "web app" | "mobile app" | "server" | "database"

export const LANES: Lane[] = ["content site", "web app", "mobile app", "server", "database"]

export type Idea = {
  id: string
  title: string
  framework: string
  lanes: Lane[]
  text?: string
  createdAt: string
  priority?: number   // 1 (lowest) – 5 (highest)
  promotedFromThought?: boolean
}
