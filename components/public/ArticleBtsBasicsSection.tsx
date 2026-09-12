import { Lightbulb } from "lucide-react";

export default function ArticleBtsBasicsSection() {
  return (
    <section className="mx-auto mt-10 max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
        <h2 className="text-[24px] font-bold leading-tight text-[#112d57]">
          1. BTSスカイトレインとは？基本情報
        </h2>
        <div className="mt-3 h-2 w-full bg-[#174a9c]" />

        <p className="mt-6 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
          BTS（Bangkok Mass Transit System）は、バンコク市内を走る高架鉄道です。渋滞が激しいバンコクの道路を避けて、快適に移動できる最も人気の交通手段となっています。
        </p>

        <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ BTSの主な特徴</h3>
        <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
          <li>朝6時から深夜0時まで運行（路線により異なる）</li>
          <li>冷房完備で清潔な車内環境</li>
          <li>運行間隔は3〜8分と短く、待ち時間が少ない</li>
          <li>主要観光地や商業施設に直結している駅が多い</li>
        </ul>

        <div className="mt-8 rounded-xl bg-[#dbe8ee] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-2 text-[#183c7a]">
            <Lightbulb className="h-5 w-5" />
            <p className="text-[24px] font-bold">在住者からのアドバイス</p>
          </div>
          <p className="mt-4 text-[16px] font-semibold leading-[1.7] text-[#1b355f]">
            ラッシュアワー（7:00-9:00、17:00-19:00）は非常に混雑します。観光の場合は、この時間帯を避けるとより快適に移動できます。
          </p>
        </div>

        <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 他の交通手段との違い</h3>
        <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
          バンコクには地下鉄（MRT）やエアポートリンクなど複数の鉄道がありますが、BTSは以下の点で特に便利です
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
          <li>主要ショッピングモールへのアクセスが良好</li>
          <li>駅の数が多く、目的地に近い駅を見つけやすい</li>
          <li>高架式のため、車窓からバンコクの街並みを楽しめる</li>
        </ul>
      </div>
    </section>
  );
}
