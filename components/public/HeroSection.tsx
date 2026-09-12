import Image from "next/image";
import HeroSearchBox from "./HeroSearchBox";

export default function HeroSection() {
  return (
    <section className="bg-[#eceff4] pb-9 pt-7 md:pb-12 md:pt-10">
      <div className="mx-auto w-full max-w-360 px-4 md:px-6">
        <div className="grid items-center gap-7 md:grid-cols-[0.95fr_1.05fr] md:gap-10">
          <div className="order-2 -mx-4 text-center md:order-1 md:mx-0 md:text-left">
            <h1 className="tracking-[0.01em] text-[#114f9d]">
              <span className="block text-[30px] font-medium leading-[1.08] sm:text-[34px] md:text-[46px] lg:text-[52px]">
                バンコク日本人の
              </span>
              <span className="mt-2 block text-[46px] font-semibold leading-[0.98] sm:text-[56px] md:text-[74px] lg:text-[84px]">
                <span className="inline md:block">行きつけが</span>
                <span className="inline md:block">見つかる。</span>
              </span>
            </h1>
            <p className="mt-5 w-full text-[16px] leading-snug text-[#1b365d] md:mt-6 md:text-[19px]">
              飲食・バー・ナイト・生活情報を日本語で最速更新。
            </p>
          </div>

          <div className="order-1 mx-auto w-full max-w-145 md:order-2 md:mx-0 md:max-w-160">
            <div className="relative aspect-16/10 overflow-hidden rounded-lg shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <Image
                src="/img/main.png"
                alt="バンコクの夜景"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <HeroSearchBox />
      </div>
    </section>
  );
}
