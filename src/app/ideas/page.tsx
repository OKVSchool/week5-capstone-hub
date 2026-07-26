import IdeasTabs from "@/components/IdeasTabs"

export default async function IdeasPage() {
  const API = process.env.NEXT_PUBLIC_API_URL
  const [thoughtsRes, ideasRes, activeRes, archivedRes, orphanedRes, tasksRes] = await Promise.all([
    fetch(`${API}/thoughts`, { cache: 'no-store' }),
    fetch(`${API}/ideas`, { cache: 'no-store' }),
    fetch(`${API}/projects?status=active`, { cache: 'no-store' }),
    fetch(`${API}/projects?status=archived`, { cache: 'no-store' }),
    fetch(`${API}/projects?status=orphaned`, { cache: 'no-store' }),
    fetch(`${API}/tasks?limit=100`, { cache: 'no-store' }),
  ])
  const thoughts = await thoughtsRes.json()
  const ideas = await ideasRes.json()
  const liveProjects = await activeRes.json()
  const removedProjects = [...(await archivedRes.json()), ...(await orphanedRes.json())]
  const tasks = await tasksRes.json()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Project Ideas
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Capture thoughts, grow them into ideas, and promote ideas into projects.
      </p>
      <IdeasTabs
        thoughts={thoughts}
        ideas={ideas}
        liveProjects={liveProjects}
        removedProjects={removedProjects}
        tasks={tasks}
      />
    </div>
  )
}
