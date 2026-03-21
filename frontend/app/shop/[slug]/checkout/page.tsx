"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
    imageUrl: string
}

export default function CheckoutPage() {
    const router = useRouter()
    const params = useParams()
    const slug = params.slug as string

    // Get cart from localStorage
    const getCart = (): CartItem[] => {
        if (typeof window === "undefined") return []
        try {
            const stored = localStorage.getItem(`storefront_cart_${slug}`)
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    }

    const cart = getCart()
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const deliveryFee = 50
    const total = subtotal + deliveryFee

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [pincode, setPincode] = useState("")
    const [note, setNote] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) newErrors.name = "Full name is required"
        if (!phone.trim()) newErrors.phone = "Phone number is required"
        else if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = "Enter a valid 10-digit mobile number"
        if (!address.trim()) newErrors.address = "Delivery address is required"
        if (!city.trim()) newErrors.city = "City is required"
        if (!pincode.trim()) newErrors.pincode = "Pincode is required"
        else if (!/^[1-9][0-9]{5}$/.test(pincode)) newErrors.pincode = "Enter a valid 6-digit pincode"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const loadCashfree = (): Promise<any> => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
            script.onload = () => {
                const cashfree = (window as any).Cashfree({
                    mode: "sandbox",
                })
                resolve(cashfree)
            }
            document.head.appendChild(script)
        })
    }


    const handleProceed = async () => {
        if (cart.length === 0) {
            router.push(`/shop/${slug}`)
            return
        }
        if (!validate()) return

        setLoading(true)
        setError("")

        try {
            // Get store details first
            const storeRes = await fetch(`http://localhost:5000/api/store/${slug}`)
            const storeData = await storeRes.json()

            if (!storeRes.ok) {
                setError("Store not found")
                return
            }

            // Create order
            const orderRes = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: storeData.id,
                    customerName: name,
                    customerPhone: phone,
                    customerEmail: email,
                    deliveryAddress: address,
                    deliveryCity: city,
                    deliveryPincode: pincode,
                    note,
                    items: cart.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                }),
            })

            const orderData = await orderRes.json()

            if (!orderRes.ok) {
                setError(orderData.error?.message || "Failed to create order")
                return
            }

            // Load Cashfree SDK and open payment
            const cashfree = await loadCashfree()

            const checkoutOptions = {
                paymentSessionId: orderData.paymentSessionId,
                returnUrl: `http://localhost:3000/shop/order-success?orderId=${orderData.orderId}&orderNumber=${orderData.orderNumber}`,
            }

            cashfree.checkout(checkoutOptions)

        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0) {
        router.push(`/shop/${slug}`)
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <span className="text-sm font-medium">Checkout</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Delivery form */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-medium mb-4">Delivery details</p>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Full name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Riya Sharma"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.name ? "border-red-300" : "border-gray-200 focus:border-gray-400"
                                    }`}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Phone number <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="98765 43210"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.phone ? "border-red-300" : "border-gray-200 focus:border-gray-400"
                                    }`}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Email (optional)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="riya@example.com"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Delivery address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Flat no, building, street"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.address ? "border-red-300" : "border-gray-200 focus:border-gray-400"
                                    }`}
                            />
                            {errors.address && (
                                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    City <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Bangalore"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.city ? "border-red-300" : "border-gray-200 focus:border-gray-400"
                                        }`}
                                />
                                {errors.city && (
                                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                    Pincode <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="560001"
                                    maxLength={6}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.pincode ? "border-red-300" : "border-gray-200 focus:border-gray-400"
                                        }`}
                                />
                                {errors.pincode && (
                                    <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Delivery note (optional)
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ring bell on arrival"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-medium mb-4">Order summary</p>

                    <div className="space-y-3 mb-4">
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
                                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Delivery fee</span>
                            <span>₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-100">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Pay button */}
                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleProceed}
                    disabled={loading}
                    className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                >
                    {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                </button>
            </div>
        </div>
    )
}