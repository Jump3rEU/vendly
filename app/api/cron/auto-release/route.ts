// Cron job to auto-release payments after 21 days
// Run this daily: 0 0 * * * (midnight)

import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
})

async function autoReleasePayments() {
  try {
    const now = new Date()

    // Find orders that need auto-release
    const ordersToRelease = await prisma.order.findMany({
      where: {
        status: {
          in: ['PAYMENT_HELD', 'SHIPPED', 'DELIVERED'],
        },
        autoReleaseAt: {
          lte: now,
        },
      },
      include: {
        payment: true,
        buyer: true,
        seller: true,
      },
    })

    console.log(`Found ${ordersToRelease.length} orders for auto-release`)

    for (const order of ordersToRelease) {
      if (!order.payment || order.payment.status !== 'HELD' || !order.payment.stripePaymentIntentId) {
        continue
      }

      try {
        // Capture payment
        const paymentIntent = await stripe.paymentIntents.capture(
          order.payment.stripePaymentIntentId,
          {
            idempotencyKey: `auto_release_${order.id}_${Date.now()}`,
          }
        )

        // Fetch the full PaymentIntent with charges to get charge ID
        const fullPaymentIntent = await stripe.paymentIntents.retrieve(
          order.payment.stripePaymentIntentId,
          { expand: ['charges'] }
        )

        // Update payment
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'RELEASED',
            releasedAt: new Date(),
            stripeChargeId: (fullPaymentIntent as any).charges?.data?.[0]?.id,
          },
        })

        // Update order
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            paymentReleasedAt: new Date(),
          },
        })

        // Update listing
        await prisma.listing.update({
          where: { id: order.listingId },
          data: { status: 'SOLD' },
        })

        // Update stats
        await prisma.user.update({
          where: { id: order.sellerId },
          data: { totalSales: { increment: 1 } },
        })

        await prisma.user.update({
          where: { id: order.buyerId },
          data: { totalPurchases: { increment: 1 } },
        })

        // Log auto-release
        await prisma.adminAction.create({
          data: {
            adminId: 'SYSTEM',
            actionType: 'PAYMENT_RELEASED',
            targetOrderId: order.id,
            reason: `Payment auto-released after 21 days. Order: ${order.orderNumber}`,
          },
        })

        console.log(`Auto-released payment for order ${order.orderNumber}`)
      } catch (error: any) {
        console.error(`Failed to auto-release order ${order.id}:`, error.message)

        // Log failure
        await prisma.adminAction.create({
          data: {
            adminId: 'SYSTEM',
            actionType: 'PAYMENT_RELEASED',
            targetOrderId: order.id,
            reason: `Failed to auto-release payment: ${error.message}`,
          },
        })
      }
    }

    console.log('Auto-release completed')
  } catch (error) {
    console.error('Auto-release cron error:', error)
  }
}

// Export for API route
export async function GET() {
  await autoReleasePayments()
  return Response.json({ success: true, message: 'Auto-release completed' })
}
