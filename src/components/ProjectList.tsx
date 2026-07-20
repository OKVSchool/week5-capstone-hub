'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/data/projects"
import ProjectCard from "@/components/ProjectCard"
import AddProjectForm from "@/components/AddProjectForm"
import FetchWidget from "@/components/FetchWidget"

export default function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const filtered = [...projects]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(p =>
      (p.title + " " + p.description).toLowerCase().includes(query.toLowerCase())
    )

  return (
    <>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}, newest first
      </p>

      <AddProjectForm onAdd={() => router.refresh()} />

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
    </>
  )
}
