import { store } from "@/lib/store"
import type { Project } from "@/data/projects"

export async function GET() {
  return Response.json(store)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newProject: Project = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    date: body.date,
    ...(body.repoUrl && { repoUrl: body.repoUrl }),
    ...(body.tags && { tags: body.tags }),
  }

  store.push(newProject)
  return Response.json(newProject, { status: 201 })
}
