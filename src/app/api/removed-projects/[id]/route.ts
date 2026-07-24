import { removedProjectStore } from "@/lib/removedProjectStore"
import { thoughtStore } from "@/lib/thoughtStore"
import { ideaStore } from "@/lib/ideaStore"
import type { Idea, Lane } from "@/data/idea"
import { LANES } from "@/data/idea"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idx = removedProjectStore.findIndex((p) => p.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  removedProjectStore.splice(idx, 1)

  // delete all thoughts attached to this project
  let i = thoughtStore.length
  while (i--) {
    if (thoughtStore[i].projectId === id) thoughtStore.splice(i, 1)
  }

  return new Response(null, { status: 204 })
}

// POST /api/removed-projects/[id]?action=move-to-idea
// Converts an archived project into an Idea, migrates its thoughts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  if (searchParams.get("action") !== "move-to-idea") {
    return Response.json({ error: "Unknown action" }, { status: 400 })
  }

  const idx = removedProjectStore.findIndex((p) => p.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const title = body.title?.trim() ?? ""
  const framework = body.framework?.trim() ?? ""
  const lane: Lane | "" = LANES.includes(body.lane) ? body.lane : ""
  const text = body.text?.trim() ?? ""

  if (!title || !framework || !lane) {
    return Response.json(
      { error: "Title, framework, and lane are all required." },
      { status: 400 }
    )
  }

  const idea: Idea = {
    id: crypto.randomUUID(),
    title,
    framework,
    lane,
    createdAt: new Date().toISOString(),
    ...(text && { text }),
  }

  ideaStore.push(idea)

  // migrate thoughts from projectId → ideaId
  thoughtStore.forEach((t, i) => {
    if (t.projectId === id) {
      thoughtStore[i] = { ...t, projectId: undefined, ideaId: idea.id }
    }
  })

  // remove from removedProjectStore
  removedProjectStore.splice(idx, 1)

  return Response.json(idea, { status: 201 })
}
