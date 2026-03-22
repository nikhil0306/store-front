"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import "../../shop.css"
import "./checkout.css"

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

    const getCart = (): CartItem[] => {
        if (typeof window === "undefined") return []
        try {
            const stored = localStorage.getItem(`storefront_cart_${slug}`)
            return stored ? JSON.parse(stored) : []
        } catch { return [] }
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
        const e: Record<string, string> = {}
        if (!name.trim()) e.name = "Full name is required"
        if (!phone.trim()) e.phone = "Phone number is required"
        else if (!/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter a valid 10-digit mobile number"
        if (!address.trim()) e.address = "Delivery address is required"
        if (!city.trim()) e.city = "City is required"
        if (!pincode.trim()) e.pincode = "Pincode is required"
        else if (!/^[1-9][0-9]{5}$/.test(pincode)) e.pincode = "Enter a valid 6-digit pincode"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const loadCashfree = (): Promise<any> => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
            script.onload = () => {
                const cashfree = (window as any).Cashfree({ mode: "sandbox" })
                resolve(cashfree)
            }
            document.head.appendChild(script)
        })
    }

    const handleProceed = async () => {
        if (cart.length === 0) { router.push(`/shop/${slug}`); return }
        if (!validate()) return
        setLoading(true)
        setError("")
        try {
            const storeRes = await fetch(`http://localhost:5000/api/store/${slug}`)
            const storeData = await storeRes.json()
            if (!storeRes.ok) { setError("Store not found"); return }

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
                    items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                }),
            })
            const orderData = await orderRes.json()
            if (!orderRes.ok) { setError(orderData.error?.message || "Failed to create order"); return }

            const cashfree = await loadCashfree()
            cashfree.checkout({
                paymentSessionId: orderData.paymentSessionId,
                returnUrl: `http://localhost:3000/shop/order-success?orderId=${orderData.orderId}&orderNumber=${orderData.orderNumber}`,
            })
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0) { router.push(`/shop/${slug}`); return null }

    return (
        <div className="checkout-page">
            {/* Header */}
            <header className="checkout-header">
                <div className="checkout-header-inner">
                    <button onClick={() => router.back()} className="checkout-back">
                        ← Back
                    </button>
                    <span className="checkout-title">Checkout</span>
                    <div className="checkout-header-right" />
                </div>
            </header>

            <div className="checkout-body">
                {/* Left — Delivery form (60%) */}
                <div className="checkout-left">
                    <div className="checkout-card">
                        <h2 className="checkout-section-title">Delivery details</h2>

                        <div className="form-grid">
                            <div className="form-field full">
                                <label>Full name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Riya Sharma"
                                    className={errors.name ? "error" : ""}
                                />
                                {errors.name && <span className="field-error">{errors.name}</span>}
                            </div>

                            <div className="form-field">
                                <label>Phone number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="98765 43210"
                                    className={errors.phone ? "error" : ""}
                                />
                                {errors.phone && <span className="field-error">{errors.phone}</span>}
                            </div>

                            <div className="form-field">
                                <label>Email <span className="optional">(optional)</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="riya@example.com"
                                />
                            </div>

                            <div className="form-field full">
                                <label>Delivery address <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Flat no, building, street"
                                    className={errors.address ? "error" : ""}
                                />
                                {errors.address && <span className="field-error">{errors.address}</span>}
                            </div>

                            <div className="form-field">
                                <label>City <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Bangalore"
                                    className={errors.city ? "error" : ""}
                                />
                                {errors.city && <span className="field-error">{errors.city}</span>}
                            </div>

                            <div className="form-field">
                                <label>Pincode <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="560001"
                                    maxLength={6}
                                    className={errors.pincode ? "error" : ""}
                                />
                                {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                            </div>

                            <div className="form-field full">
                                <label>Delivery note <span className="optional">(optional)</span></label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ring bell on arrival, leave at door, etc."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Order summary (40%) */}
                <div className="checkout-right">
                    <div className="checkout-card sticky-summary">
                        <h2 className="checkout-section-title">Order summary</h2>

                        <div className="order-items">
                            {cart.map((item) => (
                                <div key={item.productId} className="order-item">
                                    <div className="order-item-img">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} />
                                        ) : (
                                            <div className="order-item-img-placeholder" />
                                        )}
                                    </div>
                                    <div className="order-item-info">
                                        <p className="order-item-name">{item.name}</p>
                                        <p className="order-item-qty">×{item.quantity}</p>
                                    </div>
                                    <p className="order-item-total">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="order-totals">
                            <div className="order-total-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="order-total-row">
                                <span>Delivery fee</span>
                                <span>₹{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="order-total-row grand-total">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && <p className="checkout-error">{error}</p>}

                        <button
                            onClick={handleProceed}
                            disabled={loading}
                            className="btn-pay"
                        >
                            {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                        </button>

                        <p className="secure-note">
                            Secured by Cashfree · 256-bit encryption
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="shop-footer">
                <p>Powered by <a href="/">StoreFront</a> · All rights reserved © {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}