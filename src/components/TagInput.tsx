'use client'
import { useState, useRef, KeyboardEvent } from "react"

type Props = {
  tags: string[]
  onChange: (tags: string[]) => void
  existingTags?: string[]
}

export default function TagInput({ tags, onChange, existingTags = [] }: Props) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  const suggestions = existingTags.filter((t) => !tags.includes(t))

  return (
    <div className="space-y-2">
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-h-[42px] flex-wrap gap-1.5 items-center rounded border border-zinc-300 bg-white px-3 py-2 cursor-text dark:border-zinc-600 dark:bg-zinc-900"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 leading-none"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? "Add tags — press Enter or comma" : ""}
        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-100"
      />
    </div>

    {suggestions.length > 0 && (
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-zinc-400">Used:</span>
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
          >
            + {tag}
          </button>
        ))}
      </div>
    )}
    </div>
  )
}
