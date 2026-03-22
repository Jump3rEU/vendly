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
    const { notes } = await request.json();

    // Check if user exists and is suspended
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.status !== AccountStatus.SUSPENDED) {
      return NextResponse.json(
        { error: 'User is not suspended' },
        { status: 400 }
      );
    }

    // Update user status to ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: AccountStatus.ACTIVE,
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
        actionType: AdminActionType.VERIFY_USER,
        targetUserId: params.id,
        reason: 'Account suspension lifted',
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User unsuspended successfully',
    });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    return NextResponse.json(
      { error: 'Failed to unsuspend user' },
      { status: 500 }
    );
  }
}
