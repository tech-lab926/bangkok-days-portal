import { AlertCircle } from "lucide-react";

export default function ArticleBeginnerTipsSection() {
  return (
    <section className="mx-auto w-full max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
      {/* Section Title */}
      <h2 className="text-[24px] font-bold leading-tight text-[#112d57]">
        4. 初心者が知っておくべき注意点
      </h2>
      
      {/* Blue Divider */}
      <div className="mt-3 h-2 w-full bg-[#174a9c]" />

      {/* Lead Paragraph */}
      <p className="mt-6 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        BTSを快適に利用するために、以下のポイントを押さえておきましょう。
      </p>

      {/* Subsection 1 - Ticket Gates */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 改札の通り方</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>入場時：ICカードをタッチパネルにかざす</li>
        <li>出場時：ICカードを挿入口に入れる（カードは回収されない）</li>
        <li>Rabbit Cardの場合：入場・出場とも両方タッチするのみ</li>
      </ul>

      {/* Yellow Advisory Box - Common Mistakes */}
      <div className="mt-6 rounded-2xl bg-[#FFC10780] p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 text-[#333333]" />
          <p className="text-[18px] font-bold text-[#333333]">よくある間違い</p>
        </div>
        <p className="mt-4 text-[16px] font-semibold leading-[1.65] text-[#333333]">
          出場時に単なるチケットをタッチしたただけで通過しようとして、改札が閉まってしまうケースがあります。必ず挿入口に入れてください。
        </p>
      </div>

      {/* Subsection 2 - Train Etiquette */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 車内でのマナー</h3>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>優先席（Monk Seat）は僧侶や高齢者、妊婦に譲る</li>
        <li>車内での飲食は禁止されている</li>
        <li>大きな荷物は他の乗客の迷惑になるないよう配置する</li>
        <li>携帯電話の通話は控えめに</li>
      </ul>

      {/* Subsection 3 - Safety */}
      <h3 className="mt-8 text-[24px] font-bold text-[#0f2a52]">▼ 安全面での注意</h3>
      <p className="mt-4 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        BTSは比較的安全な交通手段ですが、以下の点には注意が必要です
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-8 text-[16px] font-semibold leading-[1.65] text-[#122b4f]">
        <li>混雑時はスリに注意し、貴重品は前で持つ</li>
        <li>エスカレーターは急いている人のため右側を避ける</li>
        <li>ホームドアがない駅あるため、黄色い線の内側に立つ</li>
      </ul>
      </div>
    </section>
  );
}
