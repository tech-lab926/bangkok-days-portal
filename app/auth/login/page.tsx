"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, LogIn } from "lucide-react"

export default function UserLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("user-credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#0f4aa8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#0f4aa8]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl p-10 shadow-2xl shadow-black/5">
          <div className="text-center space-y-4 mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4aa8] to-[#1d60be] shadow-lg shadow-[#0f4aa8]/25">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ログイン
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                バンコクデイズアカウントにログイン
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                メールアドレス
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                パスワード
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0f4aa8] to-[#1d60be] hover:from-[#0d3f94] hover:to-[#1854a8] text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              アカウントをお持ちでないですか？{" "}
              <Link href="/auth/register" className="font-semibold text-[#0f4aa8] hover:underline">
                新規登録
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/auth/forgot-password" className="text-gray-400 hover:underline text-xs">
                パスワードをお忘れの方
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          © 2026 Bangkok Days. All rights reserved.
        </p>
      </div>
    </div>
  )
}
