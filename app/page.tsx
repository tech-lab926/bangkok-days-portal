import HeroSection from "@/components/public/HeroSection";
import CategoryPreviewSection from "@/components/public/CategoryPreviewSection";
import BangkokTodaySection from "@/components/public/BangkokTodaySection";
import QaSectionHomepage from "@/components/public/QaSectionHomepage";
import LatestNewsSection from "@/components/public/LatestNewsSection";
import LatestGuidesSection from "@/components/public/LatestGuidesSection";
import AreaSearchSection from "@/components/public/AreaSearchSection";
import SceneRecommendationSection from "@/components/public/SceneRecommendationSection";
import EditorSpotServiceSection from "@/components/public/EditorSpotServiceSection";
import NightlifeSection from "@/components/public/NightlifeSection";
import PopularRankingSection from "@/components/public/PopularRankingSection";
import RecommendedJobsSection from "@/components/public/RecommendedJobsSection";
import StoreOwnerPlanSection from "@/components/public/StoreOwnerPlanSection";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Noto_Sans_JP } from "next/font/google";
import prisma from "@/lib/prisma";
import type { Article, Area, Category, Place, Scene } from "@/lib/public-api";
import { unstable_cache } from "next/cache";
// import "./(public)/public.css";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const revalidate = 300;

const locale = "ja";

const articleInclude = {
  translations: { where: { locale } },
  tags: {
    include: {
      tag: { include: { translations: { where: { locale } } } },
    },
  },
} as const;

const placeInclude = {
  translations: { where: { locale } },
  area: { include: { translations: { where: { locale } } } },
  categories: {
    include: {
      category: { include: { translations: { where: { locale } } } },
    },
  },
  scenes: {
    include: {
      scene: { include: { translations: { where: { locale } } } },
    },
  },
  images: { orderBy: { order: "asc" as const }, take: 1 },
  tags: {
    include: {
      tag: { include: { translations: { where: { locale } } } },
    },
  },
} as const;

const getHomepageData = unstable_cache(async () => {
  try {
    const [
      news,
      guides,
      areas,
      categories,
      scenes,
      featured,
      nightlife,
      jobs,
    ] = await Promise.all([
      prisma.article.findMany({
        where: { type: "NEWS", published: true },
        include: articleInclude,
        take: 10,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      }),
      prisma.article.findMany({
        where: { type: "GUIDE", published: true },
        include: articleInclude,
        take: 10,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      }),
      prisma.area.findMany({
        where: { enabled: true },
        include: {
          translations: { where: { locale } },
          _count: { select: { places: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.category.findMany({
        where: { enabled: true },
        include: {
          translations: { where: { locale } },
          _count: { select: { places: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.scene.findMany({
        where: { enabled: true },
        include: {
          translations: { where: { locale } },
          _count: { select: { places: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.place.findMany({
        where: { isVisible: true, showSpotlight: true },
        include: placeInclude,
        take: 5,
        orderBy: [
          { displayPriority: "desc" },
          { showSpotlight: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.place.findMany({
        where: { isVisible: true, type: "NIGHT" },
        include: placeInclude,
        take: 5,
        orderBy: [
          { displayPriority: "desc" },
          { showSpotlight: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.job.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: {
          place: { include: { translations: { where: { locale } } } },
        },
        take: 6,
      }),
    ]);

    return {
      news,
      guides,
      areas,
      categories,
      scenes,
      featured,
      nightlife,
      jobs,
    };
  } catch {
    // Return empty data if database is unavailable (e.g. during Docker build)
    return {
      news: [],
      guides: [],
      areas: [],
      categories: [],
      scenes: [],
      featured: [],
      nightlife: [],
      jobs: [],
    };
  }
}, ["homepage-data"], { revalidate: 300 });

export default async function Home() {
  const { news, guides, areas, categories, scenes, featured, nightlife, jobs } =
    await getHomepageData();

  return (
    <div className={`${notoSansJP.variable} public-site`}>
      <Header />
      <main>
        <HeroSection />
        <BangkokTodaySection />
        <QaSectionHomepage />
        <CategoryPreviewSection initialData={serialize(categories) as unknown as any} />
        {/* <CategorySection /> */}
        {/* <InfoPanel /> */}
        <LatestNewsSection initialData={serialize(news) as unknown as Article[]} />
        <LatestGuidesSection initialData={serialize(guides) as unknown as Article[]} />
        <AreaSearchSection initialData={serialize(areas) as unknown as Area[]} />
        <SceneRecommendationSection initialData={serialize(scenes) as unknown as Scene[]} />
        <EditorSpotServiceSection initialData={serialize(featured) as unknown as Place[]} />
        <NightlifeSection initialData={serialize(nightlife) as unknown as Place[]} />
        <PopularRankingSection initialData={(serialize(guides) as unknown as Article[]).slice(0, 5)} />
        <RecommendedJobsSection initialData={serialize(jobs) as unknown as any[]} />
        <StoreOwnerPlanSection />
      </main>
      <Footer />
    </div>
  );
}
