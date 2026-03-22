import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth';
import { UserRole, AccountStatus, AdminActionType } from '@prisma/client';
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

    // Cannot ban yourself
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot ban your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Cannot ban other admins
    if (targetUser.role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot ban administrator accounts' },
        { status: 403 }
      );
    }

    // Update user status to BANNED
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: AccountStatus.BANNED,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.BAN_USER,
        targetUserId: params.id,
        reason,
        notes,
      },
    });

    // Remove all active listings from this user
    await prisma.listing.updateMany({
      where: {
        sellerId: params.id,
        status: { in: ['ACTIVE', 'SUSPENDED'] },
      },
      data: {
        status: 'REMOVED',
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User banned permanently',
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}
