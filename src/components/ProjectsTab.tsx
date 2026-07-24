'use client'
import { useState } from "react"
import type { Project } from "@/data/projects"
import type { RemovedProject } from "@/data/removedProject"
import type { Thought } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import ProjectPanel from "./ProjectPanel"

type Props = {
  liveProjects: Project[]
  removedProjects: RemovedProject[]
  thoughts: Thought[]
  ideas: Idea[]
}

export default function ProjectsTab({ liveProjects, removedProjects, thoughts, ideas }: Props) {
  const [search, setSearch] = useState("")
  const [archiveOpen, setArchiveOpen] = useState(false)

  const q = search.toLowerCase()
  const orphaned = removedProjects.filter((p) => p.state === "orphaned" && (!q || p.title.toLowerCase().includes(q)))
  const archived = removedProjects.filter((p) => p.state === "archived" && (!q || p.title.toLowerCase().includes(q)))
  const filteredLive = q ? liveProjects.filter((p) => p.title.toLowerCase().includes(q) || p.framework?.toLowerCase().includes(q) || p.lane?.toLowerCase().includes(q)) : liveProjects

  const totalCount = liveProjects.length + removedProjects.length

  return (
    <div className="space-y-3">
      <input
        type="search"
        placeholder="Search projects…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      />

      {totalCount === 0 && (
        <p className="text-sm text-zinc-400">No projects yet.</p>
      )}

      {/* Live projects */}
      {filteredLive.map((p) => (
        <ProjectPanel
          key={p.id}
          project={p}
          mode="live"
          thoughts={thoughts.filter((t) => t.projectId === p.id)}
          ideas={ideas}
          liveProjects={liveProjects}
        />
      ))}

      {/* Orphaned projects (deleted, kept in place, red) */}
      {orphaned.map((p) => (
        <ProjectPanel
          key={p.id}
          project={p}
          mode="orphaned"
          thoughts={thoughts.filter((t) => t.projectId === p.id)}
          ideas={ideas}
          liveProjects={liveProjects}
        />
      ))}

      {/* Archived accordion */}
      {archived.length > 0 && (
        <div className="rounded border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setArchiveOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Archived
              <span className="ml-2 text-xs font-normal text-zinc-400">({archived.length})</span>
            </span>
            <span className="text-zinc-400 text-xs">{archiveOpen ? "▲" : "▼"}</span>
          </button>

          {archiveOpen && (
            <div className="border-t border-zinc-100 dark:border-zinc-700 px-4 py-3 space-y-3">
              {archived.map((p) => (
                <ProjectPanel
                  key={p.id}
                  project={p}
                  mode="archived"
                  thoughts={thoughts.filter((t) => t.projectId === p.id)}
                  ideas={ideas}
                  liveProjects={liveProjects}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
