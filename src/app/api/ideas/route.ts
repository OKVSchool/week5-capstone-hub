import { ideaStore } from "@/lib/ideaStore"
import type { Idea, Lane } from "@/data/idea"
import { LANES } from "@/data/idea"

export async function GET() {
  return Response.json(ideaStore)
}

export async function POST(request: Request) {
  const body = await request.json()
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

  const idea: Idea = {
    id: crypto.randomUUID(),
    title,
    framework,
    lanes,
    createdAt: new Date().toISOString(),
    ...(text && { text }),
    ...(body.promotedFromThought === true && { promotedFromThought: true }),
  }

  ideaStore.push(idea)
  return Response.json(idea, { status: 201 })
}
