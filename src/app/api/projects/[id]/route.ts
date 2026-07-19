import { store } from "@/lib/store"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const index = store.findIndex(p => p.id === id)

  if (index === -1) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  store[index] = { ...store[index], ...body }
  return Response.json(store[index])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const index = store.findIndex(p => p.id === id)

  if (index === -1) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const deleted = store.splice(index, 1)
  return Response.json(deleted[0])
}
