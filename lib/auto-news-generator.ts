import prisma from "@/lib/prisma"

const DEFAULT_PROMPT = `あなたはバンコク在住日本人向けのニュースライターです。以下の英語ニュースを日本語でリライトしてください。

元記事タイトル: {title}
元記事内容: {description}

以下のJSON形式で回答してください（JSONのみ、他のテキストなし）:
{
  "title": "日本語タイトル（30文字以内）",
  "content": "日本語記事本文（200-400文字、HTMLタグ使用可。<p>タグで段落分け）",
  "excerpt": "要約（80文字以内）",
  "slug": "英語スラッグ（ハイフン区切り、小文字）",
  "category": "LIFE|TRANSPORT|BUSINESS|NIGHT|EVENT|SYSTEMのいずれか1つ"
}

重要:
- 元記事のコピーではなく、独自の視点でリライトすること
- バンコク在住日本人に関連する情報を強調すること
- 元記事との類似度が30%以下になるようにすること
- categoryは記事内容に最も適したものを選ぶこと`

export const DEFAULT_FEEDS =
  "https://www.bangkokpost.com/rss/data/most-recent.xml\nhttps://www.thaipbsworld.com/feed/\nhttps://thethaiger.com/feed"

export interface GenerateOptions {
  autoPublish?: boolean
  dateFrom?: Date | null
  dateTo?: Date | null
}

export interface GenerateResult {
  generated: number
  titles: string[]
  skipped: string[]
  skippedCount: number
}

// ─── RSS helpers ───────────────────────────────────────────────────────────────

export async function fetchRSS(
  feedUrl: string
): Promise<{ title: string; link: string; description: string; image: string; pubDate: string }[]> {
  const res = await fetch(feedUrl)
  const xml = await res.text()
  const items: { title: string; link: string; description: string; image: string; pubDate: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)
    const title = titleMatch?.[1] || titleMatch?.[2] || ""
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] || "")
      .replace(/^<!\[CDATA\[|\]\]>$/g, "")
      .trim()
    const desc =
      block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] ||
      block.match(/<description>(.*?)<\/description>/)?.[1] ||
      ""
    const image =
      block.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ||
      block.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ||
      block.match(/<img[^>]+src="([^"]+)"/)?.[1] ||
      ""
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
    if (title && link)
      items.push({ title, link, description: desc.replace(/<[^>]+>/g, "").slice(0, 500), image, pubDate })
  }
  return items.slice(0, 8)
}

async function getOgImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const html = await res.text()
    return (
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1] ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/)?.[1] ||
      ""
    )
  } catch {
    return ""
  }
}

async function uploadImageToCloudinary(imageUrl: string): Promise<string | null> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) return null

    const timestamp = Math.round(Date.now() / 1000)
    const folder = "site-bang/news"

    const { createHash } = await import("crypto")
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex")

    const uploadForm = new FormData()
    uploadForm.append("file", imageUrl)
    uploadForm.append("api_key", apiKey)
    uploadForm.append("timestamp", timestamp.toString())
    uploadForm.append("signature", signature)
    uploadForm.append("folder", folder)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadForm,
    })

    const data = await res.json()
    if (!res.ok) return null
    return data.secure_url || null
  } catch {
    return null
  }
}

async function rewriteWithAI(
  title: string,
  description: string,
  customPrompt?: string
): Promise<{ jaTitle: string; jaContent: string; excerpt: string; slug: string; category: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error("[auto-news] OPENAI_API_KEY is not set")
    return null
  }

  const prompt = (customPrompt || DEFAULT_PROMPT)
    .replace("{title}", title)
    .replace("{description}", description)

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error(`[auto-news] OpenAI error ${res.status}:`, errText)
    return null
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ""
  try {
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim())
    return {
      jaTitle: json.title,
      jaContent: json.content,
      excerpt: json.excerpt,
      slug: json.slug,
      category: json.category || "LIFE",
    }
  } catch (e) {
    console.error("[auto-news] Failed to parse OpenAI JSON:", e, "Raw:", text)
    return null
  }
}

// Simple similarity check using trigrams
function getSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")
  const trigrams = (s: string) => {
    const n = normalize(s)
    const set = new Set<string>()
    for (let i = 0; i < n.length - 2; i++) set.add(n.slice(i, i + 3))
    return set
  }
  const setA = trigrams(a)
  const setB = trigrams(b)
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const t of setA) if (setB.has(t)) intersection++
  return intersection / Math.max(setA.size, setB.size)
}

// ─── Main generation function ──────────────────────────────────────────────────

export async function generateAutoNews(opts: GenerateOptions = {}): Promise<GenerateResult> {
  const { autoPublish = false, dateFrom = null, dateTo = null } = opts

  // Load settings from DB
  const settings = await prisma.globalSettings.findMany({
    where: { key: { in: ["news_rss_feeds", "news_ai_prompt"] } },
  })
  const feedsStr = settings.find((s) => s.key === "news_rss_feeds")?.value || DEFAULT_FEEDS
  const customPrompt = settings.find((s) => s.key === "news_ai_prompt")?.value || ""
  const RSS_FEEDS = feedsStr
    .split("\n")
    .filter(Boolean)
    .map((url) => ({ url: url.trim() }))

  // Load existing articles for dedup
  const existingArticles = await prisma.article.findMany({
    where: { type: "NEWS" },
    select: {
      sourceUrl: true,
      translations: { select: { title: true, content: true }, where: { locale: "ja" } },
    },
  })
  const existingTitles = existingArticles.map((a) => a.translations[0]?.title || "").filter(Boolean)
  const existingContents = existingArticles
    .map((a) => a.translations[0]?.content?.replace(/<[^>]+>/g, "").slice(0, 200) || "")
    .filter(Boolean)
  const existingUrls = new Set(existingArticles.map((a) => a.sourceUrl).filter(Boolean))

  const results: string[] = []
  const skipped: string[] = []
  const MAX_PER_RUN = 3
  const DEADLINE_MS = 50_000
  const startedAt = Date.now()

  for (const feed of RSS_FEEDS) {
    if (results.length >= MAX_PER_RUN) break
    if (Date.now() - startedAt > DEADLINE_MS) break

    let items: Awaited<ReturnType<typeof fetchRSS>> = []
    try {
      items = await fetchRSS(feed.url)
    } catch (e) {
      console.error(`[auto-news] RSS fetch failed for ${feed.url}:`, e)
      continue
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      items = items.filter((item) => {
        if (!item.pubDate) return true
        const pub = new Date(item.pubDate)
        if (isNaN(pub.getTime())) return true
        if (dateFrom && pub < dateFrom) return false
        if (dateTo && pub > dateTo) return false
        return true
      })
    }

    for (const item of items) {
      if (results.length >= MAX_PER_RUN) break
      if (Date.now() - startedAt > DEADLINE_MS) break
      if (existingUrls.has(item.link)) continue

      const rewritten = await rewriteWithAI(item.title, item.description, customPrompt || undefined)
      if (!rewritten) continue

      // Similarity checks
      if (existingTitles.some((t) => getSimilarity(t, rewritten.jaTitle) > 0.4)) {
        skipped.push(`[タイトル重複] ${rewritten.jaTitle}`)
        continue
      }
      if (
        existingContents.some(
          (c) => getSimilarity(c, rewritten.jaContent.replace(/<[^>]+>/g, "").slice(0, 200)) > 0.35
        )
      ) {
        skipped.push(`[内容重複] ${rewritten.jaTitle}`)
        continue
      }

      // Ensure unique slug
      let slug = rewritten.slug || `news-${Date.now()}`
      const slugExists = await prisma.article.findUnique({ where: { slug } })
      if (slugExists) slug = `${slug}-${Date.now()}`

      // Image
      const rawImageUrl = item.image || (await getOgImage(item.link))
      const imageUrl = rawImageUrl ? await uploadImageToCloudinary(rawImageUrl) : null

      // Source credit
      const contentWithSource =
        rewritten.jaContent +
        `<p class="text-xs text-gray-400 mt-4">出典: <a href="${item.link}" target="_blank" rel="noopener noreferrer">${new URL(item.link).hostname}</a></p>`

      await prisma.article.create({
        data: {
          slug,
          type: "NEWS",
          published: autoPublish,
          newsCategory: (
            ["LIFE", "TRANSPORT", "BUSINESS", "NIGHT", "EVENT", "SYSTEM"].includes(rewritten.category)
              ? rewritten.category
              : "LIFE"
          ) as any,
          sourceUrl: item.link,
          publishedAt: autoPublish ? (item.pubDate ? new Date(item.pubDate) : new Date()) : null,
          translations: {
            create: {
              locale: "ja",
              title: rewritten.jaTitle,
              content: contentWithSource,
              excerpt: rewritten.excerpt,
              coverUrl: imageUrl || null,
            },
          },
        },
      })

      results.push(rewritten.jaTitle)
      existingTitles.push(rewritten.jaTitle)
      existingContents.push(rewritten.jaContent.replace(/<[^>]+>/g, "").slice(0, 200))
    }
  }

  return { generated: results.length, titles: results, skipped, skippedCount: skipped.length }
}
