"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { toast } from "sonner"

export default function NewEventPage() {
  const { data: session, status } = useSession()
  const [areas, setAreas] = useState<string[]>([])
  const [form, setForm] = useState({ title: "", eventTime: "", area: "", eventDate: new Date().toISOString().slice(0, 10), description: "", contactUrl: "", lineId: "", contactEmail: "", contactPhone: "" })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch("/api/v1/areas?locale=ja").then(r => r.json())
      .then(d => setAreas((d.data || []).map((a: any) => a.translations?.[0]?.name || a.slug)))
      .catch(() => {})
  }, [])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || images.length >= 4) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/v1/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.data?.url) {
        setImages(prev => [...prev, data.data.url].slice(0, 4))
        toast.success("画像をアップロードしました")
      } else throw new Error(data.error)
    } catch { toast.error("画像のアップロードに失敗しました") }
    finally { setUploading(false); e.target.value = "" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.eventTime || !form.area || !form.eventDate) return
    setSaving(true)
    try {
      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrls: images }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDone(true)
    } catch (e: any) {
      alert(e.message || "投稿に失敗しました")
    } finally { setSaving(false) }
  }

  if (status === "loading") return null

  if (!session) {
    return (
      <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-[#d9e1ed] bg-white p-8 text-center max-w-sm w-full shadow-sm">
          <h1 className="text-[20px] font-bold text-[#1a3457] mb-3">イベントを投稿する</h1>
          <p className="text-[14px] text-[#6a7890] mb-6">投稿にはログインが必要です</p>
          <Link href="/auth/login?callbackUrl=/events/new"
            className="inline-block w-full rounded-lg bg-[#004098] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#003070] transition">
            ログインして投稿する
          </Link>
          <p className="mt-4 text-[13px] text-[#6a7890]">
            アカウントをお持ちでない方は
            <Link href="/auth/register" className="text-[#004098] hover:underline ml-1">新規登録</Link>
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-[#d9e1ed] bg-white p-8 text-center max-w-sm w-full shadow-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-[20px] font-bold text-[#1a3457] mb-3">投稿しました！</h1>
          <p className="text-[14px] text-[#6a7890] mb-6">管理者が確認後、掲載されます。</p>
          <Link href="/" className="inline-block rounded-lg bg-[#004098] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#003070] transition">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1653a5] hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />トップに戻る
        </Link>
        <div className="rounded-xl border border-[#d9e1ed] bg-white p-6 shadow-sm">
          <h1 className="text-[22px] font-bold text-[#1a3457] mb-6">イベントを投稿する</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-[#334968]">タイトル *</label>
              <input required value={form.title} onChange={e => f("title", e.target.value)}
                placeholder="例: 駐在向け飲み会"
                className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-semibold text-[#334968]">日付 *</label>
                <input required type="date" value={form.eventDate} onChange={e => f("eventDate", e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] font-semibold text-[#334968]">時間 *</label>
                <input required value={form.eventTime} onChange={e => f("eventTime", e.target.value)}
                  placeholder="19:00"
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-[#334968]">エリア *</label>
              <select required value={form.area} onChange={e => f("area", e.target.value)}
                className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none bg-white">
                <option value="">選択してください</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-[#334968]">詳細（任意）</label>
              <textarea value={form.description} onChange={e => f("description", e.target.value)}
                placeholder="場所・参加費・連絡先など" rows={4}
                className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none resize-none" />
            </div>
            <div className="space-y-3 border-t pt-4">
              <p className="text-[13px] font-semibold text-[#334968]">連絡先（任意・入力した項目のみ表示されます）</p>
              <div className="space-y-1">
                <label className="text-[13px] text-[#334968]">URL（サイト・SNS・LINE等）</label>
                <input type="url" value={form.contactUrl} onChange={e => f("contactUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-[#334968]">LINE ID</label>
                <input type="text" value={form.lineId} onChange={e => f("lineId", e.target.value)}
                  placeholder="@lineid"
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-[#334968]">メール</label>
                <input type="email" value={form.contactEmail} onChange={e => f("contactEmail", e.target.value)}
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-[#334968]">電話</label>
                <input type="tel" value={form.contactPhone} onChange={e => f("contactPhone", e.target.value)}
                  placeholder="+66-XX-XXX-XXXX"
                  className="w-full rounded-lg border border-[#d4dbe6] px-3 py-2 text-[14px] focus:border-[#004098] focus:outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[#334968]">画像（最大4枚・任意）</label>
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#d4dbe6] flex items-center justify-center cursor-pointer hover:border-[#004098] transition text-[#6a7890] text-2xl">
                    {uploading ? "..." : "+"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
            <button type="submit" disabled={saving || uploading}
              className="w-full rounded-lg bg-[#004098] py-3 text-[14px] font-bold text-white hover:bg-[#003070] transition disabled:opacity-50">
              {saving ? "投稿中..." : "投稿する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
