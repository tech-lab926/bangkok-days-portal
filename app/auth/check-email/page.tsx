"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      } else {
        setError(data.error || "再送信に失敗しました");
      }
    } catch {
      setError("サーバーエラーが発生しました");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#0f4aa8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#0f4aa8]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl p-10 shadow-2xl shadow-black/5">
          <div className="text-center space-y-4 mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0f4aa8]/10">
              <Mail className="h-10 w-10 text-[#0f4aa8]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                メールをご確認ください
              </h1>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                確認メールを送信しました。
                <br />
                メール内のリンクをクリックして、
                <br />
                アカウントを有効化してください。
              </p>
            </div>
          </div>

          {email && (
            <div className="rounded-xl bg-[#f4f6fa] border border-[#e1e5ed] p-4 mb-6">
              <p className="text-sm text-gray-600 text-center">
                送信先:{" "}
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {resent && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-4 animate-in fade-in duration-300">
              <p className="text-sm text-green-600 font-medium text-center">
                確認メールを再送信しました
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={resending || resent}
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  送信中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  確認メールを再送信
                </span>
              )}
            </Button>

            <Link href="/auth/login" className="block">
              <Button
                variant="ghost"
                className="w-full text-gray-500"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ログインに戻る
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          © 2026 Bangkok Days. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5]" />
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
