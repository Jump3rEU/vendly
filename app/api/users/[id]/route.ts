// User Profile API
// GET/PATCH /api/users/[id]

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdminOrOwner } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

interface RouteParams {
  params: { id: string }
}

// GET user profile (public info)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Try to find by nickname first, then by ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { nickname: id },
          { id: id }
        ]
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        trustScore: true,
        totalSales: true,
        totalPurchases: true,
        idVerified: true,
        phoneVerified: true,
        createdAt: true,
        role: true,
        status: true,
        // Aggregate review data
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          },
          where: {
            hidden: false,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
        },
        // Count active listings
        _count: {
          select: {
            listings: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        // Get all listings for profile views calculation
        listings: {
          select: {
            views: true,
          }
        }
      }
    })

    if (!user) {
      return notFoundResponse('Uživatel nebyl nalezen')
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return errorResponse('Tento účet není aktivní')
    }

    // Calculate average rating
    const avgRating = user.reviews.length > 0
      ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
      : 0

    // Calculate total profile views (sum of all listing views)
    const totalProfileViews = user.listings.reduce((sum, listing) => sum + listing.views, 0)

    // Calculate satisfaction rate from reviews (percentage of 4-5 star reviews)
    const positiveReviews = user.reviews.filter(r => r.rating >= 4).length
    const satisfactionRate = user.reviews.length > 0
      ? Math.round((positiveReviews / user.reviews.length) * 100)
      : 0

    return successResponse({
      ...user,
      averageRating: avgRating,
      reviewCount: user.reviews.length,
      totalProfileViews,
      satisfactionRate,
      listings: undefined, // Remove listings array from response
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return serverErrorResponse()
  }
}

// PATCH - Update profile (owner only)
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Authorization
    await requireAdminOrOwner(id)

    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        trustScore: true,
        role: true,
      }
    })

    return successResponse(updatedUser, 'Profil byl aktualizován')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message.includes('authorized')) {
      return errorResponse(error.message, 403)
    }

    console.error('Error updating profile:', error)
    return serverErrorResponse()
  }
}
