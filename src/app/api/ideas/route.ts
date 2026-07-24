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
  return Response.json(idea, { status: 201 })
}
