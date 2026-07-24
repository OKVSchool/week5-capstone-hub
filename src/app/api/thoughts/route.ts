import { thoughtStore } from "@/lib/thoughtStore"
import type { Thought, Category } from "@/data/thoughts"
import { CATEGORIES } from "@/data/thoughts"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ideaId = searchParams.get("ideaId")
  const projectId = searchParams.get("projectId")

  if (ideaId) return Response.json(thoughtStore.filter((t) => t.ideaId === ideaId))
  if (projectId) return Response.json(thoughtStore.filter((t) => t.projectId === projectId))
  return Response.json(thoughtStore)
}

export async function POST(request: Request) {
  const body = await request.json()
  const title = body.title?.trim() ?? ""
  const text = body.text?.trim() ?? ""
  const category: Category | "" = CATEGORIES.includes(body.category) ? body.category : ""

  if (!title && !text && !category) {
    return Response.json(
      { error: "At least one of title, category, or text is required." },
      { status: 400 }
    )
  }

  const thought: Thought = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...(title && { title }),
    ...(category && { category }),
    ...(text && { text }),
    ...(body.ideaId && { ideaId: body.ideaId }),
    ...(body.projectId && { projectId: body.projectId }),
  }

  thoughtStore.push(thought)
  return Response.json(thought, { status: 201 })
}
