'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Thought, Category } from "@/data/thoughts"
import { CATEGORIES } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import type { Project } from "@/data/projects"
import ThoughtCard from "./ThoughtCard"

type Props = {
  thoughts: Thought[]
  ideas: Idea[]
  liveProjects: Project[]
}

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"

export default function ThoughtsTab({ thoughts, ideas, liveProjects }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState("")
  const allBlank = !title.trim() && !category && !text.trim()

  const filtered = search.trim()
    ? [...thoughts].reverse().filter((t) => {
        const q = search.toLowerCase()
        return (
          t.title?.toLowerCase().includes(q) ||
          t.text?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
        )
      })
    : [...thoughts].reverse()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (allBlank) { setError("Fill in at least one field."); return }
    setError("")
    setSubmitting(true)
    const res = await fetch("/api/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, text }),
    })
    setSubmitting(false)
    if (res.ok) { setTitle(""); setCategory(""); setText(""); setShowForm(false); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Failed.") }
  }

  return (
    <div className="space-y-3">
      {/* + New Thought trigger */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          + New Thought
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded border border-zinc-200 dark:border-zinc-700 p-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className={INPUT} />
          <select value={category} onChange={(e) => setCategory(e.target.value as Category | "")} className={INPUT}>
            <option value="">Category (optional)</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={allBlank || submitting} className={BTN_PRIMARY}>
              {submitting ? "Saving…" : "Save Thought"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError("") }} className={BTN_GHOST}>Cancel</button>
          </div>
        </form>
      )}

      {/* Thought list */}
      <input
        type="search"
        placeholder="Search thoughts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      />

      {thoughts.length === 0 && !showForm && (
        <p className="text-sm text-zinc-400">No thoughts yet.</p>
      )}
      {thoughts.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-zinc-400">No thoughts match "{search}".</p>
      )}
      {filtered.map((t) => (
        <ThoughtCard key={t.id} thought={t} ideas={ideas} liveProjects={liveProjects} showPromoteToIdea />
      ))}
    </div>
  )
}
