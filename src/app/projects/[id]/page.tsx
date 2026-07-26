import { notFound } from "next/navigation"
import Link from "next/link"
import type { Project } from "@/data/projects"
import DeleteButton from "@/components/DeleteButton"
import EditProjectForm from "@/components/EditProjectForm"
import TaskList from "@/components/TaskList"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [projectRes, allRes, tasksRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?projectId=${id}`, { cache: 'no-store' }),
    ])
    if (!projectRes.ok) notFound()
    const project = await projectRes.json()
    const allProjects = await allRes.json()
    const tasks = await tasksRes.json()
    const existingTags = [...new Set((allProjects as Project[]).filter((p) => p.id !== id).flatMap((p) => p.tags ?? []))]
    return (
        <div className="mx-auto max-w-4xl px-6 py-12">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← Project List
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {project.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{project.date}</p>
            <p className="mt-4 text-zinc-700 dark:text-zinc-300">{project.description}</p>
            {(project.framework || project.lanes?.length) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.framework && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {project.framework}
                  </span>
                )}
                {project.lanes?.map(l => (
                  <span key={l} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 capitalize">
                    {l}
                  </span>
                ))}
              </div>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View Repo ↗
              </a>
            )}
            <EditProjectForm project={project} existingTags={existingTags} />
            <TaskList tasks={tasks} projectId={id} />
            <DeleteButton project={project} />
        </div>
    )
}
