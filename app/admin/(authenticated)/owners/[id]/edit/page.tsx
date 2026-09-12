"use client"

import { useEffect, useState, use } from "react"
import { ownersApi, pricingPlansApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function OwnerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    planId: "",
    memo: "",
    active: true,
  })

  useEffect(() => {
    Promise.all([
      ownersApi.list({ search: "" }),
      pricingPlansApi.list(),
    ]).then(async ([, plansData]) => {
      setPlans(plansData.filter((p: any) => p.enabled))

      // Fetch single owner from list
      const allOwners = await ownersApi.list({ limit: "1000" })
      const owner = (allOwners.items || []).find((o: any) => o.id === id)
      if (owner) {
        setForm({
          companyName: owner.companyName || "",
          contactName: owner.contactName || "",
          phone: owner.phone || "",
          email: owner.email || "",
          planId: owner.planId || "",
          memo: owner.memo || "",
          active: owner.active ?? true,
        })
      }
      setInitialLoading(false)
    }).catch(() => {
      toast.error("データの取得に失敗しました")
      setInitialLoading(false)
    })
  }, [id])

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.companyName || !form.contactName || !form.phone || !form.email) {
      toast.error("必須項目を入力してください")
      return
    }
    setLoading(true)
    try {
      await ownersApi.update(id, form)
      toast.success("オーナー情報を更新しました")
    } catch (err: any) {
      toast.error(err.message || "更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-20">
      <PageHeader title="オーナー編集" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <Separator />

        <div className="space-y-2">
          <Label>会社名 *</Label>
          <Input value={form.companyName} onChange={(e) => updateForm("companyName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>担当者名 *</Label>
          <Input value={form.contactName} onChange={(e) => updateForm("contactName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>電話番号 *</Label>
          <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>メール *</Label>
          <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>契約プラン *</Label>
          <Select value={form.planId} onValueChange={(v) => updateForm("planId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="プランを選択" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan: any) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}（¥{plan.monthlyPrice.toLocaleString()}/月）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>メモ</Label>
          <Textarea value={form.memo} onChange={(e) => updateForm("memo", e.target.value)} rows={4} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label>ステータス（有効/無効）</Label>
          <Switch checked={form.active} onCheckedChange={(v) => updateForm("active", v)} />
        </div>
      </section>

      <FixedSaveButton onClick={handleSave} loading={loading} />
    </div>
  )
}
