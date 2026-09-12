import Image from "next/image";
import { CalendarDays } from "lucide-react";

export default function ArticleLeadSection() {
  return (
    <section className="mx-auto max-w-280 px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <h1 className="text-center text-[32px] font-bold leading-tight text-[#102a50] sm:text-[38px]">
        バンコクのBTSスカイトレイン完全ガイド
        <br />
        初心者でも安心の乗り方と使い方
      </h1>

      <div className="mx-auto mt-6 flex max-w-240 items-center gap-3 text-[14px] text-[#7a808a]">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <span>2025-12-15</span>
        <span>更新</span>
        <span className="rounded-full bg-[#eef2f6] px-3 py-1 text-[12px] font-semibold text-[#5f6d84]">交通・移動</span>
      </div>

      <div className="mx-auto mt-8 max-w-240 overflow-hidden rounded-sm">
        <Image
          src="/img/atrical.jpg"
          alt="バンコクの夜景"
          width={1280}
          height={720}
          className="h-80 w-full object-cover sm:h-105"
          priority
        />
      </div>

      <p className="mx-auto mt-6 max-w-240 text-[18px] font-semibold leading-[1.7] text-[#142949] sm:text-[20px]">
        バンコク旅行で最も便利な交通手段であるBTSスカイトレイン。しかし チケットの買い方が分からない
        「どの路線に乗ればいいか不安」という声をよく聞きます。この記事では、初めてバンコクを訪れる方でも迷わず利用できるよう、BTSの基本から実践的な使い方まで分かりやすく解説します。
      </p>

      <div className="mx-auto mt-8 max-w-240 rounded-xl border border-[#d7d9de] bg-[#f2f3f5] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.16)]">
        <h2 className="text-[20px] font-bold text-[#1c2f4f]">目次</h2>
        <div className="my-3 border-b border-[#9199a6]" />
        <ol className="space-y-2 text-[16px] leading-[1.45] text-[#4c5462]">
          <li>1. BTSスカイトレインとは？基本情報</li>
          <li>2. チケットの買い方と料金体系</li>
          <li>3. 主要な路線と乗り換え方法</li>
          <li>4. 初心者が知っておくべき注意点</li>
          <li>5. 観光に便利な駅とアクセス</li>
        </ol>
      </div>
    </section>
  );
}
