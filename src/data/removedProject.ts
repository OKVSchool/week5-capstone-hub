export type ProjectState = "archived" | "orphaned"

export type RemovedProject = {
  id: string
  title: string
  description: string
  date: string
  repoUrl?: string
  tags?: string[]
  state: ProjectState
  removedAt: string
}
