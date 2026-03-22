import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.captured':
        await handleChargeCaptured(event.data.object as Stripe.Charge)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Payment authorized (funds on hold)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: { include: { listing: true } } },
  })

  if (!payment) {
    console.error('Payment not found for PaymentIntent:', paymentIntent.id)
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'HELD',
      heldAt: new Date(),
    },
  })

  // Update order status to PAYMENT_HELD (escrow)
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: 'PAYMENT_HELD',
      paymentHeldAt: new Date(),
    },
  })

  console.log(`Payment held for order ${payment.order.orderNumber}`)
}

// Payment failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: { include: { listing: true } } },
  })

  if (!payment) return

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' },
  })

  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'CANCELLED' },
  })

  // Release listing
  if (payment.order.listing) {
    await prisma.listing.update({
      where: { id: payment.order.listingId },
      data: { status: 'ACTIVE' },
    })
  }

  console.log(`Payment failed for order ${payment.order.orderNumber}`)
}

// Payment canceled
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: { include: { listing: true } } },
  })

  if (!payment) return

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'CANCELLED' },
  })

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'CANCELLED' },
  })

  if (payment.order.listing) {
    await prisma.listing.update({
      where: { id: payment.order.listingId },
      data: { status: 'ACTIVE' },
    })
  }
}

// Charge captured (funds transferred to platform)
async function handleChargeCaptured(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: charge.payment_intent as string },
    include: { order: true },
  })

  if (!payment) return

  // Update payment with charge ID
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      stripeChargeId: charge.id,
      status: 'COMPLETED',
    },
  })

  // Update order status to COMPLETED (funds released)
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })

  console.log(`Payment captured for order ${payment.order.orderNumber}`)
}

// Charge refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: charge.id },
    include: { order: true },
  })

  if (!payment) return

  const refund = charge.refunds?.data[0]

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'REFUNDED',
      stripeRefundId: refund?.id,
      refundedAt: new Date(),
    },
  })

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'REFUNDED' },
  })

  console.log(`Payment refunded for order ${payment.order.orderNumber}`)
}
