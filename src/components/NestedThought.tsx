'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Thought, Category } from "@/data/thoughts"
import { getThoughtLabel, CATEGORIES } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import type { Project } from "@/data/projects"
import { useToast } from "@/lib/toast"

type Props = {
  thought: Thought
  ideas: Idea[]
  liveProjects: Project[]
  isOpen: boolean
  isPinned: boolean
  onToggle: () => void
  onPin: () => void
  onUnpin: () => void
}

type Mode = "view" | "edit" | "move" | "confirmDelete" | "promoteToTask"

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
const BTN_GREEN = "rounded border border-green-600 px-3 py-1 text-xs text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950 disabled:opacity-40 disabled:cursor-not-allowed"
const BTN_RED = "rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"

export default function NestedThought({
  thought, ideas, liveProjects,
  isOpen, isPinned, onToggle, onPin, onUnpin,
}: Props) {
  const router = useRouter()
  const { show } = useToast()
  const API = process.env.NEXT_PUBLIC_API_URL
  const [mode, setMode] = useState<Mode>("view")

  const [title, setTitle] = useState(thought.title ?? "")
  const [category, setCategory] = useState<Category | "">(thought.category ?? "")
  const [text, setText] = useState(thought.text ?? "")
  const [error, setError] = useState("")

  const [moveSection, setMoveSection] = useState<"" | "standalone" | "ideas" | "projects">("")

  const [tskTitle, setTskTitle] = useState("")
  const [tskNotes, setTskNotes] = useState("")
  const [tskDueBy, setTskDueBy] = useState("")
  const [tskError, setTskError] = useState("")
  const [tskSubmitting, setTskSubmitting] = useState(false)

  const editBlank = !title.trim() && !category && !text.trim()

  function reset() { setMode("view"); setError(""); setMoveSection(""); setTskError("") }

  useEffect(() => { if (!isOpen) reset() }, [isOpen])

  async function handleSave() {
    if (editBlank) { setError("At least one field is required."); return }
    const res = await fetch(`${API}/thoughts/${thought.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || undefined, category: category || null, text: text || undefined }),
    })
    if (res.ok) { show("saved", "Thought saved"); reset(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Save failed.") }
  }

  async function confirmDelete() {
    await fetch(`${API}/thoughts/${thought.id}`, { method: "DELETE" })
    show("executed", "Thought deleted")
    router.refresh()
  }

  async function handleMove(target: { ideaId?: string | null; projectId?: string | null } | "standalone") {
    const body = target === "standalone"
      ? { title: title || undefined, category: category || null, text: text || undefined, ideaId: null, projectId: null }
      : { title: thought.title, category: thought.category, text: thought.text, ...target }
    const res = await fetch(`${API}/thoughts/${thought.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) { show("saved", "Thought moved"); reset(); router.refresh() }
  }

  async function handlePromoteToTask(e: React.FormEvent) {
    e.preventDefault()
    if (!tskTitle.trim()) { setTskError("Title is required."); return }
    setTskError("")
    setTskSubmitting(true)
    const taskRes = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: tskTitle.trim(),
        notes: tskNotes.trim() || undefined,
        dueBy: tskDueBy || undefined,
        projectId: thought.projectId,
      }),
    })
    setTskSubmitting(false)
    if (!taskRes.ok) {
      const d = await taskRes.json()
      setTskError(d.error ?? "Failed.")
      return
    }
    await fetch(`${API}/thoughts/${thought.id}`, { method: "DELETE" })
    show("promoted", "Promoted to task")
    router.refresh()
  }

  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-700">
      <div
        onClick={onToggle}
        className="flex w-full items-center px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer select-none"
      >
        <span className="flex-1 text-left text-sm text-zinc-800 dark:text-zinc-200">
          {getThoughtLabel(thought)}
        </span>
        <div className="flex items-center gap-2 mx-2" onClick={e => e.stopPropagation()}>
          {isOpen && !isPinned && (
            <button type="button" onClick={onPin}
              className="text-xs text-zinc-400 hover:text-amber-400 dark:text-zinc-500 dark:hover:text-amber-400 leading-none">
              pin
            </button>
          )}
          {isPinned && (
            <button type="button" onClick={onUnpin}
              className="text-xs font-medium text-amber-400 hover:text-amber-600 leading-none">
              pinned ×
            </button>
          )}
        </div>
        <span className="text-zinc-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-700 px-4 py-3 space-y-3">

          {mode === "view" && (
            <>
              {thought.category && (
                <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Category</p>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{thought.category}</p></div>
              )}
              {thought.title && (
                <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Title</p>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{thought.title}</p></div>
              )}
              {thought.text && (
                <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{thought.text}</p></div>
              )}
              <p className="text-xs text-zinc-400">{new Date(thought.createdAt).toLocaleDateString()}</p>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setMode("move")} className={BTN_GHOST}>Move Thought</button>
                {thought.projectId && (
                  <button onClick={() => {
                    setTskTitle(thought.title ?? "")
                    setTskNotes(thought.text ?? "")
                    setTskDueBy("")
                    setTskError("")
                    setMode("promoteToTask")
                  }} className={BTN_GHOST}>
                    Promote to Task
                  </button>
                )}
                <button onClick={() => { setMode("edit"); setTitle(thought.title ?? ""); setCategory(thought.category ?? ""); setText(thought.text ?? "") }} className={BTN_GHOST}>Edit</button>
                <button onClick={() => setMode("confirmDelete")} className={BTN_RED}>Delete</button>
              </div>
            </>
          )}

          {mode === "promoteToTask" && (
            <form onSubmit={handlePromoteToTask} className="space-y-2">
              <p className="text-xs text-zinc-500">This thought will be removed and added as a task on the project.</p>
              <input
                autoFocus
                type="text"
                value={tskTitle}
                onChange={e => setTskTitle(e.target.value)}
                placeholder="Title (required)"
                className={INPUT}
              />
              <textarea
                value={tskNotes}
                onChange={e => setTskNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={3}
                className={INPUT}
              />
              <input
                type="date"
                value={tskDueBy}
                onChange={e => setTskDueBy(e.target.value)}
                className={INPUT}
              />
              {tskError && <p className="text-xs text-red-500">{tskError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={!tskTitle.trim() || tskSubmitting} className={BTN_GREEN}>
                  {tskSubmitting ? "Promoting…" : "Promote to Task"}
                </button>
                <button type="button" onClick={() => { setMode("view"); setTskError("") }} className={BTN_GHOST}>Cancel</button>
              </div>
            </form>
          )}

          {mode === "confirmDelete" && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Delete this thought?</p>
              <div className="flex gap-2">
                <button onClick={confirmDelete} className={BTN_RED}>Yes, delete</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className={INPUT} />
                <select value={category} onChange={(e) => setCategory(e.target.value as Category | "")} className={INPUT}>
                  <option value="">Category (optional)</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={editBlank} className={BTN_PRIMARY}>Save</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </>
          )}

          {mode === "move" && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Move this thought to:</p>
              <button onClick={() => handleMove("standalone")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Standalone (Thoughts tab)
              </button>
              <button onClick={() => setMoveSection(moveSection === "ideas" ? "" : "ideas")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Ideas {moveSection === "ideas" ? "▲" : "▼"}
              </button>
              {moveSection === "ideas" && (
                <div className="ml-3 space-y-1">
                  {ideas.length === 0 && <p className="text-xs text-zinc-400">No ideas yet.</p>}
                  {ideas.map((idea) => (
                    <button key={idea.id} onClick={() => handleMove({ ideaId: idea.id, projectId: null })}
                      className="block w-full text-left rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      {idea.title}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setMoveSection(moveSection === "projects" ? "" : "projects")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Projects {moveSection === "projects" ? "▲" : "▼"}
              </button>
              {moveSection === "projects" && (
                <div className="ml-3 space-y-1">
                  {liveProjects.length === 0 && <p className="text-xs text-zinc-400">No projects yet.</p>}
                  {liveProjects.map((p) => (
                    <button key={p.id} onClick={() => handleMove({ projectId: p.id, ideaId: null })}
                      className="block w-full text-left rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={reset} className={BTN_GHOST}>Cancel</button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
