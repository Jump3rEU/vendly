import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [likes, totalCount] = await Promise.all([
      prisma.like.findMany({
        where: { userId: user.id },
        include: {
          listing: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  trustScore: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.like.count({
        where: { userId: user.id },
      }),
    ])

    // Filter out listings that are no longer active or have been deleted
    const validLikes = likes.filter(like => like.listing && like.listing.status === 'ACTIVE')

    return successResponse({
      likes: validLikes.map(like => ({
        id: like.id,
        likedAt: like.createdAt,
        listing: like.listing,
      })),
      hasMore: skip + likes.length < totalCount,
      total: totalCount,
      page,
    })

  } catch (error) {
    console.error('Favorites fetch error:', error)
    return serverErrorResponse()
  }
}
