"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/use-permissions";
import {
  Store,
  Moon,
  PlusCircle,
  Mail,
  DollarSign,
  Building2,
  CreditCard,
  MapPin,
  Tag,
  Sparkles,
  Settings,
  LogOut,
  ChevronDown,
  UserCog,
  Users,
  Tags,
  MessageSquare,
  SlidersHorizontal,
  CalendarDays,
  Briefcase,
  Images,
  ShieldAlert,
  Newspaper,
  BookOpen,
  Star,
  BarChart3,
  TrainFront,
} from "lucide-react";
import { signOut } from "next-auth/react";

// Each item maps to a permission resource (or null for SUPER_ADMIN-only items)
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  resource: string | null;       // null = always visible (SUPER_ADMIN only gates)
  action?: "canView";
  superAdminOnly?: boolean;      // hidden for non-SUPER_ADMIN entirely
};

// Section 1: Store management
const storeMenuItems: NavItem[] = [
  { href: "/admin/stores",       label: "店舗一覧",          icon: Store,      resource: "stores" },
  { href: "/admin/night-stores", label: "ナイト店舗一覧",    icon: Moon,       resource: "stores" },
  { href: "/admin/stores/new",   label: "店舗登録",          icon: PlusCircle, resource: "stores" },
  { href: "/admin/owners",       label: "オーナー管理(会社)", icon: Building2,  resource: "owners" },
];

// Section 2: Sales & inquiries
const salesMenuItems: NavItem[] = [
  { href: "/admin/revenue",    label: "売上管理", icon: DollarSign, resource: "revenue" },
  { href: "/admin/inquiries",  label: "掲載依頼", icon: Mail,       resource: "inquiries" },
  { href: "/admin/jobs",       label: "求人依頼", icon: Briefcase,  resource: "jobs" },
];

// Section 3: Community & events
const communityMenuItems: NavItem[] = [
  { href: "/admin/today-events", label: "イベント管理",    icon: CalendarDays,   resource: "today_events" },
  { href: "/admin/qa",           label: "Q&A管理",         icon: MessageSquare,  resource: "qa" },
  { href: "/admin/community",    label: "コミュニティ管理", icon: MessageSquare,  resource: "community" },
];

// Section 4: Content management
const contentMenuItems: NavItem[] = [
  { href: "/admin/articles",      label: "記事管理",                  icon: BookOpen,   resource: "articles" },
  { href: "/admin/news",          label: "ニュース管理",              icon: Newspaper,  resource: "articles" },
  { href: "/admin/auto-news",     label: "AIニュース生成",            icon: Sparkles,   resource: "auto_news" },
  { href: "/admin/featured",      label: "特集管理(●選記事)",         icon: Star,       resource: "featured" },
  { href: "/admin/articles",      label: "ガイド記事管理(SEO記事)",   icon: BookOpen,   resource: "articles" },
  { href: "/admin/curated-lists", label: "ランキング管理",            icon: BarChart3,  resource: "curated_lists" },
  { href: "/admin/media",         label: "画像管理",                  icon: Images,     resource: "media" },
];

// Section 5: Settings
const configMenuItems: NavItem[] = [
  { href: "/admin/pricing-plans", label: "料金プラン設定", icon: CreditCard,        resource: "pricing_plans" },
  { href: "/admin/areas",         label: "エリア設定",     icon: MapPin,            resource: "areas" },
  { href: "/admin/stations",      label: "駅設定",         icon: TrainFront,        resource: "areas" },
  { href: "/admin/categories",    label: "カテゴリ設定",   icon: Tag,               resource: "categories" },
  { href: "/admin/scenes",        label: "シーン設定",     icon: Sparkles,          resource: "scenes" },
  { href: "/admin/tags",          label: "タグ設定",       icon: Tags,              resource: "tags" },
];

const settingsMenuItems: NavItem[] = [
  { href: "/admin/settings",             label: "設定",         icon: SlidersHorizontal, resource: "settings" },
  { href: "/admin/settings/permissions", label: "権限設定",     icon: ShieldAlert,       resource: null, superAdminOnly: true },
  { href: "/admin/settings/admins",      label: "管理者管理",   icon: UserCog,           resource: null, superAdminOnly: true },
  { href: "/admin/settings/users",       label: "ユーザー管理", icon: Users,             resource: "users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { can, effectiveRole } = usePermissions();
  const isSuperAdmin = effectiveRole === "SUPER_ADMIN";
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.includes("/admin/settings"),
  );

  const isVisible = (item: NavItem): boolean => {
    // Items marked superAdminOnly are only shown to SUPER_ADMIN
    if (item.superAdminOnly) return isSuperAdmin;
    // SUPER_ADMIN sees everything
    if (isSuperAdmin) return true;
    // For permission-controlled resources, check canView
    if (item.resource) return can(item.resource, "canView");
    return true;
  };

  const visibleStores = storeMenuItems.filter(isVisible);
  const visibleSales = salesMenuItems.filter(isVisible);
  const visibleCommunity = communityMenuItems.filter(isVisible);
  const visibleContent = contentMenuItems.filter(isVisible);
  const visibleConfig = configMenuItems.filter(isVisible);
  const visibleSettings = settingsMenuItems.filter(isVisible);

  const isItemActive = (href: string) => {
    if (href === "/admin/stores") return pathname === "/admin/stores";
    if (href === "/admin/stores/new") return pathname === "/admin/stores/new";
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:scale-[1.01] active:scale-[0.99]",
        )}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
        )}
        <div
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
            isActive
              ? "bg-white/20 ring-2 ring-white/30"
              : "bg-muted/50 group-hover:bg-primary/10 group-hover:ring-2 group-hover:ring-primary/20",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isActive ? "scale-110" : "group-hover:scale-110",
            )}
          />
        </div>
        <span className="truncate relative z-10">{item.label}</span>
        {!isActive && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        )}
      </Link>
    );
  };

  const SettingsNavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-sm",
        )}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
        )}
        <div className="w-1 h-1 rounded-full bg-current opacity-50" />
        <Icon className="h-3.5 w-3.5 relative z-10" />
        <span className="truncate relative z-10 text-xs">{item.label}</span>
        {!isActive && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        )}
      </Link>
    );
  };

  const Divider = () => <div className="h-px bg-border/40 my-2" />;

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-border/60 bg-gradient-to-b from-background via-background to-background-subtle backdrop-blur-xl shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border/60 px-6 bg-gradient-to-r from-primary/5 to-transparent">
        <Link
          href="/admin/stores"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/img/logo.png" alt="バンコクデイズ" className="w-full h-auto object-contain max-h-14" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

        {/* Section 1: Stores */}
        {visibleStores.map((item) => <NavLink key={item.href + item.label} item={item} />)}

        {/* Section 2: Sales */}
        {visibleSales.length > 0 && <Divider />}
        {visibleSales.map((item) => <NavLink key={item.href + item.label} item={item} />)}

        {/* Section 3: Community */}
        {visibleCommunity.length > 0 && <Divider />}
        {visibleCommunity.map((item) => <NavLink key={item.href + item.label} item={item} />)}

        {/* Section 4: Content */}
        {visibleContent.length > 0 && <Divider />}
        {visibleContent.map((item) => <NavLink key={item.href + item.label} item={item} />)}

        {/* Section 5: Config settings */}
        {visibleConfig.length > 0 && <Divider />}
        {visibleConfig.map((item) => <NavLink key={item.href + item.label} item={item} />)}

        {/* Settings Section (Collapsible) */}
        {visibleSettings.length > 0 && <Divider />}
        {visibleSettings.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-primary/10 group-hover:ring-2 group-hover:ring-primary/20 transition-all duration-300">
                <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="truncate flex-1 text-left relative z-10">設定</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300 relative z-10",
                  settingsOpen && "rotate-180",
                )}
              />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </button>

            <div
              className={cn(
                "ml-4 space-y-0.5 overflow-hidden transition-all duration-300",
                settingsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {visibleSettings.map((item) => <SettingsNavLink key={item.href} item={item} />)}
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-border/60 p-3 bg-gradient-to-t from-muted/30 to-transparent">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div suppressHydrationWarning className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-destructive/20 group-hover:ring-2 group-hover:ring-destructive/30 transition-all duration-300">
            <LogOut suppressHydrationWarning className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="relative z-10">ログアウト</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-destructive/5 to-transparent" />
        </button>
      </div>
    </aside>
  );
}
