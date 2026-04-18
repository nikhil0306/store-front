"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function OnboardingPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [city, setCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleNameChange = (value: string) => {
        setName(value)
        const generatedSlug = value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 50)
        setSlug(generatedSlug)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name || !slug) {
            setError("Store name and URL are required")
            return
        }

        if (!session?.user?.email) {
            setError("You must be logged in")
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/store`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    city,
                    userEmail: session.user.email,
                    userName: session.user.name,
                    userImage: session.user.image,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message || "Something went wrong")
                return
            }

            router.push("/dashboard")
        } catch (err) {
            setError("Could not connect to server. Make sure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="db-onboarding-page">
            <div className="db-onboarding-card">
                <div className="db-onboarding-logo">S</div>
                <h1 className="db-page-title" style={{ marginBottom: 4 }}>Create your store</h1>
                <p className="db-page-subtitle" style={{ marginBottom: 28 }}>
                    Set up your store in under 2 minutes
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="db-form-group">
                        <label className="db-label">
                            Store name <span className="db-label-required">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Priya's Homemade Bakes"
                            className="db-input"
                        />
                    </div>

                    <div className="db-form-group">
                        <label className="db-label">
                            Store URL <span className="db-label-required">*</span>
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) =>
                                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            }
                            placeholder="priyas-bakes"
                            className="db-input"
                        />
                        {slug && (
                            <p className="db-slug-preview">
                                storefront.app/shop/{slug}
                            </p>
                        )}
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

                    {error && <p className="db-alert-error" style={{ marginBottom: 14 }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="db-btn-primary"
                        style={{ width: "100%" }}
                    >
                        {loading ? "Creating store..." : "Create store"}
                    </button>
                </form>
            </div>
        </div>
    )
}