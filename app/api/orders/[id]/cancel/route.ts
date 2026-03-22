import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
})

// POST /api/orders/[id]/cancel - Cancel order and refund payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
        listing: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only buyer or seller can cancel
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to cancel this order' },
        { status: 403 }
      )
    }

    // Check if order can be cancelled
    if (!['PENDING_PAYMENT', 'PAYMENT_HELD', 'SHIPPED'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled in current state' },
        { status: 400 }
      )
    }

    // Cancel Stripe PaymentIntent (releases authorization hold)
    if (order.payment && order.payment.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(
          order.payment.stripePaymentIntentId,
          {
            idempotencyKey: `cancel_${order.id}_${Date.now()}`,
          }
        )

        // Update payment status
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'CANCELLED',
          },
        })
      } catch (stripeError: any) {
        console.error('Stripe cancellation error:', stripeError)
        
        // If payment was already captured, issue refund instead
        if (order.payment.status === 'CAPTURED' && order.payment.stripeChargeId) {
          const refund = await stripe.refunds.create(
            {
              charge: order.payment.stripeChargeId,
              reason: 'requested_by_customer',
            },
            {
              idempotencyKey: `refund_${order.id}_${Date.now()}`,
            }
          )

          await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'REFUNDED',
              stripeRefundId: refund.id,
              refundedAt: new Date(),
            },
          })
        }
      }
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    // Release listing
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { status: 'ACTIVE' },
    })

    // Create admin log
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'ORDER_CANCELLED',
        targetOrderId: order.id,
        reason: reason || 'Not provided',
        notes: `Order cancelled by admin.`,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: 'CANCELLED',
        message: 'Order cancelled and payment released',
      },
    })
  } catch (error) {
    console.error('Order cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
