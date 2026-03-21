import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import DashboardOverview from "@/components/dashboard/DashboardOverview"

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session) {
        redirect("/login")
    }

    return <DashboardOverview userEmail={session.user?.email ?? ""} />
}