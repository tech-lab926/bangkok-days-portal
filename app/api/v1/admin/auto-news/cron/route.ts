import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateAutoNews } from "@/lib/auto-news-generator"

/**
 * GET /api/v1/admin/auto-news/cron
 *
 * Manual-trigger fallback endpoint (VPS deployment).
 * The actual daily schedule is handled by instrumentation.ts (node-cron)
 * running inside the app process — no external curl or cron daemon needed.
 *
 * Protected by CRON_SECRET env variable if set.
 */

export async function GET(req: NextRequest) {
  // ── Auth: Vercel sends Authorization: Bearer <CRON_SECRET> ──────────────────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[cron/auto-news] Unauthorized request — bad or missing CRON_SECRET")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } else {
    // No CRON_SECRET set — warn but still allow (for backward compat / local dev)
    console.warn("[cron/auto-news] CRON_SECRET is not set. Endpoint is unprotected!")
  }

  try {
    // ── Check if auto-generate is enabled in settings ──────────────────────────
    const setting = await prisma.globalSettings.findUnique({
      where: { key: "news_auto_generate" },
    })

    if (setting?.value !== "true") {
      console.log("[cron/auto-news] Skipped — news_auto_generate is disabled")
      return NextResponse.json({ skipped: true, reason: "news_auto_generate is disabled" })
    }

    // ── Check auto-publish setting ─────────────────────────────────────────────
    const publishSetting = await prisma.globalSettings.findUnique({
      where: { key: "news_auto_publish" },
    })
    const autoPublish = publishSetting?.value === "true"

    // ── Run generation directly (no HTTP self-call) ────────────────────────────
    const result = await generateAutoNews({ autoPublish })

    console.log(
      `[cron/auto-news] generated=${result.generated}, skipped=${result.skippedCount}, autoPublish=${autoPublish}`
    )

    return NextResponse.json({
      success: true,
      generated: result.generated,
      skippedCount: result.skippedCount,
      autoPublish,
    })
  } catch (err) {
    console.error("[cron/auto-news] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
