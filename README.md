# StoreFront

> Instant mini e-commerce pages for local sellers — no code, no Shopify fees.

A seller can go from zero to a live, shareable store in under 10 minutes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Frontend + SSR |
| Node.js + Express | Backend API |
| PostgreSQL (Supabase) | Database |
| Prisma ORM | Database client |
| NextAuth.js | Authentication |
| Cloudinary | Image storage |
| Razorpay | Payments |
| Claude API | AI copy writer |
| Vercel | Frontend hosting |
| Railway | Backend hosting |

## Local Setup

### Prerequisites
- Node.js v18+
- Git

### Steps

1. Clone the repo
   git clone https://github.com/nikhil0306/store-front.git
   cd store-front

2. Setup frontend
   cd frontend && npm install

3. Setup backend
   cd ../backend && npm install
   cp .env.example .env

4. Run frontend (port 3000)
   cd frontend && npm run dev

5. Run backend (port 5000)
   cd backend && npm run dev

## Project Structure

store-front/
├── frontend/          # Next.js 14 app
├── backend/           # Node.js + Express API
│   ├── src/
│   │   └── index.js
│   └── prisma/
└── .github/
    └── workflows/     # GitHub Actions CI