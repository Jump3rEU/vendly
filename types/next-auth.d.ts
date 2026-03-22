import 'next-auth'
import { UserRole, AccountStatus } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    status: AccountStatus
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      nickname?: string | null
      role: UserRole
      status: AccountStatus
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    status: AccountStatus
  }
}
