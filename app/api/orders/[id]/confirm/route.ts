import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
})

// POST /api/orders/[id]/confirm - Buyer confirms item received
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
        listing: true,
        buyer: true,
        seller: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify buyer ownership
    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to confirm this order' },
        { status: 403 }
      )
    }

    // Check order status
    if (order.status !== 'DELIVERED' && order.status !== 'SHIPPED') {
      return NextResponse.json(
        { error: 'Order cannot be confirmed in current state' },
        { status: 400 }
      )
    }

    // Check if payment exists and is held
    if (!order.payment || order.payment.status !== 'HELD') {
      return NextResponse.json(
        { error: 'Payment not in held state' },
        { status: 400 }
      )
    }

    if (!order.payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found' },
        { status: 400 }
      )
    }

    // Capture the payment (release funds from escrow)
    try {
      const paymentIntent = await stripe.paymentIntents.capture(
        order.payment.stripePaymentIntentId,
        {
          idempotencyKey: `capture_${order.id}_${Date.now()}`,
        }
      )

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment capture failed')
      }

      // Fetch the full PaymentIntent with charges to get charge ID
      const fullPaymentIntent = await stripe.paymentIntents.retrieve(
        order.payment.stripePaymentIntentId,
        { expand: ['latest_charge'] }
      )

      // Update payment status
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'CAPTURED',
          stripeChargeId: typeof fullPaymentIntent.latest_charge === 'string' 
            ? fullPaymentIntent.latest_charge 
            : fullPaymentIntent.latest_charge?.id,
        },
      })

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          deliveredAt: new Date(),
        },
      })

      // Update listing status
      await prisma.listing.update({
        where: { id: order.listingId },
        data: { status: 'SOLD' },
      })

      // Update seller stats
      await prisma.user.update({
        where: { id: order.sellerId },
        data: {
          totalSales: {
            increment: 1,
          },
        },
      })

      // Update buyer stats
      await prisma.user.update({
        where: { id: order.buyerId },
        data: {
          totalPurchases: {
            increment: 1,
          },
        },
      })

      // Calculate platform fee and seller payout
      const platformFee = order.platformFee.toNumber()
      const sellerPayout = order.itemPrice.toNumber()

      // TODO: Create Stripe Transfer to seller (if connected account exists)
      // TODO: Send confirmation emails

      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          status: 'COMPLETED',
          sellerPayout,
          platformFee,
          message: 'Payment released to seller',
        },
      })
    } catch (stripeError: any) {
      console.error('Stripe capture error:', stripeError)

      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Order confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm order' },
      { status: 500 }
    )
  }
}

// GET /api/orders/[id]/confirm - Check if order can be confirmed
export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const canConfirm =
      (order.status === 'DELIVERED' || order.status === 'SHIPPED') &&
      order.payment?.status === 'HELD'

    return NextResponse.json({
      success: true,
      data: {
        canConfirm,
        status: order.status,
        paymentStatus: order.payment?.status,
        expectedReleaseAt: order.expectedReleaseAt,
        autoReleaseAt: order.autoReleaseAt,
      },
    })
  } catch (error) {
    console.error('Check confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to check confirmation status' },
      { status: 500 }
    )
  }
}
