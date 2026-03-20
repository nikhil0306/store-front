"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

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
                    `http://localhost:5000/api/products?userEmail=${session.user?.email}`
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
        return <div className="text-sm text-gray-500">Loading products...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium">Products</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {products.length} product{products.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
                >
                    + Add product
                </Link>
            </div>

            {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    {error}
                </p>
            )}

            {products.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-400 text-sm mb-3">No products yet</p>
                    <Link
                        href="/dashboard/products/new"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Add your first product
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Product
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Price
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Stock
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                                                {product.imageUrls.length > 0 ? (
                                                    <img
                                                        src={product.imageUrls[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    "img"
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {product.name}
                                                </p>
                                                {product.category && (
                                                    <p className="text-xs text-gray-400">
                                                        {product.category}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        ₹{product.price.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{product.stock}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${product.isVisible
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {product.isVisible ? "Visible" : "Hidden"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/dashboard/products/${product.id}/edit`}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}