"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"

interface Props {
    userName: string
    userImage: string
    storeSlug?: string
}

export default function TopbarWrapper({ userName, userImage, storeSlug }: Props) {
    return (
        <header className="db-topbar">
            <Link href="/dashboard" className="db-topbar-brand">
                <div className="db-topbar-logo">S</div>
                <span className="db-topbar-name">StoreFront</span>
            </Link>

            <div className="db-topbar-right">
                {storeSlug && (
                    <Link
                        href={`/shop/${storeSlug}`}
                        target="_blank"
                        className="db-store-link-pill"
                    >
                        /shop/{storeSlug} ↗
                    </Link>
                )}

                <div className="db-topbar-user">
                    {userImage && (
                        <img
                            src={userImage}
                            alt="avatar"
                            className="db-topbar-avatar"
                        />
                    )}
                    <span className="db-topbar-username">{userName}</span>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="db-signout-btn"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    )
}