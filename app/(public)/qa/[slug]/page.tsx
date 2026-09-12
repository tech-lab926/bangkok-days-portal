import { Metadata } from "next";
import prisma from "@/lib/prisma";
import QaDetailClient from "./QaDetailClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const q = await prisma.qaQuestion.findUnique({
    where: { slug },
    select: { title: true },
  });
  const title = q ? `${q.title}｜バンコクデイズ` : "Q&A｜バンコクデイズ";
  return { title };
}

export default async function QaDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return <QaDetailClient slug={slug} />;
}
