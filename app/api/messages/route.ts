// Messaging API
// POST/GET /api/messages

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { sendNewMessageEmail } from '@/lib/email'

// POST - Send message (via conversation)
const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  receiverId: z.string().optional(),
  content: z.string().min(1).max(2000),
  listingId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { conversationId, receiverId, content, listingId } = sendMessageSchema.parse(body)

    let conversation

    if (conversationId) {
      // Use existing conversation
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: user.id },
            { participant2Id: user.id },
          ]
        }
      })

      if (!conversation) {
        return errorResponse('Konverzace nebyla nalezena', 404)
      }
    } else if (receiverId) {
      // Cannot message yourself
      if (receiverId === user.id) {
        return errorResponse('Nemůžete poslat zprávu sami sobě')
      }

      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, status: true }
      })

      if (!receiver) {
        return errorResponse('Příjemce nebyl nalezen', 404)
      }

      if (receiver.status !== 'ACTIVE') {
        return errorResponse('Tento uživatel není aktivní')
      }

      // Find or create conversation
      // Sort IDs to ensure consistent ordering
      const [p1Id, p2Id] = [user.id, receiverId].sort()

      conversation = await prisma.conversation.findFirst({
        where: {
          participant1Id: p1Id,
          participant2Id: p2Id,
          listingId: listingId || null,
        }
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: p1Id,
            participant2Id: p2Id,
            listingId: listingId || null,
          }
        })
      }
    } else {
      return errorResponse('Je vyžadováno conversationId nebo receiverId')
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    })

    // Send email notification to receiver (if not the sender) 
    const messageReceiverId = conversation.participant1Id === user.id 
      ? conversation.participant2Id 
      : conversation.participant1Id
      
    if (messageReceiverId !== user.id) {
      const messageReceiver = await prisma.user.findUnique({
        where: { id: messageReceiverId },
        select: { email: true, name: true }
      })
      
      if (messageReceiver) {
        sendNewMessageEmail({
          recipientEmail: messageReceiver.email,
          recipientName: messageReceiver.name || 'Uživatel',
          senderName: user.name || 'Anonymn\u00ed',
          messagePreview: content,
          conversationId: conversation.id,
        }).catch(err => console.error('Failed to send message email:', err))
      }
    }

    // TODO: Emit WebSocket event to receiver
    // TODO: Send push notification

    return successResponse(message, 'Zpráva byla odeslána', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message === 'Unauthorized') {
      return errorResponse('Pro odeslání zprávy se musíte přihlásit', 401)
    }

    console.error('Error sending message:', error)
    return serverErrorResponse()
  }
}

// GET - List conversations or messages
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Get messages from specific conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: user.id },
            { participant2Id: user.id },
          ]
        }
      })

      if (!conversation) {
        return errorResponse('Konverzace nebyla nalezena', 404)
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId,
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          conversationId: conversationId,
          senderId: { not: user.id },
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        }
      })

      return successResponse(messages)
    } else {
      // Get list of conversations
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: user.id },
            { participant2Id: user.id },
          ]
        },
        orderBy: {
          lastMessageAt: 'desc'
        },
        include: {
          participant1: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          participant2: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              read: true,
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  read: false,
                  senderId: { not: user.id }
                }
              }
            }
          }
        }
      })

      // Transform to include otherUser
      const result = conversations.map(conv => {
        const otherUser = conv.participant1Id === user.id ? conv.participant2 : conv.participant1
        return {
          id: conv.id,
          otherUser,
          listing: conv.listing,
          lastMessage: conv.messages[0] || null,
          unreadCount: conv._count.messages,
          lastMessageAt: conv.lastMessageAt,
        }
      })

      return successResponse(result)
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro zobrazení zpráv se musíte přihlásit', 401)
    }

    console.error('Error fetching messages:', error)
    return serverErrorResponse()
  }
}
