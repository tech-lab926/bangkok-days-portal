import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import CuratedListForm from "../../CuratedListForm"

export default async function EditCuratedListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const list = await prisma.curatedList.findUnique({
    where: { id },
    include: {
      places: {
        orderBy: { order: "asc" },
        include: {
          place: {
            include: {
              translations: { where: { locale: "ja" } },
              images: { orderBy: { order: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  })
  if (!list) notFound()
  return <CuratedListForm initialData={list} id={id} />
}
