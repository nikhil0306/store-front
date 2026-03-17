"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Topbar({ storeSlug }: { storeSlug?: string }) {
    const { data: session } = useSession()

    return (
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center text-sm font-medium text-blue-700">
                    S
                </div>
                <span className="font-medium text-sm">StoreFront</span>
            </div>

            <div className="flex items-center gap-3">
                {storeSlug && (
                    <Link
                        href={`/shop/${storeSlug}`}
                        target="_blank"
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                    >
                        storefront.app/shop/{storeSlug}
                    </Link>
                )}
                <div className="flex items-center gap-2">
                    {session?.user?.image && (
                        <img
                            src={session.user.image}
                            alt="avatar"
                            className="w-7 h-7 rounded-full"
                        />
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    )
}