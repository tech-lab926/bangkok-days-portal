import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "アカウント - バンコクデイズ",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
