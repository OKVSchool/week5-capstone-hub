import { ideaStore } from "@/lib/ideaStore"
import { thoughtStore } from "@/lib/thoughtStore"
import { store } from "@/lib/store"
import type { Lane } from "@/data/idea"
import { LANES } from "@/data/idea"
import { PROJECT_LANES } from "@/data/projects"
import type { Project } from "@/data/projects"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idx = ideaStore.findIndex((i) => i.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const hasPriority = "priority" in body
  const hasContent = body.title !== undefined || body.framework !== undefined || body.lanes !== undefined

  if (!hasPriority && !hasContent) {
    return Response.json({ error: "Nothing to update." }, { status: 400 })
  }

  if (hasContent) {
    const title = body.title?.trim() ?? ""
    const framework = body.framework?.trim() ?? ""
    const lanes: Lane[] = Array.isArray(body.lanes)
      ? body.lanes.filter((l: unknown) => LANES.includes(l as Lane))
      : []
    const text = body.text?.trim() ?? ""

    if (!title || !framework || lanes.length === 0) {
      return Response.json(
        { error: "Title, framework, and at least one lane are required." },
        { status: 400 }
      )
    }

    ideaStore[idx] = {
      ...ideaStore[idx],
      title,
      framework,
      lanes,
      text: text || undefined,
    }
  }

  if (hasPriority) {
    ideaStore[idx] = { ...ideaStore[idx], priority: body.priority ?? undefined }
  }

  return Response.json(ideaStore[idx])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idx = ideaStore.findIndex((i) => i.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  ideaStore.splice(idx, 1)

  // orphan any thoughts that were attached to this idea
  thoughtStore.forEach((t, i) => {
    if (t.ideaId === id) {
      thoughtStore[i] = { ...t, ideaId: undefined }
    }
  })

  return new Response(null, { status: 204 })
}

// POST /api/ideas/[id]/promote — promotes idea to a real project
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  if (searchParams.get("action") !== "promote") {
    return Response.json({ error: "Unknown action" }, { status: 400 })
  }

  const ideaIdx = ideaStore.findIndex((i) => i.id === id)
  if (ideaIdx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  const idea = ideaStore[ideaIdx]
  const body = await request.json()
  const date = body.date?.trim() ?? ""

  if (!date) {
    return Response.json({ error: "Date started is required." }, { status: 400 })
  }

  const projectLanes: string[] = Array.isArray(body.lanes) && body.lanes.length > 0
    ? body.lanes.filter((l: unknown) => PROJECT_LANES.includes(l as typeof PROJECT_LANES[number]))
    : idea.lanes

  const project: Project = {
    id: crypto.randomUUID(),
    title: body.title?.trim() || idea.title,
    description: idea.text?.trim() || idea.framework,
    date,
    ...(body.repoUrl?.trim() && { repoUrl: body.repoUrl.trim() }),
    ...(projectLanes.length > 0 && { lanes: projectLanes }),
    promotedFromIdea: true,
    ...(idea.promotedFromThought && { ideaWasFromThought: true }),
  }

  store.push(project)

  // migrate thoughts from ideaId → projectId
  thoughtStore.forEach((t, i) => {
    if (t.ideaId === id) {
      thoughtStore[i] = { ...t, ideaId: undefined, projectId: project.id }
    }
  })

  // delete the idea
  ideaStore.splice(ideaIdx, 1)

  return Response.json(project, { status: 201 })
}
