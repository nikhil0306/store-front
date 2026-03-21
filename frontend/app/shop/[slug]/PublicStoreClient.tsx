"use client"

import { useState } from "react"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    description: string | null
    category: string | null
    imageUrls: string[]
}

interface Store {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    city: string | null
    themeColor: string
    products: Product[]
}

interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
    imageUrl: string
}

export default function PublicStoreClient({ store }: { store: Store }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeCategory, setActiveCategory] = useState("All")

    // Get unique categories
    const categories = [
        "All",
        ...Array.from(
            new Set(store.products.map((p) => p.category).filter(Boolean) as string[])
        ),
    ]

    // Filter products by category
    const filteredProducts =
        activeCategory === "All"
            ? store.products
            : store.products.filter((p) => p.category === activeCategory)

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.productId === product.id)
            if (existing) {
                return prev.map((i) =>
                    i.productId === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    imageUrl: product.imageUrls?.[0] || "",
                },
            ]
        })
    }

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Store header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-xl"
                            style={{ backgroundColor: store.themeColor || "#000" }}
                        >
                            {store.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-medium">{store.name}</h1>
                            {store.description && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {store.description}
                                </p>
                            )}
                            <div className="flex gap-3 mt-1">
                                {store.city && (
                                    <span className="text-xs text-gray-400">{store.city}</span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {store.products.length} products
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition border ${activeCategory === cat
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Products grid */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-sm">No products available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                            >
                                {/* Product image */}
                                <div className="aspect-square bg-gray-100">
                                    {product.imageUrls?.length > 0 ? (
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Product info */}
                                <div className="p-3">
                                    <p className="font-medium text-sm text-gray-900 leading-tight">
                                        {product.name}
                                    </p>
                                    {product.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-medium text-sm">
                                            ₹{product.price.toFixed(2)}
                                        </span>
                                        {product.stock === 0 && (
                                            <span className="text-xs text-red-400">Out of stock</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock === 0}
                                        className="w-full mt-2 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky cart bar */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="text-sm">
                            <span className="font-medium">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                            <span className="text-gray-500 ml-2">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
                            onClick={() => alert("Checkout coming in Week 3!")}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="text-center py-8 pb-24">
                <p className="text-xs text-gray-300">Powered by StoreFront</p>
            </div>
        </div>
    )
}