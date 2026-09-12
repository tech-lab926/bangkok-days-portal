import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (session?.user) {
    redirect("/admin/stores")
  }

  return <>{children}</>
}
