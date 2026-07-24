import { store } from "@/lib/store"
import type { Project } from "@/data/projects"

export async function GET() {
  return Response.json(store)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title?.trim() || !body.description?.trim() || !body.date?.trim()) {
    return Response.json(
      { error: "title, description, and date are required" },
      { status: 400 }
    )
  }

  const newProject: Project = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    description: body.description.trim(),
    date: body.date.trim(),
    ...(body.repoUrl && { repoUrl: body.repoUrl }),
    ...(body.tags && { tags: body.tags }),
    ...(body.framework?.trim() && { framework: body.framework.trim() }),
    ...(body.lane?.trim() && { lane: body.lane.trim() }),
  }

  store.push(newProject)
  return Response.json(newProject, { status: 201 })
}
