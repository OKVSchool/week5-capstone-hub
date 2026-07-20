import { store } from "@/lib/store"
import ProjectList from "@/components/ProjectList"

export default function Home() {
  const projects = [...store]

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Project List
      </h1>
      <ProjectList projects={projects} />
    </div>
  )
}
