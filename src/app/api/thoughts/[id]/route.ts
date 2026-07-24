import { thoughtStore } from "@/lib/thoughtStore"
import type { Category } from "@/data/thoughts"
import { CATEGORIES } from "@/data/thoughts"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idx = thoughtStore.findIndex((t) => t.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const title = body.title?.trim() ?? ""
  const text = body.text?.trim() ?? ""
  const category: Category | "" = CATEGORIES.includes(body.category) ? body.category : ""

  const hasPriority = "priority" in body
  const hasAttachment = "ideaId" in body || "projectId" in body
  const hasContent = title || text || category

  if (!hasPriority && !hasAttachment && !hasContent) {
    return Response.json(
      { error: "Nothing to update." },
      { status: 400 }
    )
  }

  const updates: Partial<typeof thoughtStore[0]> = {}
  if ("title" in body) updates.title = title || undefined
  if ("category" in body) updates.category = category || undefined
  if ("text" in body) updates.text = text || undefined
  if (hasPriority) updates.priority = body.priority ?? undefined
  if ("ideaId" in body) updates.ideaId = body.ideaId ?? undefined
  if ("projectId" in body) updates.projectId = body.projectId ?? undefined

  thoughtStore[idx] = { ...thoughtStore[idx], ...updates }
  return Response.json(thoughtStore[idx])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idx = thoughtStore.findIndex((t) => t.id === id)
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 })

  thoughtStore.splice(idx, 1)
  return new Response(null, { status: 204 })
}
