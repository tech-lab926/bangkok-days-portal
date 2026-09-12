import { Lightbulb } from "lucide-react";

export default function ArticleRoutesTransferSection() {
  return (
    <section className="mx-auto w-full max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
      {/* Section Title */}
      <h2 className="text-[24px] font-bold leading-tight text-[#112d57]">
        3. 主要な路線と乗り換え方法
      </h2>
      
      {/* Blue Divider */}
      <div className="mt-3 h-2 w-full bg-[#174a9c]" />

      {/* Subsection 1 - Sukhumvit Line */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">
        ▼ スクンビット線（Sukhumvit Line / ライトグリーン）
      </h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>バンコク東部から北部を結ぶ路線</li>
        <li>アソーク、プロンポン、トンロー,など日本人居住エリアを通過</li>
        <li>観光地に人気のショッピングモール（Terminal 21、EmQuartierなど）にアクセス</li>
      </ul>

      {/* Subsection 2 - Silom Line */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">
        ▼ シーロム線（Silom Line / ダークグリーン）
      </h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>バンコク中心部から南西方向へ延びる路線</li>
        <li>サイアム、チョンノンシー、サパーンタクシンなど主要駅を含む</li>
        <li>リバーサイドや夜の繁華街ハッピンへのアクセスに便利</li>
      </ul>

      {/* Info Box - Transfer Information */}
      <div className="mt-8 rounded-2xl bg-[#e8f1f8] p-6 border border-[#b8d4e8]">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 shrink-0 text-[#183c7a] mt-1" />
          <div>
            <p className="text-[18px] font-bold text-[#0f2a52]">乗り換えについて</p>
            <p className="mt-3 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
              2つの路線はサイアム駅で乗り換えができます。サイアム駅は有名なショッピングモール『Siam Paragon』に直結しており、乗り換え時間を利用して買い物や食事も楽しめます。
            </p>
          </div>
        </div>
      </div>

      {/* Subsection 3 - MRT Transfer */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">
        ▼ MRTへの乗り換え
      </h3>
      <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        以下の駅でBTSから地下鉄MRTに乗り換えることができます
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>アソーク駅 ↔ MRTスクンビット駅</li>
        <li>モーチット駅 ↔ MRTチャットチャック駅</li>
        <li>サラデーン駅 ↔ MRTシーロム駅</li>
      </ul>
      </div>
    </section>
  );
}
