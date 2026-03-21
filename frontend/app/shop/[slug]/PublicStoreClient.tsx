"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

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

    const router = useRouter()
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeCategory, setActiveCategory] = useState("All")
    const [showCart, setShowCart] = useState(false)

    const categories = [
        "All",
        ...Array.from(
            new Set(store.products.map((p) => p.category).filter(Boolean) as string[])
        ),
    ]

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

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((i) =>
                    i.productId === productId
                        ? { ...i, quantity: i.quantity + delta }
                        : i
                )
                .filter((i) => i.quantity > 0)
        )
    }

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

    // Save cart to localStorage on every change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                `storefront_cart_${store.slug}`,
                JSON.stringify(cart)
            )
        }
    }, [cart, store.slug])

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Store header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg shrink-0"
                            style={{ backgroundColor: store.themeColor || "#000" }}
                        >
                            {store.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-medium truncate">{store.name}</h1>
                            {store.description && (
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                    {store.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {store.city && (
                                    <span className="text-xs text-gray-400">{store.city}</span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {store.products.length} products
                                </span>
                                <span className="text-xs text-gray-400">
                                    UPI · Cards accepted
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto">
                        <div
                            className="flex gap-2 overflow-x-auto py-3 px-4"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition border min-h-[36px] ${activeCategory === cat
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
            <div className="max-w-2xl mx-auto px-4 py-4">
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
                                {/* Product image — square aspect ratio */}
                                <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                                    <div className="absolute inset-0">
                                        {product.imageUrls?.length > 0 ? (
                                            <img
                                                src={product.imageUrls[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product info */}
                                <div className="p-3">
                                    <p className="font-medium text-sm text-gray-900 leading-tight line-clamp-2">
                                        {product.name}
                                    </p>
                                    {product.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-1.5">
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
                                        className="w-full mt-2 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center py-6 pb-28">
                <p className="text-xs text-gray-300">Powered by StoreFront</p>
            </div>

            {/* Sticky cart bar */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20 safe-area-bottom">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="text-sm flex items-center gap-2"
                        >
                            <span className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                {cartCount}
                            </span>
                            <span className="font-medium">
                                ₹{cartTotal.toFixed(2)}
                            </span>
                            <span className="text-gray-400 text-xs">
                                {showCart ? "▼" : "▲"} View cart
                            </span>
                        </button>
                        <button
                            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition min-h-[40px]"
                            onClick={() => router.push(`/shop/${store.slug}/checkout`)}                        >
                            Checkout
                        </button>
                    </div>

                    {/* Cart drawer */}
                    {showCart && (
                        <div className="max-w-2xl mx-auto mt-3 border-t border-gray-100 pt-3 space-y-2">
                            {cart.map((item) => (
                                <div key={item.productId} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            ₹{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-7 h-7 rounded-full border border-gray-200 text-sm flex items-center justify-center hover:bg-gray-50"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm w-4 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-7 h-7 rounded-full border border-gray-200 text-sm flex items-center justify-center hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}