"use client"

import { useEffect, useState } from "react"
import { pricingPlansApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formPriority, setFormPriority] = useState("0")

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await pricingPlansApi.list()
      setPlans(data)
    } catch {
      toast.error("料金プランの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const openAddModal = () => {
    setSelectedPlan(null)
    setFormName("")
    setFormPrice("")
    setFormDescription("")
    setFormPriority("0")
    setEditModal(true)
  }

  const openEditModal = (plan: any) => {
    setSelectedPlan(plan)
    setFormName(plan.name)
    setFormPrice(plan.monthlyPrice.toString())
    setFormDescription(plan.description || "")
    setFormPriority((plan.displayPriority ?? 0).toString())
    setEditModal(true)
  }

  const handleSave = async () => {
    if (!formName || !formPrice) {
      toast.error("プラン名と月額料金は必須です")
      return
    }
    setSaveLoading(true)
    try {
      if (selectedPlan) {
        await pricingPlansApi.update(selectedPlan.id, {
          name: formName,
          monthlyPrice: formPrice,
          description: formDescription,
          displayPriority: formPriority,
        })
        toast.success("プランを更新しました")
      } else {
        await pricingPlansApi.create({
          name: formName,
          monthlyPrice: formPrice,
          description: formDescription,
          displayPriority: formPriority,
        })
        toast.success("プランを追加しました")
      }
      setEditModal(false)
      await fetchPlans()
    } catch (err: any) {
      toast.error(err.message || "保存に失敗しました")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleToggleEnabled = async (plan: any) => {
    try {
      await pricingPlansApi.update(plan.id, { enabled: !plan.enabled })
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, enabled: !p.enabled } : p))
      )
    } catch {
      toast.error("更新に失敗しました")
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan) return
    setDeleteLoading(true)
    try {
      await pricingPlansApi.delete(selectedPlan.id)
      toast.success("プランを削除しました")
      setDeleteModal(false)
      setSelectedPlan(null)
      await fetchPlans()
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="料金プラン設定">
        <Button onClick={openAddModal}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>プラン名</TableHead>
              <TableHead>月額料金</TableHead>
              <TableHead>説明</TableHead>
              <TableHead>表示優先度</TableHead>
              <TableHead>使用会社数</TableHead>
              <TableHead>有効/無効</TableHead>
              <TableHead className="w-16">編集</TableHead>
              <TableHead className="w-16">削除</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  プランがありません
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>¥{plan.monthlyPrice.toLocaleString()}</TableCell>
                  <TableCell className="max-w-60 truncate text-sm text-muted-foreground">
                    {plan.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.displayPriority ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan._count?.owners ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={plan.enabled} onCheckedChange={() => handleToggleEnabled(plan)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {(plan._count?.owners ?? 0) > 0 ? (
                      <Button variant="ghost" size="icon" disabled title="使用中のため削除不可">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setDeleteModal(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPlan ? "プラン編集" : "プラン追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>プラン名 *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>月額料金 *（円）</Label>
              <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>表示優先度（数値が高いほど上位表示）</Label>
              <Input type="number" value={formPriority} onChange={(e) => setFormPriority(e.target.value)} placeholder="例: 100" />
              <p className="text-xs text-muted-foreground">推奨: プレミアム=100、スタンダード=50、ベーシック=10、無料=0</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="プラン削除"
        description="このプランを削除します。この操作は元に戻せません。"
        confirmLabel="削除"
        destructive
        loading={deleteLoading}
      />
    </div>
  )
}
