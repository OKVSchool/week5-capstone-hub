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

  if (!title && !text && !category) {
    return Response.json(
      { error: "At least one of title, category, or text is required." },
      { status: 400 }
    )
  }

  // Allow moving: if body includes ideaId/projectId keys (even null), update attachment
  const updates: Partial<typeof thoughtStore[0]> = {
    title: title || undefined,
    category: category || undefined,
    text: text || undefined,
  }

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
