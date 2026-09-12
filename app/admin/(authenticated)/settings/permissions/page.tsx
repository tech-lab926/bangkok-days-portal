"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ShieldAlert, Save, Lock, ShieldCheck, RefreshCw, Check } from "lucide-react"

function PermCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
        checked
          ? "bg-primary border-primary text-primary-foreground shadow-sm"
          : "border-border bg-background hover:border-primary/60"
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </button>
  )
}

const RESOURCE_LABELS: Record<string, string> = {
  stores: "店舗管理",
  articles: "記事管理",
  areas: "エリア設定",
  categories: "カテゴリ設定",
  scenes: "シーン設定",
  tags: "タグ管理",
  owners: "オーナー管理",
  revenue: "売上管理",
  pricing_plans: "料金プラン",
  inquiries: "掲載依頼",
  featured: "人気ランキング・特集",
  curated_lists: "特集ページ",
  today_events: "今日のイベント",
  jobs: "求人管理",
  auto_news: "AIニュース生成",
  media: "画像管理",
  community: "コミュニティ",
  settings: "システム設定",
  admin_users: "管理者管理",
  users: "ユーザー管理",
}

type Permission = {
  role: string
  resource: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

type CustomRole = {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [resources, setResources] = useState<string[]>([])
  const [roles, setRoles] = useState<CustomRole[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAll = async (keepSelected?: string) => {
    setLoading(true)
    try {
      const [permRes, roleRes] = await Promise.all([
        fetch("/api/v1/admin/permissions"),
        fetch("/api/v1/admin/roles"),
      ])
      const permJson = await permRes.json()
      const roleJson = await roleRes.json()

      if (permJson.success) {
        setPermissions(permJson.data.permissions)
        setResources(permJson.data.resources)
      }
      if (roleJson.success) {
        const allRoles: CustomRole[] = roleJson.data.roles
        setRoles(allRoles)
        const target = keepSelected || selectedRole
        const firstSelectable = allRoles.find(r => r.code !== "SUPER_ADMIN")
        if (!target || !allRoles.find(r => r.code === target)) {
          if (firstSelectable) setSelectedRole(firstSelectable.code)
        } else {
          setSelectedRole(target)
        }
      }
      setDirty(false)
    } catch {
      toast.error("データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const getPermission = (resource: string): Permission => {
    const existing = permissions.find(p => p.role === selectedRole && p.resource === resource)
    return existing ?? { role: selectedRole, resource, canView: false, canCreate: false, canEdit: false, canDelete: false }
  }

  const togglePermission = (resource: string, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
    setDirty(true)
    setPermissions(prev => {
      const idx = prev.findIndex(p => p.role === selectedRole && p.resource === resource)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], [action]: !updated[idx][action] }
        return updated
      }
      return [...prev, { role: selectedRole, resource, canView: false, canCreate: false, canEdit: false, canDelete: false, [action]: true }]
    })
  }

  const toggleAll = (action: "canView" | "canCreate" | "canEdit" | "canDelete", value: boolean) => {
    setDirty(true)
    setPermissions(prev => {
      const updated = [...prev]
      for (const resource of resources) {
        const idx = updated.findIndex(p => p.role === selectedRole && p.resource === resource)
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], [action]: value }
        } else {
          updated.push({ role: selectedRole, resource, canView: false, canCreate: false, canEdit: false, canDelete: false, [action]: value })
        }
      }
      return updated
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const toSave = resources.map(resource => getPermission(resource))
      const res = await fetch("/api/v1/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      })
      const json = await res.json()
      if (json.success) {
        setPermissions(prev => {
          const updated = prev.filter(p => p.role !== selectedRole)
          return [...updated, ...(json.data as Permission[]).filter(p => p.role === selectedRole)]
        })
        setDirty(false)
        toast.success(`「${selectedRoleObj?.name || selectedRole}」の権限設定を保存しました`)
      } else {
        toast.error(json.error || "保存に失敗しました")
      }
    } catch {
      toast.error("保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 gap-2 text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        読み込み中...
      </div>
    )
  }

  const rolePerms = resources.map(r => getPermission(r))
  const allView   = rolePerms.length > 0 && rolePerms.every(p => p.canView)
  const allCreate = rolePerms.length > 0 && rolePerms.every(p => p.canCreate)
  const allEdit   = rolePerms.length > 0 && rolePerms.every(p => p.canEdit)
  const allDelete = rolePerms.length > 0 && rolePerms.every(p => p.canDelete)

  const selectedRoleObj = roles.find(r => r.code === selectedRole)
  const assignableRoles = roles.filter(r => r.code !== "SUPER_ADMIN")

  return (
    <div className="space-y-6">
      <PageHeader
        title="権限設定"
        description="ロールごとのアクセス権限を管理します。カスタムロールの作成は管理者管理ページで行えます。"
      />

      {selectedRole && selectedRoleObj && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <ShieldAlert className="h-5 w-5" />
                  権限マトリクス
                  {dirty && (
                    <Badge variant="outline" className="text-orange-500 border-orange-300 font-normal">
                      未保存の変更あり
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ロールを選択し、チェックボックスで権限を設定して「保存」を押してください
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => fetchAll(selectedRole)}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  更新
                </Button>
                <Select value={selectedRole} onValueChange={v => { setSelectedRole(v); setDirty(false) }}>
                  <SelectTrigger className="w-56 rounded-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map(r => (
                      <SelectItem key={r.code} value={r.code}>
                        <span className="flex items-center gap-2">
                          {r.isSystem
                            ? <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                            : <ShieldCheck className="h-3 w-3 text-primary shrink-0" />}
                          {r.name}
                          <span className="text-xs text-muted-foreground font-mono">({r.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={save} disabled={saving} variant={dirty ? "default" : "outline"} className="rounded-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-3 px-4 font-semibold w-[45%]">リソース</th>
                    <th className="text-center py-3 px-4 font-semibold min-w-[90px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">閲覧</span>
                        <PermCheckbox checked={allView} onToggle={() => toggleAll("canView", !allView)} />
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold min-w-[90px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">作成</span>
                        <PermCheckbox checked={allCreate} onToggle={() => toggleAll("canCreate", !allCreate)} />
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold min-w-[90px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">編集</span>
                        <PermCheckbox checked={allEdit} onToggle={() => toggleAll("canEdit", !allEdit)} />
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold min-w-[90px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">削除</span>
                        <PermCheckbox checked={allDelete} onToggle={() => toggleAll("canDelete", !allDelete)} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource, i) => {
                    const perm = getPermission(resource)
                    return (
                      <tr
                        key={resource}
                        className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">{RESOURCE_LABELS[resource] || resource}</span>
                          <span className="ml-2 text-xs font-mono text-muted-foreground">{resource}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            <PermCheckbox checked={perm.canView} onToggle={() => togglePermission(resource, "canView")} />
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            <PermCheckbox checked={perm.canCreate} onToggle={() => togglePermission(resource, "canCreate")} />
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            <PermCheckbox checked={perm.canEdit} onToggle={() => togglePermission(resource, "canEdit")} />
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            <PermCheckbox checked={perm.canDelete} onToggle={() => togglePermission(resource, "canDelete")} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ※ ヘッダーのボタンで全リソースを一括切り替えできます。SUPER_ADMINは常に全権限を持ち編集できません。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
