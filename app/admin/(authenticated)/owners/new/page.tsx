"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ownersApi, pricingPlansApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { FixedSaveButton } from "@/components/admin/fixed-save-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function OwnerCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    planId: "",
    memo: "",
  })

  useEffect(() => {
    pricingPlansApi.list().then((data) => {
      setPlans(data.filter((p: any) => p.enabled))
    })
  }, [])

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.companyName || !form.contactName || !form.phone || !form.email) {
      toast.error("必須項目を入力してください")
      return
    }
    setLoading(true)
    try {
      await ownersApi.create(form)
      toast.success("オーナーを登録しました")
      router.push("/admin/owners")
    } catch (err: any) {
      toast.error(err.message || "登録に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl pb-20">
      <PageHeader title="オーナー登録" description="新しいオーナー（会社）を登録します" />

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
      </section>

      <FixedSaveButton onClick={handleSave} loading={loading} label="登録" />
    </div>
  )
}
