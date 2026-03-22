// Review System API
// POST /api/orders/[id]/review - Submit review after order completion

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { OrderStatus } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
})

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orderId } = params
    const body = await req.json()
    const { rating, comment } = createReviewSchema.parse(body)

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        listing: true,
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nenalezena')
    }

    // Check order is completed
    if (order.status !== 'COMPLETED') {
      return errorResponse('Můžete hodnotit pouze dokončené objednávky', 400)
    }

    // Determine who is being reviewed
    const isBuyer = order.buyerId === user.id
    const reviewedUserId = isBuyer ? order.sellerId : order.buyerId

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        orderId,
        reviewerId: user.id,
      }
    })

    if (existingReview) {
      return errorResponse('Již jste tuto objednávku ohodnotili', 400)
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: user.id,
        reviewedId: reviewedUserId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        reviewed: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Recalculate trust score for reviewed user
    await recalculateTrustScore(reviewedUserId)

    return successResponse(review, 'Hodnocení odesláno', 201)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Neplatná data hodnocení', 400)
    }
    console.error('Review creation error:', error)
    return serverErrorResponse()
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orderId } = params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        review: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            },
          },
        },
      },
    })

    if (!order) {
      return notFoundResponse('Objednávka nenalezena')
    }

    const isBuyer = order.buyerId === user.id
    const isSeller = order.sellerId === user.id

    if (!isBuyer && !isSeller) {
      return errorResponse('Nemáte oprávnění zobrazit tuto objednávku', 403)
    }

    const canReview = order.status === 'COMPLETED' && !order.review

    return successResponse({
      canReview,
      hasReview: !!order.review,
      review: order.review,
    })

  } catch (error) {
    console.error('Review fetch error:', error)
    return serverErrorResponse()
  }
}

// Helper function to recalculate trust score with fraud-resistant logic
async function recalculateTrustScore(userId: string) {
  try {
    // Get all reviews received by user (exclude hidden/reported)
    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: userId,
        hidden: false,
        reported: false,
      },
      include: {
        reviewer: true,
      },
    })

    if (reviews.length === 0) {
      // Default trust score for new users
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: 50 },
      })
      return
    }

    // Fraud detection: Check for suspicious patterns
    const reviewerIds = reviews.map(r => r.reviewerId)
    const uniqueReviewers = new Set(reviewerIds).size
    const duplicateRate = 1 - (uniqueReviewers / reviews.length)

    // Detect if multiple reviews from same IP or created in short time
    const recentReviews = reviews.filter(r => {
      const hoursSince = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60)
      return hoursSince <= 24
    })

    // Fraud penalty
    let fraudPenalty = 0
    if (duplicateRate > 0.3) fraudPenalty += 10 // Too many reviews from same users
    if (recentReviews.length > 5) fraudPenalty += 5 // Too many reviews in 24h

    // Calculate average rating with weights
    let weightedSum = 0
    let totalWeight = 0

    reviews.forEach(review => {
      // Newer reviews have higher weight
      const daysSince = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      const recencyWeight = Math.max(0.5, 1 - (daysSince / 365)) // Decay over 1 year

      // Verified reviewers have higher weight
      const verificationWeight = review.reviewer.idVerified ? 1.2 : 1.0

      const weight = recencyWeight * verificationWeight
      weightedSum += review.rating * weight
      totalWeight += weight
    })

    const avgRating = totalWeight > 0 ? weightedSum / totalWeight : 0

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalSales: true,
        totalPurchases: true,
        idVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    })

    if (!user) return

    // Trust score calculation (0-100)
    let trustScore = 0

    // Base score from weighted average rating (0-50 points)
    trustScore += (avgRating / 5) * 50

    // Volume bonus (0-20 points) - with diminishing returns
    const totalTransactions = user.totalSales + user.totalPurchases
    if (totalTransactions >= 100) {
      trustScore += 20
    } else if (totalTransactions >= 50) {
      trustScore += 15
    } else if (totalTransactions >= 20) {
      trustScore += 10
    } else if (totalTransactions >= 10) {
      trustScore += 5
    } else if (totalTransactions >= 5) {
      trustScore += 3
    }

    // Verification bonus (0-15 points)
    if (user.idVerified) trustScore += 10
    if (user.phoneVerified) trustScore += 5

    // Recent activity bonus (0-10 points)
    const last90DaysReviews = reviews.filter(r => {
      const daysSince = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 90
    })
    if (last90DaysReviews.length >= 5) {
      trustScore += 10
    } else if (last90DaysReviews.length >= 3) {
      trustScore += 5
    } else if (last90DaysReviews.length >= 1) {
      trustScore += 2
    }

    // Consistency bonus (0-5 points) - rewards consistent high ratings
    const highRatings = reviews.filter(r => r.rating >= 4).length
    const consistencyRate = reviews.length > 0 ? highRatings / reviews.length : 0
    if (consistencyRate >= 0.9 && reviews.length >= 5) {
      trustScore += 5
    } else if (consistencyRate >= 0.8 && reviews.length >= 3) {
      trustScore += 3
    }

    // Account age bonus (0-5 points) - older accounts more trustworthy
    const accountAgeDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (accountAgeDays >= 365) {
      trustScore += 5
    } else if (accountAgeDays >= 180) {
      trustScore += 3
    } else if (accountAgeDays >= 90) {
      trustScore += 2
    }

    // Apply fraud penalty
    trustScore -= fraudPenalty

    // Cap between 0 and 100
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)))

    // Update user trust score
    await prisma.user.update({
      where: { id: userId },
      data: { trustScore },
    })

    console.log(`Updated trust score for user ${userId}: ${trustScore} (${reviews.length} reviews, fraud penalty: ${fraudPenalty})`)
  } catch (error) {
    console.error('Error calculating trust score:', error)
  }
}
