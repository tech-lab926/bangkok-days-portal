export const metadata = {
  title: "バンコク日本人向けガイド記事",
  description: "バンコク在住・旅行者向けの役立つガイド記事。ナイト・生活・移動・医療など幅広いテーマで解説。",
  alternates: { canonical: "/articles" },
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
