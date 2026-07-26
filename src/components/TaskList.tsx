'use client'
import { useState, useEffect } from "react"
import type { Task } from "@/data/tasks"
import { useToast } from "@/lib/toast"

const INPUT = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"

export default function TaskList({ tasks: initial, projectId }: { tasks: Task[]; projectId: string }) {
  const { show } = useToast()
  const API = process.env.NEXT_PUBLIC_API_URL
  const [tasks, setTasks] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [dueBy, setDueBy] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Sync when parent re-fetches (e.g. after Promote to Task)
  useEffect(() => { setTasks(initial) }, [initial])

  async function handleToggle(task: Task) {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    })
  }

  function handleUpdate(updated: Task) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    show("saved", "Task saved")
  }

  async function handleDelete(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch(`${API}/tasks/${taskId}`, { method: "DELETE" })
    show("executed", "Task deleted")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    setError("")
    setSubmitting(true)
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        notes: notes.trim() || undefined,
        dueBy: dueBy || undefined,
        projectId,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      const newTask: Task = await res.json()
      setTasks(prev => [newTask, ...prev])
      setTitle("")
      setNotes("")
      setDueBy("")
      setShowForm(false)
      show("saved", "Task added")
    } else {
      const d = await res.json()
      setError(d.error ?? "Failed.")
    }
  }

  function cancelForm() {
    setShowForm(false)
    setTitle("")
    setNotes("")
    setDueBy("")
    setError("")
  }

  const pending = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-700 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Tasks
          {tasks.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-zinc-400">
              ({done.length}/{tasks.length} done)
            </span>
          )}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            + Add Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 rounded border border-zinc-200 dark:border-zinc-700 p-3">
          <input
            autoFocus
            placeholder="Title (required)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={INPUT}
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className={INPUT}
          />
          <input
            type="date"
            value={dueBy}
            onChange={e => setDueBy(e.target.value)}
            className={INPUT}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!title.trim() || submitting} className={BTN_PRIMARY}>
              {submitting ? "Saving…" : "Add"}
            </button>
            <button type="button" onClick={cancelForm} className={BTN_GHOST}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 && !showForm && (
        <p className="text-sm text-zinc-400">No tasks yet.</p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-1">
          {pending.map(task => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <ul className={`space-y-1 opacity-50 ${pending.length > 0 ? "mt-3" : ""}`}>
          {done.map(task => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onUpdate, onDelete }: {
  task: Task
  onToggle: (t: Task) => void
  onUpdate: (updated: Task) => void
  onDelete: (id: string) => void
}) {
  const API = process.env.NEXT_PUBLIC_API_URL
  const [editing, setEditing] = useState(false)
  const [eTitle, setETitle] = useState(task.title)
  const [eNotes, setENotes] = useState(task.notes ?? "")
  const [eDueBy, setEDueBy] = useState(task.dueBy ?? "")
  const [eError, setEError] = useState("")

  function startEdit() {
    setETitle(task.title)
    setENotes(task.notes ?? "")
    setEDueBy(task.dueBy ?? "")
    setEError("")
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!eTitle.trim()) { setEError("Title is required."); return }
    const res = await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: eTitle.trim(),
        notes: eNotes.trim() || null,
        dueBy: eDueBy || null,
      }),
    })
    if (res.ok) {
      onUpdate(await res.json())
      setEditing(false)
    } else {
      const d = await res.json()
      setEError(d.error ?? "Failed.")
    }
  }

  if (editing) {
    return (
      <li className="rounded border border-zinc-200 dark:border-zinc-700 px-3 py-2 space-y-2">
        <input
          autoFocus
          value={eTitle}
          onChange={e => setETitle(e.target.value)}
          placeholder="Title (required)"
          className={INPUT}
        />
        <textarea
          value={eNotes}
          onChange={e => setENotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className={INPUT}
        />
        <input
          type="date"
          value={eDueBy}
          onChange={e => setEDueBy(e.target.value)}
          className={INPUT}
        />
        {eError && <p className="text-xs text-red-500">{eError}</p>}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={!eTitle.trim()} className={BTN_PRIMARY}>Save</button>
          <button type="button" onClick={() => setEditing(false)} className={BTN_GHOST}>Cancel</button>
        </div>
      </li>
    )
  }

  return (
    <li className="group flex items-start gap-3 rounded px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.done ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}>
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{task.notes}</p>
        )}
      </div>
      {task.dueBy && (
        <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(task.dueBy + 'T00:00:00').toLocaleDateString()}
        </span>
      )}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={startEdit}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 text-sm leading-none"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </li>
  )
}
