// Admin Dashboard API
// GET/POST /api/admin/* - Admin-only endpoints

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { AdminActionType, AccountStatus, ListingStatus, DisputeStatus } from '@prisma/client'

// GET /api/admin/stats - Platform statistics
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalListings,
      activeListings,
      totalOrders,
      pendingOrders,
      totalRevenue,
      openDisputes,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: AccountStatus.ACTIVE } }),
      prisma.user.count({ where: { status: AccountStatus.SUSPENDED } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING_PAYMENT', 'PAYMENT_HELD'] } } }),
      prisma.payment.aggregate({
        where: { status: 'RELEASED' },
        _sum: { amount: true }
      }),
      prisma.dispute.count({ where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.INVESTIGATING] } } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ])

    return successResponse({
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      moderation: {
        openDisputes,
        pendingReports,
      }
    })
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return errorResponse(error.message, 403)
    }

    console.error('Error fetching admin stats:', error)
    return serverErrorResponse()
  }
}
