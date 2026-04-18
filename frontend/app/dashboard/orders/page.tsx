"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

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
    customerName: string
    customerPhone: string
    customerEmail: string | null
    deliveryAddress: string
    deliveryCity: string
    deliveryPincode: string
    note: string | null
    subtotal: number
    deliveryFee: number
    total: number
    status: string
    paymentStatus: string
    createdAt: string
    items: OrderItem[]
}

const statusBadgeClass: Record<string, string> = {
    pending:   "db-badge db-badge-pending",
    confirmed: "db-badge db-badge-confirmed",
    packing:   "db-badge db-badge-packing",
    delivered: "db-badge db-badge-delivered",
    cancelled: "db-badge db-badge-cancelled",
}

const nextStatus: Record<string, string> = {
    confirmed: "packing",
    packing:   "delivered",
}

export default function OrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        if (!session?.user?.email) return
        fetchOrders()
    }, [session])

    const fetchOrders = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/orders?userEmail=${session?.user?.email}`
            )
            const data = await res.json()
            if (res.ok) setOrders(data.orders)
        } catch (err) {
            console.error("Failed to fetch orders:", err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId: string, status: string) => {
        setUpdatingId(orderId)
        try {
            const res = await fetch(
                `http://localhost:5000/api/orders/${orderId}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            )
            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status } : o))
                )
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev) => prev ? { ...prev, status } : null)
                }
            }
        } catch (err) {
            console.error("Failed to update status:", err)
        } finally {
            setUpdatingId(null)
        }
    }

    if (loading) return <p className="db-loading">Loading orders...</p>

    return (
        <div>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Orders</h1>
                    <p className="db-page-subtitle">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} total
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="db-card">
                    <div className="db-empty">
                        <p className="db-empty-icon">📬</p>
                        <p className="db-empty-title">No orders yet</p>
                        <p className="db-empty-sub">Orders will appear here after customers checkout</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Desktop table ── */}
                    <div className="db-card db-orders-desktop-only">
                        <div className="db-table-wrap">
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                                            <td>
                                                <p className="db-td-primary">{order.orderNumber}</p>
                                                <p className="db-td-secondary">
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                                </p>
                                            </td>
                                            <td>
                                                <p className="db-td-primary">{order.customerName}</p>
                                                <p className="db-td-secondary">{order.customerPhone}</p>
                                            </td>
                                            <td className="db-td-primary">₹{order.total.toFixed(2)}</td>
                                            <td>
                                                <span className={statusBadgeClass[order.status] ?? "db-badge db-badge-pending"}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                {nextStatus[order.status] && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            updateStatus(order.id, nextStatus[order.status])
                                                        }}
                                                        disabled={updatingId === order.id}
                                                        className="db-mark-btn"
                                                    >
                                                        {updatingId === order.id ? "Updating..." : `→ ${nextStatus[order.status]}`}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Mobile card list ── */}
                    <div className="db-orders-mobile-only">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="db-order-card"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="db-order-card-top">
                                    <div className="db-order-card-info">
                                        <p className="db-order-card-num">{order.orderNumber}</p>
                                        <p className="db-order-card-meta">
                                            {order.customerName} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="db-order-card-right">
                                        <p className="db-order-card-total">₹{order.total.toFixed(2)}</p>
                                        <span className={statusBadgeClass[order.status] ?? "db-badge db-badge-pending"}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Order detail MODAL (desktop + mobile) ── */}
                    {selectedOrder && (
                        <div className="db-modal-overlay" onClick={() => setSelectedOrder(null)}>
                            <div className="db-order-modal" onClick={(e) => e.stopPropagation()}>
                                {/* Header */}
                                <div className="db-order-modal-header">
                                    <div>
                                        <p className="db-order-modal-num">{selectedOrder.orderNumber}</p>
                                        <p className="db-order-modal-date">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className={statusBadgeClass[selectedOrder.status]}>
                                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                        </span>
                                        <button onClick={() => setSelectedOrder(null)} className="db-detail-close">✕</button>
                                    </div>
                                </div>

                                <div className="db-order-modal-body">
                                    {/* Customer */}
                                    <div className="db-order-modal-section">
                                        <p className="db-detail-section-label">Customer</p>
                                        <p className="db-detail-text">{selectedOrder.customerName}</p>
                                        <p className="db-detail-sub">{selectedOrder.customerPhone}</p>
                                        {selectedOrder.customerEmail && (
                                            <p className="db-detail-sub">{selectedOrder.customerEmail}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="db-order-modal-section">
                                        <p className="db-detail-section-label">Delivery address</p>
                                        <p className="db-detail-sub">
                                            {selectedOrder.deliveryAddress}, {selectedOrder.deliveryCity} — {selectedOrder.deliveryPincode}
                                        </p>
                                    </div>

                                    {/* Note */}
                                    {selectedOrder.note && (
                                        <div className="db-order-modal-section">
                                            <p className="db-detail-section-label">Note</p>
                                            <p className="db-detail-sub">{selectedOrder.note}</p>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div className="db-order-modal-section">
                                        <p className="db-detail-section-label">Items</p>
                                        <div className="db-order-modal-items">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="db-order-modal-item-row">
                                                    <span>{item.productName} <span className="db-order-modal-qty">×{item.quantity}</span></span>
                                                    <span>₹{item.lineTotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="db-order-modal-totals">
                                        <div className="db-detail-line">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="db-detail-line">
                                            <span>Delivery</span>
                                            <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="db-detail-line total">
                                            <span>Total</span>
                                            <span>₹{selectedOrder.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer — mark as action */}
                                {nextStatus[selectedOrder.status] && (
                                    <div className="db-order-modal-footer">
                                        <button
                                            onClick={() => updateStatus(selectedOrder.id, nextStatus[selectedOrder.status])}
                                            disabled={updatingId === selectedOrder.id}
                                            className="db-btn-primary"
                                            style={{ width: "100%", justifyContent: "center" }}
                                        >
                                            {updatingId === selectedOrder.id
                                                ? "Updating..."
                                                : `Mark as ${nextStatus[selectedOrder.status]}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}