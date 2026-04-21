import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import DashboardOverview from "@/components/dashboard/DashboardOverview"
import { API_URL } from "@/lib/api"

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session) {
        redirect("/login")
    }

    try {
        const res = await fetch(
            `${API_URL}/api/store/me?userEmail=${session.user?.email}`,
            { cache: "no-store" }
        )

        if (res.status === 404) {
            redirect("/dashboard/onboarding")
        }
    } catch (err) {
        console.error("Failed to check store status:", err)
    }

    return <DashboardOverview userEmail={session.user?.email ?? ""} />
}