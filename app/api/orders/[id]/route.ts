// Order Detail & Actions
// GET/PATCH /api/orders/[id]

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { sendOrderShippedEmail, sendOrderCompletedEmail } from '@/lib/email'
import { cancelOrderJobs } from '@/lib/cron-jobs'

interface RouteParams {
  params: { id: string }
}

// GET single order
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            trustScore: true,
            totalSales: true,
            idVerified: true,
            phoneVerified: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            thumbnailUrl: true,
            condition: true,
          }
        },
        payment: true,
        dispute: true,
        review: true,
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nebyla nalezena')
    }

    // Authorization - buyer or seller only
    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Nemáte oprávnění zobrazit tuto objednávku', 403)
    }

    return successResponse(order)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro zobrazení objednávky se musíte přihlásit', 401)
    }

    console.error('Error fetching order:', error)
    return serverErrorResponse()
  }
}

// PATCH - Update order status (buyer confirms delivery, seller ships, etc.)
const updateOrderSchema = z.object({
  action: z.enum([
    'confirm_payment',
    'mark_shipped',
    'confirm_delivery',
    'cancel',
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = params
    const body = await req.json()
    const { action, trackingNumber, notes } = updateOrderSchema.parse(body)

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payment: true,
        listing: true,
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nebyla nalezena')
    }

    // Execute action based on user role and order state
    let updatedOrder

    switch (action) {
      case 'mark_shipped':
        // Only seller can mark as shipped
        if (order.sellerId !== user.id) {
          return errorResponse('Pouze prodávající může označit objednávku jako odeslanou', 403)
        }

        if (order.status !== OrderStatus.PAYMENT_HELD && order.status !== OrderStatus.AWAITING_SHIPMENT) {
          return errorResponse('Objednávku nelze označit jako odeslanou v aktuálním stavu')
        }

        updatedOrder = await prisma.order.update({
          where: { id },
          data: {
            status: OrderStatus.SHIPPED,
            shippedAt: new Date(),
            trackingNumber: trackingNumber || null,
          },
          include: {
            buyer: true,
            seller: true,
            listing: true,
          }
        })

        // Send email notification to buyer
        sendOrderShippedEmail({
          buyerEmail: updatedOrder.buyer.email,
          buyerName: updatedOrder.buyer.name || 'Kupující',
          orderId: order.id,
          listingTitle: order.listing.title,
          trackingNumber,
          carrier: trackingNumber ? 'Česká pošta' : undefined,
        }).catch(err => console.error('Failed to send shipped email:', err))
        break

      case 'confirm_delivery':
        // Only buyer can confirm delivery
        if (order.buyerId !== user.id) {
          return errorResponse('Pouze kupující může potvrdit převzetí', 403)
        }

        if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.DELIVERED) {
          return errorResponse('Objednávku lze potvrdit pouze po odeslání')
        }

        // Mark as delivered and prepare for payment release
        updatedOrder = await prisma.$transaction(async (tx) => {
          const updated = await tx.order.update({
            where: { id },
            data: {
              status: OrderStatus.DELIVERED,
              deliveredAt: new Date(),
              buyerConfirmedAt: new Date(),
            }
          })

          // Release payment to seller (will be handled by background job)
          // For now, mark as ready for release
          await tx.payment.update({
            where: { orderId: id },
            data: {
              status: PaymentStatus.RELEASED,
              releasedAt: new Date(),
            }
          })

          // Update seller stats
          await tx.user.update({
            where: { id: order.sellerId },
            data: {
              totalSales: { increment: 1 },
            }
          })

          // Update buyer stats
          await tx.user.update({
            where: { id: order.buyerId },
            data: {
              totalPurchases: { increment: 1 },
            }
          })

          return tx.order.findUnique({
            where: { id },
            include: {
              buyer: true,
              seller: true,
              listing: true,
              payment: true,
            }
          })
        })

        // Send completion email to seller
        const platformFee = Number(process.env.PLATFORM_FEE_PERCENTAGE || 5) / 100
        const sellerAmount = parseFloat(order.listing.price.toString()) * (1 - platformFee)
        
        sendOrderCompletedEmail({
          sellerEmail: updatedOrder!.seller.email,
          sellerName: updatedOrder!.seller.name || 'Prodávající',
          orderId: order.id,
          listingTitle: order.listing.title,
          amount: sellerAmount,
        }).catch(err => console.error('Failed to send completion email:', err))

        // Cancel any pending cron jobs for this order
        cancelOrderJobs(order.id).catch(err => 
          console.error('Failed to cancel order jobs:', err)
        )

        // TODO: Trigger Stripe transfer to seller
        break

      case 'cancel':
        // Buyer or seller can cancel (with restrictions)
        if (order.buyerId !== user.id && order.sellerId !== user.id) {
          return errorResponse('Nemáte oprávnění zrušit tuto objednávku', 403)
        }

        if (order.status === OrderStatus.COMPLETED) {
          return errorResponse('Dokončenou objednávku nelze zrušit')
        }

        if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
          return errorResponse('Odeslanou objednávku nelze zrušit. Otevřete spor.')
        }

        updatedOrder = await prisma.$transaction(async (tx) => {
          // Cancel order
          const updated = await tx.order.update({
            where: { id },
            data: {
              status: OrderStatus.CANCELLED,
            }
          })

          // Refund if payment was held
          if (order.payment?.status === PaymentStatus.HELD) {
            await tx.payment.update({
              where: { orderId: id },
              data: {
                status: PaymentStatus.REFUNDED,
                refundedAt: new Date(),
              }
            })
          }

          // Restore listing
          await tx.listing.update({
            where: { id: order.listingId },
            data: {
              status: 'ACTIVE',
            }
          })

          return tx.order.findUnique({
            where: { id },
            include: {
              buyer: true,
              seller: true,
              listing: true,
              payment: true,
            }
          })
        })

        // TODO: Process Stripe refund
        break

      default:
        return errorResponse('Neplatná akce')
    }

    return successResponse(updatedOrder, 'Objednávka byla aktualizována')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message === 'Unauthorized') {
      return errorResponse('Pro aktualizaci objednávky se musíte přihlásit', 401)
    }

    console.error('Error updating order:', error)
    return serverErrorResponse()
  }
}
