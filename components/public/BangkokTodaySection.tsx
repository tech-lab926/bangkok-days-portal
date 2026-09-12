import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import BangkokTodayClient from "./BangkokTodayClient";

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "快晴", 1: "晴れ", 2: "晴れ時々くもり", 3: "くもり",
  45: "霧", 48: "霧", 51: "弱い霧雨", 53: "霧雨", 55: "強い霧雨",
  61: "弱い雨", 63: "雨", 65: "強い雨",
  71: "弱い雪", 73: "雪", 75: "強い雪",
  80: "にわか雨", 81: "にわか雨", 82: "激しいにわか雨",
  95: "雷雨", 96: "雷雨（ひょう）", 99: "激しい雷雨（ひょう）",
};

const getPm25Advice = (v: number) => {
  if (v <= 15) return "空気は良好";
  if (v <= 35) return "敏感な方は注意";
  if (v <= 55) return "外出時はマスク推奨";
  if (v <= 150) return "長時間の屋外活動は控えめに";
  return "不要不急の外出は控えてください";
};

const getWeatherPrimary = (apparent: number, code: number) => {
  if (apparent >= 34) return `蒸し暑い（体感${Math.round(apparent)}℃）`;
  if (apparent >= 30) return `暑い（体感${Math.round(apparent)}℃）`;
  return `${WEATHER_CODE_MAP[code] || "天気情報"}（体感${Math.round(apparent)}℃）`;
};

const getTodayData = unstable_cache(async () => {
  try {
    const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&hourly=precipitation_probability&timezone=Asia%2FBangkok";
    const airQualityUrl = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=13.7563&longitude=100.5018&current=pm2_5&timezone=Asia%2FBangkok";
    const fxUrl = "https://open.er-api.com/v6/latest/THB";

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);

    const [weatherRes, airRes, fxRes, events] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(airQualityUrl, { next: { revalidate: 1800 } }),
      fetch(fxUrl, { next: { revalidate: 1800 } }),
      prisma.todayEvent.findMany({
        where: {
          active: true,
          eventDate: {
            gte: new Date(now.toISOString().slice(0, 10)),
            lte: new Date(in7Days.toISOString().slice(0, 10)),
          },
        },
        orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
        take: 10,
      }),
    ]);

    if (!weatherRes.ok || !airRes.ok || !fxRes.ok) throw new Error("fetch failed");

    const weather = await weatherRes.json();
    const air = await airRes.json();
    const fx = await fxRes.json();

    const currentTime: string = weather?.current?.time || "";
    const currentDate = currentTime.slice(0, 10);
    const hourlyTimes: string[] = weather?.hourly?.time || [];
    const hourlyPrecip: number[] = weather?.hourly?.precipitation_probability || [];

    let eveningMaxPrecip = 0;
    for (let i = 0; i < hourlyTimes.length; i++) {
      const t = hourlyTimes[i] || "";
      const hour = Number.parseInt(t.slice(11, 13), 10);
      if (t.slice(0, 10) === currentDate && hour >= 17 && hour <= 23) {
        eveningMaxPrecip = Math.max(eveningMaxPrecip, hourlyPrecip[i] || 0);
      }
    }

    const apparent = Number(weather?.current?.apparent_temperature || 0);
    const weatherCode = Number(weather?.current?.weather_code || 0);
    const maxTemp = Number(weather?.daily?.temperature_2m_max?.[0] || 0);
    const minTemp = Number(weather?.daily?.temperature_2m_min?.[0] || 0);
    const pm25 = Number(air?.current?.pm2_5 || 0);
    const thbToJpy = Number(fx?.rates?.JPY || 0);

    return {
      weather: {
        code: weatherCode,
        primary: getWeatherPrimary(apparent, weatherCode),
        secondary: `最高${Math.round(maxTemp)}℃ / 最低${Math.round(minTemp)}℃ · 夕方スコール${Math.round(eveningMaxPrecip)}%`,
      },
      pm25: {
        primary: `${Math.round(pm25)}`,
        secondary: getPm25Advice(pm25),
      },
      exchange: {
        primary: `1 THB = ${thbToJpy.toFixed(2)}円`,
        secondary: `${new Date().toLocaleDateString("ja-JP")}時点`,
      },
      events: events.map(e => ({
        id: e.id,
        time: e.eventTime,
        tag: e.area,
        title: e.title,
        eventDate: e.eventDate.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}, ["today-data"], { revalidate: 1800 });

export default async function BangkokTodaySection() {
  const data = await getTodayData();
  return <BangkokTodayClient data={data} />;
}
