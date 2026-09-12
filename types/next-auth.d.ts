import 'next-auth'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    customRole?: string | null
    userType?: string
    emailVerified?: boolean | null
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: string
      customRole?: string | null
      userType: string
      emailVerified?: boolean | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    customRole?: string | null
    userType?: string
    emailVerified?: boolean | null
  }
}
