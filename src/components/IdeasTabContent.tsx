'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Idea, Lane } from "@/data/idea"
import { LANES } from "@/data/idea"
import type { Thought } from "@/data/thoughts"
import type { Project } from "@/data/projects"
import IdeaCard from "./IdeaCard"

type Props = {
  ideas: Idea[]
  thoughts: Thought[]
  liveProjects: Project[]
}

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"

export default function IdeasTabContent({ ideas, thoughts, liveProjects }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [framework, setFramework] = useState("")
  const [lane, setLane] = useState<Lane | "">("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState("")
  const formReady = title.trim() && framework.trim() && lane

  const filtered = search.trim()
    ? [...ideas].reverse().filter((i) => {
        const q = search.toLowerCase()
        return (
          i.title.toLowerCase().includes(q) ||
          i.framework.toLowerCase().includes(q) ||
          i.lane.toLowerCase().includes(q) ||
          i.text?.toLowerCase().includes(q)
        )
      })
    : [...ideas].reverse()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formReady) { setError("Title, framework, and lane are all required."); return }
    setError("")
    setSubmitting(true)
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, framework, lane, text }),
    })
    setSubmitting(false)
    if (res.ok) { setTitle(""); setFramework(""); setLane(""); setText(""); setShowForm(false); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Failed.") }
  }

  return (
    <div className="space-y-3">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          + New Idea
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded border border-zinc-200 dark:border-zinc-700 p-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (required)" className={INPUT} />
          <input type="text" value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="Framework (required)" className={INPUT} />
          <select value={lane} onChange={(e) => setLane(e.target.value as Lane | "")} className={INPUT}>
            <option value="">Lane (required)</option>
            {LANES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!formReady || submitting} className={BTN_PRIMARY}>
              {submitting ? "Saving…" : "Save Idea"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError("") }} className={BTN_GHOST}>Cancel</button>
          </div>
        </form>
      )}

      <input
        type="search"
        placeholder="Search ideas…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      />

      {ideas.length === 0 && !showForm && (
        <p className="text-sm text-zinc-400">No ideas yet.</p>
      )}
      {ideas.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-zinc-400">No ideas match "{search}".</p>
      )}
      {filtered.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          thoughts={thoughts.filter((t) => t.ideaId === idea.id)}
          ideas={[...ideas].reverse()}
          liveProjects={liveProjects}
        />
      ))}
    </div>
  )
}
