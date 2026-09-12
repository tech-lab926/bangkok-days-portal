import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CategoryTabs from "./CategoryTabsClient";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  placesCount: number;
};

type RawCategory = {
  id: string;
  slug: string;
  translations?: Array<{ name?: string }>;
  _count?: { places?: number };
};

export default function CategoryPreviewSection({ initialData }: { initialData?: RawCategory[] }) {
  const categories: CategoryItem[] = (initialData || []).map((c) => ({
    id: c.id,
    name: c.translations?.[0]?.name || c.slug,
    slug: c.slug,
    placesCount: c._count?.places || 0,
  }));

  return (
    <section className="bg-[#f2f4f8] py-12 md:py-16">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-center text-[30px] font-extrabold tracking-[0.02em] text-[#004098] md:text-[44px]">
          カテゴリから探す
        </h2>
        <CategoryTabs categories={categories} />
      </div>
    </section>
  );
}
