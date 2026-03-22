import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth';
import { UserRole, AdminActionType } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession([UserRole.ADMIN]);
    const { reason, notes } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Update listing status to REMOVED
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: 'REMOVED',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.REMOVE_LISTING,
        targetListingId: params.id,
        targetUserId: listing.sellerId,
        reason,
        notes,
      },
    });

    // TODO: Send notification email to seller about listing removal

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'Listing removed successfully',
    });
  } catch (error) {
    console.error('Error removing listing:', error);
    return NextResponse.json(
      { error: 'Failed to remove listing' },
      { status: 500 }
    );
  }
}
