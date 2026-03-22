// GET /api/conversations/unread-count - Get count of unread conversations

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Count conversations with unread messages
    const unreadCount = await prisma.conversation.count({
      where: {
        OR: [
          { participant1Id: user.id },
          { participant2Id: user.id },
        ],
        messages: {
          some: {
            senderId: { not: user.id },
            read: false,
          }
        }
      }
    })

    return successResponse({ count: unreadCount })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return successResponse({ count: 0 })
    }
    
    console.error('Error fetching unread count:', error)
    return serverErrorResponse()
  }
}
