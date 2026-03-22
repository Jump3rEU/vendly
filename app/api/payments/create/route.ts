import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
})

// Helper to generate idempotency key
function generateIdempotencyKey(userId: string, listingId: string): string {
  return `payment_${userId}_${listingId}_${Date.now()}`
}

// POST /api/payments/create - Create payment intent with authorization hold
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Fetch listing with seller info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Prevent self-purchase
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot buy your own listing' },
        { status: 400 }
      )
    }

    // Check listing status
    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not available for purchase' },
        { status: 400 }
      )
    }

    // Check for existing pending order (idempotency)
    const existingOrder = await prisma.order.findFirst({
      where: {
        listingId,
        buyerId: session.user.id,
        status: {
          in: ['PENDING_PAYMENT', 'PAYMENT_HELD', 'SHIPPED'],
        },
      },
      include: {
        payment: true,
      },
    })

    if (existingOrder && existingOrder.payment) {
      // Return existing payment intent
      return NextResponse.json({
        success: true,
        data: {
          orderId: existingOrder.id,
          clientSecret: existingOrder.payment.stripePaymentIntentId,
          amount: existingOrder.totalAmount,
        },
      })
    }

    // Calculate amounts
    const itemPrice = listing.price
    const platformFee = itemPrice.mul(0.05) // 5% platform fee
    const totalAmount = itemPrice.add(platformFee)

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create Stripe PaymentIntent with authorization hold (capture_method: manual)
    const idempotencyKey = generateIdempotencyKey(session.user.id, listingId)
    
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(totalAmount.toNumber() * 100), // Convert to cents
        currency: 'czk',
        capture_method: 'manual', // CRITICAL: Manual capture for escrow
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          listingId,
          sellerId: listing.sellerId,
          buyerId: session.user.id,
          orderNumber,
          itemPrice: itemPrice.toString(),
          platformFee: platformFee.toString(),
        },
        description: `Purchase of ${listing.title}`,
        statement_descriptor: 'VENDLY ESCROW',
      },
      {
        idempotencyKey, // Prevent duplicate charges
      }
    )

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        listingId,
        itemPrice,
        platformFee,
        totalAmount,
        status: 'PENDING_PAYMENT',
        // Escrow timeline
        expectedReleaseAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        autoReleaseAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days auto-release
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        currency: 'CZK',
        status: 'PENDING',
        method: 'STRIPE_CARD',
        stripePaymentIntentId: paymentIntent.id,
        metadata: {
          paymentIntentClientSecret: paymentIntent.client_secret,
        },
      },
    })

    // Update listing status to reserved
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'RESERVED' },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        orderNumber,
      },
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Card was declined' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
