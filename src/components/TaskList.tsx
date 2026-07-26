'use client'
import { useState } from "react"
import type { Task } from "@/data/tasks"
import { CATEGORIES } from "@/data/thoughts"
import { useToast } from "@/lib/toast"

const INPUT = "rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
const BTN_PRIMARY = "rounded bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
const BTN_GHOST = "rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"

export default function TaskList({ tasks: initial, projectId }: { tasks: Task[]; projectId: string }) {
  const { show } = useToast()
  const API = process.env.NEXT_PUBLIC_API_URL
  const [tasks, setTasks] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleToggle(task: Task) {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    })
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
      body: JSON.stringify({ title: title.trim(), category: category || undefined, projectId }),
    })
    setSubmitting(false)
    if (res.ok) {
      const newTask: Task = await res.json()
      setTasks(prev => [newTask, ...prev])
      setTitle("")
      setCategory("")
      setShowForm(false)
      show("saved", "Task added")
    } else {
      const d = await res.json()
      setError(d.error ?? "Failed.")
    }
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
            className={`${INPUT} w-full`}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={`${INPUT} w-full`}
          >
            <option value="">Category (optional)</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!title.trim() || submitting} className={BTN_PRIMARY}>
              {submitting ? "Saving…" : "Add"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError("") }} className={BTN_GHOST}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 && !showForm && (
        <p className="text-sm text-zinc-400">No tasks yet.</p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-0.5">
          {pending.map(task => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <ul className={`space-y-0.5 ${pending.length > 0 ? "mt-3" : ""} opacity-50`}>
          {done.map(task => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }: {
  task: Task
  onToggle: (t: Task) => void
  onDelete: (id: string) => void
}) {
  return (
    <li className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task)}
        className="h-4 w-4 flex-shrink-0 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
      />
      <span className={`flex-1 text-sm ${task.done ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}>
        {task.title}
      </span>
      {task.category && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.category}
        </span>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none"
        aria-label="Delete task"
      >
        ✕
      </button>
    </li>
  )
}
