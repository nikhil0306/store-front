"use client"

import { useState, useRef } from "react"
import { API_URL } from "@/lib/api"

interface Props {
    imageUrls: string[]
    onImagesChange: (urls: string[]) => void
}

export default function ImageUploadZone({ imageUrls, onImagesChange }: Props) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        if (imageUrls.length >= 3) {
            setError("Maximum 3 images allowed")
            return
        }

        const file = files[0]

        // Validate file type
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("Only JPG and PNG files allowed")
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB")
            return
        }

        setError("")
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch(`${API_URL}/api/upload/image`, {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message || "Upload failed")
                return
            }

            onImagesChange([...imageUrls, data.url])
        } catch (err) {
            setError("Could not connect to server")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = (index: number) => {
        const updated = imageUrls.filter((_, i) => i !== index)
        onImagesChange(updated)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        handleFileSelect(e.dataTransfer.files)
    }

    return (
        <div>
            {/* Upload zone */}
            {imageUrls.length < 3 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition"
                >
                    {uploading ? (
                        <p className="text-sm text-gray-400">Uploading...</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-400">
                                Drop image here or click to upload
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                                JPG, PNG up to 5MB · Max 3 images
                            </p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
            )}

            {/* Thumbnails */}
            {imageUrls.length > 0 && (
                <div className="flex gap-2 mt-3">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative w-20 h-20">
                            <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}