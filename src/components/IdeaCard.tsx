'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Idea, Lane } from "@/data/idea"
import { LANES } from "@/data/idea"
import type { Thought, Category } from "@/data/thoughts"
import { CATEGORIES } from "@/data/thoughts"
import type { Project } from "@/data/projects"
import ThoughtCard from "./ThoughtCard"
import StarRating from "./StarRating"

type Props = {
  idea: Idea
  thoughts: Thought[]
  ideas: Idea[]
  liveProjects: Project[]
  autoAssignLevel?: number
  onPriorityChange?: (id: string, level: number | undefined) => void
  // Accordion props — managed by IdeasTabContent
  isOpen: boolean
  isPinned: boolean
  onToggle: () => void
  onPin: () => void
  onUnpin: () => void
}

type Mode = "view" | "edit" | "promote" | "newThought" | "confirmDelete"

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
const BTN_GREEN = "rounded border border-green-600 px-3 py-1 text-xs text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950 disabled:opacity-40 disabled:cursor-not-allowed"
const BTN_RED = "rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"

export default function IdeaCard({
  idea, thoughts, ideas, liveProjects, autoAssignLevel, onPriorityChange,
  isOpen, isPinned, onToggle, onPin, onUnpin,
}: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("view")

  const [title, setTitle] = useState(idea.title)
  const [framework, setFramework] = useState(idea.framework)
  const [lane, setLane] = useState<Lane>(idea.lane)
  const [text, setText] = useState(idea.text ?? "")
  const [error, setError] = useState("")

  const [pTitle, setPTitle] = useState(idea.title)
  const [pFramework, setPFramework] = useState(idea.framework)
  const [pLane, setPLane] = useState<Lane>(idea.lane)
  const [pDate, setPDate] = useState("")
  const [pRepo, setPRepo] = useState("")
  const [pText, setPText] = useState(idea.text ?? "")
  const [pError, setPError] = useState("")

  const [tTitle, setTTitle] = useState("")
  const [tCategory, setTCategory] = useState<Category | "">("")
  const [tText, setTText] = useState("")
  const [tError, setTError] = useState("")

  // Accordion state for nested ThoughtCards
  const [innerOpenId, setInnerOpenId] = useState<string | null>(null)
  const [innerPinnedIds, setInnerPinnedIds] = useState<Set<string>>(new Set())

  const thoughtBlank = !tTitle.trim() && !tCategory && !tText.trim()
  const promoteReady = pTitle.trim() && pFramework.trim() && pLane && pDate.trim()

  function reset() { setMode("view"); setError(""); setPError(""); setTError("") }

  // Reset form + inner accordion when this card closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setInnerOpenId(null)
      setInnerPinnedIds(new Set())
    }
  }, [isOpen])

  function handleInnerToggle(id: string) {
    if (innerPinnedIds.has(id)) return
    setInnerOpenId(prev => prev === id ? null : id)
  }
  function handleInnerPin(id: string) {
    setInnerPinnedIds(prev => new Set([...prev, id]))
    setInnerOpenId(null)
  }
  function handleInnerUnpin(id: string) {
    setInnerPinnedIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  async function handleSave() {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, framework, lane, text }),
    })
    if (res.ok) { reset(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? "Save failed.") }
  }

  async function handleDelete() {
    await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" })
    router.refresh()
  }

  async function handlePromote() {
    if (!promoteReady) { setPError("All required fields must be filled."); return }
    const res = await fetch(`/api/ideas/${idea.id}?action=promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pTitle, framework: pFramework, lane: pLane, date: pDate, repoUrl: pRepo, text: pText }),
    })
    if (res.ok) { router.refresh() }
    else { const d = await res.json(); setPError(d.error ?? "Failed.") }
  }

  async function handleAddThought(e: React.FormEvent) {
    e.preventDefault()
    if (thoughtBlank) { setTError("At least one field is required."); return }
    const res = await fetch("/api/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: idea.id, title: tTitle, category: tCategory, text: tText }),
    })
    if (res.ok) { setTTitle(""); setTCategory(""); setTText(""); setTError(""); setMode("view"); router.refresh() }
    else { const d = await res.json(); setTError(d.error ?? "Failed.") }
  }

  const count = thoughts.length

  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex w-full items-center px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer select-none"
      >
        <span className="flex-1 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {idea.title}
          {idea.priority !== undefined && (
            <span className="ml-1 text-yellow-400 text-xs font-normal">{"★".repeat(idea.priority)}</span>
          )}
          {count > 0 && <span className="ml-2 text-xs font-normal text-zinc-400">({count})</span>}
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
        <div className="border-t border-zinc-100 dark:border-zinc-700 px-4 py-3 space-y-4">

          {mode === "view" && (
            <>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Framework</p>
                    <p className="text-zinc-800 dark:text-zinc-200">{idea.framework}</p></div>
                  <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Lane</p>
                    <p className="text-zinc-800 dark:text-zinc-200 capitalize">{idea.lane}</p></div>
                </div>
                {idea.text && (
                  <div><p className="text-xs text-zinc-400 uppercase tracking-wide">Notes</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{idea.text}</p></div>
                )}
                <p className="text-xs text-zinc-400">{new Date(idea.createdAt).toLocaleDateString()}</p>

                {onPriorityChange && (idea.priority !== undefined || autoAssignLevel !== undefined) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 uppercase tracking-wide">Priority</span>
                    {idea.priority !== undefined ? (
                      <StarRating value={idea.priority} onChange={(p) => onPriorityChange(idea.id, p)} />
                    ) : (
                      <button
                        onClick={() => onPriorityChange(idea.id, autoAssignLevel!)}
                        className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 hover:border-yellow-300 hover:text-yellow-600 dark:border-zinc-700 dark:hover:border-yellow-600 dark:hover:text-yellow-400"
                      >
                        + Add Priority
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setMode("newThought")} className={BTN_GHOST}>+ New Thought</button>
                <button onClick={() => setMode("promote")} className={BTN_GREEN}>Promote to Project</button>
                <button onClick={() => setMode("edit")} className={BTN_GHOST}>Edit</button>
                <button onClick={() => setMode("confirmDelete")} className={BTN_RED}>Delete</button>
              </div>

              {thoughts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                  {[...thoughts].reverse().map((t) => (
                    <ThoughtCard
                      key={t.id}
                      thought={t}
                      ideas={ideas}
                      liveProjects={liveProjects}
                      isOpen={innerOpenId === t.id || innerPinnedIds.has(t.id)}
                      isPinned={innerPinnedIds.has(t.id)}
                      onToggle={() => handleInnerToggle(t.id)}
                      onPin={() => handleInnerPin(t.id)}
                      onUnpin={() => handleInnerUnpin(t.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {mode === "confirmDelete" && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Delete <span className="font-semibold">{idea.title}</span>? Its thoughts will become standalone.
              </p>
              <div className="flex gap-2">
                <button onClick={handleDelete} className={BTN_RED}>Yes, delete</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "newThought" && (
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
                <button type="button" onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </form>
          )}

          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (required)" className={INPUT} />
                <input type="text" value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="Framework (required)" className={INPUT} />
                <select value={lane} onChange={(e) => setLane(e.target.value as Lane)} className={INPUT}>
                  <option value="">Lane (required)</option>
                  {LANES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleSave} className={BTN_PRIMARY}>Save</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </>
          )}

          {mode === "promote" && (
            <>
              <p className="text-xs text-zinc-500">An Idea becomes a Project when it has a start date. Fields are prefilled from the Idea.</p>
              <div className="space-y-2">
                <input type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Title (required)" className={INPUT} />
                <input type="text" value={pFramework} onChange={(e) => setPFramework(e.target.value)} placeholder="Framework (required)" className={INPUT} />
                <select value={pLane} onChange={(e) => setPLane(e.target.value as Lane)} className={INPUT}>
                  <option value="">Lane (required)</option>
                  {LANES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="flex gap-2 items-center">
                  <input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} className={INPUT} />
                  <button type="button" onClick={() => setPDate(new Date().toISOString().split("T")[0])} className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">Today</button>
                </div>
                <input type="url" value={pRepo} onChange={(e) => setPRepo(e.target.value)} placeholder="Repo URL (optional)" className={INPUT} />
                <textarea value={pText} onChange={(e) => setPText(e.target.value)} placeholder="Notes (optional)" rows={3} className={INPUT} />
              </div>
              {pError && <p className="text-xs text-red-500">{pError}</p>}
              <div className="flex gap-2">
                <button onClick={handlePromote} disabled={!promoteReady} className={BTN_GREEN}>Promote to Project</button>
                <button onClick={reset} className={BTN_GHOST}>Cancel</button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  )
}
