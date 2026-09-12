"use client"

import { useEffect, useState } from "react"
import { settingsApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

interface BadgeItem { id: string; label: string; answerCount: number; likeCount: number }

const DEFAULT_BADGES: BadgeItem[] = [
  { id: "answer_1", label: "初回回答者", answerCount: 1, likeCount: 0 },
  { id: "answer_10", label: "回答者", answerCount: 10, likeCount: 0 },
  { id: "answer_50", label: "エキスパート", answerCount: 50, likeCount: 0 },
  { id: "like_10", label: "人気回答者", answerCount: 0, likeCount: 10 },
  { id: "like_50", label: "トップ回答者", answerCount: 0, likeCount: 50 },
]

export default function SettingsPage() {
  const [closingDay, setClosingDay] = useState("25")
  const [gaId, setGaId] = useState("")
  const [gscVerification, setGscVerification] = useState("")
  const [rssFeeds, setRssFeeds] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  // Q&A settings
  const [qaEnabled, setQaEnabled] = useState("true")
  const [qaSuggestEnabled, setQaSuggestEnabled] = useState("true")
  const [qaSuggestLimit, setQaSuggestLimit] = useState("5")
  const [qaBestAutoDays, setQaBestAutoDays] = useState("30")
  const [qaBestAutoEnabled, setQaBestAutoEnabled] = useState("true")
  const [qaSpamThreshold, setQaSpamThreshold] = useState("5")
  const [qaSpamNotifyEmail, setQaSpamNotifyEmail] = useState("")
  const [qaSpamNotify, setQaSpamNotify] = useState("true")
  const [qaOldFlagMonths, setQaOldFlagMonths] = useState("12")
  const [qaOldFlagEnabled, setQaOldFlagEnabled] = useState("true")
  const [qaAnswerNotify, setQaAnswerNotify] = useState("true")
  const [qaWatchNotify, setQaWatchNotify] = useState("true")
  const [badges, setBadges] = useState<BadgeItem[]>(DEFAULT_BADGES)
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.get().then((data) => {
      setClosingDay(data.billing_closing_day || "25")
      setGaId(data.ga_tracking_id || "")
      setGscVerification(data.gsc_verification || "")
      setRssFeeds(data.news_rss_feeds || "https://www.bangkokpost.com/rss/data/most-recent.xml\nhttps://www.thaipbsworld.com/feed/")
      setAiPrompt(data.news_ai_prompt || "")
      setQaEnabled(data.qa_enabled ?? "true")
      setQaSuggestEnabled(data.qa_suggest_enabled ?? "true")
      setQaSuggestLimit(data.qa_suggest_limit || "5")
      setQaBestAutoDays(data.qa_best_auto_days || "30")
      setQaBestAutoEnabled(data.qa_best_auto_enabled ?? "true")
      setQaSpamThreshold(data.qa_spam_threshold || "5")
      setQaSpamNotifyEmail(data.qa_spam_notify_email || "")
      setQaSpamNotify(data.qa_spam_notify ?? "true")
      setQaOldFlagMonths(data.qa_old_flag_months || "12")
      setQaOldFlagEnabled(data.qa_old_flag_enabled ?? "true")
      setQaAnswerNotify(data.qa_answer_notify ?? "true")
      setQaWatchNotify(data.qa_watch_notify ?? "true")
      try { setBadges(data.qa_badges ? JSON.parse(data.qa_badges) : DEFAULT_BADGES) } catch { setBadges(DEFAULT_BADGES) }
      setOriginal(data)
    }).catch(() => toast.error("設定の取得に失敗しました"))
    .finally(() => setLoading(false))
  }, [])

  const hasChanges = closingDay !== (original.billing_closing_day || "25") ||
    gaId !== (original.ga_tracking_id || "") ||
    gscVerification !== (original.gsc_verification || "") ||
    rssFeeds !== (original.news_rss_feeds || "https://www.bangkokpost.com/rss/data/most-recent.xml\nhttps://www.thaipbsworld.com/feed/") ||
    aiPrompt !== (original.news_ai_prompt || "") ||
    qaEnabled !== (original.qa_enabled ?? "true") ||
    qaSuggestEnabled !== (original.qa_suggest_enabled ?? "true") ||
    qaSuggestLimit !== (original.qa_suggest_limit || "5") ||
    qaBestAutoDays !== (original.qa_best_auto_days || "30") ||
    qaBestAutoEnabled !== (original.qa_best_auto_enabled ?? "true") ||
    qaSpamThreshold !== (original.qa_spam_threshold || "5") ||
    qaSpamNotifyEmail !== (original.qa_spam_notify_email || "") ||
    qaSpamNotify !== (original.qa_spam_notify ?? "true") ||
    qaOldFlagMonths !== (original.qa_old_flag_months || "12") ||
    qaOldFlagEnabled !== (original.qa_old_flag_enabled ?? "true") ||
    qaAnswerNotify !== (original.qa_answer_notify ?? "true") ||
    qaWatchNotify !== (original.qa_watch_notify ?? "true") ||
    JSON.stringify(badges) !== (original.qa_badges || JSON.stringify(DEFAULT_BADGES))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.save({
        billing_closing_day: closingDay,
        ga_tracking_id: gaId,
        gsc_verification: gscVerification,
        news_rss_feeds: rssFeeds,
        news_ai_prompt: aiPrompt,
        qa_enabled: qaEnabled,
        qa_suggest_enabled: qaSuggestEnabled,
        qa_suggest_limit: qaSuggestLimit,
        qa_best_auto_days: qaBestAutoDays,
        qa_best_auto_enabled: qaBestAutoEnabled,
        qa_spam_threshold: qaSpamThreshold,
        qa_spam_notify_email: qaSpamNotifyEmail,
        qa_spam_notify: qaSpamNotify,
        qa_old_flag_months: qaOldFlagMonths,
        qa_old_flag_enabled: qaOldFlagEnabled,
        qa_answer_notify: qaAnswerNotify,
        qa_watch_notify: qaWatchNotify,
        qa_badges: JSON.stringify(badges),
      })
      setOriginal({ ...original, billing_closing_day: closingDay, ga_tracking_id: gaId, gsc_verification: gscVerification, news_rss_feeds: rssFeeds, news_ai_prompt: aiPrompt })
      toast.success("設定を保存しました")
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally { setSaving(false) }
  }

  const days = Array.from({ length: 28 }, (_, i) => i + 1)

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">読み込み中...</div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="設定" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">売上設定</h2>
        <Separator />
        <div className="space-y-2">
          <Label>締め日</Label>
          <Select value={closingDay} onValueChange={setClosingDay}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {days.map(d => <SelectItem key={d} value={d.toString()}>{d}日</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">アナリティクス・サーチコンソール</h2>
        <Separator />
        <div className="space-y-2">
          <Label>Google Analytics トラッキングID</Label>
          <Input value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" className="max-w-xs" />
          <p className="text-xs text-muted-foreground">GA4の測定IDを入力してください（例: G-XXXXXXXXXX）</p>
        </div>
        <div className="space-y-2">
          <Label>Google Search Console 確認コード</Label>
          <Input value={gscVerification} onChange={e => setGscVerification(e.target.value)} placeholder="google-site-verification=xxxx" className="max-w-md" />
          <p className="text-xs text-muted-foreground">HTMLタグ方式の content 値を入力（例: google-site-verification=abcdef123）</p>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">AIニュース生成設定</h2>
        <Separator />
        <div className="space-y-2">
          <Label>RSSフィードURL（1行に1つ）</Label>
          <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] font-mono"
            value={rssFeeds} onChange={e => setRssFeeds(e.target.value)}
            placeholder="https://www.bangkokpost.com/rss/data/most-recent.xml" />
          <p className="text-xs text-muted-foreground">ニュース取得元のRSSフィードURLを1行ずつ入力してください</p>
        </div>
        <div className="space-y-2">
          <Label>AIリライトプロンプト（空欄でデフォルト使用）</Label>
          <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[200px]"
            value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            placeholder="あなたはバンコク在住日本人向けのニュースライターです。以下の英語ニュースを日本語でリライトしてください..." />
          <p className="text-xs text-muted-foreground">プロンプト内で {"{title}"} と {"{description}"} が元記事の情報に置換されます。空欄の場合はデフォルトプロンプトを使用します。</p>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Q&amp;A機能設定</h2>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Q&A機能</Label>
            <Select value={qaEnabled} onValueChange={setQaEnabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>類似質問サジェスト</Label>
            <Select value={qaSuggestEnabled} onValueChange={setQaSuggestEnabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>サジェスト表示件数</Label>
            <Input type="number" min={1} max={10} value={qaSuggestLimit} onChange={e => setQaSuggestLimit(e.target.value)} className="w-24" />
          </div>
          <div className="space-y-2">
            <Label>自動ベストアンサー昇格</Label>
            <Select value={qaBestAutoEnabled} onValueChange={setQaBestAutoEnabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>自動昇格までの期間（日）</Label>
            <Input type="number" min={1} value={qaBestAutoDays} onChange={e => setQaBestAutoDays(e.target.value)} className="w-24" />
          </div>
          <div className="space-y-2">
            <Label>古い情報フラグ表示</Label>
            <Select value={qaOldFlagEnabled} onValueChange={setQaOldFlagEnabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>フラグ表示までの期間（ヶ月）</Label>
            <Input type="number" min={1} value={qaOldFlagMonths} onChange={e => setQaOldFlagMonths(e.target.value)} className="w-24" />
          </div>
          <div className="space-y-2">
            <Label>スパム通報メール通知</Label>
            <Select value={qaSpamNotify} onValueChange={setQaSpamNotify}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>通報数の閾値（件）</Label>
            <Input type="number" min={1} value={qaSpamThreshold} onChange={e => setQaSpamThreshold(e.target.value)} className="w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>スパム通知先メールアドレス</Label>
          <Input type="email" value={qaSpamNotifyEmail} onChange={e => setQaSpamNotifyEmail(e.target.value)} placeholder="admin@example.com" className="max-w-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>回答通知メール</Label>
            <Select value={qaAnswerNotify} onValueChange={setQaAnswerNotify}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ウォッチ通知メール</Label>
            <Select value={qaWatchNotify} onValueChange={setQaWatchNotify}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">ON</SelectItem><SelectItem value="false">OFF</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">バッジ・レベル設定</h2>
        <Separator />
        <p className="text-sm text-muted-foreground">回答数・いいね数に応じたバッジ付与条件を設定します。</p>
        <div className="space-y-3">
          {badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={b.label} onChange={e => { const n = [...badges]; n[i] = { ...b, label: e.target.value }; setBadges(n) }} placeholder="バッジ名" className="w-40" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">回答数≧</span>
              <Input type="number" min={0} value={b.answerCount} onChange={e => { const n = [...badges]; n[i] = { ...b, answerCount: +e.target.value }; setBadges(n) }} className="w-20" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">いいね≧</span>
              <Input type="number" min={0} value={b.likeCount} onChange={e => { const n = [...badges]; n[i] = { ...b, likeCount: +e.target.value }; setBadges(n) }} className="w-20" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setBadges(badges.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setBadges([...badges, { id: `custom_${Date.now()}`, label: "", answerCount: 0, likeCount: 0 }])}>
          <Plus className="h-4 w-4 mr-1" />バッジを追加
        </Button>
      </section>

      <FixedSaveButton onClick={handleSave} disabled={!hasChanges} loading={saving} />
    </div>
  )
}
