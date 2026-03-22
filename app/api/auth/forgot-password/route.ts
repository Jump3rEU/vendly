// Password Reset Request API
// POST /api/auth/forgot-password - Request password reset email

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { authRateLimiter } from '@/lib/rate-limit'
import { nanoid } from 'nanoid'
import { sendPasswordResetEmail } from '@/lib/email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
})

export async function POST(req: NextRequest) {
  try {
    // Strict rate limiting for password reset
    const identifier = req.ip || 'anonymous'
    const rateLimit = await authRateLimiter.check(identifier)
    if (!rateLimit.success) {
      return errorResponse('Příliš mnoho pokusů. Zkuste to za 15 minut.', 429)
    }

    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user - but don't reveal if exists or not
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, status: true }
    })

    // Always return success to prevent email enumeration
    if (!user || user.status !== 'ACTIVE') {
      // Log for security auditing but return success
      console.log(`Password reset requested for non-existent/inactive email: ${email}`)
      return successResponse(null, 'Pokud účet existuje, odeslali jsme vám email s instrukcemi.')
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = nanoid(32)
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)

    // Store token in database
    await (prisma as any).passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetTokenExpires,
      }
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name || 'Uživatel',
      resetToken,
    })

    console.log(`Password reset link for ${email}: ${resetUrl}`)

    return successResponse(null, 'Pokud účet existuje, odeslali jsme vám email s instrukcemi.')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message)
    }
    console.error('Error requesting password reset:', error)
    return serverErrorResponse()
  }
}
