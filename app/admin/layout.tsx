import { Toaster } from "@/components/ui/sonner"
import "../globals.css"

export const metadata = {
  title: "バンコクデイズ管理画面",
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" duration={3000} />
    </>
  )
}
