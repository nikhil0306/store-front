"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import "../landing.css"
import "./shops.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { API_URL } from "@/lib/api"

interface Store {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    themeColor: string
    city: string | null
    createdAt: string
    _count: { products: number }
}

export default function ShopsPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await fetch(`${API_URL}/api/stores`)
                const data = await res.json()
                if (res.ok) setStores(data.stores)
            } catch (err) {
                console.error("Failed to fetch stores:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStores()
    }, [])

    const filtered = stores.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.city?.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="shops-page">
            {/* Navbar */}
            <Navbar activePage="shops" />

            {/* Header */}
            <div className="shops-header">
                <div className="shops-header-inner">
                    <h1 className="shops-title">Browse shops</h1>
                    <p className="shops-sub">
                        Discover local sellers and shop directly from their stores
                    </p>
                    <div className="shops-search-wrap">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search shops by name, city or category..."
                            className="shops-search"
                        />
                    </div>
                </div>
            </div>

            {/* Stores grid */}
            <main className="shops-body">
                {loading ? (
                    <div className="shops-loading">
                        <div className="spinner" style={{ borderTopColor: "#0B0F2F" }} />
                        <p>Loading shops...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="shops-empty">
                        <p>No shops found</p>
                        <span>
                            {search ? "Try a different search term" : "Be the first to open a shop!"}
                        </span>
                        {!search && (
                            <a href="/login" className="btn-open-shop">
                                Open your shop →
                            </a>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="shops-count">
                            {filtered.length} shop{filtered.length !== 1 ? "s" : ""} found
                        </p>
                        <div className="shops-grid">
                            {filtered.map((store) => (
                                <Link
                                    key={store.id}
                                    href={`/shop/${store.slug}`}
                                    className="store-card"
                                >
                                    {/* Store avatar */}
                                    <div className="store-card-header">
                                        <div
                                            className="store-avatar-lg"
                                            style={{ backgroundColor: store.themeColor || "#0B0F2F" }}
                                        >
                                            {store.name.charAt(0)}
                                        </div>
                                        <div className="store-card-meta">
                                            <h2 className="store-card-name">{store.name}</h2>
                                            <div className="store-card-tags">
                                                {store.city && (
                                                    <span className="store-tag">{store.city}</span>
                                                )}
                                                <span className="store-tag">
                                                    {store._count.products} products
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {store.description && (
                                        <p className="store-card-desc">{store.description}</p>
                                    )}
                                    <div className="store-card-footer">
                                        <span className="store-visit-btn">Visit shop →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}