'use client'
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

export default function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/", label: "Project List" },
    { href: "/ideas", label: "Project Ideas" },
    { href: "/references", label: "References" },
    { href: "/settings", label: "Settings" },
  ]

  const linkClass = (href: string) =>
    pathname === href
      ? "text-sm font-semibold text-zinc-900 dark:text-zinc-50"
      : "text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"

  return (
    <nav>
      {/* Top bar */}
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          Project Hub
        </span>

        {/* Desktop links — hidden below 645px */}
        <div className="hidden min-[645px]:flex gap-6">
          {links.map(link => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button — visible below 645px */}
        <button
          onClick={() => setOpen(!open)}
          className="min-[645px]:hidden flex flex-col gap-1.5 p-1"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-zinc-900 dark:bg-zinc-50 transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-zinc-900 dark:bg-zinc-50 transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-zinc-900 dark:bg-zinc-50 transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer — visible below 645px when open */}
      {open && (
        <div className="min-[645px]:hidden border-t border-zinc-200 dark:border-zinc-800">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 ${linkClass(link.href)} hover:bg-zinc-50 dark:hover:bg-zinc-900`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
