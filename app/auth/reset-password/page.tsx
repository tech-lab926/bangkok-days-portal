"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("パスワードが一致しません"); return; }
    setLoading(true);
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("パスワードをリセットしました");
      router.push("/auth/login");
    } else {
      toast.error(json.error || "リセットに失敗しました");
    }
    setLoading(false);
  };

  if (!token) return <p className="text-center text-sm text-destructive">無効なリンクです。</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pw">新しいパスワード（8文字以上）</Label>
        <Input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw2">確認用パスワード</Label>
        <Input id="pw2" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "処理中..." : "パスワードを変更する"}</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-xl font-bold">パスワードのリセット</h1>
        <Suspense><ResetForm /></Suspense>
        <Link href="/auth/login" className="block text-center text-sm text-muted-foreground hover:underline">ログインに戻る</Link>
      </div>
    </div>
  );
}
