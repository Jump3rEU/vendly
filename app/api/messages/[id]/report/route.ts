import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// POST /api/messages/[id]/report - Report message
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
    const { reason, description } = body

    if (!reason || !description) {
      return NextResponse.json(
        { error: 'Reason and description are required' },
        { status: 400 }
      )
    }

    // Verify message exists
    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        conversation: true,
        sender: true,
      },
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Verify user is participant in conversation
    if (
      message.conversation.participant1Id !== session.user.id &&
      message.conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Cannot report own message
    if (message.senderId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot report your own message' },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedUserId: message.senderId,
        reportedMessageId: message.id,
        reason,
        description,
      },
    })

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'WARNING_ISSUED',
        targetUserId: message.senderId,
        reason: `Message reported: ${reason}`,
        notes: description,
      },
    })

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report submitted successfully',
    })
  } catch (error) {
    console.error('Report message error:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
