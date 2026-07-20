'use client'
import { useState } from "react"

export default function AddProjectForm({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, repoUrl: repoUrl || undefined }),
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
      <input
        required
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="rounded border px-3 py-2 text-sm"
      />
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
