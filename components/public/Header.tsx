import Image from "next/image";
import Link from "next/link";
import { UserMenu, MobileMenuToggle } from "./HeaderClient";

const navItems = [
  { label: "店舗一覧", href: "/shops",    iconPath: "/icons/nav/icon-nav-category.png" },
  { label: "エリア",   href: "/area",     iconPath: "/icons/nav/icon-nav-area.png" },
  { label: "カテゴリ", href: "/category", iconPath: "/icons/nav/icon-nav-category.png" },
  { label: "夜遊びナビ", href: "/night",  iconPath: "/icons/nav/icon-nav-news.png" },
  { label: "特集",     href: "/featured", iconPath: "/icons/nav/icon-nav-listing.png" },
  { label: "ガイド",   href: "/articles", iconPath: "/icons/nav/icon-nav-area.png" },
  { label: "掲載依頼", href: "/listing",  iconPath: "/icons/nav/icon-nav-listing.png" },
  { label: "求人依頼", href: "/jobs",     iconPath: "/icons/nav/icon-nav-jobs.png" },
  // ランキング: 非表示（将来的に使用する可能性あり）
  // { label: "ランキング", href: "/ranking", iconPath: "/icons/nav/icon-nav-listing.png" },
];

export default function Header() {
  return (
    <header className="relative border-t-0 border-[#1d60be] bg-[#f4f6fa] md:border-t-[3px]">
      {/* Desktop */}
      <div className="hidden h-18 w-full items-stretch md:flex">
        <div className="w-64 shrink-0 items-center justify-center border-r border-dashed border-[#c8d0dd] md:flex">
          <Link href="/" className="flex items-center justify-center w-full px-3">
            <Image src="/img/logo.png" alt="バンコクデイズ" width={200} height={60}
              className="w-full h-auto object-contain max-h-20" priority />
          </Link>
        </div>

        <nav className="flex-1 grid items-stretch" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}
              className="flex min-w-0 flex-col items-center justify-center gap-0.5 border-r border-dashed border-[#c8d0dd] px-1 text-[#114f9d] transition hover:bg-[#ecf1f8]">
              {/* Use img for nav icons to avoid layout shift; they're small PNGs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.iconPath} alt="" width={30} height={30} className="h-7 w-7 object-contain" loading="lazy" />
              <span className="text-[12px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center border-l border-dashed border-[#c8d0dd] px-4">
          <UserMenu />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex h-18 w-full items-center justify-between px-4 md:hidden">
        <Link href="/" className="flex items-center justify-center">
          <Image src="/img/logo.png" alt="バンコクデイズ" width={150} height={45}
            className="h-12 w-auto object-contain" priority />
        </Link>
        <MobileMenuToggle navItems={navItems} />
      </div>
    </header>
  );
}
