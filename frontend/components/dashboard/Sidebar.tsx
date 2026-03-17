"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Products", href: "/dashboard/products" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Settings", href: "/dashboard/settings" },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-48 min-h-screen border-r border-gray-200 bg-white py-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm transition ${isActive
                                ? "font-medium text-gray-900 bg-gray-100 border-l-2 border-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {item.label}
                    </Link>
                )
            })}
        </div>
    )
}