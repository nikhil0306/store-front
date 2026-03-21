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

    // Fetch product data on load
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
        return <div className="text-sm text-gray-500">Loading product...</div>
    }

    return (
        <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href="/dashboard/products"
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Products
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium">Edit product</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Product name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Price (₹) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Stock <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                min="0"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Product images
                        </label>
                        <ImageUploadZone
                            imageUrls={imageUrls}
                            onImagesChange={setImageUrls}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Show in store</span>
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${isVisible ? "bg-gray-900" : "bg-gray-200"
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isVisible ? "translate-x-5" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                        Delete product
                    </button>
                    <div className="flex gap-2">
                        <Link
                            href="/dashboard/products"
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-2">Delete product?</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            This action cannot be undone. If this product has existing orders
                            it will be hidden instead of deleted.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
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