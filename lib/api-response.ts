import { NextResponse } from 'next/server'
import { ApiError } from './errors'

export const success = <T>(data: T, status = 200, headers?: Record<string, string>) => {
  return NextResponse.json({ success: true, data }, { status, headers })
}

export const error = (err: unknown) => {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: err.message, code: err.code },
      { status: err.statusCode }
    )
  }

  // Prisma known request errors
  if (err && typeof err === 'object' && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] || 'フィールド'
      return NextResponse.json(
        { success: false, error: `この${field === 'email' ? 'メールアドレス' : field === 'loginId' ? 'ログインID' : field}は既に使用されています`, code: 'CONFLICT' },
        { status: 409 }
      )
    }
    if (prismaErr.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'レコードが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
  }

  // Zod validation errors
  if (err && typeof err === 'object' && 'issues' in err) {
    const zodErr = err as { issues: { message: string }[] }
    return NextResponse.json(
      { success: false, error: zodErr.issues[0]?.message || 'バリデーションエラー', code: 'BAD_REQUEST' },
      { status: 400 }
    )
  }

  console.error('Unexpected error:', err)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}

export const paginated = <T>(data: T[], total: number, page: number, limit: number, headers?: Record<string, string>) => {
  return success({
    items: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }, 200, headers)
}
