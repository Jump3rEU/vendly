// Change Password API
// POST /api/users/me/password - Change current user's password

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { authRateLimiter } from '@/lib/rate-limit'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Zadejte současné heslo'),
  newPassword: z.string()
    .min(8, 'Nové heslo musí mít alespoň 8 znaků')
    .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jednu číslici')
    .regex(/[a-zA-Z]/, 'Heslo musí obsahovat alespoň jedno písmeno'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = req.ip || 'anonymous'
    const rateLimit = await authRateLimiter.check(identifier)
    if (!rateLimit.success) {
      return errorResponse('Příliš mnoho pokusů. Zkuste to později.', 429)
    }

    const user = await requireAuth()
    const body = await req.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get user with password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true }
    })

    if (!dbUser) {
      return errorResponse('Uživatel nebyl nalezen', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, dbUser.password)
    if (!isCurrentPasswordValid) {
      return errorResponse('Nesprávné současné heslo')
    }

    // Check if new password is different
    const isSamePassword = await compare(newPassword, dbUser.password)
    if (isSamePassword) {
      return errorResponse('Nové heslo musí být odlišné od současného')
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return successResponse(null, 'Heslo bylo úspěšně změněno')
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Nepřihlášen', 401)
    }
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message)
    }
    console.error('Error changing password:', error)
    return serverErrorResponse()
  }
}
