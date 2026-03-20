"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

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

    // Fetch current store data on page load
    useEffect(() => {
        if (!session?.user?.email) return

        const fetchStore = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/store/me?userEmail=${session.user?.email}`
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
            const res = await fetch("http://localhost:5000/api/store/me", {
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
        return (
            <div className="text-sm text-gray-500">Loading store settings...</div>
        )
    }

    return (
        <div className="max-w-lg">
            <h1 className="text-xl font-medium mb-1">Store settings</h1>
            <p className="text-sm text-gray-500 mb-6">
                Update your store information
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Store name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Priya's Homemade Bakes"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
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

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Theme colour
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                            />
                            <span className="text-sm text-gray-500 font-mono">
                                {themeColor}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        ✓ Store settings saved successfully
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || !name}
                    className="bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save changes"}
                </button>
            </form>
        </div>
    )
}