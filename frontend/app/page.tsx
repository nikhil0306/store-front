"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import "./landing.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <Navbar activePage="home" />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag">Free to start · No code needed</div>
            <h1 className="hero-title">
              Your store,<br />
              live in <span>10 minutes</span>
            </h1>
            <p className="hero-subtitle">
              StoreFront lets local sellers — home bakers, boutiques, handicraft makers —
              create a beautiful online store and start accepting orders instantly.
              No Shopify fees, no technical knowledge needed.
            </p>

          </div>

          {/* Sign in card */}
          <div className="hero-right">
            <div className="hero-card">
              <h2 className="hero-card-title">Get started today</h2>
              <p className="hero-card-sub">
                Join hundreds of local sellers already on StoreFront
              </p>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="btn-google"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up as a seller
              </button>
              <div className="hero-card-divider">or</div>
              <Link href="/shop" className="btn-browse-shops">
                🛍 Browse shops as a buyer
              </Link>
              <p className="hero-card-note">
                Free forever for up to 10 products · No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div>
            <div className="stat-value">50+</div>
            <div className="stat-label">Sellers onboarded</div>
          </div>
          <div>
            <div className="stat-value">10 min</div>
            <div className="stat-label">Average setup time</div>
          </div>
          <div>
            <div className="stat-value">₹0</div>
            <div className="stat-label">Monthly fees</div>
          </div>
          <div>
            <div className="stat-value">UPI/Cards</div>
            <div className="stat-label">Instant payments</div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything you need to sell online</h2>
          <p className="section-sub">
            No complicated setup. No monthly fees. Just a beautiful store that works.
          </p>
          <div className="features-grid">
            {[
              { icon: "⚡", title: "Live in 10 minutes", desc: "Sign up, add your products, share your link. Your store is live before your next cup of chai." },
              { icon: "📦", title: "Easy product management", desc: "Add products with photos, set prices, manage stock. Edit anytime from your dashboard." },
              { icon: "💳", title: "UPI & card payments", desc: "Accept payments via UPI, credit cards, debit cards and net banking. Powered by Cashfree." },
              { icon: "🤖", title: "AI copy writer", desc: "Let AI write your product descriptions. Just type a few keywords and get professional copy instantly." },
              { icon: "📱", title: "Mobile-first design", desc: "Your store looks stunning on every device. Customers shop easily on their phones." },
              { icon: "📊", title: "Order dashboard", desc: "See all your orders, track status, get email alerts on every new order. Stay on top of your business." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section section-alt" id="how-it-works">
        <div className="section-inner">
          <div className="section-tag">How it works</div>
          <h2 className="section-title">Start selling in 4 simple steps</h2>
          <p className="section-sub">
            No technical knowledge needed. If you can use WhatsApp, you can use StoreFront.
          </p>
          <div className="steps-grid">
            {[
              { n: "1", title: "Create your account", desc: "Sign up with your Google account in one click. No forms, no passwords." },
              { n: "2", title: "Set up your store", desc: "Add your store name, description, and pick a theme colour. Takes 2 minutes." },
              { n: "3", title: "Add your products", desc: "Upload photos, set prices, write descriptions. Use AI to write copy for you." },
              { n: "4", title: "Share and sell", desc: "Share your store link on WhatsApp and Instagram. Start receiving orders instantly." },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="contact">
        <h2 className="cta-title">Ready to start selling?</h2>
        <p className="cta-sub">
          Join StoreFront today. Free forever for small sellers.
        </p>
        <div className="cta-btns">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="btn-hero-primary"
          >
            Start for free →
          </button>
          <Link href="/shop" className="btn-hero-secondary">
            Browse shops
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />

    </div>
  )
}