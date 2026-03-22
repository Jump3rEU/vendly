import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET /api/conversations - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            images: true,
            price: true,
            status: true,
            sellerId: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
            senderId: true,
            read: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: session.user.id },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Format conversations
    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.participant1Id === session.user.id 
        ? conv.participant2 
        : conv.participant1

      return {
        id: conv.id,
        otherUser,
        listing: conv.listing,
        order: conv.order,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedConversations,
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create or get conversation
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
    const { otherUserId, listingId, orderId } = body

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Other user ID is required' },
        { status: 400 }
      )
    }

    // Order participants to ensure uniqueness
    const [p1, p2] = [session.user.id, otherUserId].sort()

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: p1,
            participant2Id: p2,
            listingId: listingId || null,
          },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            images: true,
            price: true,
            status: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    })

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
          listingId: listingId || null,
          orderId: orderId || null,
        },
        include: {
          participant1: {
            select: {
              id: true,
              name: true,
              avatar: true,
              trustScore: true,
            },
          },
          participant2: {
            select: {
              id: true,
              name: true,
              avatar: true,
              trustScore: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              images: true,
              price: true,
              status: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
      })
    }

    const otherUser = conversation.participant1Id === session.user.id 
      ? conversation.participant2 
      : conversation.participant1

    return NextResponse.json({
      success: true,
      data: {
        id: conversation.id,
        otherUser,
        listing: conversation.listing,
        order: conversation.order,
        createdAt: conversation.createdAt,
      },
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
