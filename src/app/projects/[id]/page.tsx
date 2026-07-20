import { store } from "@/lib/store"
import { notFound } from "next/navigation"
import DeleteButton from "@/components/DeleteButton"
import EditProjectForm from "@/components/EditProjectForm"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const {id } = await params
    const project = store.find(p => p.id === id)
    if (!project) notFound()
    return (
        <div className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {project.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{project.date}</p>
            <p className="mt-4 text-zinc-700 dark:text-zinc-300">{project.description}</p>
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
            <EditProjectForm project={project} />
            <DeleteButton id={id} />
        </div>
    )
}