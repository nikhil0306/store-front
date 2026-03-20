import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user }) {
            try {
                // Sync user to our database
                await fetch("http://localhost:5000/api/auth/sync-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }),
                })
            } catch (error) {
                console.error("Failed to sync user:", error)
            }
            return true
        },
        async session({ session, token }) {
            return session
        },
    },
})

export { handler as GET, handler as POST }