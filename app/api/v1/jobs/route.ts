import prisma from "@/lib/prisma"
import { success, error } from "@/lib/api-response"

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      include: {
        place: { include: { translations: { where: { locale: "ja" } } } },
      },
    })
    return success(jobs, 200, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' })
  } catch (err) {
    return error(err)
  }
}
