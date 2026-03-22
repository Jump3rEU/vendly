// Orders API - Create order & escrow management
// POST /api/orders - Create new order

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { OrderStatus, ListingStatus, PaymentStatus } from '@prisma/client'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { scheduleOrderJobs } from '@/lib/cron-jobs'

const createOrderSchema = z.object({
  listingId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const buyer = await requireAuth()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'buyer' or 'seller'

    const whereClause: any = {}

    if (type === 'buyer') {
      whereClause.buyerId = buyer.id
    } else if (type === 'seller') {
      whereClause.sellerId = buyer.id
    } else {
      // Return both buying and selling orders
      whereClause.OR = [
        { buyerId: buyer.id },
        { sellerId: buyer.id },
      ]
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            trustScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            trustScore: true,
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return serverErrorResponse('Nepodařilo se načíst objednávky')
  }
}

export async function POST(req: NextRequest) {
  try {
    const buyer = await requireAuth()
    const body = await req.json()
    const { listingId } = createOrderSchema.parse(body)

    // Fetch listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true }
    })

    if (!listing) {
      return notFoundResponse('Inzerát nebyl nalezen')
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      return errorResponse('Tento inzerát již není k dispozici')
    }

    if (listing.sellerId === buyer.id) {
      return errorResponse('Nemůžete koupit vlastní inzerát')
    }

    // Calculate fees (5% platform fee)
    const itemPrice = parseFloat(listing.price.toString())
    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5')
    const platformFee = itemPrice * (platformFeePercent / 100)
    const totalAmount = itemPrice + platformFee

    // Generate unique order number
    const orderNumber = `VND-${nanoid(10).toUpperCase()}`

    // Create order with payment record
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          sellerId: listing.sellerId,
          listingId: listing.id,
          itemPrice: itemPrice.toString(),
          platformFee: platformFee.toString(),
          totalAmount: totalAmount.toString(),
          status: OrderStatus.PENDING_PAYMENT,
          // Auto-release after 7 days if no dispute
          autoReleaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
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
              avatar: true,
              trustScore: true,
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              thumbnailUrl: true,
              images: true,
            }
          }
        }
      })

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: totalAmount.toString(),
          currency: 'CZK',
          status: PaymentStatus.PENDING,
          method: 'STRIPE_CARD', // Will be updated after Stripe confirmation
        }
      })

      // Mark listing as pending (prevent double-purchase)
      await tx.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.SOLD } // Temporarily mark as sold
      })

      return newOrder
    })

    // Send order confirmation email
    sendOrderConfirmationEmail({
      buyerEmail: order.buyer.email,
      buyerName: order.buyer.name || 'Kupující',
      orderId: order.orderNumber,
      listingTitle: order.listing.title,
      price: itemPrice,
      sellerName: order.seller.name || 'Prodávající',
    }).catch(err => console.error('Failed to send order confirmation email:', err))

    // Schedule cron jobs for auto-release and reminders
    scheduleOrderJobs(order.id, order.autoReleaseAt!).catch(err => 
      console.error('Failed to schedule order jobs:', err)
    )

    return successResponse(order, 'Objednávka byla vytvořena', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message === 'Unauthorized') {
      return errorResponse('Pro vytvoření objednávky se musíte přihlásit', 401)
    }

    console.error('Error creating order:', error)
    return serverErrorResponse()
  }
}
