import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function AdminIndexPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/admin/login")
  }

  redirect("/admin/stores")
}
