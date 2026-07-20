'use client'
import { useState, useEffect } from "react"
import type { Project } from "@/data/projects"

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "data"; projects: Project[] }

export default function FetchWidget() {
  const [state, setState] = useState<State>({ status: "loading" })

  async function load() {
    setState({ status: "loading" })
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data: Project[] = await res.json()
      setState(data.length === 0 ? { status: "empty" } : { status: "data", projects: data })
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "Unknown error" })
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          API Status
        </h2>
        <button
          onClick={load}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          Refresh ↺
        </button>
      </div>

      <div className="mt-3">
        {state.status === "loading" && (
          <p className="text-sm text-zinc-400 animate-pulse">Fetching from /api/projects…</p>
        )}
        {state.status === "error" && (
          <p className="text-sm text-red-500">Error: {state.message}</p>
        )}
        {state.status === "empty" && (
          <p className="text-sm text-zinc-400">No projects found.</p>
        )}
        {state.status === "data" && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            ✔ {state.projects.length} project{state.projects.length !== 1 ? "s" : ""} loaded from API
          </p>
        )}
      </div>

      {/* State demo controls */}
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <p className="mb-2 text-xs text-zinc-400">Demo all four states:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={load}
            className="rounded border px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Loading
          </button>
          <button
            onClick={() => setState({ status: "error", message: "Simulated network error" })}
            className="rounded border px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Error
          </button>
          <button
            onClick={() => setState({ status: "empty" })}
            className="rounded border px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Empty
          </button>
          <button
            onClick={load}
            className="rounded border px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Data
          </button>
        </div>
      </div>
    </div>
  )
}
