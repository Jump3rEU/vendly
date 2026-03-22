// Admin-only AI analysis endpoints
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { 
  successResponse, 
  errorResponse,
  notFoundResponse,
  serverErrorResponse 
} from '@/lib/api-response'
import { analyzeListingForFraud } from '@/lib/ai-service'

type RouteParams = {
  params: {
    id: string
  }
}

// POST /api/admin/listings/[id]/analyze - Analyze listing with AI
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    
    // Admin only
    if (user.role !== 'ADMIN') {
      return errorResponse('Pouze pro administrátory', 403)
    }

    const { id: listingId } = params

    // Fetch listing with seller info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            trustScore: true,
            totalSales: true,
            createdAt: true,
          },
        },
      },
    })

    if (!listing) {
      return notFoundResponse('Inzerát nenalezen')
    }

    // Analyze with AI
    const analysis = await analyzeListingForFraud({
      title: listing.title,
      description: listing.description,
      price: Number(listing.price),
      category: listing.category,
      images: listing.images,
      seller: listing.seller,
    })

    // Store analysis result
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        // Store AI analysis in metadata (you might want to add this field)
        // For now, we'll just return it
      },
    })

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId: user.id,
        actionType: 'ANALYZE_LISTING',
        targetListingId: listingId,
        reason: `AI analysis: suspicion score ${analysis.suspicionScore}`,
      },
    })

    return successResponse({
      analysis,
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        seller: listing.seller,
      },
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return serverErrorResponse()
  }
}
