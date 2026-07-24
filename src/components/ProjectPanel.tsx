'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/data/projects"
import type { RemovedProject } from "@/data/removedProject"
import type { Thought, Category } from "@/data/thoughts"
import { CATEGORIES } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import { LANES } from "@/data/idea"
import type { Lane } from "@/data/idea"
import ThoughtCard from "./ThoughtCard"

type Mode = "live" | "orphaned" | "archived"

type Props = {
  project: Project | RemovedProject
  mode: Mode
  thoughts: Thought[]
  ideas: Idea[]
  liveProjects: Project[]
}

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
const BTN_GREEN = "rounded border border-green-600 px-3 py-1 text-xs text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950 disabled:opacity-40 disabled:cursor-not-allowed"
const BTN_RED = "rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"

export default function ProjectPanel({ project, mode, thoughts, ideas, liveProjects }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showMoveForm, setShowMoveForm] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  // new thought state
  const [tTitle, setTTitle] = useState("")
  const [tCategory, setTCategory] = useState<Category | "">("")
  const [tText, setTText] = useState("")
  const [tError, setTError] = useState("")

  // move-to-ideas state (for archived)
  const [mTitle, setMTitle] = useState(project.title)
  const [mFramework, setMFramework] = useState("")
  const [mLane, setMLane] = useState<Lane | "">("")
  const [mText, setMText] = useState(("description" in project ? project.description : "") ?? "")
  const [mError, setMError] = useState("")

  const thoughtBlank = !tTitle.trim() && !tCategory && !tText.trim()
  const moveReady = mTitle.trim() && mFramework.trim() && mLane
  const count = thoughts.length

  async function handleAddThought(e: React.FormEvent) {
    e.preventDefault()
    if (thoughtBlank) { setTError("At least one field is required."); return }
    const res = await fetch("/api/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, title: tTitle, category: tCategory, text: tText }),
    })
    if (res.ok) { setTTitle(""); setTCategory(""); setTText(""); setTError(""); setShowForm(false); router.refresh() }
    else { const d = await res.json(); setTError(d.error ?? "Failed.") }
  }

  async function handleDeleteAll() {
    await fetch(`/api/removed-projects/${project.id}`, { method: "DELETE" })
    router.refresh()
  }

  async function handleMoveToIdeas(e: React.FormEvent) {
    e.preventDefault()
    if (!moveReady) { setMError("Title, framework, and lane are all required."); return }
    const res = await fetch(`/api/removed-projects/${project.id}?action=move-to-idea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: mTitle, framework: mFramework, lane: mLane, text: mText }),
    })
    if (res.ok) { router.refresh() }
    else { const d = await res.json(); setMError(d.error ?? "Failed.") }
  }

  const titleClass = mode === "orphaned"
    ? "text-sm font-semibold text-red-500 dark:text-red-400"
    : mode === "archived"
    ? "text-sm font-semibold text-zinc-400 dark:text-zinc-500"
    : "text-sm font-semibold text-zinc-800 dark:text-zinc-200"

  return (
    <div className={`rounded border ${mode === "orphaned" ? "border-red-200 dark:border-red-900" : "border-zinc-200 dark:border-zinc-700"}`}>
      <button
        onClick={() => { setOpen((o) => !o); if (open) { setShowForm(false); setShowMoveForm(false) } }}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span className={titleClass}>
          {project.title}
          {mode === "orphaned" && <span className="ml-2 text-xs font-normal opacity-70">(deleted)</span>}
          {mode === "archived" && <span className="ml-2 text-xs font-normal opacity-70">(archived)</span>}
          {count > 0 && <span className="ml-2 text-xs font-normal text-zinc-400">({count})</span>}
        </span>
        <span className="text-zinc-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-700 px-4 py-3 space-y-3">

          {/* LIVE: + New Thought */}
          {mode === "live" && !showForm && (
            <button onClick={() => setShowForm(true)} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              + New Thought
            </button>
          )}
          {mode === "live" && showForm && (
            <form onSubmit={handleAddThought} className="space-y-2">
              <input type="text" value={tTitle} onChange={(e) => setTTitle(e.target.value)} placeholder="Title (optional)" className={INPUT} />
              <select value={tCategory} onChange={(e) => setTCategory(e.target.value as Category | "")} className={INPUT}>
                <option value="">Category (optional)</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea value={tText} onChange={(e) => setTText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              {tError && <p className="text-xs text-red-500">{tError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={thoughtBlank} className={BTN_PRIMARY}>Save Thought</button>
                <button type="button" onClick={() => { setShowForm(false); setTError("") }} className={BTN_GHOST}>Cancel</button>
              </div>
            </form>
          )}

          {/* ORPHANED: Delete All */}
          {mode === "orphaned" && !confirmDeleteAll && (
            <button onClick={() => setConfirmDeleteAll(true)} className={BTN_RED}>Delete All</button>
          )}
          {mode === "orphaned" && confirmDeleteAll && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Delete <span className="font-semibold">{project.title}</span> and all its thoughts permanently?
              </p>
              <div className="flex gap-2">
                <button onClick={handleDeleteAll} className={BTN_RED}>Yes, delete all</button>
                <button onClick={() => setConfirmDeleteAll(false)} className={BTN_GHOST}>Cancel</button>
              </div>
            </div>
          )}

          {/* ARCHIVED: Move to Ideas */}
          {mode === "archived" && !showMoveForm && (
            <button onClick={() => setShowMoveForm(true)} className={BTN_GREEN}>Move to Ideas</button>
          )}
          {mode === "archived" && showMoveForm && (
            <form onSubmit={handleMoveToIdeas} className="space-y-2">
              <p className="text-xs text-zinc-500">Fill in required fields to move this project to Ideas.</p>
              <input type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Title (required)" className={INPUT} />
              <input type="text" value={mFramework} onChange={(e) => setMFramework(e.target.value)} placeholder="Framework (required)" className={INPUT} />
              <select value={mLane} onChange={(e) => setMLane(e.target.value as Lane | "")} className={INPUT}>
                <option value="">Lane (required)</option>
                {LANES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <textarea value={mText} onChange={(e) => setMText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              {mError && <p className="text-xs text-red-500">{mError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={!moveReady} className={BTN_GREEN}>Move to Ideas</button>
                <button type="button" onClick={() => { setShowMoveForm(false); setMError("") }} className={BTN_GHOST}>Cancel</button>
              </div>
            </form>
          )}

          {/* Thoughts list */}
          {thoughts.length === 0 && !showForm && !showMoveForm && (
            <p className="text-xs text-zinc-400">No thoughts yet.</p>
          )}
          {thoughts.length > 0 && (
            <div className="space-y-2 pt-1">
              {[...thoughts].reverse().map((t) => (
                <ThoughtCard key={t.id} thought={t} ideas={ideas} liveProjects={liveProjects} />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
