import { notFound } from "next/navigation"
import type { Metadata } from "next"
import PublicStoreClient from "./PublicStoreClient"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    try {
        const res = await fetch(
            `http://127.0.0.1:5000/api/store/${slug}`,
            { cache: "no-store" }
        )
        if (!res.ok) return { title: "Store not found" }
        const store = await res.json()
        return {
            title: store.name,
            description: store.description || `Shop at ${store.name}`,
        }
    } catch {
        return { title: "StoreFront" }
    }
}

export default async function PublicStorePage({ params }: Props) {
    const { slug } = await params
    try {
        const res = await fetch(
            `http://127.0.0.1:5000/api/store/${slug}`,
            { cache: "no-store" }
        )

        if (!res.ok) {
            notFound()
        }

        const store = await res.json()
        return <PublicStoreClient store={store} />
    } catch (error) {
        console.error("Store fetch error:", error)
        notFound()
    }
}