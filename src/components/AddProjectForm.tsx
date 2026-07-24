'use client'
import { useState } from "react"
import { LANES } from "@/data/idea"
import TagInput from "./TagInput"

export default function AddProjectForm({ onAdd, existingTags = [] }: { onAdd: () => void; existingTags?: string[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [framework, setFramework] = useState("")
  const [lane, setLane] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, repoUrl: repoUrl || undefined, framework: framework || undefined, lane: lane || undefined, tags: tags.length ? tags : undefined }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      return
    }

    setTitle("")
    setDescription("")
    setDate("")
    setRepoUrl("")
    setFramework("")
    setLane("")
    setTags([])
    setError(null)
    setOpen(false)
    onAdd()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
      >
        + Add Project
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      <input
        required
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="rounded border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="rounded border px-3 py-2 text-sm"
      />
      <div className="flex gap-2 items-center">
        <input
          required
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setDate(new Date().toISOString().split("T")[0])}
          className="rounded border px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap"
        >
          Today
        </button>
      </div>
      <input
        placeholder="Framework (optional)"
        value={framework}
        onChange={e => setFramework(e.target.value)}
        className="rounded border px-3 py-2 text-sm"
      />
      <select
        value={lane}
        onChange={e => setLane(e.target.value)}
        className="rounded border px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900"
      >
        <option value="">Lane (optional)</option>
        {LANES.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <TagInput tags={tags} onChange={setTags} existingTags={existingTags} />
      <input
        placeholder="Repo URL (optional)"
        value={repoUrl}
        onChange={e => setRepoUrl(e.target.value)}
        className="rounded border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900">
          Save
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
          Cancel
        </button>
      </div>
    </form>
  )
}
