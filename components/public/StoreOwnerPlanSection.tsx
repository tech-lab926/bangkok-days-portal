import Link from "next/link";
import { BarChart3, CheckSquare } from "lucide-react";

const planItems = [
  "店舗情報の詳細掲載",
  "写真・動画の掲載",
  "特集記事での紹介",
  "SNSでのプロモーション",
];

export default function StoreOwnerPlanSection() {
  return (
    <section className="relative mb-0 overflow-hidden pt-10 md:pt-12" id="owner-plan">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/footer.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#0a1f46]/52" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-360 px-4 pb-6 md:px-6 md:pb-8">
        <div className="grid items-start gap-7 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-center text-white md:text-left">
            <h2 className="text-[30px] font-semibold tracking-[0.02em] md:text-[42px]">店舗オーナーの方へ</h2>
            <p className="mx-auto mt-5 max-w-3xl text-[16px] leading-snug text-white/95 md:mx-0 md:text-[20px]">
              バンコク在住・出張の日本人に効果的にPRしませんか？
              <br />
              月間10万PVを超える当サイトで、あなたの店舗を日本人
              <br />
              コミュニティに広く紹介できます。
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-4 pb-5 md:justify-start md:gap-4 md:pb-7">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#f6be00] text-center text-[#0a2248] shadow-md md:h-32 md:w-32">
                <p className="text-[15px] font-medium leading-none md:text-[18px]">月間PV</p>
                <p className="mt-1 whitespace-nowrap text-[32px] font-semibold leading-none md:text-[42px]">10万</p>
              </div>

              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#f6be00] text-center text-[#0a2248] shadow-md md:h-32 md:w-32">
                <p className="text-[15px] font-medium leading-none md:text-[18px]">高い</p>
                <BarChart3 className="my-0.5 h-7 w-7 md:h-8 md:w-8" />
                <p className="whitespace-nowrap text-[20px] font-semibold leading-none md:text-[23px]">集客効果</p>
              </div>

              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#f6be00] text-center text-[#0a2248] shadow-md md:h-32 md:w-32">
                <p className="text-[15px] font-medium leading-none md:text-[18px]">簡単</p>
                <CheckSquare className="my-0.5 h-7 w-7 md:h-8 md:w-8" />
                <p className="whitespace-nowrap text-[20px] font-semibold leading-none md:text-[23px]">掲載</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#1d57bd]/92 p-5 text-white shadow-lg md:p-7 lg:mb-3">
            <h3 className="text-center text-[26px] font-semibold md:text-[32px]">掲載プランのご案内</h3>

            <ul className="mt-6 space-y-2.5">
              {planItems.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[18px] font-medium leading-tight md:text-[22px]">
                  <span className="inline-block h-4.5 w-4.5 rounded-full bg-[#f6be00]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/listing"
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#f6be00] px-6 py-2.5 text-[18px] font-semibold text-[#0f1a2e] transition hover:brightness-95 md:text-[22px]"
            >
              掲載申し込み
            </Link>

            <p className="mt-4 text-center text-[16px] font-medium text-white/95 md:text-[19px]">
              お問い合わせ:{" "}
              <a href="mailto:bangkokdays2026@gmail.com" className="underline hover:text-[#f6be00]">
                bangkokdays2026@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
