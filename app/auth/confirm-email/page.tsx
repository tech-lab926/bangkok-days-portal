"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ConfirmContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch("/api/v1/auth/change-email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => {
      setStatus(j.success ? "success" : "error");
      if (j.success) setTimeout(() => router.push("/profile"), 2000);
    });
  }, [token]);

  if (status === "loading") return <p className="text-muted-foreground">確認中...</p>;
  if (status === "success") return <p className="text-green-600">メールアドレスを変更しました。リダイレクトします...</p>;
  return <p className="text-destructive">リンクが無効または期限切れです。<Link href="/profile" className="underline ml-1">プロフィールに戻る</Link></p>;
}

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-bold">メールアドレスの変更確認</h1>
        <Suspense><ConfirmContent /></Suspense>
      </div>
    </div>
  );
}
