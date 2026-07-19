export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-16 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  )
}
