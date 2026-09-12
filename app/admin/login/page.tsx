"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Lock, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("admin-credentials", {
      email: identifier,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("メールアドレス（ID）またはパスワードが正しくありません")
      setLoading(false)
    } else {
      router.push("/admin/stores")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Premium card with glassmorphism */}
        <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-10 shadow-2xl shadow-black/10">
          {/* Header with icon */}
          <div className="text-center space-y-4 mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                バンコクデイズ
              </h1>
              <p className="mt-2 text-sm text-muted-foreground/80">管理画面へようこそ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/ID field */}
            <div className="space-y-3">
              <Label htmlFor="identifier" className="text-sm font-semibold text-foreground/90">
                メールアドレスまたはID
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-12"
                  placeholder="your@email.com または ログインID"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/90">
                パスワード
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
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

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full mt-6" 
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
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground/60">
          © 2026 Bangkok Days. All rights reserved.
        </p>
      </div>
    </div>
  )
}
