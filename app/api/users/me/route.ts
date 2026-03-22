// User Profile API
// GET/PATCH /api/users/me - Get or update current user profile

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

// GET - Get current user profile
export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        phone: true,
        role: true,
        status: true,
        trustScore: true,
        totalSales: true,
        totalPurchases: true,
        idVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
            orders: true,
            sales: true,
            reviews: true,
          }
        }
      }
    })

    if (!profile) {
      return errorResponse('Uživatel nebyl nalezen', 404)
    }

    return successResponse(profile)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Nepřihlášen', 401)
    }
    console.error('Error fetching user profile:', error)
    return serverErrorResponse()
  }
}

// PATCH - Update current user profile
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nickname: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Přezdívka může obsahovat pouze písmena, čísla, _ a -').optional(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if nickname is already taken (if provided and different from current)
    if (validatedData.nickname) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          nickname: validatedData.nickname,
          NOT: { id: user.id }
        }
      })
      if (existingUser) {
        return errorResponse('Tato přezdívka je již použita')
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname,
        phone: validatedData.phone,
        avatar: validatedData.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        phone: true,
        role: true,
        trustScore: true,
        idVerified: true,
        phoneVerified: true,
      }
    })

    return successResponse(updatedUser, 'Profil byl úspěšně aktualizován')
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Nepřihlášen', 401)
    }
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }
    console.error('Error updating user profile:', error)
    return serverErrorResponse()
  }
}
