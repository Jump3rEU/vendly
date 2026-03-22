// Dispute Management API
// POST /api/orders/[id]/dispute - Open dispute

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { DisputeReason, DisputeStatus, OrderStatus } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

const createDisputeSchema = z.object({
  reason: z.nativeEnum(DisputeReason),
  description: z.string().min(50).max(2000),
  evidence: z.array(z.string().url()).max(10).optional(),
})

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orderId } = params
    const body = await req.json()
    const { reason, description, evidence } = createDisputeSchema.parse(body)

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        dispute: true,
        payment: true,
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nebyla nalezena')
    }

    // Only buyer or seller can open dispute
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return errorResponse('Nemáte oprávnění otevřít spor k této objednávce', 403)
    }

    // Check if dispute already exists
    if (order.dispute) {
      return errorResponse('K této objednávce již existuje spor')
    }

    // Cannot dispute cancelled or completed orders
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
      return errorResponse('K této objednávce nelze otevřít spor')
    }

    // Create dispute
    const dispute = await prisma.$transaction(async (tx) => {
      // Create dispute record
      const newDispute = await tx.dispute.create({
        data: {
          orderId,
          initiatorId: user.id,
          reason,
          description,
          evidence: evidence || [],
          status: DisputeStatus.OPEN,
        },
        include: {
          initiator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          order: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            }
          }
        }
      })

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DISPUTED,
        }
      })

      // Freeze payment if not already released
      if (order.payment && order.payment.status === 'HELD') {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: 'HELD', // Keep held during dispute
          }
        })
      }

      return newDispute
    })

    // TODO: Notify admin and other party
    // TODO: Send emails

    return successResponse(dispute, 'Spor byl otevřen. Náš tým jej brzy posoudí.', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message === 'Unauthorized') {
      return errorResponse('Pro otevření sporu se musíte přihlásit', 401)
    }

    console.error('Error creating dispute:', error)
    return serverErrorResponse()
  }
}

// GET dispute details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orderId } = params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true,
        dispute: {
          include: {
            initiator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            },
            order: {
              include: {
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                },
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                },
                listing: true,
              }
            }
          }
        }
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nebyla nalezena')
    }

    if (!order.dispute) {
      return notFoundResponse('K této objednávce neexistuje žádný spor')
    }

    // Authorization
    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Nemáte oprávnění zobrazit tento spor', 403)
    }

    return successResponse(order.dispute)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro zobrazení sporu se musíte přihlásit', 401)
    }

    console.error('Error fetching dispute:', error)
    return serverErrorResponse()
  }
}
