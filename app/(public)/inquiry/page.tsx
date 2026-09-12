"use client";

import Link from "next/link";
import { useState } from "react";
import { submitInquiry } from "@/lib/public-api";

export default function InquiryPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", privacy: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy) {
      setError("プライバシーポリシーに同意してください");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await submitInquiry({
        type: "GENERAL",
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: "お問い合わせ",
        message: formData.message,
      });
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "", privacy: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-[12px] text-[#999]">
          <Link href="/" className="text-[#004098]">TOP</Link>
          <span className="text-[#ccc]">›</span>
          <span>お問い合わせ</span>
        </div>

        <h1 className="mb-3 text-[28px] font-bold text-[#004098]">お問い合わせ</h1>
        <p className="mb-8 text-[14px] leading-relaxed text-[#666]">
          バンコクデイズへのお問い合わせは、下記のフォームよりお気軽にご連絡ください。
        </p>

        {success ? (
          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-8 text-center">
            <p className="text-[18px] font-bold text-green-700 mb-2">送信完了</p>
            <p className="text-[14px] text-green-600">お問い合わせありがとうございます。確認後、ご連絡いたします。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-10 space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#333]">ご担当者名（必須）</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="山田　太郎" required
                className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2.5 text-[13px] focus:border-[#004098] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#333]">メールアドレス（必須）</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="your@email.com" required
                className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2.5 text-[13px] focus:border-[#004098] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#333]">お電話番号</label>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="例：02-123-4567"
                className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2.5 text-[13px] focus:border-[#004098] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-[#333]">お問い合わせ内容（必須）</label>
              <textarea
                name="message" value={formData.message} onChange={handleChange}
                placeholder="お問い合わせ内容をご記入ください" rows={6} required
                className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2.5 text-[13px] focus:border-[#004098] focus:outline-none"
              />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange} className="mt-0.5" />
              <label className="text-[12px] text-[#666]">
                <Link href="/privacy" className="text-[#004098] hover:underline">プライバシーポリシー</Link>に同意する
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-[13px] text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="block w-full rounded-lg border-0 bg-[#ffc107] py-3 text-center text-[16px] font-bold text-[#333] hover:bg-[#ffb300] disabled:opacity-50"
            >
              {loading ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
