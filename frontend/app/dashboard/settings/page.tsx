"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { API_URL } from "@/lib/api"

export default function SettingsPage() {
    const { data: session } = useSession()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [city, setCity] = useState("")
    const [themeColor, setThemeColor] = useState("#000000")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!session?.user?.email) return

        const fetchStore = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/store/me?userEmail=${session.user?.email}`
                )
                const data = await res.json()

                if (res.ok) {
                    setName(data.name || "")
                    setDescription(data.description || "")
                    setCity(data.city || "")
                    setThemeColor(data.themeColor || "#000000")
                }
            } catch (err) {
                setError("Could not load store data")
            } finally {
                setFetching(false)
            }
        }

        fetchStore()
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/store/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: session?.user?.email,
                    name,
                    description,
                    city,
                    themeColor,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message || "Something went wrong")
                return
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError("Could not connect to server")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <p className="db-loading">Loading store settings...</p>
    }

    return (
        <div>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Store settings</h1>
                    <p className="db-page-subtitle">Update your store information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
                <div className="db-card db-card-body" style={{ marginBottom: 16 }}>
                    <div className="db-form-group">
                        <label className="db-label">
                            Store name <span className="db-label-required">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Priya's Homemade Bakes"
                            className="db-input"
                        />
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell customers what you sell..."
                            rows={3}
                            className="db-textarea"
                        />
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Bangalore"
                            className="db-input"
                        />
                    </div>

                    <div className="db-form-group" style={{ marginBottom: 0 }}>
                        <label className="db-label">Theme colour</label>
                        <div className="db-color-row">
                            <input
                                type="color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="db-color-input"
                            />
                            <span className="db-color-value">{themeColor}</span>
                        </div>
                    </div>
                </div>

                {error && <p className="db-alert-error" style={{ marginBottom: 12 }}>{error}</p>}
                {success && <p className="db-alert-success" style={{ marginBottom: 12 }}>✓ Settings saved successfully</p>}

                <div className="db-form-actions" style={{ justifyContent: "flex-start" }}>
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="db-btn-primary"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}