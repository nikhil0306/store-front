"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import "../shop.css"
import "./order-success.css"
import { API_URL } from "@/lib/api"

interface OrderItem {
    id: string
    productName: string
    quantity: number
    unitPrice: number
    lineTotal: number
}

interface Order {
    id: string
    orderNumber: string
    status: string
    customerName: string
    customerPhone: string
    deliveryAddress: string
    deliveryCity: string
    deliveryPincode: string
    subtotal: number
    deliveryFee: number
    total: number
    items: OrderItem[]
    createdAt: string
}

const statusLabel: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    packing: "Being packed",
    delivered: "Delivered",
    cancelled: "Cancelled",
}

const statusColor: Record<string, string> = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    packing: "status-packing",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
}

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get("orderId")
    const orderNumber = searchParams.get("orderNumber")

    const [verifying, setVerifying] = useState(true)
    const [verified, setVerified] = useState(false)
    const [order, setOrder] = useState<Order | null>(null)
    const [storeSlug, setStoreSlug] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        if (!orderId) {
            setVerifying(false)
            setError("Order not found")
            return
        }

        const verifyPayment = async () => {
            try {
                // Verify payment
                const verifyRes = await fetch(
                    `${API_URL}/api/orders/${orderId}/verify-payment`,
                    { method: "POST" }
                )
                const verifyData = await verifyRes.json()

                if (!verifyRes.ok || !verifyData.success) {
                    setError(verifyData.error?.message || "Payment verification failed")
                    return
                }

                // Fetch full order details
                const orderRes = await fetch(
                    `${API_URL}/api/orders/${orderId}`
                )
                const orderData = await orderRes.json()

                if (orderRes.ok) {
                    setOrder(orderData)
                    setVerified(true)

                    // Clear cart
                    const keys = Object.keys(localStorage).filter((k) =>
                        k.startsWith("storefront_cart_")
                    )
                    keys.forEach((k) => {
                        const slug = k.replace("storefront_cart_", "")
                        setStoreSlug(slug)
                        localStorage.removeItem(k)
                    })
                }
            } catch (err) {
                setError("Could not verify payment")
            } finally {
                setVerifying(false)
            }
        }

        verifyPayment()
    }, [orderId])

    if (verifying) {
        return (
            <div className="success-page">
                <div className="success-loading">
                    <div className="spinner" />
                    <p>Verifying your payment...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="success-page">
                <div className="success-container">
                    <div className="success-card">
                        <div className="status-icon failed">✕</div>
                        <h1 className="success-title">Payment failed</h1>
                        <p className="success-sub">{error}</p>
                        <button
                            onClick={() => window.history.back()}
                            className="btn-shop-more"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="success-page">
            {/* Header */}
            <header className="success-header">
                <div className="success-header-inner">
                    <span className="success-header-brand">StoreFront</span>
                </div>
            </header>

            <div className="success-container">
                {/* Confirmation card */}
                <div className="success-card">
                    <div className="status-icon confirmed">✓</div>
                    <h1 className="success-title">Order confirmed!</h1>
                    <p className="success-sub">
                        Thank you{order?.customerName ? `, ${order.customerName}` : ""}! Your order has been placed successfully.
                    </p>

                    {/* Order number + status */}
                    <div className="order-meta-row">
                        <div className="order-meta-item">
                            <span className="order-meta-label">Order number</span>
                            <span className="order-meta-value mono">
                                {order?.orderNumber || orderNumber}
                            </span>
                        </div>
                        <div className="order-meta-item">
                            <span className="order-meta-label">Status</span>
                            <span className={`order-status-badge ${statusColor[order?.status || "confirmed"]}`}>
                                {statusLabel[order?.status || "confirmed"]}
                            </span>
                        </div>
                        <div className="order-meta-item">
                            <span className="order-meta-label">Date</span>
                            <span className="order-meta-value">
                                {order?.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric"
                                    })
                                    : new Date().toLocaleDateString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items ordered */}
                {order?.items && order.items.length > 0 && (
                    <div className="success-card">
                        <h2 className="section-title">Items ordered</h2>
                        <div className="items-list">
                            {order.items.map((item) => (
                                <div key={item.id} className="item-row">
                                    <div className="item-info">
                                        <p className="item-name">{item.productName}</p>
                                        <p className="item-qty">×{item.quantity} · ₹{item.unitPrice.toFixed(2)} each</p>
                                    </div>
                                    <p className="item-total">₹{item.lineTotal.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Delivery fee</span>
                                <span>₹{order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="total-row grand">
                                <span>Total paid</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery details */}
                {order && (
                    <div className="success-card">
                        <h2 className="section-title">Delivery details</h2>
                        <div className="delivery-info">
                            <div className="delivery-row">
                                <span className="delivery-label">Name</span>
                                <span className="delivery-value">{order.customerName}</span>
                            </div>
                            <div className="delivery-row">
                                <span className="delivery-label">Phone</span>
                                <span className="delivery-value">{order.customerPhone}</span>
                            </div>
                            <div className="delivery-row">
                                <span className="delivery-label">Address</span>
                                <span className="delivery-value">
                                    {order.deliveryAddress}, {order.deliveryCity} — {order.deliveryPincode}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="success-actions">
                    {storeSlug && (
                        <button
                            onClick={() => router.push(`/shop/${storeSlug}`)}
                            className="btn-shop-more"
                        >
                            Shop more
                        </button>
                    )}
                    <button
                        onClick={() => router.push("/")}
                        className="btn-home"
                    >
                        Go to home
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="shop-footer" style={{ marginTop: "auto" }}>
                <p>Powered by <a href="/">StoreFront</a> · All rights reserved © {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}