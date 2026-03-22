// User Registration API
// POST /api/auth/register

import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { authRateLimiter } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky').max(100),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = req.ip || 'anonymous'
    const rateLimit = await authRateLimiter.check(identifier)
    if (!rateLimit.success) {
      return errorResponse('Příliš mnoho pokusů o registraci. Zkuste to později.', 429)
    }

    const body = await req.json()
    const { email, password, name, phone } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return errorResponse('Uživatel s tímto emailem již existuje')
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: 'USER',
        status: 'ACTIVE',
        trustScore: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    return successResponse(user, 'Účet byl úspěšně vytvořen', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    console.error('Registration error:', error)
    return serverErrorResponse()
  }
}
