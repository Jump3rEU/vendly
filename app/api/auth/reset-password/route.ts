// Password Reset API
// POST /api/auth/reset-password - Generate reset token
// PATCH /api/auth/reset-password - Reset password with token

import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { sendPasswordResetEmail } from '@/lib/email'

// Request password reset
const requestResetSchema = z.object({
  email: z.string().email('Zadejte platný email'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = requestResetSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, status: true }
    })

    // Always return success for security (don't reveal if email exists)
    const message = 'Pokud email existuje, byl odeslán link pro reset hesla'

    if (!user) {
      return successResponse(null, message)
    }

    if (user.status !== 'ACTIVE') {
      return successResponse(null, message)
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = nanoid(32)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token to database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetExpires,
      }
    })

    // Send reset email
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name || 'Uživatel',
      resetToken,
    })

    return successResponse(null, message)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatné údaje: ${error.errors[0].message}`)
    }

    console.error('Password reset request error:', error)
    return serverErrorResponse('Nepodařilo se odeslat reset hesla')
  }
}

// Reset password with token
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token je povinný'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
})

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find valid reset token
    const resetRecord = await (prisma as any).passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(), // Token hasn't expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          }
        }
      }
    })

    if (!resetRecord) {
      return errorResponse('Neplatný nebo expirovaný token', 400)
    }

    if (resetRecord.user.status !== 'ACTIVE') {
      return errorResponse('Účet není aktivní', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and mark token as used
    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        }
      })

      // Mark token as used
      await (tx as any).passwordReset.update({
        where: { id: resetRecord.id },
        data: {
          used: true,
          usedAt: new Date(),
        }
      })

      // Invalidate all other reset tokens for this user
      await (tx as any).passwordReset.updateMany({
        where: {
          userId: resetRecord.userId,
          used: false,
          id: { not: resetRecord.id }
        },
        data: { used: true }
      })
    })

    return successResponse(null, 'Heslo bylo úspěšně změněno')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatné údaje: ${error.errors[0].message}`)
    }

    console.error('Password reset error:', error)
    return serverErrorResponse('Nepodařilo se změnit heslo')
  }
}