'use client'
import { createContext, useContext, useState, useCallback, useRef } from "react"

export type ToastKind = "promoted" | "executed" | "saved"

type Toast = { id: string; kind: ToastKind; message: string }

type Ctx = { show: (kind: ToastKind, message: string) => void }

const ToastContext = createContext<Ctx>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = String(++counter.current)
    setToasts(prev => [...prev, { id, kind, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  )
}

// ── Visual stack ──────────────────────────────────────────────────────────────

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const { kind, message } = toast

  const base = "relative flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium overflow-hidden toast-enter"

  const styles: Record<ToastKind, string> = {
    promoted: "bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
    executed: "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    saved:    "bg-white border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200",
  }

  return (
    <div className={`${base} ${styles[kind]}`}>
      <Icon kind={kind} />
      <span>{message}</span>
    </div>
  )
}

function Icon({ kind }: { kind: ToastKind }) {
  if (kind === "promoted") return <TrumpetIcon />
  if (kind === "executed") return <GuillotineIcon />
  return <span className="text-base leading-none">✓</span>
}

function TrumpetIcon() {
  return (
    <span className="text-xl leading-none trumpet-fanfare select-none" aria-hidden>
      🎺
    </span>
  )
}

function GuillotineIcon() {
  return (
    <svg
      width="24" height="28" viewBox="0 0 24 28"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="flex-shrink-0"
    >
      {/* Left pillar */}
      <rect x="1" y="4" width="4" height="24" rx="1" fill="#9ca3af" />
      {/* Right pillar */}
      <rect x="19" y="4" width="4" height="24" rx="1" fill="#9ca3af" />
      {/* Top crossbar */}
      <rect x="1" y="2" width="22" height="4" rx="1" fill="#6b7280" />
      {/* Blade — drops in via animation */}
      <g className="blade-drop">
        {/* Blade body */}
        <rect x="7" y="0" width="10" height="16" rx="1" fill="#d1d5db" />
        {/* Angled cutting edge */}
        <polygon points="7,16 17,16 7,22" fill="#e5e7eb" />
        {/* Blade shine */}
        <rect x="9" y="2" width="2" height="12" rx="1" fill="white" opacity="0.4" />
        {/* Handle */}
        <rect x="10" y="-3" width="4" height="5" rx="1" fill="#4b5563" />
      </g>
    </svg>
  )
}
