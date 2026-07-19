'use client'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error
  unstable_retry: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
        Something went wrong
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{error.message}</p>
      <button
        onClick={() => unstable_retry()}
        className="mt-4 rounded border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  )
}
