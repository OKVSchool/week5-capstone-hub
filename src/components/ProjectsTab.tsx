'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/data/projects"
import type { RemovedProject } from "@/data/removedProject"
import type { Thought } from "@/data/thoughts"
import type { Idea } from "@/data/idea"
import ProjectPanel from "./ProjectPanel"
import { getHighestAvailable, computeBumpChain, sortByPriority } from "@/lib/priority"

type Props = {
  liveProjects: Project[]
  removedProjects: RemovedProject[]
  thoughts: Thought[]
  ideas: Idea[]
}

export default function ProjectsTab({ liveProjects, removedProjects, thoughts, ideas }: Props) {
  const router = useRouter()
  // Local copy so priority changes don't trigger router.refresh(), which would
  // reset the open/close state of every ProjectPanel.
  const [localProjects, setLocalProjects] = useState(liveProjects)

  // Sync when server data changes (e.g. after promote/archive/delete)
  useEffect(() => { setLocalProjects(liveProjects) }, [liveProjects])

  const [search, setSearch] = useState("")
  const [archiveOpen, setArchiveOpen] = useState(false)

  // Accordion state — separate for live, orphaned, and archived sections
  const [liveOpenId, setLiveOpenId] = useState<string | null>(null)
  const [livePinnedIds, setLivePinnedIds] = useState<Set<string>>(new Set())
  const [orphanOpenId, setOrphanOpenId] = useState<string | null>(null)
  const [orphanPinnedIds, setOrphanPinnedIds] = useState<Set<string>>(new Set())
  const [archiveOpenId, setArchiveOpenId] = useState<string | null>(null)
  const [archivePinnedIds, setArchivePinnedIds] = useState<Set<string>>(new Set())

  function liveToggle(id: string) { if (!livePinnedIds.has(id)) setLiveOpenId(prev => prev === id ? null : id) }
  function livePin(id: string) { setLivePinnedIds(prev => new Set([...prev, id])); setLiveOpenId(null) }
  function liveUnpin(id: string) { setLivePinnedIds(prev => { const n = new Set(prev); n.delete(id); return n }) }

  function orphanToggle(id: string) { if (!orphanPinnedIds.has(id)) setOrphanOpenId(prev => prev === id ? null : id) }
  function orphanPin(id: string) { setOrphanPinnedIds(prev => new Set([...prev, id])); setOrphanOpenId(null) }
  function orphanUnpin(id: string) { setOrphanPinnedIds(prev => { const n = new Set(prev); n.delete(id); return n }) }

  function archiveToggle(id: string) { if (!archivePinnedIds.has(id)) setArchiveOpenId(prev => prev === id ? null : id) }
  function archivePin(id: string) { setArchivePinnedIds(prev => new Set([...prev, id])); setArchiveOpenId(null) }
  function archiveUnpin(id: string) { setArchivePinnedIds(prev => { const n = new Set(prev); n.delete(id); return n }) }

  const takenLevels = new Set(localProjects.map(p => p.priority).filter((p): p is number => p !== undefined))
  const autoAssignLevel = takenLevels.size < 5 ? getHighestAvailable(localProjects) : undefined

  const q = search.toLowerCase()
  const orphaned = removedProjects.filter((p) => p.state === "orphaned" && (!q || p.title.toLowerCase().includes(q)))
  const archived = removedProjects.filter((p) => p.state === "archived" && (!q || p.title.toLowerCase().includes(q)))

  const filteredLive = q
    ? localProjects.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.framework?.toLowerCase().includes(q) ||
        p.lane?.toLowerCase().includes(q)
      )
    : localProjects

  const sortedLive = sortByPriority(filteredLive, (a, b) => b.date.localeCompare(a.date))

  const totalCount = localProjects.length + removedProjects.length

  async function handlePriorityChange(id: string, newPriority: number | undefined) {
    const changes = newPriority === undefined
      ? new Map([[id, undefined as number | undefined]])
      : computeBumpChain(localProjects, id, newPriority)

    // Optimistic update — no router.refresh() so open panels stay open
    setLocalProjects(prev =>
      prev.map(p => changes.has(p.id) ? { ...p, priority: changes.get(p.id) } : p)
    )

    for (const [affectedId, priority] of changes) {
      await fetch(`/api/projects/${affectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: priority ?? null }),
      })
    }
  }

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

      {/* Live projects — priority sorted */}
      {sortedLive.map((p) => (
        <ProjectPanel
          key={p.id}
          project={p}
          mode="live"
          thoughts={thoughts.filter((t) => t.projectId === p.id)}
          ideas={ideas}
          liveProjects={localProjects}
          autoAssignLevel={autoAssignLevel}
          onPriorityChange={handlePriorityChange}
          isOpen={liveOpenId === p.id || livePinnedIds.has(p.id)}
          isPinned={livePinnedIds.has(p.id)}
          onToggle={() => liveToggle(p.id)}
          onPin={() => livePin(p.id)}
          onUnpin={() => liveUnpin(p.id)}
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
          liveProjects={localProjects}
          isOpen={orphanOpenId === p.id || orphanPinnedIds.has(p.id)}
          isPinned={orphanPinnedIds.has(p.id)}
          onToggle={() => orphanToggle(p.id)}
          onPin={() => orphanPin(p.id)}
          onUnpin={() => orphanUnpin(p.id)}
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
                  liveProjects={localProjects}
                  isOpen={archiveOpenId === p.id || archivePinnedIds.has(p.id)}
                  isPinned={archivePinnedIds.has(p.id)}
                  onToggle={() => archiveToggle(p.id)}
                  onPin={() => archivePin(p.id)}
                  onUnpin={() => archiveUnpin(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
