'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Thought, Category } from "@/data/thoughts"
import { getThoughtLabel, CATEGORIES } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import type { Project } from "@/data/projects"

type Props = {
  thought: Thought
  ideas: Idea[]
  liveProjects: Project[]
  showPromoteToIdea?: boolean
}

type Mode = "view" | "edit" | "move" | "promote" | "confirmDelete"

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
const BTN_GREEN = "rounded border border-green-600 px-3 py-1 text-xs text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950"
const BTN_RED = "rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"

export default function ThoughtCard({ thought, ideas, liveProjects, showPromoteToIdea = false }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("view")

  // edit state
  const [title, setTitle] = useState(thought.title ?? "")
  const [category, setCategory] = useState<Category | "">(thought.category ?? "")
  const [text, setText] = useState(thought.text ?? "")
  const [error, setError] = useState("")

  // promote-to-idea state
  const [pTitle, setPTitle] = useState(thought.title ?? "")
  const [pFramework, setPFramework] = useState("")
  const [pLane, setPLane] = useState("")
  const [pText, setPText] = useState(thought.text ?? "")
  const [pError, setPError] = useState("")

  // move state
  const [moveSection, setMoveSection] = useState<"" | "standalone" | "ideas" | "projects">("")

  const editBlank = !title.trim() && !category && !text.trim()
  const promoteReady = pTitle.trim() && pFramework.trim() && pLane

  function reset() { setMode("view"); setError(""); setPError(""); setMoveSection("") }

  async function handleSave() {
    if (editBlank) { setError("At least one field is required."); return }
    const res = await fetch(`/api/thoughts/${thought.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, text }),
    })
    if (res.ok) { reset(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Save failed.") }
  }

  async function confirmDelete() {
    await fetch(`/api/thoughts/${thought.id}`, { method: "DELETE" })
    router.refresh()
  }

  async function handleMove(target: { ideaId?: string; projectId?: string } | "standalone") {
    const body = target === "standalone"
      ? { title, category, text, ideaId: null, projectId: null }
      : { title: thought.title, category: thought.category, text: thought.text, ...target }
    const res = await fetch(`/api/thoughts/${thought.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) { reset(); router.refresh() }
  }

  async function handlePromote() {
    if (!promoteReady) { setPError("Title, framework, and lane are all required."); return }
    // create idea
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pTitle, framework: pFramework, lane: pLane, text: pText }),
    })
    if (!res.ok) { const d = await res.json(); setPError(d.error ?? "Failed."); return }
    // delete the thought
    await fetch(`/api/thoughts/${thought.id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-700">
      {/* Header row */}
      <button
        onClick={() => { setOpen((o) => !o); if (open) reset() }}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span>{getThoughtLabel(thought)}</span>
        <span className="text-zinc-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-700 px-4 py-3 space-y-3">

          {/* VIEW mode */}
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
                {showPromoteToIdea && (
                  <button onClick={() => setMode("promote")} className={BTN_GREEN}>Promote to Idea</button>
                )}
                <button onClick={() => { setMode("edit"); setTitle(thought.title ?? ""); setCategory(thought.category ?? ""); setText(thought.text ?? "") }} className={BTN_GHOST}>Edit</button>
                <button onClick={() => setMode("confirmDelete")} className={BTN_RED}>Delete</button>
              </div>
            </>
          )}

          {/* CONFIRM DELETE */}
          {mode === "confirmDelete" && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Delete this thought?</p>
              <div className="flex gap-2">
                <button onClick={confirmDelete} className={BTN_RED}>Yes, delete</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </div>
          )}

          {/* EDIT mode */}
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

          {/* MOVE mode */}
          {mode === "move" && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Move this thought to:</p>
              <button onClick={() => handleMove("standalone")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Standalone (Thoughts tab)
              </button>

              {/* Ideas */}
              <button onClick={() => setMoveSection(moveSection === "ideas" ? "" : "ideas")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Ideas {moveSection === "ideas" ? "▲" : "▼"}
              </button>
              {moveSection === "ideas" && (
                <div className="ml-3 space-y-1">
                  {ideas.length === 0 && <p className="text-xs text-zinc-400">No ideas yet.</p>}
                  {ideas.map((idea) => (
                    <button key={idea.id} onClick={() => handleMove({ ideaId: idea.id, projectId: undefined })}
                      className="block w-full text-left rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      {idea.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Projects */}
              <button onClick={() => setMoveSection(moveSection === "projects" ? "" : "projects")} className="block w-full text-left rounded border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Projects {moveSection === "projects" ? "▲" : "▼"}
              </button>
              {moveSection === "projects" && (
                <div className="ml-3 space-y-1">
                  {liveProjects.length === 0 && <p className="text-xs text-zinc-400">No projects yet.</p>}
                  {liveProjects.map((p) => (
                    <button key={p.id} onClick={() => handleMove({ projectId: p.id, ideaId: undefined })}
                      className="block w-full text-left rounded px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={reset} className={BTN_GHOST}>Cancel</button>
            </div>
          )}

          {/* PROMOTE TO IDEA mode */}
          {mode === "promote" && (
            <>
              <p className="text-xs text-zinc-500">A thought becomes an Idea when it has a title, framework, and lane.</p>
              <div className="space-y-2">
                <input type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Title (required)" className={INPUT} />
                <input type="text" value={pFramework} onChange={(e) => setPFramework(e.target.value)} placeholder="Framework (required)" className={INPUT} />
                <select value={pLane} onChange={(e) => setPLane(e.target.value)} className={INPUT}>
                  <option value="">Lane (required)</option>
                  {["content site", "web app", "mobile app"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <textarea value={pText} onChange={(e) => setPText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              </div>
              {pError && <p className="text-xs text-red-500">{pError}</p>}
              <div className="flex gap-2">
                <button onClick={handlePromote} disabled={!promoteReady} className={BTN_GREEN + " disabled:opacity-40 disabled:cursor-not-allowed"}>Promote to Idea</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  )
}
