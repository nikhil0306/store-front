"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

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

const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    confirmed: "bg-blue-50 text-blue-700",
    packing: "bg-amber-50 text-amber-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-500",
}

const nextStatus: Record<string, string> = {
    confirmed: "packing",
    packing: "delivered",
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

    if (loading) {
        return <div className="text-sm text-gray-500">Loading orders...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium">Orders</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} total
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-400 text-sm">No orders yet</p>
                    <p className="text-xs text-gray-300 mt-1">
                        Orders will appear here after customers checkout
                    </p>
                </div>
            ) : (
                <div className="flex gap-4">
                    {/* Orders list */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Order</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${selectedOrder?.id === order.id ? "bg-blue-50" : ""
                                            }`}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{order.orderNumber}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{order.customerName}</p>
                                            <p className="text-xs text-gray-400">{order.customerPhone}</p>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            ₹{order.total.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-500"}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {nextStatus[order.status] && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateStatus(order.id, nextStatus[order.status])
                                                    }}
                                                    disabled={updatingId === order.id}
                                                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                                                >
                                                    {updatingId === order.id
                                                        ? "Updating..."
                                                        : `Mark as ${nextStatus[order.status]}`}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order detail panel */}
                    {selectedOrder && (
                        <div className="w-72 bg-white border border-gray-200 rounded-xl p-4 self-start shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-medium text-sm">{selectedOrder.orderNumber}</p>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Customer</p>
                                    <p className="font-medium">{selectedOrder.customerName}</p>
                                    <p className="text-gray-500">{selectedOrder.customerPhone}</p>
                                    {selectedOrder.customerEmail && (
                                        <p className="text-gray-500 text-xs">{selectedOrder.customerEmail}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Delivery address</p>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {selectedOrder.deliveryAddress}, {selectedOrder.deliveryCity} - {selectedOrder.deliveryPincode}
                                    </p>
                                </div>

                                {selectedOrder.note && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Note</p>
                                        <p className="text-gray-600 text-xs">{selectedOrder.note}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Items</p>
                                    <div className="space-y-1">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    {item.productName} ×{item.quantity}
                                                </span>
                                                <span className="font-medium">₹{item.lineTotal.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-2 space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Delivery</span>
                                        <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Total</span>
                                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Status</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedOrder.status]}`}>
                                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                    </span>
                                </div>

                                {nextStatus[selectedOrder.status] && (
                                    <button
                                        onClick={() => updateStatus(selectedOrder.id, nextStatus[selectedOrder.status])}
                                        disabled={updatingId === selectedOrder.id}
                                        className="w-full py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                    >
                                        {updatingId === selectedOrder.id
                                            ? "Updating..."
                                            : `Mark as ${nextStatus[selectedOrder.status]}`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}