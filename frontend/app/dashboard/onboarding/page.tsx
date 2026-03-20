"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [city, setCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Auto-generate slug from store name
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
            const res = await fetch("http://localhost:5000/api/store", {
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

            // Success — redirect to dashboard
            router.push("/dashboard")
        } catch (err) {
            setError("Could not connect to server. Make sure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-md">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center font-medium text-blue-700 mb-6">
                    S
                </div>
                <h1 className="text-xl font-medium mb-1">Create your store</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Set up your store in under 2 minutes
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Store name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Priya's Homemade Bakes"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Store URL <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            placeholder="priyas-bakes"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                        {slug && (
                            <p className="text-xs text-blue-600 mt-1">
                                storefront.app/shop/{slug}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell customers what you sell..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Bangalore"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Creating store..." : "Create store"}
                    </button>
                </form>
            </div>
        </div>
    )
}