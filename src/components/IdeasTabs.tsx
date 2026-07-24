'use client'
import { useState } from "react"
import type { Thought } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import type { Project } from "@/data/projects"
import type { RemovedProject } from "@/data/removedProject"
import ThoughtsTab from "./ThoughtsTab"
import IdeasTabContent from "./IdeasTabContent"
import ProjectsTab from "./ProjectsTab"

type Tab = "thoughts" | "ideas" | "projects"

type Props = {
  thoughts: Thought[]
  ideas: Idea[]
  liveProjects: Project[]
  removedProjects: RemovedProject[]
}

export default function IdeasTabs({ thoughts, ideas, liveProjects, removedProjects }: Props) {
  const [active, setActive] = useState<Tab>("thoughts")

  const standaloneThoughts = thoughts.filter((t) => !t.ideaId && !t.projectId)
  const projectsCount = liveProjects.length + removedProjects.length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "thoughts", label: "Thoughts", count: standaloneThoughts.length },
    { key: "ideas",    label: "Ideas",    count: ideas.length },
    { key: "projects", label: "Projects", count: projectsCount },
  ]

  return (
    <div className="mt-6">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 -mx-6 bg-white px-6 pb-0 pt-2 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-1">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-2 text-sm rounded-t transition-colors ${
                active === key
                  ? "border border-b-white dark:border-zinc-700 dark:border-b-zinc-950 border-zinc-200 font-semibold text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-950"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${active === key ? "text-zinc-400" : "text-zinc-400"}`}>
                  ({count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {active === "thoughts" && (
          <ThoughtsTab
            thoughts={standaloneThoughts}
            ideas={ideas}
            liveProjects={liveProjects}
          />
        )}
        {active === "ideas" && (
          <IdeasTabContent
            ideas={ideas}
            thoughts={thoughts}
            liveProjects={liveProjects}
          />
        )}
        {active === "projects" && (
          <ProjectsTab
            liveProjects={liveProjects}
            removedProjects={removedProjects}
            thoughts={thoughts}
            ideas={ideas}
          />
        )}
      </div>
    </div>
  )
}
