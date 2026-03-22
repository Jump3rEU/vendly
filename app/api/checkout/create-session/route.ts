// Stripe Checkout Session Creation
// POST /api/checkout/create-session

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { stripe, ESCROW_CONFIG } from '@/lib/stripe'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { OrderStatus, PaymentStatus } from '@prisma/client'

const createSessionSchema = z.object({
  orderId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { orderId } = createSessionSchema.parse(body)

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: true,
        payment: true,
        seller: true,
      }
    })

    if (!order) {
      return notFoundResponse('Objednávka nebyla nalezena')
    }

    // Authorization - only buyer can pay
    if (order.buyerId !== user.id) {
      return errorResponse('Nemáte oprávnění zaplatit tuto objednávku', 403)
    }

    // Check order status
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      return errorResponse('Tato objednávka již byla zaplacena nebo zrušena')
    }

    // Check if payment already exists and is not pending
    if (order.payment && order.payment.status !== PaymentStatus.PENDING) {
      return errorResponse('Platba již byla zpracována')
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: ESCROW_CONFIG.currency,
            product_data: {
              name: order.listing.title,
              description: `Objednávka ${order.orderNumber}`,
              images: order.listing.thumbnailUrl ? [order.listing.thumbnailUrl] : [],
            },
            unit_amount: Math.round(parseFloat(order.itemPrice.toString()) * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: ESCROW_CONFIG.currency,
            product_data: {
              name: 'Poplatek platformy',
              description: 'Bezpečnostní escrow systém a zpracování platby',
            },
            unit_amount: Math.round(parseFloat(order.platformFee.toString()) * 100),
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/kosik/uspech?order_id=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/kosik/zruseno?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        buyerId: user.id,
        sellerId: order.sellerId,
        listingId: order.listingId,
      },
      // Escrow: Payment will be held, not immediately transferred
      payment_intent_data: {
        capture_method: 'automatic',
        description: ESCROW_CONFIG.descriptionTemplate(order.orderNumber, order.listing.title),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          escrow: 'true',
        },
        // Later: transfer_data for Connect accounts when seller connects
      },
    })

    // Update payment record with session ID
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        stripePaymentIntentId: session.payment_intent as string,
        status: PaymentStatus.PROCESSING,
      }
    })

    return successResponse({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro platbu se musíte přihlásit', 401)
    }

    return serverErrorResponse('Chyba při vytváření platební relace')
  }
}
