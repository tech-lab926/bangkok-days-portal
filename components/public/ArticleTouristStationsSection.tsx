import { Lightbulb } from "lucide-react";

export default function ArticleTouristStationsSection() {
  return (
    <section className="mx-auto w-full max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
      {/* Section Title */}
      <h2 className="text-[24px] font-bold leading-tight text-[#112d57]">
        5. 観光に便利な駅とアクセス
      </h2>
      
      {/* Blue Divider */}
      <div className="mt-3 h-2 w-full bg-[#174a9c]" />

      {/* Lead Paragraph */}
      <p className="mt-6 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        観光で訪れるべき主要な駅と、そこからアクセスできるスポットをご紹介します。
      </p>

      {/* Subsection 1 - Siam Station */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ サイアム駅（Siam）</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>Siam Paragon：高級ショッピングモール</li>
        <li>MBK Center：お土産探しに最適</li>
        <li>Siam Square：若者向けファッションエリア</li>
      </ul>

      {/* Subsection 2 - Asok Station */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ アソーク駅（Asok）</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>Terminal 21：世界の都市をテーマにしたショッピングモール</li>
        <li>ソイカウボーイ：バンコクの夜遊びスポット</li>
        <li>日本料理店が多く集まるエリア</li>
      </ul>

      {/* Subsection 3 - Chit Lom Station */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ チットロム駅（Chit Lom）</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>セントラルワールド：巨大ショッピングコンプレックス</li>
        <li>エラワン廟：パワースポットとして有名</li>
        <li>プラトゥーナム市場：衣料品の卸売市場</li>
      </ul>

      {/* Subsection 4 - Saphan Taksin Station */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ サパーンタクシン駅（Saphan Taksin）</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>チャオプラヤー川の水上ボート乗り場に直結</li>
        <li>アジアティーク サリバーフロント：ナイトマーケット</li>
        <li>ワットアルン（暁の寺）へのアクセス拠点</li>
      </ul>

      {/* Info Box - Efficient Route */}
      <div className="mt-8 rounded-2xl bg-[#e8f1f8] p-6 border border-[#b8d4e8]">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 shrink-0 text-[#183c7a] mt-1" />
          <div>
            <p className="text-[18px] font-bold text-[#0f2a52]">効率的な観光ルート</p>
            <p className="mt-3 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
              1日で複数のスポットを回る場合、路線図を見ながら同じ線上にある駅を選ぶと、移動時間を短縮できます。サイアム駅を中心に計画を立てると、周り見ても移ムーズです。
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
