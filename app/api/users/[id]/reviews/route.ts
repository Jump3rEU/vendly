import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

type RouteParams = {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = params
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return notFoundResponse('Uživatel nenalezen')
    }

    // Get reviews received by this user (exclude hidden/reported)
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          reviewedId: userId,
          hidden: false,
          reported: false,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              trustScore: true,
            },
          },
          order: {
            include: {
              listing: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          reviewedId: userId,
          hidden: false,
          reported: false,
        },
      }),
    ])

    // Calculate stats
    const allReviews = await prisma.review.findMany({
      where: {
        reviewedId: userId,
        hidden: false,
        reported: false,
      },
      select: { rating: true },
    })

    const totalReviews = allReviews.length
    const avgRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Calculate distribution
    const distribution: { [key: number]: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    allReviews.forEach((review) => {
      distribution[review.rating]++
    })

    const stats = {
      avgRating,
      totalReviews,
      distribution,
    }

    return successResponse({
      reviews,
      stats,
      hasMore: skip + reviews.length < totalCount,
      total: totalCount,
    })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return serverErrorResponse()
  }
}
