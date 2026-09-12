import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/lib/api-response'
import { createInquirySchema } from '@/lib/validations/inquiry'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createInquirySchema.parse(body)
    
    const inquiry = await prisma.inquiry.create({
      data
    })
    
    // Send notification email to admin
    try {
      await sendEmail({
        to: "bangkokdays2026@gmail.com",
        subject: `【新規問い合わせ】${inquiry.subject || inquiry.type}`,
        text: `
新しい問い合わせが届きました。

種類: ${inquiry.type}
名前: ${inquiry.name}
メール: ${inquiry.email}
電話: ${inquiry.phone || "なし"}
${inquiry.storeName ? `店舗名: ${inquiry.storeName}` : ""}

件名: ${inquiry.subject || "なし"}

内容:
${inquiry.message}

管理画面で確認: ${process.env.FRONTEND_URL}/admin/inquiries
        `.trim(),
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Don't fail the request if email fails
    }
    
    return success(inquiry, 201)
  } catch (err) {
    return error(err)
  }
}
