import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { SessionProvider } from "@/components/providers/session-provider";
import prisma from "@/lib/prisma";
import "./public.css";
import "./globals-public.css";

const getSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.globalSettings.findMany({
        where: { key: { in: ["ga_tracking_id", "gsc_verification"] } },
      });
      return {
        gaId: settings.find((s) => s.key === "ga_tracking_id")?.value || "",
        gscCode: settings.find((s) => s.key === "gsc_verification")?.value || "",
      };
    } catch {
      return { gaId: "", gscCode: "" };
    }
  },
  ["global-settings"],
  { revalidate: 3600 }
);

export const metadata: Metadata = {
  title: {
    default: "バンコク日本人の行きつけが見つかる | バンコクデイズ",
    template: "%s | バンコクデイズ",
  },
  description: "バンコク在住・出張日本人のための総合情報サイト。日本語対応の飲食・バー・ナイト・生活サービスを厳選掲載。",
  metadataBase: new URL("https://bangkok-days.com"),
  openGraph: {
    siteName: "バンコクデイズ",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/img/main.png", width: 1200, height: 630, alt: "バンコクデイズ" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/img/main.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gaId, gscCode } = await getSettings()

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {gscCode && <meta name="google-site-verification" content={gscCode} />}
        {/* GA: defer loading until after page is interactive */}
        {gaId && (
          <script dangerouslySetInnerHTML={{ __html: `
            window.addEventListener('load', function() {
              var s = document.createElement('script');
              s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
              s.async = true;
              document.head.appendChild(s);
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: true });
            });
          `}} />
        )}
      </head>
      <body className="antialiased font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
