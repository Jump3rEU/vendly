// Like/Unlike Listing
// POST /api/listings/[id]/like

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'

interface RouteParams {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: listingId } = params

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true }
    })

    if (!listing) {
      return notFoundResponse('Inzerát nebyl nalezen')
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId
          }
        }
      })

      return successResponse({ liked: false }, 'Inzerát odebrán z oblíbených')
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          listingId
        }
      })

      return successResponse({ liked: true }, 'Inzerát přidán do oblíbených')
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro přidání do oblíbených se musíte přihlásit', 401)
    }

    console.error('Error toggling like:', error)
    return serverErrorResponse()
  }
}

// GET - Check if user liked this listing
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: listingId } = params

    const like = await prisma.like.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId
        }
      }
    })

    return successResponse({ liked: !!like })
  } catch (error) {
    return successResponse({ liked: false })
  }
}
