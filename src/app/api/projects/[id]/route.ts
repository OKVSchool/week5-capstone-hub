import { store } from "@/lib/store"
import { thoughtStore } from "@/lib/thoughtStore"

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const cascade = searchParams.get("cascade") === "true"

  const index = store.findIndex(p => p.id === id)
  if (index === -1) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  store.splice(index, 1)

  if (cascade) {
    let i = thoughtStore.length
    while (i--) {
      if (thoughtStore[i].projectId === id) thoughtStore.splice(i, 1)
    }
  }

  return new Response(null, { status: 204 })
}
