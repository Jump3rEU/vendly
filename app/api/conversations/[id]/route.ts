import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/conversations/[id] - Get conversation with messages
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

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
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
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            offer: {
              include: {
                listing: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Verify user is participant
    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: session.user.id },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

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
        messages: conversation.messages,
        createdAt: conversation.createdAt,
      },
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
