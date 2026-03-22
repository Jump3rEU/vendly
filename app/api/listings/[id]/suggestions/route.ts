// AI suggestions for listing improvement (owner only)
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { 
  successResponse, 
  errorResponse,
  notFoundResponse,
  serverErrorResponse 
} from '@/lib/api-response'
import { suggestListingImprovements } from '@/lib/ai-service'

type RouteParams = {
  params: {
    id: string
  }
}

// GET /api/listings/[id]/suggestions - Get AI improvement suggestions
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: listingId } = params

    // Fetch listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return notFoundResponse('Inzerát nenalezen')
    }

    // Only owner can get suggestions
    if (listing.sellerId !== user.id) {
      return errorResponse('Můžete získat návrhy pouze pro své inzeráty', 403)
    }

    // Get AI suggestions
    const suggestions = await suggestListingImprovements(
      listing.title,
      listing.description,
      listing.category,
      Number(listing.price)
    )

    return successResponse({
      suggestions,
      disclaimer: 'Tyto návrhy jsou generované AI. Vždy zkontrolujte, že odpovídají skutečnosti.',
    })

  } catch (error) {
    console.error('AI suggestions error:', error)
    return serverErrorResponse()
  }
}
