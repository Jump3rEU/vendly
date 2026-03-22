import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/offers/[id] - Get offer details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnailUrl: true,
            images: true,
            status: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
      },
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Verify user is buyer or seller
    if (offer.buyerId !== session.user.id && offer.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: offer,
    })
  } catch (error) {
    console.error('Get offer error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}

// PATCH /api/offers/[id] - Accept/reject offer
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, responseMessage } = body // action: 'accept' | 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
      },
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Verify user is seller
    if (offer.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only seller can respond to offer' },
        { status: 403 }
      )
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Offer already responded to' },
        { status: 400 }
      )
    }

    // Check if offer expired
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await prisma.offer.update({
        where: { id: params.id },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json(
        { error: 'Offer has expired' },
        { status: 400 }
      )
    }

    // Update offer status
    const updatedOffer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
        responseMessage: responseMessage || null,
        respondedAt: new Date(),
      },
      include: {
        listing: true,
      },
    })

    // If accepted, update listing price
    if (action === 'accept') {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: {
          originalPrice: offer.listing.price,
          price: offer.offerPrice,
        },
      })
    }

    // Send response message to conversation
    const [p1, p2] = [offer.buyerId, offer.sellerId].sort()
    const conversation = await prisma.conversation.findFirst({
      where: {
        participant1Id: p1,
        participant2Id: p2,
        listingId: offer.listingId,
      },
    })

    if (conversation) {
      const statusText = action === 'accept' ? 'přijal' : 'odmítl'
      const content = responseMessage
        ? `Prodejce ${statusText} vaši nabídku: ${responseMessage}`
        : `Prodejce ${statusText} vaši nabídku`

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content,
          type: 'SYSTEM',
        },
      })

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedOffer,
    })
  } catch (error) {
    console.error('Update offer error:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}
