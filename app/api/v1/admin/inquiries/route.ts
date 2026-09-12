import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error, paginated } from '@/lib/api-response'
import { requirePermission } from '@/lib/permissions'
import { paginationSchema } from '@/lib/validations/common'
import { updateInquirySchema } from '@/lib/validations/inquiry'
import { errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requirePermission("inquiries", "canView")
    
    const { searchParams } = req.nextUrl
    const params = Object.fromEntries(searchParams)
    
    const { page, limit } = paginationSchema.parse(params)
    const status = searchParams.get('status')
    
    const where = status ? { status: status as any } : {}
    
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inquiry.count({ where })
    ])
    
    return paginated(inquiries, total, page, limit)
  } catch (err) {
    return error(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission("inquiries", "canEdit")
    
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) throw errors.badRequest('Inquiry ID required')
    
    const body = await req.json()
    const data = updateInquirySchema.parse(body)
    
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data
    })
    
    // TODO: Send reply email if reply is provided
    
    return success(inquiry)
  } catch (err) {
    return error(err)
  }
}
