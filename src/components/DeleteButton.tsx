'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/data/projects"

type Step = "idle" | "confirm-cascade" | "confirm-archive"

export default function DeleteButton({ project }: { project: Project }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("idle")

  async function handleCascade() {
    // Delete project + all attached thoughts
    await fetch(`/api/projects/${project.id}?cascade=true`, { method: "DELETE" })
    router.push("/")
  }

  async function handleArchive() {
    // Move to archive in Ideas tab, keep thoughts
    await fetch("/api/removed-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, state: "archived" }),
    })
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" })
    router.push("/")
  }

  async function handleOrphan() {
    // Keep in Ideas tab as orphaned (red), keep thoughts
    await fetch("/api/removed-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, state: "orphaned" }),
    })
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" })
    router.push("/")
  }

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirm-cascade")}
        className="mt-6 rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete project
      </button>
    )
  }

  if (step === "confirm-cascade") {
    return (
      <div className="mt-6 space-y-3 rounded border border-red-200 p-4 dark:border-red-900">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Delete <span className="font-semibold">{project.title}</span> from Project Ideas and all related thoughts?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCascade}
            className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
          >
            Yes — delete everything
          </button>
          <button
            onClick={() => setStep("confirm-archive")}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            No
          </button>
        </div>
      </div>
    )
  }

  if (step === "confirm-archive") {
    return (
      <div className="mt-6 space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-700">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Archive <span className="font-semibold">{project.title}</span> and its contents?
        </p>
        <p className="text-xs text-zinc-400">
          Yes moves it to the Archived section in Project Ideas. No keeps it in Projects with a deleted indicator so you can redistribute thoughts.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleArchive}
            className="rounded bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Yes — archive it
          </button>
          <button
            onClick={handleOrphan}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            No — keep with deleted indicator
          </button>
          <button
            onClick={() => setStep("idle")}
            className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return null
}
