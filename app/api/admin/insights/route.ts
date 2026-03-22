// Admin dashboard AI insights
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { 
  successResponse, 
  errorResponse,
  serverErrorResponse 
} from '@/lib/api-response'
import { generateAdminInsights } from '@/lib/ai-service'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Admin only
    if (user.role !== 'ADMIN') {
      return errorResponse('Pouze pro administrátory', 403)
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Gather data for analysis
    const [recentListings, recentReports, todayUsers, suspendedUsers, activeListings] = await Promise.all([
      prisma.listing.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          title: true,
          category: true,
          price: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.report.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          reason: true,
          status: true,
        },
        take: 50,
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.count({
        where: {
          status: 'SUSPENDED',
        },
      }),
      prisma.listing.count({
        where: {
          status: 'ACTIVE',
        },
      }),
    ])

    // Generate AI insights
    const insights = await generateAdminInsights({
      recentListings: recentListings.map(l => ({
        ...l,
        price: Number(l.price),
        status: l.status as string,
      })),
      recentReports: recentReports.map(r => ({
        reason: r.reason as string,
        status: r.status as string,
      })),
      userStats: {
        newUsers: todayUsers,
        suspendedUsers,
        activeListings,
      },
    })

    return successResponse({
      insights,
      stats: {
        period: `${days} dní`,
        listingsAnalyzed: recentListings.length,
        reportsAnalyzed: recentReports.length,
        newUsersToday: todayUsers,
        suspendedUsers,
        activeListings,
      },
      disclaimer: 'AI analýza slouží jako doporučení. Vždy ověřte fakta před akcí.',
    })

  } catch (error) {
    console.error('Admin insights error:', error)
    return serverErrorResponse()
  }
}
