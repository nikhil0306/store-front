"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    category: string | null
    isVisible: boolean
    isFeatured: boolean
    imageUrls: string[]
    createdAt: string
}

export default function ProductsPage() {
    const { data: session } = useSession()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!session?.user?.email) return

        const fetchProducts = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/products?userEmail=${session.user?.email}`
                )
                const data = await res.json()

                if (res.ok) {
                    setProducts(data.products)
                } else {
                    setError(data.error?.message || "Failed to load products")
                }
            } catch (err) {
                setError("Could not connect to server")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [session])

    if (loading) {
        return <p className="db-loading">Loading products...</p>
    }

    return (
        <div>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Products</h1>
                    <p className="db-page-subtitle">
                        {products.length} product{products.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/dashboard/products/new" className="db-btn-primary">
                    + Add product
                </Link>
            </div>

            {error && <p className="db-alert-error" style={{ marginBottom: 16 }}>{error}</p>}

            {products.length === 0 ? (
                <div className="db-card">
                    <div className="db-empty">
                        <p className="db-empty-icon">📦</p>
                        <p className="db-empty-title">No products yet</p>
                        <p className="db-empty-sub">Add your first product to start selling</p>
                        <Link href="/dashboard/products/new" className="db-btn-primary">
                            Add first product
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="db-card">
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} style={{ cursor: "default" }}>
                                        <td>
                                            <div className="db-product-cell">
                                                {product.imageUrls.length > 0 ? (
                                                    <img
                                                        src={product.imageUrls[0]}
                                                        alt={product.name}
                                                        className="db-product-thumb"
                                                    />
                                                ) : (
                                                    <div className="db-thumb-placeholder">img</div>
                                                )}
                                                <div>
                                                    <p className="db-td-primary">{product.name}</p>
                                                    {product.category && (
                                                        <p className="db-td-secondary">{product.category}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="db-td-primary">₹{product.price.toFixed(2)}</td>
                                        <td className="db-td-primary">{product.stock}</td>
                                        <td>
                                            <span className={`db-badge ${product.isVisible ? "db-badge-visible" : "db-badge-hidden"}`}>
                                                {product.isVisible ? "Visible" : "Hidden"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <Link
                                                href={`/dashboard/products/${product.id}/edit`}
                                                className="db-link"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}