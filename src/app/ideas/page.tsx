import { thoughtStore } from "@/lib/thoughtStore"
import { ideaStore } from "@/lib/ideaStore"
import { removedProjectStore } from "@/lib/removedProjectStore"
import { store } from "@/lib/store"
import IdeasTabs from "@/components/IdeasTabs"

export default function IdeasPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Project Ideas
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Capture thoughts, grow them into ideas, and promote ideas into projects.
      </p>
      <IdeasTabs
        thoughts={[...thoughtStore]}
        ideas={[...ideaStore]}
        liveProjects={[...store]}
        removedProjects={[...removedProjectStore]}
      />
    </div>
  )
}
