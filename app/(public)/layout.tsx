import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "バンコク日本人の行きつけが見つかる | バンコクデイズ",
  description: "バンコク在住・出張日本人のための総合情報サイト。日本語対応の飲食・バー・ナイト・生活サービスを厳選掲載。",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${notoSansJP.variable} public-site w-full`}>
      {/* Preconnect to Cloudinary for faster image loads */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
