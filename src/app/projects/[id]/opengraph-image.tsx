import { ImageResponse } from "next/og"
import { store } from "@/lib/store"

export const alt = "Project detail"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = store.find(p => p.id === id)

  const title = project?.title ?? "Project not found"
  const description = project?.description ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#18181b",
        }}
      >
        <p style={{ fontSize: 24, color: "#a1a1aa", margin: 0 }}>
          Course Project Hub
        </p>
        <h1 style={{ fontSize: 72, color: "#ffffff", margin: "16px 0 0" }}>
          {title}
        </h1>
        <p style={{ fontSize: 32, color: "#d4d4d8", margin: "24px 0 0" }}>
          {description}
        </p>
      </div>
    ),
    size
  )
}
