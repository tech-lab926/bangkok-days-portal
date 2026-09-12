/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the server process starts (both dev and production).
 * Used here to schedule the daily auto-news cron job inside the app
 * process — no external cron daemon or curl needed on the VPS.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime (not Edge), and only in production
  // to avoid double-scheduling in dev hot-reload cycles.
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (process.env.NODE_ENV !== "production") return

  const { default: cron } = await import("node-cron")
  const { generateAutoNews } = await import("@/lib/auto-news-generator")

  // Import prisma lazily to avoid issues during build
  const { default: prisma } = await import("@/lib/prisma")

  // Run every day at 06:00 Bangkok time (UTC+7 → "0 23 * * *" in UTC, i.e. 23:00 UTC = 06:00 BKK next day)
  // Adjust the schedule below if needed. Format: "minute hour * * *" (UTC)
  const SCHEDULE = process.env.AUTO_NEWS_CRON_SCHEDULE || "0 23 * * *"

  cron.schedule(SCHEDULE, async () => {
    console.log(`[cron/auto-news] Starting scheduled run at ${new Date().toISOString()}`)

    try {
      // Check if auto-generate is enabled
      const setting = await prisma.globalSettings.findUnique({
        where: { key: "news_auto_generate" },
      })

      if (setting?.value !== "true") {
        console.log("[cron/auto-news] Skipped — news_auto_generate is disabled in settings")
        return
      }

      // Check auto-publish
      const publishSetting = await prisma.globalSettings.findUnique({
        where: { key: "news_auto_publish" },
      })
      const autoPublish = publishSetting?.value === "true"

      // Run generation directly — no HTTP self-call
      const result = await generateAutoNews({ autoPublish })

      console.log(
        `[cron/auto-news] Done — generated=${result.generated}, skipped=${result.skippedCount}, autoPublish=${autoPublish}`
      )
    } catch (err) {
      console.error("[cron/auto-news] Scheduled run failed:", err)
    }
  })

  console.log(`[cron/auto-news] Scheduler registered — schedule="${SCHEDULE}" (UTC)`)
}
