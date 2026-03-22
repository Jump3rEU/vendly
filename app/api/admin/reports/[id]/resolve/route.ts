import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth';
import { UserRole, ReportStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuthSession([UserRole.ADMIN]);
    const { status, resolution } = await request.json();

    if (!status || !['RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (RESOLVED or DISMISSED) is required' },
        { status: 400 }
      );
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: status as ReportStatus,
        reviewedBy: session.user.id,
        resolution: resolution || `Report marked as ${status.toLowerCase()}`,
        resolvedAt: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedListing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // TODO: Send notification to reporter

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Report updated successfully',
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
