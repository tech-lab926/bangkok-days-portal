"use client";

import { BadgeAlert, CloudSun, Coins, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Wind } from "lucide-react";

type EventItem = { id: string; time: string; tag: string; title: string; eventDate?: string };
type TodayData = {
  weather: { code: number; primary: string; secondary: string };
  pm25: { primary: string; secondary: string };
  exchange: { primary: string; secondary: string };
  events: EventItem[];
} | null;

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun className="h-7 w-7 text-yellow-400" />;
  if (code <= 2) return <CloudSun className="h-7 w-7 text-yellow-300" />;
  if (code <= 3) return <Cloud className="h-7 w-7 text-gray-400" />;
  if (code <= 48) return <Wind className="h-7 w-7 text-gray-400" />;
  if (code <= 57) return <CloudDrizzle className="h-7 w-7 text-blue-300" />;
  if (code <= 67) return <CloudRain className="h-7 w-7 text-blue-500" />;
  if (code <= 77) return <CloudSnow className="h-7 w-7 text-blue-200" />;
  if (code <= 82) return <CloudRain className="h-7 w-7 text-blue-600" />;
  return <CloudLightning className="h-7 w-7 text-purple-500" />;
}

const defaultData: NonNullable<TodayData> = {
  weather: { code: 1, primary: "蒸し暑い（体感36℃）", secondary: "最高35℃ / 最低28℃ · 夕方スコール60%" },
  pm25: { primary: "48", secondary: "外出時はマスク推奨" },
  exchange: { primary: "1 THB = 4.28円", secondary: "本日時点" },
  events: [],
};

export default function BangkokTodayClient({ data }: { data: TodayData }) {
  const d = data ?? defaultData;
  const stats = [
    { title: "天気", icon: getWeatherIcon(d.weather.code), primary: d.weather.primary, secondary: d.weather.secondary },
    { title: "PM2.5", icon: <BadgeAlert className="h-4 w-4" />, primary: d.pm25.primary, secondary: d.pm25.secondary },
    { title: "為替レート", icon: <Coins className="h-4 w-4" />, primary: d.exchange.primary, secondary: d.exchange.secondary },
  ];

  return (
    <section className="relative isolate overflow-hidden py-12 md:py-16">
      {/* Optimized background via next/image */}
      <div className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/land_bg.jpg" alt="" className="h-full w-full object-cover" width={1920} height={1080} loading="lazy" decoding="async" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,224,255,0.45)_0%,rgba(255,255,255,0.12)_38%,rgba(10,8,16,0.28)_100%)]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-360 px-4 md:px-6">
        <h2 className="text-[30px] font-extrabold tracking-[0.01em] text-[#004098] drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)] md:text-[40px]">
          今日のバンコク
        </h2>

        <div className="mt-5 space-y-4 md:mt-7 md:space-y-5">
          <article className="rounded-2xl bg-white/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur-sm md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.title} className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#777] md:text-sm">
                    <span className="text-[#8e8e8e]">{stat.icon}</span>
                    <span>{stat.title}</span>
                  </p>
                  <p className="text-base font-extrabold text-[#0f172a] md:text-[22px]">{stat.primary}</p>
                  <p className="text-xs text-[#71717a] md:text-sm">{stat.secondary}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-white/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur-sm md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#111827] md:text-xl">直近7日間のイベント</h3>
              <a href="/events/new"
                className="inline-flex items-center gap-1 rounded-full bg-[#004098] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#003070] transition">
                ＋ 投稿する
              </a>
            </div>
            <div className="mt-4 space-y-3 md:mt-5">
              {d.events.length === 0 ? (
                <p className="rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-sm text-[#6b7280] md:px-4">
                  イベント情報はまだありません。<a href="/events/new" className="text-[#004098] font-semibold hover:underline ml-1">最初に投稿する →</a>
                </p>
              ) : (
                d.events.map((event) => (
                  <a key={event.id} href={`/events/${event.id}`}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-sm hover:bg-[#e8edf5] transition md:grid md:grid-cols-[52px_74px_90px_1fr] md:gap-3 md:px-4">
                    <span className="text-center text-xs font-semibold text-[#888]">
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
                        : "-"}
                    </span>
                    <span className="text-center text-sm font-semibold text-[#1f4d95]">{event.time}</span>
                    <span className="inline-flex items-center rounded-full border border-[#d4d4d8] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#4b5563] whitespace-nowrap">{event.tag}</span>
                    <span className="text-sm font-medium text-[#1f2937]">{event.title}</span>
                  </a>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
