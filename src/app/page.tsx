'use client'
import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export default function Home() {
  const [query, setQuery] = useState("")
  const filtered = [...projects]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(p=>
      (p.title + " " + p.description).toLowerCase().includes(query.toLowerCase())
    )

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Project List
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}, newest first
      </p>

      {<input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search projects..."
        className="mt-4 w-full rounded border px-3 py-2 text-sm"
        />
          }

      <div className="mt-6 flex flex-col gap-4">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

