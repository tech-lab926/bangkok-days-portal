"use client";

import { useState, useEffect } from "react";
import { submitInquiry, getCategories, getAreas, type Category, type Area } from "@/lib/public-api";

export default function ListingRequestPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [formData, setFormData] = useState({
    storeName: "", category: "", area: "", contactName: "",
    phone: "", email: "", website: "", googleMapUrl: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getAreas().then(setAreas).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const messageBody = [
        `店舗名: ${formData.storeName}`,
        `カテゴリ: ${formData.category}`,
        `エリア: ${formData.area}`,
        formData.website ? `Webサイト/SNS: ${formData.website}` : "",
        formData.googleMapUrl ? `Google Map URL: ${formData.googleMapUrl}` : "",
        formData.message ? `備考: ${formData.message}` : "",
      ].filter(Boolean).join("\n");

      await submitInquiry({
        type: "STORE_LISTING",
        name: formData.contactName,
        email: formData.email,
        phone: formData.phone || undefined,
        storeName: formData.storeName,
        subject: `掲載依頼: ${formData.storeName}`,
        message: messageBody,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-[#333]">
      {/* Header */}
      <section className="mx-auto max-w-[1120px] px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-center text-[18px] font-bold text-[#1a1a1a] sm:text-[24px]">店舗掲載のご案内</h1>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-[#666] sm:mt-3 sm:text-[13px]">
          バンコクデイズでは、日本人のお客様に向けた掲載依頼を受け付けております。<br />
          掲載をご希望の際は下のフォームからお申し込みください。
        </p>
      </section>

      {/* Info */}
      <section className="mx-auto max-w-[1120px] px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
        <div className="grid gap-4 md:gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-[14px] font-bold text-[#1a1a1a] sm:text-[15px]">バンコクデイズについて</h2>
            <ul className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-[#444] sm:text-[13px]">
              <li>・日本人をターゲットにしたバンコク情報サイト</li>
              <li>・厳選された掲載店舗を掲載しております</li>
              <li>・幅広い年齢層の利用者</li>
            </ul>
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#1a1a1a] sm:text-[15px]">掲載対象となる店舗</h2>
            <ul className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-[#444] sm:text-[13px]">
              <li>・日本人のお客様にサービスしている店舗</li>
              <li>・飲食店、バー、サービス店舗など</li>
              <li>・掲載期間は3ヶ月以上</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Merits */}
      <section className="mx-auto max-w-[1120px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <h2 className="text-center text-[14px] font-bold text-[#1a1a1a] sm:text-[15px]">掲載のメリット</h2>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3 sm:flex-wrap">
          <span className="inline-block rounded-full bg-[#ffc107] px-3 py-1.5 text-[11px] font-bold text-[#333] sm:px-5 sm:text-[12px]">日本人利用者への認知向上</span>
          <span className="inline-block rounded-full bg-[#ffc107] px-3 py-1.5 text-[11px] font-bold text-[#333] sm:px-5 sm:text-[12px]">店舗情報を正確に伝えられる</span>
          <span className="inline-block rounded-full bg-[#ffc107] px-3 py-1.5 text-[11px] font-bold text-[#333] sm:px-5 sm:text-[12px]">編集部による確認を経た掲載</span>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1120px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <h2 className="text-center text-[14px] font-bold text-[#1a1a1a] sm:text-[15px]">掲載までの流れ</h2>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { num: "1", title: "フォームより\nお問い合わせ" },
            { num: "2", title: "編集部にて\n内容確認" },
            { num: "3", title: "掲載可否の\nご連絡" },
            { num: "4", title: "情報掲載\n・公開" },
          ].map((step) => (
            <div key={step.num} className="relative rounded-2xl border-2 border-[#ffc107] bg-white py-4 px-2 sm:py-6 sm:px-3 flex flex-col items-center justify-center min-h-28 sm:min-h-32">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ffc107] text-[13px] font-bold text-[#333]">
                {step.num}
              </div>
              <p className="text-[15px] font-semibold text-[#333] sm:text-[18px] whitespace-pre-line leading-snug text-center">{step.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-[1120px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-lg border-2 border-[#e8d5a0] bg-[#fffcf0] p-4 sm:p-8">
          <h2 className="text-[13px] font-bold text-[#333] sm:text-[14px]">掲載依頼フォーム</h2>

          {success ? (
            <div className="mt-6 rounded-lg border-2 border-green-300 bg-green-50 p-8 text-center">
              <p className="text-[18px] font-bold text-green-700 mb-2">送信完了</p>
              <p className="text-[14px] text-green-600">掲載依頼ありがとうございます。編集部にて確認後、ご連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">店舗名（必須）</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} required
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">店舗カテゴリ</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]">
                    <option value="">選択してください</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.translations[0]?.name || cat.slug}>
                        {cat.translations[0]?.name || cat.slug}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">エリア</label>
                  <select name="area" value={formData.area} onChange={handleChange}
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]">
                    <option value="">選択してください</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.translations[0]?.name || area.slug}>
                        {area.translations[0]?.name || area.slug}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">ご担当者名（必須）</label>
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">電話番号</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">メールアドレス（必須）</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">Webサイト/SNS</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="http://"
                  className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">Google Map URL</label>
                <input type="text" name="googleMapUrl" value={formData.googleMapUrl} onChange={handleChange} placeholder="https://maps.google.com/..."
                  className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#666] sm:text-[11px]">備考・ご要望</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
                  className="mt-1 w-full border border-[#ddd] bg-white px-2.5 py-1.5 text-[12px] focus:border-[#ffc107] focus:outline-none sm:px-3 sm:py-2 sm:text-[13px]" />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-[13px] text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#ffc107] py-2 text-[12px] font-bold text-[#333] hover:bg-[#ffb300] disabled:opacity-50 sm:py-2 sm:text-[13px]">
                {loading ? "送信中..." : "送信する"}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-[12px] text-[#666]">
            お問い合わせ先：
            <a href="mailto:bangkokdays2026@gmail.com" className="text-[#004098] hover:underline font-medium">
              bangkokdays2026@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
