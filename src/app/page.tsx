'use client'
import { useState, useEffect } from "react"
import ProjectCard from "@/components/ProjectCard"
import AddProjectForm from "@/components/AddProjectForm"
import FetchWidget from "@/components/FetchWidget"
import type { Project } from "@/data/projects"

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  async function fetchProjects() {
    try {
      setLoading(true)
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setProjects(data)
    } catch {
      setError("Could not load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const filtered = [...projects]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(p =>
      (p.title + " " + p.description).toLowerCase().includes(query.toLowerCase())
    )

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-12 text-zinc-500">Loading...</div>
  if (error) return <div className="mx-auto max-w-4xl px-6 py-12 text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Project List
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}, newest first
      </p>

      <AddProjectForm onAdd={fetchProjects} />

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search projects..."
        className="mt-4 w-full rounded border px-3 py-2 text-sm"
      />

      <div className="mt-6 flex flex-col gap-4">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <FetchWidget />
    </div>
  )
}
