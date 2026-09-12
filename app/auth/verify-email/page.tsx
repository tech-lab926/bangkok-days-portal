"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerifyState = "loading" | "success" | "already_verified" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("無効なリンクです");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/v1/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setState(data.data.alreadyVerified ? "already_verified" : "success");
        } else {
          setState("error");
          setErrorMessage(data.error || "確認に失敗しました");
        }
      } catch {
        setState("error");
        setErrorMessage("サーバーエラーが発生しました");
      }
    };

    verify();
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5] p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0f4aa8] mx-auto" />
          <p className="text-gray-500 text-lg">メールアドレスを確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#0f4aa8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#0f4aa8]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl p-10 shadow-2xl shadow-black/5">
          {(state === "success" || state === "already_verified") && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {state === "already_verified"
                    ? "既に確認済みです"
                    : "メール確認完了！"}
                </h1>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {state === "already_verified"
                    ? "このメールアドレスは既に確認されています。ログインしてご利用ください。"
                    : "メールアドレスが正常に確認されました。ログインしてバンコクデイズをお楽しみください。"}
                </p>
              </div>

              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full mt-6 bg-gradient-to-r from-[#0f4aa8] to-[#1d60be] hover:from-[#0d3f94] hover:to-[#1854a8] text-white"
                size="lg"
              >
                ログインする
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  確認に失敗しました
                </h1>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3 mt-6">
                <Link href="/auth/register" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-[#0f4aa8] to-[#1d60be] hover:from-[#0d3f94] hover:to-[#1854a8] text-white"
                    size="lg"
                  >
                    新規登録に戻る
                  </Button>
                </Link>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    ログインに戻る
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400">
          © 2026 Bangkok Days. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#f4f6fa] via-white to-[#e8edf5]" />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
