export type Lane = "content site" | "web app" | "mobile app"

export const LANES: Lane[] = ["content site", "web app", "mobile app"]

export type Idea = {
  id: string
  title: string
  framework: string
  lane: Lane
  text?: string
  createdAt: string
  priority?: number   // 1 (lowest) – 5 (highest)
}
