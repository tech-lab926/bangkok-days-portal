export const metadata = {
  title: "バンコク最新ニュース（日本人向け）",
  description: "バンコク在住日本人の生活に影響するニュースを日本語でわかりやすく更新。交通・営業・イベント情報も。",
  alternates: { canonical: "/news" },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
