"use client";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Camera, Loader2, AlertTriangle } from "lucide-react";

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete-account dialog state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (session?.user?.userType !== "user") return;
    fetch("/api/v1/auth/profile").then(r => r.json()).then(j => {
      if (j.success) {
        setProfile(j.data);
        setNickname(j.data.nickname || "");
        setBio(j.data.bio || "");
        setAvatarUrl(j.data.avatarUrl || "");
      }
    });
  }, [session, status]);

  // ── Avatar upload ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/v1/auth/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const newUrl = data.data.url as string;
      // Immediately patch profile with new avatar
      const patch = await fetch("/api/v1/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: newUrl }),
      });
      const patchJson = await patch.json();
      if (!patchJson.success) throw new Error(patchJson.error);
      setAvatarUrl(newUrl);
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: newUrl }));
      toast.success("アバターを更新しました");
    } catch (err: any) {
      toast.error(err.message || "アップロードに失敗しました");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Profile save ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/v1/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, bio }),
    });
    const json = await res.json();
    if (json.success) toast.success("プロフィールを更新しました");
    else toast.error(json.error);
    setSaving(false);
  };

  // ── Password change ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast.error("パスワードを入力してください"); return; }
    setSaving(true);
    const res = await fetch("/api/v1/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const json = await res.json();
    if (json.success) { toast.success("パスワードを変更しました"); setCurrentPw(""); setNewPw(""); }
    else toast.error(json.error);
    setSaving(false);
  };

  // ── Email change ──────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!newEmail || !emailPw) { toast.error("必須項目を入力してください"); return; }
    setSaving(true);
    const res = await fetch("/api/v1/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password: emailPw }),
    });
    const json = await res.json();
    if (json.success) { toast.success("確認メールを送信しました"); setNewEmail(""); setEmailPw(""); }
    else toast.error(json.error);
    setSaving(false);
  };

  // ── Withdraw (delete account) ─────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (withdrawConfirm !== "退会する") {
      toast.error("「退会する」と入力してください");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/v1/auth/profile", { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("アカウントを削除しました。ご利用ありがとうございました。");
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました");
      setWithdrawing(false);
    }
  };

  if (!profile) return null;

  return (
    <section className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-bold">プロフィール設定</h1>

      {/* ── Avatar ── */}
      <div className="space-y-4">
        <h2 className="font-semibold">アバター</h2>
        <Separator />
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="アバター"
                className="h-20 w-20 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-[#0f4aa8] flex items-center justify-center text-white text-2xl font-bold select-none">
                {(nickname || profile?.fullName || "U")[0].toUpperCase()}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              JPG・PNG・GIF（5MB以内）
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              id="avatar-file-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-1.5" />
              {avatarUploading ? "アップロード中..." : "画像を変更"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Basic info ── */}
      <div className="space-y-4">
        <h2 className="font-semibold">基本情報</h2>
        <Separator />
        <div className="space-y-1.5">
          <Label>ニックネーム（30文字以内）</Label>
          <Input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={30} />
        </div>
        <div className="space-y-1.5">
          <Label>自己紹介（140文字以内）</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={140} rows={3} />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/140</p>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving}>保存する</Button>
      </div>

      {/* ── Password ── */}
      <div className="space-y-4">
        <h2 className="font-semibold">パスワード変更</h2>
        <Separator />
        <div className="space-y-1.5">
          <Label>現在のパスワード</Label>
          <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>新しいパスワード（8文字以上）</Label>
          <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
        </div>
        <Button onClick={handleChangePassword} disabled={saving} variant="outline">パスワードを変更</Button>
      </div>

      {/* ── Email ── */}
      <div className="space-y-4">
        <h2 className="font-semibold">メールアドレス変更</h2>
        <Separator />
        <p className="text-xs text-muted-foreground">新しいアドレスに確認メールを送信します。リンクをクリックすると変更が完了します。</p>
        <div className="space-y-1.5">
          <Label>新しいメールアドレス</Label>
          <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>現在のパスワード（確認）</Label>
          <Input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} />
        </div>
        <Button onClick={handleChangeEmail} disabled={saving} variant="outline">確認メールを送信</Button>
      </div>

      {/* ── Withdraw ── */}
      <div className="space-y-4">
        <h2 className="font-semibold text-red-600">退会・アカウント削除</h2>
        <Separator />
        <p className="text-sm text-muted-foreground">
          退会すると、アカウント情報は削除され、投稿データは「退会済みユーザー」として匿名で残ります。この操作は取り消せません。
        </p>

        {!showWithdraw ? (
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            onClick={() => setShowWithdraw(true)}
          >
            退会する
          </Button>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">本当に退会しますか？</p>
            </div>
            <p className="text-xs text-red-600">
              確認のため、下のフィールドに「退会する」と入力してください。
            </p>
            <Input
              value={withdrawConfirm}
              onChange={e => setWithdrawConfirm(e.target.value)}
              placeholder="退会する"
              className="border-red-300 focus-visible:ring-red-400"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={withdrawing || withdrawConfirm !== "退会する"}
                onClick={handleWithdraw}
              >
                {withdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                アカウントを削除する
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={withdrawing}
                onClick={() => { setShowWithdraw(false); setWithdrawConfirm(""); }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
