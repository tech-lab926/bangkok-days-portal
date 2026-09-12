"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { UserPlus, Trash2, Pencil, Lock, ShieldCheck, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Admin = {
  id: string
  loginId: string | null
  name: string
  email: string
  role: string
  customRole: string | null
  active: boolean
  createdAt: string
}

type CustomRole = {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
}

const SYSTEM_ROLE_CODES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

export default function AdminManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [allRoles, setAllRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Admin | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    name: "", loginId: "", email: "", password: "",
    role: "EDITOR", customRole: "",
  })
  const [editForm, setEditForm] = useState({
    name: "", loginId: "", email: "",
    role: "EDITOR", customRole: "", newPassword: "",
  })

  const [roleCreateOpen, setRoleCreateOpen] = useState(false)
  const [roleEditOpen, setRoleEditOpen] = useState(false)
  const [roleEditTarget, setRoleEditTarget] = useState<CustomRole | null>(null)
  const [roleDeleteId, setRoleDeleteId] = useState<string | null>(null)
  const [roleForm, setRoleForm] = useState({ code: "", name: "", description: "" })
  const [roleFormSaving, setRoleFormSaving] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin")
      toast.error("この機能はスーパー管理者のみ利用できます")
    }
  }, [session, status, router])

  const fetchAll = async () => {
    try {
      const [adminRes, roleRes] = await Promise.all([
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/roles"),
      ])
      const adminJson = await adminRes.json()
      const roleJson = await roleRes.json()
      if (adminJson.success) setAdmins(adminJson.data || [])
      if (roleJson.success) setAllRoles(roleJson.data.roles || [])
    } catch {
      toast.error("データの取得に失敗しました")
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === "SUPER_ADMIN") {
      fetchAll()
    }
  }, [session])

  const getRoleLabel = (admin: Admin): string => {
    if (admin.customRole) {
      const found = allRoles.find(r => r.code === admin.customRole)
      return found ? found.name : admin.customRole
    }
    const system = allRoles.find(r => r.code === admin.role)
    return system?.name || admin.role
  }

  const getRoleBadgeVariant = (admin: Admin): "default" | "secondary" => {
    if (admin.role === "SUPER_ADMIN" || admin.customRole === "SUPER_ADMIN") return "default"
    return "secondary"
  }

  const encodeRoleSelection = (code: string) => {
    if (SYSTEM_ROLE_CODES.includes(code)) {
      return { role: code, customRole: "" }
    }
    return { role: "EDITOR", customRole: code }
  }

  const effectiveCreateRole = createForm.customRole || createForm.role
  const effectiveEditRole = editForm.customRole || editForm.role

  const handleCreate = async () => {
    try {
      const payload: Record<string, unknown> = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        customRole: createForm.customRole || null,
      }
      if (createForm.loginId.trim()) payload.loginId = createForm.loginId.trim()

      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("管理者を追加しました")
        setCreateOpen(false)
        setCreateForm({ name: "", loginId: "", email: "", password: "", role: "EDITOR", customRole: "" })
        fetchAll()
      } else {
        toast.error(json.error || "追加に失敗しました")
      }
    } catch {
      toast.error("追加に失敗しました")
    }
  }

  const openEdit = (admin: Admin) => {
    setEditTarget(admin)
    setEditForm({
      name: admin.name,
      loginId: admin.loginId || "",
      email: admin.email,
      role: admin.role,
      customRole: admin.customRole || "",
      newPassword: "",
    })
    setEditOpen(true)
  }

  const handleEdit = async () => {
    if (!editTarget) return
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        customRole: editForm.customRole || null,
        loginId: editForm.loginId.trim() || null,
      }
      if (editForm.newPassword.trim()) payload.password = editForm.newPassword

      const res = await fetch(`/api/v1/admin/users?id=${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("更新しました")
        setEditOpen(false)
        setEditTarget(null)
        fetchAll()
      } else {
        toast.error(json.error || "更新に失敗しました")
      }
    } catch {
      toast.error("更新に失敗しました")
    }
  }

  const handleToggleActive = async (admin: Admin) => {
    try {
      const res = await fetch(`/api/v1/admin/users?id=${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !admin.active }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(admin.active ? "無効にしました" : "有効にしました")
        fetchAll()
      } else {
        toast.error(json.error || "更新に失敗しました")
      }
    } catch {
      toast.error("更新に失敗しました")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/v1/admin/users?id=${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("削除しました")
        fetchAll()
      } else {
        toast.error(json.error || "削除に失敗しました")
      }
    } catch {
      toast.error("削除に失敗しました")
    } finally {
      setDeleteId(null)
    }
  }

  const handleCreateRole = async () => {
    setRoleFormSaving(true)
    try {
      const res = await fetch("/api/v1/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roleForm.code.toUpperCase().trim(),
          name: roleForm.name.trim(),
          description: roleForm.description.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`ロール「${json.data.name}」を作成しました`)
        setRoleCreateOpen(false)
        setRoleForm({ code: "", name: "", description: "" })
        fetchAll()
      } else {
        toast.error(json.error || "作成に失敗しました")
      }
    } catch {
      toast.error("作成に失敗しました")
    } finally {
      setRoleFormSaving(false)
    }
  }

  const openEditRole = (role: CustomRole) => {
    setRoleEditTarget(role)
    setRoleForm({ code: role.code, name: role.name, description: role.description || "" })
    setRoleEditOpen(true)
  }

  const handleEditRole = async () => {
    if (!roleEditTarget) return
    setRoleFormSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/roles?id=${roleEditTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleForm.name.trim(),
          description: roleForm.description.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("ロールを更新しました")
        setRoleEditOpen(false)
        setRoleEditTarget(null)
        fetchAll()
      } else {
        toast.error(json.error || "更新に失敗しました")
      }
    } catch {
      toast.error("更新に失敗しました")
    } finally {
      setRoleFormSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!roleDeleteId) return
    const deletingRole = allRoles.find(r => r.id === roleDeleteId)
    try {
      const res = await fetch(`/api/v1/admin/roles?id=${roleDeleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success(`ロール「${deletingRole?.name}」を削除しました`)
        fetchAll()
      } else {
        toast.error(json.error || "削除に失敗しました")
      }
    } catch {
      toast.error("削除に失敗しました")
    } finally {
      setRoleDeleteId(null)
    }
  }

  const systemRoles = allRoles.filter(r => r.isSystem)
  const customRoles = allRoles.filter(r => !r.isSystem)

  const RoleSelect = ({
    value,
    onChange,
  }: {
    value: string
    onChange: (code: string) => void
  }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="ロールを選択" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3 w-3" /> システムロール
          </SelectLabel>
          {systemRoles.map(r => (
            <SelectItem key={r.code} value={r.code}>
              {r.name}
              <span className="ml-1 text-xs font-mono text-muted-foreground">({r.code})</span>
            </SelectItem>
          ))}
        </SelectGroup>
        {customRoles.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-1.5 text-xs mt-1">
              <ShieldCheck className="h-3 w-3 text-primary" /> カスタムロール
            </SelectLabel>
            {customRoles.map(r => (
              <SelectItem key={r.code} value={r.code}>
                {r.name}
                <span className="ml-1 text-xs font-mono text-muted-foreground">({r.code})</span>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )

  if (status === "loading" || loading) return <div className="py-20 text-center text-muted-foreground">読み込み中...</div>
  if (!session || session.user.role !== "SUPER_ADMIN") return null

  return (
    <div className="space-y-6">
      <PageHeader title="管理者管理" description="カスタムロールと管理者アカウントの作成・編集を行います">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4" />
                管理者を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>管理者を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>名前</Label>
                  <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>ログインID <span className="text-muted-foreground text-xs">（任意）</span></Label>
                  <Input value={createForm.loginId} onChange={(e) => setCreateForm({ ...createForm, loginId: e.target.value })} placeholder="半角英数字" />
                </div>
                <div>
                  <Label>メールアドレス</Label>
                  <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>パスワード</Label>
                  <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
                </div>
                <div>
                  <Label>権限ロール</Label>
                  <RoleSelect
                    value={effectiveCreateRole}
                    onChange={(code) => setCreateForm({ ...createForm, ...encodeRoleSelection(code) })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">追加</Button>
              </div>
            </DialogContent>
          </Dialog>
      </PageHeader>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>カスタムロール一覧</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setRoleForm({ code: "", name: "", description: "" }); setRoleCreateOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            カスタムロールを作成
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示名</TableHead>
                <TableHead>ロールコード</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    カスタムロールがありません
                  </TableCell>
                </TableRow>
              ) : (
                customRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">{role.code}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditRole(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRoleDeleteId(role.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>管理者を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>名前</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>ログインID <span className="text-muted-foreground text-xs">（任意）</span></Label>
              <Input value={editForm.loginId} onChange={(e) => setEditForm({ ...editForm, loginId: e.target.value })} placeholder="半角英数字" />
            </div>
            <div>
              <Label>メールアドレス</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" />
            </div>
            <div>
              <Label>権限ロール</Label>
              <RoleSelect
                value={effectiveEditRole}
                onChange={(code) => setEditForm({ ...editForm, ...encodeRoleSelection(code) })}
              />
            </div>
            <Separator />
            <div>
              <Label>新しいパスワード <span className="text-muted-foreground text-xs">（変更する場合のみ入力）</span></Label>
              <Input
                type="password"
                placeholder="8文字以上"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
              />
            </div>
            <Button onClick={handleEdit} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>管理者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>ログインID</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>権限</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    管理者が登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.loginId || "—"}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(admin)}>
                        {getRoleLabel(admin)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={admin.active}
                          onCheckedChange={() => handleToggleActive(admin)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {admin.active ? "有効" : "無効"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(admin)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(admin.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {roleEditOpen && (
        <Dialog open onOpenChange={setRoleEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                カスタムロールを編集
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ロールコード <span className="text-xs text-muted-foreground">（変更不可）</span></Label>
                <Input value={roleEditTarget?.code || ""} disabled className="font-mono bg-muted" />
              </div>
              <div>
                <Label>表示名</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>説明 <span className="text-xs text-muted-foreground">（任意）</span></Label>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                type="button"
                onClick={handleEditRole}
                disabled={roleFormSaving || !roleForm.name}
                className="w-full"
              >
                {roleFormSaving ? "更新中..." : "更新する"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {roleCreateOpen && (
        <Dialog open onOpenChange={setRoleCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                カスタムロールを作成
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ロールコード <span className="text-xs text-muted-foreground">（英大文字・数字・アンダースコアのみ）</span></Label>
                <Input
                  value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") })}
                  placeholder="例: CONTENT_MANAGER"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">作成後は変更できません</p>
              </div>
              <div>
                <Label>表示名</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="例: コンテンツ管理者"
                />
              </div>
              <div>
                <Label>説明 <span className="text-xs text-muted-foreground">（任意）</span></Label>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="このロールの説明を入力してください"
                  rows={3}
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateRole}
                disabled={roleFormSaving || !roleForm.code || !roleForm.name}
                className="w-full"
              >
                {roleFormSaving ? "作成中..." : "作成する"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!roleDeleteId} onOpenChange={() => setRoleDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カスタムロールを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{allRoles.find(r => r.id === roleDeleteId)?.name}」を削除しますか？このロールに設定された権限もすべて削除されます。管理者に割り当て済みのロールは削除できません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>管理者を削除</AlertDialogTitle>
            <AlertDialogDescription>
              本当にこの管理者を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
