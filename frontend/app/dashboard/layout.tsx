import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import TopbarWrapper from "@/components/dashboard/TopbarWrapper"
import "./dashboard.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="db-root">
      <TopbarWrapper
        userName={session.user?.name ?? ""}
        userImage={session.user?.image ?? ""}
      />
      <div className="db-shell">
        <Sidebar />
        <main className="db-main">{children}</main>
      </div>
    </div>
  )
}