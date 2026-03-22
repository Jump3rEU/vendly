import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse 
} from '@/lib/api-response'

type RouteParams = {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: reviewId } = params

    // Check review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewed: true,
      },
    })

    if (!review) {
      return notFoundResponse('Hodnocení nenalezeno')
    }

    // Can't report your own reviews
    if (review.reviewerId === user.id) {
      return errorResponse('Nemůžete nahlásit vlastní hodnocení', 400)
    }

    // Can only report if you're the reviewed person
    if (review.reviewedId !== user.id) {
      return errorResponse('Nemáte oprávnění nahlásit toto hodnocení', 403)
    }

    // Check if already reported
    if (review.reported) {
      return errorResponse('Toto hodnocení již bylo nahlášeno', 400)
    }

    // Create report entry
    await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedUserId: review.reviewerId,
        reason: 'INAPPROPRIATE_CONTENT',
        description: `Nevhodné hodnocení (Review ID: ${reviewId})`,
      },
    })

    // Mark review as reported
    await prisma.review.update({
      where: { id: reviewId },
      data: { reported: true },
    })

    // TODO: Notify admins about reported review
    // TODO: If user has multiple reports, apply trust score penalty

    return successResponse({ message: 'Hodnocení bylo nahlášeno' })

  } catch (error) {
    console.error('Review report error:', error)
    return serverErrorResponse()
  }
}
