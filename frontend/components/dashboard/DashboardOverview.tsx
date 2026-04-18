"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Order {
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
    items: { productName: string; quantity: number }[]
}

const statusBadgeClass: Record<string, string> = {
    pending:   "db-badge db-badge-pending",
    confirmed: "db-badge db-badge-confirmed",
    packing:   "db-badge db-badge-packing",
    delivered: "db-badge db-badge-delivered",
    cancelled: "db-badge db-badge-cancelled",
}

export default function DashboardOverview({ userEmail }: { userEmail: string }) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userEmail) return
        const fetchOrders = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/orders?userEmail=${userEmail}`
                )
                const data = await res.json()
                if (res.ok) setOrders(data.orders)
            } catch (err) {
                console.error("Failed to fetch orders:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [userEmail])

    const revenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0)

    const confirmedOrders = orders.filter((o) => o.status !== "cancelled").length
    const recentOrders = orders.slice(0, 4)

    return (
        <div>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Overview</h1>
                    <p className="db-page-subtitle">
                        Welcome back! Here's what's happening with your store.
                    </p>
                </div>
                <Link href="/dashboard/products/new" className="db-btn-primary">
                    + Add product
                </Link>
            </div>

            {/* Metrics */}
            <div className="db-metrics-grid">
                <div className="db-metric-card">
                    <p className="db-metric-label">Revenue</p>
                    <p className="db-metric-value">
                        {loading ? "—" : `₹${revenue.toFixed(0)}`}
                    </p>
                </div>
                <div className="db-metric-card">
                    <p className="db-metric-label">Orders</p>
                    <p className="db-metric-value">
                        {loading ? "—" : confirmedOrders}
                    </p>
                </div>
                <div className="db-metric-card">
                    <p className="db-metric-label">Pending</p>
                    <p className="db-metric-value">
                        {loading ? "—" : orders.filter((o) => o.status === "confirmed").length}
                    </p>
                </div>
                <div className="db-metric-card">
                    <p className="db-metric-label">Delivered</p>
                    <p className="db-metric-value">
                        {loading ? "—" : orders.filter((o) => o.status === "delivered").length}
                    </p>
                </div>
            </div>

            {/* Quick actions */}
            <div className="db-actions-grid">
                <Link href="/dashboard/products/new" className="db-action-card">
                    <p className="db-action-title">＋ Add product</p>
                    <p className="db-action-sub">Upload photo, set price</p>
                </Link>
                <Link href="/dashboard/orders" className="db-action-card">
                    <p className="db-action-title">📦 View all orders</p>
                    <p className="db-action-sub">Manage and fulfil orders</p>
                </Link>
            </div>

            {/* Recent orders */}
            <div className="db-card">
                <div className="db-card-header">
                    <p className="db-card-title">Recent orders</p>
                    <Link href="/dashboard/orders" className="db-link">
                        View all
                    </Link>
                </div>

                {loading ? (
                    <p className="db-loading">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                    <div className="db-empty">
                        <p className="db-empty-icon">🛒</p>
                        <p className="db-empty-title">No orders yet</p>
                        <p className="db-empty-sub">
                            Orders will appear here after customers checkout
                        </p>
                    </div>
                ) : (
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} style={{ cursor: "default" }}>
                                        <td>
                                            <p className="db-td-primary">{order.orderNumber}</p>
                                            <p className="db-td-secondary">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                            </p>
                                        </td>
                                        <td className="db-td-primary">{order.customerName}</td>
                                        <td className="db-td-primary">₹{order.total.toFixed(2)}</td>
                                        <td>
                                            <span className={statusBadgeClass[order.status] ?? "db-badge db-badge-pending"}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}