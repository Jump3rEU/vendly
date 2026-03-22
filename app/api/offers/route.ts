import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/offers - Create offer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, offerPrice, message, conversationId } = body

    if (!listingId || !offerPrice) {
      return NextResponse.json(
        { error: 'Listing ID and offer price are required' },
        { status: 400 }
      )
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot make offer on your own listing' },
        { status: 400 }
      )
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      )
    }

    // Check if offer price is valid
    const price = parseFloat(listing.price.toString())
    const offer = parseFloat(offerPrice)

    if (offer <= 0 || offer >= price) {
      return NextResponse.json(
        { error: 'Offer price must be between 0 and listing price' },
        { status: 400 }
      )
    }

    // Create offer
    const newOffer = await prisma.offer.create({
      data: {
        listingId,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        offerPrice,
        message: message || null,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnailUrl: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    // Create conversation if doesn't exist
    const [p1, p2] = [session.user.id, listing.sellerId].sort()
    
    let conversation = await prisma.conversation.findFirst({
      where: {
        participant1Id: p1,
        participant2Id: p2,
        listingId,
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
          listingId,
        },
      })
    }

    // Send offer message
    const offerContent = message 
      ? `Nabízím ${parseFloat(offerPrice).toLocaleString('cs-CZ')} Kč. ${message}`
      : `Nabízím ${parseFloat(offerPrice).toLocaleString('cs-CZ')} Kč`

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: offerContent,
        type: 'OFFER',
        offerId: newOffer.id,
      },
    })

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      data: newOffer,
    })
  } catch (error) {
    console.error('Create offer error:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

// GET /api/offers - Get user's offers (as buyer or seller)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'

    const whereClause = type === 'sent' 
      ? { buyerId: session.user.id }
      : type === 'received'
      ? { sellerId: session.user.id }
      : {
          OR: [
            { buyerId: session.user.id },
            { sellerId: session.user.id },
          ],
        }

    const offers = await prisma.offer.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: offers,
    })
  } catch (error) {
    console.error('Get offers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
