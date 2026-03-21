"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")
    const orderNumber = searchParams.get("orderNumber")
    const [verifying, setVerifying] = useState(true)
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!orderId) {
            setVerifying(false)
            setError("Order not found")
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/orders/${orderId}/verify-payment`,
                    { method: "POST" }
                )
                const data = await res.json()

                if (res.ok && data.success) {
                    setVerified(true)
                    // Clear cart from localStorage
                    const keys = Object.keys(localStorage).filter((k) =>
                        k.startsWith("storefront_cart_")
                    )
                    keys.forEach((k) => localStorage.removeItem(k))
                } else {
                    setError(data.error?.message || "Payment verification failed")
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Verifying your payment...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-xl">✕</span>
                    </div>
                    <h1 className="text-lg font-medium mb-2">Payment failed</h1>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-xl">✓</span>
                </div>
                <h1 className="text-lg font-medium mb-1">Order confirmed!</h1>
                <p className="text-sm text-gray-500 mb-2">
                    Thank you for your order
                </p>
                {orderNumber && (
                    <p className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-6">
                        Order #{orderNumber}
                    </p>
                )}
                <p className="text-xs text-gray-400 mb-6">
                    The seller has been notified and will prepare your order shortly.
                </p>
                <Link
                    href="/"
                    className="block w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
                >
                    Back to home
                </Link>
            </div>
        </div>
    )
}