import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth';
import { UserRole, AdminActionType } from '@prisma/client';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Using latest API version
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession([UserRole.ADMIN]);
    const { amount, reason, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
        payment: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.payment?.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Order has no payment information' },
        { status: 400 }
      );
    }

    // Validate refund amount doesn't exceed order total
    if (amount > Number(order.totalAmount)) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed order total' },
        { status: 400 }
      );
    }

    // Process refund via Stripe
    let stripeRefund;
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: order.payment.stripePaymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          orderId: order.id,
          refundedBy: session.user.id,
          adminReason: reason,
        },
      });
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError);
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Update order status
    const isFullRefund = amount >= Number(order.totalAmount);
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'DISPUTED',
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.MANUAL_REFUND,
        targetOrderId: params.id,
        reason,
        notes: `Manual refund: ${amount} CZK (Stripe: ${stripeRefund.id}). ${notes || ''}`,
      },
    });

    // TODO: Send notification email to buyer

    return NextResponse.json({
      success: true,
      refund: {
        id: stripeRefund.id,
        amount,
        status: stripeRefund.status,
      },
      order: {
        id: order.id,
        status: isFullRefund ? 'REFUNDED' : 'DISPUTED',
      },
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
