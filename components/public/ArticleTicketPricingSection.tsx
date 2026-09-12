import Image from "next/image";
import { Hand } from "lucide-react";

export default function ArticleTicketPricingSection() {
  return (
    <section className="mx-auto w-full max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
      {/* Section Title */}
      <h2 className="text-[24px] font-bold leading-tight text-[#112d57]">
        2. チケットの買い方と金額系
      </h2>
      
      {/* Blue Divider */}
      <div className="mt-3 h-2 w-full bg-[#174a9c]" />

      {/* Hero Image */}
      <div className="mt-8 flex justify-center">
        <Image
          src="/img/train.jpg"
          alt="BTS Train"
          width={500}
          height={300}
          className="h-80 w-full max-w-240 object-cover"
          priority
        />
      </div>

      {/* Lead Paragraph */}
      <p className="mt-6 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        BTSのチケット購入は、複数の方法があります。初めての方でも、それぞれの方法で簡単に購入できます。最もポピュラーな方法から順にご紹介します。
      </p>

      {/* Subsection 1 */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 自動券売機での購入（推薦）</h3>
      <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        最も一般的な方法は、駅の自動券売機での購入です。
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>多言語対応の券売機が設置されている</li>
        <li>駅の周辺に複数台配置されている</li>
        <li>現金とクレジットカードの両方に対応</li>
        <li>ICカードチャージチケットも購入できる</li>
      </ul>

      {/* Yellow Advisory Box */}
      <div className="mt-6 rounded-2xl bg-[#FFC10780] p-6">
        <div className="flex items-center gap-3">
          <Hand className="h-6 w-6 shrink-0 text-[#333333]" />
          <p className="text-[18px] font-bold text-[#333333]">初心者が注意すべきポイント</p>
        </div>
        <p className="mt-4 text-[16px] font-semibold leading-[1.65] text-[#333333]">
          一部の券売機は100バーツ以上の紙幣に対応していません。駅の窓口で両替してもらうか、小銭を用意しておくことをおすすめです。
        </p>
      </div>

      {/* Subsection 2 */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ Rabbit Cardの利用</h3>
      <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        Rabbit CardはタイのICカードです。複数のBTSを利用する場合は、このカードの購入をおすすめします。
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>初回購入時：200バーツ（160バーツデポジット）</li>
        <li>チャージは駅の窓口で対応</li>
        <li>一度のチャージで複数回利用可能</li>
        <li>一般のコンビニレジでも使用可能</li>
      </ul>

      {/* Subsection 3 */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 料金体系</h3>
      <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        運賃は区間によって異なります。運賃はバーツ単位の最新運賃です。
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#d0d0d0] bg-white">
        <table className="w-full text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
          <tbody>
            <tr className="border-b border-[#e0e0e0]">
              <td className="px-4 py-3">区間</td>
              <td className="px-4 py-3">料金</td>
            </tr>
            <tr className="border-b border-[#e0e0e0]">
              <td className="px-4 py-3">1-2駅</td>
              <td className="px-4 py-3">16-21バーツ</td>
            </tr>
            <tr className="border-b border-[#e0e0e0]">
              <td className="px-4 py-3">3-8駅</td>
              <td className="px-4 py-3">26-42バーツ</td>
            </tr>
            <tr>
              <td className="px-4 py-3">9駅以上</td>
              <td className="px-4 py-3">45-62バーツ</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </section>
  );
}
