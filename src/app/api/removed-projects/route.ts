import { removedProjectStore } from "@/lib/removedProjectStore"
import type { RemovedProject, ProjectState } from "@/data/removedProject"

export async function GET() {
  return Response.json(removedProjectStore)
}

export async function POST(request: Request) {
  const body = await request.json()
  const state: ProjectState = body.state === "archived" ? "archived" : "orphaned"

  if (!body.id || !body.title) {
    return Response.json({ error: "id and title are required." }, { status: 400 })
  }

  const removed: RemovedProject = {
    id: body.id,
    title: body.title,
    description: body.description ?? "",
    date: body.date ?? "",
    state,
    removedAt: new Date().toISOString(),
    ...(body.repoUrl && { repoUrl: body.repoUrl }),
    ...(body.tags && { tags: body.tags }),
  }

  removedProjectStore.push(removed)
  return Response.json(removed, { status: 201 })
}
