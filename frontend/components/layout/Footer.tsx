import Link from "next/link"
import "@/app/landing.css"

export default function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-inner">
                <div className="footer-logo">Store<span>Front</span></div>

                <div className="footer-copy">
                    © {new Date().getFullYear()} StoreFront. All rights reserved.
                </div>
            </div>
        </footer>
    )
}