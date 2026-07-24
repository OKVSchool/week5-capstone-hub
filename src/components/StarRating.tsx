'use client'

type Props = {
  value?: number  // 1–5, undefined = no priority
  onChange: (value: number | undefined) => void
}

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-lg leading-none transition-colors ${
            star <= (value ?? 0)
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-zinc-300 dark:text-zinc-600 hover:text-yellow-300"
          }`}
          title={`Priority ${star}`}
        >
          ★
        </button>
      ))}
      {value !== undefined && (
        <>
          <span className="ml-1 text-xs text-zinc-400">P{value}</span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="ml-2 text-xs text-zinc-400 underline hover:text-red-500 dark:hover:text-red-400"
            title="Remove priority"
          >
            Remove
          </button>
        </>
      )}
    </div>
  )
}
