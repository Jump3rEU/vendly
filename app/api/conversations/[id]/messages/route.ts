import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// POST /api/conversations/[id]/messages - Send message
export async function POST(
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
    const { content, type = 'TEXT', offerId } = body

    if (!content && type === 'TEXT') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        content,
        type,
        offerId: offerId || null,
      },
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
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() },
    })

    // TODO: Emit WebSocket event for real-time delivery
    // io.to(params.id).emit('message', message)

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
