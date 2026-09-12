"use client"

import { useEffect, useState, useCallback } from "react"
import { revenueApi } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const STATUS_LABELS: Record<string, string> = {
  UNPAID: "未請求",
  INVOICED: "請求済",
  PAID: "入金済",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  UNPAID: "destructive",
  INVOICED: "secondary",
  PAID: "default",
}

export default function RevenuePage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [billings, setBillings] = useState<any[]>([])
  const [closingDay, setClosingDay] = useState(25)
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true)
      const data = await revenueApi.list(year, month)
      setBillings(data.billings || [])
      setClosingDay(data.closingDay || 25)
    } catch {
      toast.error("売上データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleGenerate = async () => {
    try {
      await revenueApi.generate(year, month)
      toast.success("売上データを生成しました")
      await fetchRevenue()
    } catch (err: any) {
      toast.error(err.message || "生成に失敗しました")
    }
  }

  const handleStatusChange = async (billingId: string, newStatus: string) => {
    try {
      await revenueApi.updateStatus(billingId, newStatus)
      setBillings((prev) =>
        prev.map((b) => (b.id === billingId ? { ...b, status: newStatus } : b))
      )
      toast.success("ステータスを更新しました")
    } catch {
      toast.error("ステータスの更新に失敗しました")
    }
  }

  // Calculate billing period display
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const periodText = `${prevYear}/${String(prevMonth).padStart(2, "0")}/${closingDay + 1 > 28 ? 26 : closingDay + 1} 〜 ${year}/${String(month).padStart(2, "0")}/${closingDay}`

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // Calculate summary totals
  const totalRevenue = billings.reduce((sum, b) => sum + b.totalAmount, 0)
  const paymentBreakdown = {
    bankTransfer: Math.floor(totalRevenue * 0.7), // Example distribution
    qr: 0,
    credit: 0,
    cash: 0,
    other: 0,
  }

  return (
    <div>
      <PageHeader title="売上管理" description="店舗単位の課金・請求を管理します">
        <Button onClick={handleGenerate}>売上データ生成</Button>
      </PageHeader>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">対象年月：</span>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>{m}月</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          対象期間：{periodText}
        </div>
      </div>

      {/* Sales Summary Card */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">売上サマリー</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Total Revenue Card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 p-6 shadow-lg">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground/80">売上合計金額（全オーナー合算）</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ฿{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="rounded-2xl border-2 border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-lg">
            <p className="text-sm font-semibold text-muted-foreground/90 mb-4">決済方法別 売上合計金額</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">銀行振込:</span>
                <span className="font-semibold">฿{paymentBreakdown.bankTransfer.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">QR:</span>
                <span className="font-semibold">฿{paymentBreakdown.qr}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">クレジット:</span>
                <span className="font-semibold">฿{paymentBreakdown.credit}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">現金:</span>
                <span className="font-semibold">฿{paymentBreakdown.cash}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">その他:</span>
                <span className="font-semibold">฿{paymentBreakdown.other}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owners Billing Table */}
      <h2 className="text-lg font-semibold mb-4">掲載依頼</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>会社名</TableHead>
              <TableHead>契約プラン</TableHead>
              <TableHead>課金対象店舗数</TableHead>
              <TableHead>合計金額</TableHead>
              <TableHead>請求ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : billings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  売上データがありません。「売上データ生成」ボタンで生成してください。
                </TableCell>
              </TableRow>
            ) : (
              billings.map((billing) => {
                const isExpanded = expandedIds.has(billing.id)
                const activeStores = billing.stores?.filter((s: any) => s.active) || []

                return (
                  <>
                    <TableRow
                      key={billing.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpand(billing.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {billing.owner?.companyName}
                      </TableCell>
                      <TableCell>{billing.owner?.plan?.name || "—"}</TableCell>
                      <TableCell>{activeStores.length}</TableCell>
                      <TableCell className="font-medium">
                        ¥{billing.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={billing.status}
                          onValueChange={(v) => handleStatusChange(billing.id, v)}
                        >
                          <SelectTrigger className="w-28">
                            <Badge variant={STATUS_VARIANTS[billing.status]}>
                              {STATUS_LABELS[billing.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNPAID">未請求</SelectItem>
                            <SelectItem value="INVOICED">請求済</SelectItem>
                            <SelectItem value="PAID">入金済</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    {isExpanded &&
                      billing.stores?.map((store: any) => (
                        <TableRow key={store.id} className="bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell className="pl-8 text-sm">
                            {store.place?.translations?.[0]?.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {store.plan?.name || "—"}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-sm">
                            ¥{store.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={store.active ? "default" : "secondary"}>
                              {store.active ? "課金対象" : "停止"}
                            </Badge>
                            {store.note && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {store.note}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
