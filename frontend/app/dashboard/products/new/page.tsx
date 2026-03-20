"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
            const res = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: session?.user?.email,
                    name,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    description,
                    category,
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
        <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href="/dashboard/products"
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Products
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium">New product</span>
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
                            placeholder="Dark chocolate truffle box"
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
                                placeholder="850"
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
                                placeholder="20"
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
                            placeholder="Tell customers about this product..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Chocolates, Cakes, Cupcakes..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <Link
                        href="/dashboard/products"
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !name || !price || !stock}
                        className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save product"}
                    </button>
                </div>
            </form>
        </div>
    )
}