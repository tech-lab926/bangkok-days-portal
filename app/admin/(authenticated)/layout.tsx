import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.user) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-subtle">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8 pb-24">{children}</div>
      </main>
    </div>
  )
}
