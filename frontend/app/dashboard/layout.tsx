import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import TopbarWrapper from "@/components/dashboard/TopbarWrapper"

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
    <div className="min-h-screen bg-gray-50">
      <TopbarWrapper
        userName={session.user?.name ?? ""}
        userImage={session.user?.image ?? ""}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}