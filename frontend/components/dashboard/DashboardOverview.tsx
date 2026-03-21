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

const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    confirmed: "bg-blue-50 text-blue-700",
    packing: "bg-amber-50 text-amber-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-500",
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
            <h1 className="text-xl font-medium mb-1">Overview</h1>
            <p className="text-sm text-gray-500 mb-6">
                Welcome back! Here's what's happening with your store.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Revenue</p>
                    <p className="text-2xl font-medium">
                        {loading ? "—" : `₹${revenue.toFixed(0)}`}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Orders</p>
                    <p className="text-2xl font-medium">
                        {loading ? "—" : confirmedOrders}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pending</p>
                    <p className="text-2xl font-medium">
                        {loading ? "—" : orders.filter((o) => o.status === "confirmed").length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Delivered</p>
                    <p className="text-2xl font-medium">
                        {loading ? "—" : orders.filter((o) => o.status === "delivered").length}
                    </p>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Link
                    href="/dashboard/products/new"
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                    <p className="font-medium text-sm">+ Add product</p>
                    <p className="text-xs text-gray-400 mt-0.5">Upload photo, set price</p>
                </Link>
                <Link
                    href="/dashboard/orders"
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                    <p className="font-medium text-sm">View all orders</p>
                    <p className="text-xs text-gray-400 mt-0.5">Manage and fulfil orders</p>
                </Link>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-sm">Recent orders</p>
                    <Link href="/dashboard/orders" className="text-xs text-blue-600 hover:underline">
                        View all
                    </Link>
                </div>

                {loading ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        Loading orders...
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No orders yet
                    </div>
                ) : (
                    recentOrders.map((order) => (
                        <div
                            key={order.id}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{order.orderNumber}</p>
                                <p className="text-xs text-gray-400">
                                    {order.customerName} · {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                                </p>
                            </div>
                            <p className="text-sm font-medium">₹{order.total.toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}