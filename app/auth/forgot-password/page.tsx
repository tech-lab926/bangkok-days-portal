"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-xl font-bold">メールを送信しました</h1>
        <p className="text-sm text-muted-foreground">パスワードリセット用のリンクを送信しました。メールをご確認ください。（有効期限: 60分）</p>
        <Link href="/auth/login" className="text-sm text-primary hover:underline">ログインに戻る</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-xl font-bold">パスワードをお忘れの方</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">登録メールアドレス</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "送信中..." : "リセットリンクを送信"}</Button>
        </form>
        <Link href="/auth/login" className="block text-center text-sm text-muted-foreground hover:underline">ログインに戻る</Link>
      </div>
    </div>
  );
}
