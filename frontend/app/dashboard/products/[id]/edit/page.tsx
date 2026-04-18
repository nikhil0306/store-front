"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import ImageUploadZone from "@/components/dashboard/ImageUploadZone"

export default function EditProductPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [isVisible, setIsVisible] = useState(true)
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!session?.user?.email || !productId) return

        const fetchProduct = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/products/${productId}?userEmail=${session.user?.email}`
                )
                const data = await res.json()

                if (res.ok) {
                    setName(data.name || "")
                    setPrice(data.price?.toString() || "")
                    setStock(data.stock?.toString() || "")
                    setDescription(data.description || "")
                    setCategory(data.category || "")
                    setIsVisible(data.isVisible)
                    setImageUrls(data.imageUrls || [])
                } else {
                    setError(data.error?.message || "Failed to load product")
                }
            } catch (err) {
                setError("Could not connect to server")
            } finally {
                setFetching(false)
            }
        }

        fetchProduct()
    }, [session, productId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name || !price || !stock) {
            setError("Name, price and stock are required")
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: session?.user?.email,
                    name,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    description,
                    category,
                    isVisible,
                    imageUrls,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message || "Something went wrong")
                return
            }

            router.push("/dashboard/products")
        } catch (err) {
            setError("Could not connect to server")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)

        try {
            const res = await fetch(
                `http://localhost:5000/api/products/${productId}?userEmail=${session?.user?.email}`,
                { method: "DELETE" }
            )

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message || "Delete failed")
                setShowDeleteConfirm(false)
                return
            }

            router.push("/dashboard/products")
        } catch (err) {
            setError("Could not connect to server")
        } finally {
            setDeleting(false)
        }
    }

    if (fetching) {
        return <p className="db-loading">Loading product...</p>
    }

    return (
        <div>
            <div className="db-breadcrumb">
                <Link href="/dashboard/products" className="db-breadcrumb-back">
                    ← Products
                </Link>
                <span className="db-breadcrumb-sep">/</span>
                <span className="db-breadcrumb-current">Edit product</span>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
                <div className="db-card db-card-body" style={{ marginBottom: 16 }}>
                    <div className="db-form-group">
                        <label className="db-label">
                            Product name <span className="db-label-required">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="db-input"
                        />
                    </div>

                    <div className="db-input-grid-2" style={{ marginBottom: 16 }}>
                        <div className="db-form-group" style={{ marginBottom: 0 }}>
                            <label className="db-label">
                                Price (₹) <span className="db-label-required">*</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                                className="db-input"
                            />
                        </div>
                        <div className="db-form-group" style={{ marginBottom: 0 }}>
                            <label className="db-label">
                                Stock <span className="db-label-required">*</span>
                            </label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                min="0"
                                className="db-input"
                            />
                        </div>
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="db-textarea"
                        />
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="db-input"
                        />
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">Product images</label>
                        <ImageUploadZone
                            imageUrls={imageUrls}
                            onImagesChange={setImageUrls}
                        />
                    </div>

                    <div className="db-toggle-row">
                        <span className="db-toggle-label">Show in store</span>
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className={`db-toggle ${isVisible ? "on" : "off"}`}
                        >
                            <span className="db-toggle-knob" />
                        </button>
                    </div>
                </div>

                {error && <p className="db-alert-error" style={{ marginBottom: 12 }}>{error}</p>}

                <div className="db-form-actions-spread">
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="db-btn-danger-outline"
                    >
                        Delete product
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Link href="/dashboard/products" className="db-btn-outline">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="db-btn-primary"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="db-modal-overlay">
                    <div className="db-modal">
                        <h3 className="db-modal-title">Delete product?</h3>
                        <p className="db-modal-body">
                            This action cannot be undone. If this product has existing orders
                            it will be hidden instead of deleted.
                        </p>
                        <div className="db-modal-actions">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="db-btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="db-btn-danger"
                            >
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}