'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/data/projects"
import { LANES } from "@/data/idea"
import TagInput from "./TagInput"

export default function EditProjectForm({ project, existingTags = [] }: { project: Project; existingTags?: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [date, setDate] = useState(project.date)
  const [repoUrl, setRepoUrl] = useState(project.repoUrl ?? "")
  const [framework, setFramework] = useState(project.framework ?? "")
  const [lane, setLane] = useState(project.lane ?? "")
  const [tags, setTags] = useState<string[]>(project.tags ?? [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, repoUrl: repoUrl || undefined, framework: framework || undefined, lane: lane || undefined, tags: tags.length ? tags : undefined }),
    })
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Edit project
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <input
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded border px-3 py-2 text-sm"
      />
      <textarea
        required
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
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
        value={framework}
        onChange={e => setFramework(e.target.value)}
        placeholder="Framework (optional)"
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
        value={repoUrl}
        onChange={e => setRepoUrl(e.target.value)}
        placeholder="Repo URL (optional)"
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
