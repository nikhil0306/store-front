"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUploadZone from "@/components/dashboard/ImageUploadZone"
import { API_URL } from "@/lib/api"

export default function NewProductPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [imageUrls, setImageUrls] = useState<string[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name || !price || !stock) {
            setError("Name, price and stock are required")
            return
        }

        if (parseFloat(price) < 0) {
            setError("Price must be 0 or more")
            return
        }

        if (parseInt(stock) < 0) {
            setError("Stock must be 0 or more")
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: session?.user?.email,
                    name,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    description,
                    category,
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

    return (
        <div>
            <div className="db-breadcrumb">
                <Link href="/dashboard/products" className="db-breadcrumb-back">
                    ← Products
                </Link>
                <span className="db-breadcrumb-sep">/</span>
                <span className="db-breadcrumb-current">New product</span>
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
                            placeholder="Dark chocolate truffle box"
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
                                placeholder="850"
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
                                placeholder="20"
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
                            placeholder="Tell customers about this product..."
                            rows={3}
                            className="db-textarea"
                        />
                    </div>

                    <div className="db-form-group" style={{ marginBottom: 0 }}>
                        <label className="db-label">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Chocolates, Cakes, Cupcakes..."
                            className="db-input"
                        />
                    </div>
                </div>

                {/* AI Copy Writer — Currently Unavailable */}
                <div className="db-ai-section" style={{ marginBottom: 16 }}>
                    <div className="db-ai-overlay">
                        <span className="db-ai-overlay-label">Currently unavailable</span>
                    </div>
                    <div className="db-ai-body">
                        <p className="db-ai-label">AI Generator</p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                disabled
                                placeholder="Product Information"
                                className="db-input"
                                style={{ flex: 1 }}
                            />
                            <button type="button" disabled className="db-btn-primary" style={{ opacity: 0.5 }}>
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="db-form-group">
                    <label className="db-label">Product images</label>
                    <ImageUploadZone
                        imageUrls={imageUrls}
                        onImagesChange={setImageUrls}
                    />
                </div>

                {error && <p className="db-alert-error" style={{ marginBottom: 12 }}>{error}</p>}

                <div className="db-form-actions">
                    <Link href="/dashboard/products" className="db-btn-outline">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !name || !price || !stock}
                        className="db-btn-primary"
                    >
                        {loading ? "Saving..." : "Save product"}
                    </button>
                </div>
            </form>
        </div>
    )
}