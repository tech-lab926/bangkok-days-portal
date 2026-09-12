import { success, error } from '@/lib/api-response'
import { requireUser } from '@/lib/user-auth'

export async function GET() {
  try {
    const session = await requireUser()

    return success({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: (session.user as any).emailVerified,
    })
  } catch (err) {
    return error(err)
  }
}
