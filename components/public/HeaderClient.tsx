"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, User, ChevronDown, Settings, UserSquare } from "lucide-react";

type ExtUser = { userType?: string; name?: string | null; email?: string | null; id?: string };

export function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user as ExtUser | undefined;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Always listen for avatar-updated events
    const handler = (e: Event) => setAvatarUrl((e as CustomEvent).detail);
    window.addEventListener("avatar-updated", handler);

    // Fetch avatar from API whenever we have a logged-in regular user
    const userType = (session?.user as any)?.userType;
    if (session && userType === "user") {
      fetch("/api/v1/auth/profile")
        .then(r => r.json())
        .then(j => { if (j.success) setAvatarUrl(j.data.avatarUrl || null); })
        .catch(() => {});
    }

    return () => window.removeEventListener("avatar-updated", handler);
  }, [session]);

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-[#e1e5ed]" />;
  }

  if (!session || user?.userType === "admin") {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#c8d0dd] bg-white px-4 text-[13px] font-medium text-[#114f9d] transition hover:bg-[#ecf1f8]">
          <LogIn className="h-4 w-4" />
          ログイン
        </Link>
        <Link href="/auth/register" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0f4aa8] px-4 text-[13px] font-medium text-white transition hover:bg-[#0d3f94]">
          新規登録
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setDropdownOpen((p) => !p)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-[#c8d0dd] bg-white px-3 text-[13px] font-medium text-[#114f9d] transition hover:bg-[#ecf1f8]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f4aa8] text-white">
            <User className="h-3.5 w-3.5" />
          </div>
        )}
        <span className="max-w-[100px] truncate">{user?.name}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#e1e5ed] bg-white py-1 shadow-lg">
            <div className="border-b border-[#e1e5ed] px-4 py-2">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
            {user?.id && (
              <Link href={`/users/${user.id}`} onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#ecf1f8]">
                <UserSquare className="h-4 w-4" />
                プロフィールを見る
              </Link>
            )}
            <Link href="/profile" onClick={() => setDropdownOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#ecf1f8]">
              <Settings className="h-4 w-4" />
              プロフィール設定
            </Link>
            <button type="button" onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 transition hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileUserMenu({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();
  const user = session?.user as ExtUser | undefined;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setAvatarUrl((e as CustomEvent).detail);
    window.addEventListener("avatar-updated", handler);

    const userType = (session?.user as any)?.userType;
    if (session && userType === "user") {
      fetch("/api/v1/auth/profile")
        .then(r => r.json())
        .then(j => { if (j.success) setAvatarUrl(j.data.avatarUrl || null); })
        .catch(() => {});
    }

    return () => window.removeEventListener("avatar-updated", handler);
  }, [session]);

  if (status === "loading") return null;

  if (!session || user?.userType === "admin") {
    return (
      <div className="flex gap-2 border-t border-[#e1e5ed] px-3 py-3">
        <Link href="/auth/login" onClick={onClose}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#c8d0dd] bg-white py-2.5 text-[13px] font-medium text-[#114f9d]">
          <LogIn className="h-4 w-4" />ログイン
        </Link>
        <Link href="/auth/register" onClick={onClose}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#0f4aa8] py-2.5 text-[13px] font-medium text-white">
          新規登録
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-[#e1e5ed] px-3 py-3 space-y-2">
      <div className="flex items-center gap-2 px-2 py-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f4aa8] text-white">
            <User className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      {user?.id && (
        <Link href={`/users/${user.id}`} onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#c8d0dd] bg-white py-2.5 text-[13px] font-medium text-[#114f9d]">
          <UserSquare className="h-4 w-4" />プロフィールを見る
        </Link>
      )}
      <Link href="/profile" onClick={onClose}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[#c8d0dd] bg-white py-2.5 text-[13px] font-medium text-[#114f9d]">
        <Settings className="h-4 w-4" />プロフィール設定
      </Link>
      <button type="button" onClick={() => { onClose(); signOut({ callbackUrl: "/" }); }}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 py-2.5 text-[13px] font-medium text-red-600">
        <LogOut className="h-4 w-4" />ログアウト
      </button>
    </div>
  );
}

export function MobileMenuToggle({ navItems }: { navItems: { label: string; href: string; iconPath: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="inline-flex h-10 w-10 items-center justify-center" aria-label="メニュー">
        <span className="relative block h-6 w-8">
          <span className="absolute left-0 top-0 block h-0.5 w-full bg-[#2d55a3]" />
          <span className="absolute left-0 top-2.5 block h-0.5 w-full bg-[#2d55a3]" />
          <span className="absolute left-0 top-5 block h-0.5 w-full bg-[#2d55a3]" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-t border-[#d8dfeb] bg-white md:hidden z-50">
          <nav className="grid grid-cols-3 gap-2 px-3 py-3">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="flex flex-col items-center justify-center gap-1 rounded-md border border-[#e1e5ed] py-2 text-[#114f9d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.iconPath} alt="" width={24} height={24} className="h-6 w-6 object-contain" loading="lazy" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          <MobileUserMenu onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
