'use client'
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function NavBar() {
const pathname = usePathname()
const links = [
    {href: "/", label: "Project List" },
    {href: "/ideas", label: "Project Ideas" },
    {href: "/references", label: "References" },
    {href: "/settings", label: "Settings" },
]
return (
    <nav className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            Project Hub
        </span>
        {links.map(link => (
            <Link
                key={link.href}
                href={link.href}
                className={
                    pathname === link.href
                        ? "text-sm font-semibold text-zinc-900 dark:text-zinc-50"
                        : "text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                   }
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    )
}