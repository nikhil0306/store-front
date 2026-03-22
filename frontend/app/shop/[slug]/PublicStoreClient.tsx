"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "../shop.css"

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
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
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
                    i.productId === productId ? { ...i, quantity: i.quantity + delta } : i
                )
                .filter((i) => i.quantity > 0)
        )
    }

    // Persist cart to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                `storefront_cart_${store.slug}`,
                JSON.stringify(cart)
            )
        }
    }, [cart, store.slug])

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <div className="shop-page">

            {/* ── Header ── */}
            <header className="shop-header">
                <div className="shop-header-inner">
                    <div
                        className="shop-avatar"
                        style={{ backgroundColor: store.themeColor || "#1A1A1A" }}
                    >
                        {store.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 className="shop-store-name">{store.name}</h1>
                        {store.description && (
                            <p className="shop-store-desc">{store.description}</p>
                        )}
                        <div className="shop-meta">
                            {store.city && (
                                <span className="shop-meta-tag">{store.city}</span>
                            )}
                            <span className="shop-meta-tag">
                                {store.products.length} products
                            </span>
                            <span className="shop-meta-tag">UPI · Cards accepted</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Category filter ── */}
            {categories.length > 1 && (
                <div className="shop-filters">
                    <div className="shop-filters-inner">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`filter-pill${activeCategory === cat ? " active" : ""}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Products ── */}
            <main className="shop-body">
                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products in this category</p>
                        <span>Check back soon!</span>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-image-wrap">
                                    {product.imageUrls?.length > 0 ? (
                                        <img src={product.imageUrls[0]} alt={product.name} />
                                    ) : (
                                        <div className="product-no-image">No image</div>
                                    )}
                                    {product.stock === 0 && (
                                        <span className="out-of-stock-badge">Out of stock</span>
                                    )}
                                </div>
                                <div className="product-info">
                                    <p className="product-name">{product.name}</p>
                                    {product.description && (
                                        <p className="product-desc">{product.description}</p>
                                    )}
                                    <div className="product-price-row">
                                        <span className="product-price">
                                            ₹{product.price.toFixed(2)}
                                        </span>
                                        <button
                                            className="btn-add-cart"
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? "Sold out" : "Add"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Footer ── */}
            <footer className="shop-footer">
                <p>
                    Powered by <a href="/">StoreFront</a> · All rights reserved © {new Date().getFullYear()}
                </p>
            </footer>

            {/* ── Cart bar ── */}
            {cartCount > 0 && (
                <div className="cart-bar">
                    <div className="cart-bar-inner">
                        <div className="cart-bar-main">
                            <div
                                className="cart-bar-left"
                                onClick={() => setShowCart(!showCart)}
                            >
                                <div className="cart-count-badge">{cartCount}</div>
                                <div>
                                    <span className="cart-total">₹{cartTotal.toFixed(2)}</span>
                                    <span className="cart-item-count" style={{ marginLeft: 6 }}>
                                        {cartCount} item{cartCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <span className="cart-toggle-hint">
                                    {showCart ? "▼ Hide" : "▲ View cart"}
                                </span>
                            </div>
                            <button
                                className="btn-checkout"
                                onClick={() => router.push(`/shop/${store.slug}/checkout`)}
                            >
                                Checkout →
                            </button>
                        </div>

                        {/* Cart drawer */}
                        {showCart && (
                            <div className="cart-drawer">
                                {cart.map((item) => (
                                    <div key={item.productId} className="cart-item">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="cart-item-img"
                                            />
                                        ) : (
                                            <div
                                                className="cart-item-img"
                                                style={{ background: "var(--color-bg)" }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p className="cart-item-name">{item.name}</p>
                                            <p className="cart-item-price">
                                                ₹{item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="qty-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.productId, -1)}
                                            >
                                                −
                                            </button>
                                            <span className="qty-num">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.productId, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}