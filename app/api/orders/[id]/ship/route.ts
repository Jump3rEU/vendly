import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/orders/[id]/ship - Mark order as shipped (seller only)
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

    const { trackingNumber, carrier } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payment: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify seller ownership
    if (order.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to ship this order' },
        { status: 403 }
      )
    }

    // Check order status
    if (order.status !== 'PAYMENT_HELD') {
      return NextResponse.json(
        { error: 'Order cannot be shipped in current state' },
        { status: 400 }
      )
    }

    // Update order with shipping info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        shippedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: 'SHIPPED',
        trackingNumber,
        message: 'Order marked as shipped',
      },
    })
  } catch (error) {
    console.error('Order shipping error:', error)
    return NextResponse.json(
      { error: 'Failed to mark order as shipped' },
      { status: 500 }
    )
  }
}
