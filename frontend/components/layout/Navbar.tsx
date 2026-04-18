"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import "@/app/landing.css"

interface NavbarProps {
    activePage?: "home" | "shops"
    showAuthButtons?: boolean
}

export default function Navbar({ activePage, showAuthButtons = false }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [menuOpen])

    return (
        <nav className="nav">
            <div className="nav-inner">
                <Link href="/" className="nav-logo">
                    Store<span>Front</span>
                </Link>
                <div className="nav-links">
                    <Link href="/" className={`nav-link${activePage === "home" ? " active" : ""}`}>
                        Home
                    </Link>
                    <Link href="/shop" className={`nav-link${activePage === "shops" ? " active" : ""}`}>
                        Shops
                    </Link>
                    <Link href="/#features" className="nav-link">Features</Link>
                    <Link href="/#how-it-works" className="nav-link">How it works</Link>
                </div>
                <button
                    className={`nav-hamburger${menuOpen ? " active" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile menu overlay */}
            <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
                <Link href="/" className={`mobile-link${activePage === "home" ? " active" : ""}`} onClick={() => setMenuOpen(false)}>
                    Home
                </Link>
                <Link href="/shop" className={`mobile-link${activePage === "shops" ? " active" : ""}`} onClick={() => setMenuOpen(false)}>
                    Shops
                </Link>
                <Link href="/#features" className="mobile-link" onClick={() => setMenuOpen(false)}>
                    Features
                </Link>
                <Link href="/#how-it-works" className="mobile-link" onClick={() => setMenuOpen(false)}>
                    How it works
                </Link>
            </div>
        </nav>
    )
}