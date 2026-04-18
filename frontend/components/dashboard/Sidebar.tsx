"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    { label: "Overview",  href: "/dashboard",          icon: "📊" },
    { label: "Products",  href: "/dashboard/products", icon: "📦" },
    { label: "Orders",    href: "/dashboard/orders",   icon: "🛒" },
    { label: "Settings",  href: "/dashboard/settings", icon: "⚙️" },
]

export default function Sidebar() {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href)

    return (
        <>
            {/* Desktop sidebar */}
            <nav className="db-sidebar">
                <p className="db-sidebar-label">Menu</p>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`db-sidebar-link${isActive(item.href) ? " active" : ""}`}
                    >
                        <span className="db-sidebar-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile bottom tab bar */}
            <nav className="db-bottom-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`db-bottom-nav-link${isActive(item.href) ? " active" : ""}`}
                    >
                        <span className="db-bottom-nav-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </>
    )
}