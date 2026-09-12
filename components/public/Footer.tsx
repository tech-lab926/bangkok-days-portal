import Link from "next/link";

const footerLinks = {
  カテゴリ: [
    { label: "ー店舗一覧", href: "/shops" },
    { label: "ーエリア", href: "/area" },
    { label: "ーナイト店舗一覧", href: "/night" },
  ],
  情報: [
    { label: "ーお問い合わせ", href: "/inquiry" },
    { label: "ー掲載依頼", href: "/listing" },
    { label: "ーサイトについて", href: "/about" },
    { label: "ー利用規約", href: "/terms" },
    { label: "ープライバシーポリシー", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f4aa8] text-white">
      <div className="mx-auto w-full max-w-[1100px] px-8 py-10 md:px-16 md:py-12">
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.1fr] lg:gap-10">
          <div className="max-w-120">
            <h3 className="text-[20px] font-medium tracking-[0.01em]">バンコクデイズ</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-white/95">
              バンコク在住・出張日本人のための総合情報サイト。
              <br />
              飲食・バー・ナイト・生活情報を日本語で最速更新。
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[18px] font-medium">{title}</h4>
              <ul className="mt-3 space-y-1.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[14px] text-white/95 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] text-white/90 md:mt-9">
          © 2026 バンコクデイズ (Bangkok Days) All rights reserved.
        </p>
      </div>
    </footer>
  );
}
