"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-280 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-[12px] text-[#999]">
          <Link href="/" className="text-[#004098]">TOP</Link>
          <span className="text-[#ccc]">›</span>
          <span>サイトについて</span>
        </div>

        {/* Page Title */}
        <h1 className="mb-8 text-[28px] font-bold text-[#004098]">サイトについて</h1>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Section 1: About */}
          <section>
            <h2 className="mb-4 text-[18px] font-bold text-[#1a1a1a]">サイトについて</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#444]">
              <p>バンコクデイズは、バンコク在住の日本人の方々に向けた総合情報ポータルサイトです。飲食店、美容、医療、生活サービスなど、バンコクでの日常生活に必要な情報を日本語で提供しています。</p>
              <p>「バンコク日本人の行きつけが見つかる」をコンセプトに、信頼できるお店の情報を厳選して掲載しています。</p>
            </div>
          </section>

          {/* Section 2: Listing Information */}
          <section>
            <h2 className="mb-4 text-[18px] font-bold text-[#1a1a1a]">掲載情報について</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#444]">
              <p>本サイトに掲載されている情報は、一般に公開している情報、および各店店に収集した情報についています。</p>
              <p>可能な限り正確な情報の掲載に努めていますが、情報の正確性、最新性、完全性について保証するものではありません。</p>
              <p>営業時間、料金、サービス内容などの詳細は変更される可能性があります。ご利用前には、必ず各店舗やサービス提供者に確認ください。</p>
            </div>
          </section>

          {/* Section 3: Listing Standards */}
          <section>
            <h2 className="mb-4 text-[18px] font-bold text-[#1a1a1a]">掲載基準について</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#444]">
              <p>本サイトでは、バンコク在住の日本人向けに関連する情報のうち、有用性や信頼性のある と判断したものを掲載しています。</p>
              <p>掲載の判断は、特定の宗教やサービスの傷害を示すものではありません。また、掲載されていない商品やサービスを否定するものでもありません。</p>
              <p>違法性のあるお店や、公序良俗に反する内容は掲載いたしません。</p>
            </div>
          </section>

          {/* Section 4: Advertising */}
          <section>
            <h2 className="mb-4 text-[18px] font-bold text-[#1a1a1a]">広告・掲載依頼について</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#444]">
              <p>現在、有料広告のお取扱や有料でのご掲載は受け付けておりません。</p>
              <p>掲載されたサイトの確認や有料サイトに関わる説明については、金銭の対価による掲載は、特定の業者からの依頼による場合があります。</p>
              <p>情報の採正や削除の依頼については、内容を確認の上、対応を検討いたします。ただし、すべてのご依頼にお応えできるわけではありませんので、あらかじめご承知ください。</p>
            </div>
          </section>

          {/* Section 5: Disclaimer */}
          <section>
            <h2 className="mb-4 text-[18px] font-bold text-[#1a1a1a]">免責事項</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#444]">
              <p>本サイトに掲載されている情報の利用によって生じた損害について、当サイトは一切の責任を負いません。</p>
              <p>外部サイトへのリンクが含まれている場合があります。リンク先のウェブサイトの内容について当サイトは責任を負いません。</p>
              <p>本サイトの運営は予告なく中断または終了する場合があります。</p>
              <p>本サイトの内容は予告なく変更・削除される場合があります。</p>
              <p>本サイトのご利用に関して生じた問題について、当サイトは一切の責任を負わないものとします。</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
