// Admin Dispute Resolution
// PATCH /api/admin/disputes/[id]/resolve

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { DisputeStatus, OrderStatus, PaymentStatus, AdminActionType } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

const resolveDisputeSchema = z.object({
  resolution: z.enum(['refund_full', 'refund_partial', 'no_refund']),
  refundAmount: z.number().optional(),
  adminNotes: z.string().min(10).max(2000),
  resolutionText: z.string().min(10).max(1000),
})

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id: disputeId } = params
    const body = await req.json()
    const { resolution, refundAmount, adminNotes, resolutionText } = resolveDisputeSchema.parse(body)

    // Fetch dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            payment: true,
            buyer: true,
            seller: true,
          }
        }
      }
    })

    if (!dispute) {
      return notFoundResponse('Spor nebyl nalezen')
    }

    if (dispute.status === DisputeStatus.RESOLVED_REFUND || 
        dispute.status === DisputeStatus.RESOLVED_PARTIAL_REFUND ||
        dispute.status === DisputeStatus.RESOLVED_NO_REFUND) {
      return errorResponse('Tento spor již byl vyřešen')
    }

    // Resolve dispute
    const result = await prisma.$transaction(async (tx) => {
      let newDisputeStatus: DisputeStatus
      let newOrderStatus: OrderStatus
      let newPaymentStatus: PaymentStatus | undefined

      switch (resolution) {
        case 'refund_full':
          newDisputeStatus = DisputeStatus.RESOLVED_REFUND
          newOrderStatus = OrderStatus.REFUNDED
          newPaymentStatus = PaymentStatus.REFUNDED

          // Update payment
          await tx.payment.update({
            where: { orderId: dispute.orderId },
            data: {
              status: PaymentStatus.REFUNDED,
              refundedAt: new Date(),
            }
          })

          // TODO: Process Stripe refund
          break

        case 'refund_partial':
          if (!refundAmount || refundAmount <= 0) {
            throw new Error('Částka vrácení peněz musí být zadána')
          }

          newDisputeStatus = DisputeStatus.RESOLVED_PARTIAL_REFUND
          newOrderStatus = OrderStatus.COMPLETED
          newPaymentStatus = PaymentStatus.RELEASED

          // TODO: Process partial Stripe refund
          break

        case 'no_refund':
          newDisputeStatus = DisputeStatus.RESOLVED_NO_REFUND
          newOrderStatus = OrderStatus.COMPLETED
          newPaymentStatus = PaymentStatus.RELEASED

          // Release payment to seller
          await tx.payment.update({
            where: { orderId: dispute.orderId },
            data: {
              status: PaymentStatus.RELEASED,
              releasedAt: new Date(),
            }
          })

          // TODO: Transfer to seller via Stripe
          break

        default:
          throw new Error('Neplatné rozhodnutí')
      }

      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: newDisputeStatus,
          resolution: resolutionText,
          adminNotes,
          refundAmount: refundAmount?.toString(),
          resolvedAt: new Date(),
        }
      })

      // Update order
      await tx.order.update({
        where: { id: dispute.orderId },
        data: {
          status: newOrderStatus,
        }
      })

      // Log admin action
      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          actionType: AdminActionType.RESOLVE_DISPUTE,
          targetOrderId: dispute.orderId,
          reason: `Dispute resolved: ${resolution}`,
          notes: adminNotes,
        }
      })

      return updatedDispute
    })

    // TODO: Send email notifications to buyer and seller

    return successResponse(result, 'Spor byl vyřešen')
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return errorResponse(error.message, 403)
    }

    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    console.error('Error resolving dispute:', error)
    return serverErrorResponse()
  }
}
