import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats
    const [
      totalUsers,
      newUsersToday,
      activeUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalDisputes,
      openDisputes,
      resolvedDisputes,
      recentUsers,
      recentListings,
      recentOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'DRAFT' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.dispute.count({ where: { status: 'CLOSED' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, totalAmount: true, createdAt: true }
      })
    ])

    // Calculate revenue (sum of completed orders this month)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: monthStart }
      },
      _sum: { totalAmount: true }
    })

    const revenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0

    // Build recent activity
    const recentActivity = [
      ...recentUsers.map(u => ({
        id: u.id,
        type: 'user' as const,
        message: `Nový uživatel: ${u.name || u.email}`,
        time: formatTimeAgo(u.createdAt)
      })),
      ...recentListings.map(l => ({
        id: l.id,
        type: 'listing' as const,
        message: `Nový inzerát: ${l.title}`,
        time: formatTimeAgo(l.createdAt)
      })),
      ...recentOrders.map(o => ({
        id: o.id,
        type: 'order' as const,
        message: `Nová objednávka: ${Number(o.totalAmount).toLocaleString('cs-CZ')} Kč`,
        time: formatTimeAgo(o.createdAt)
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    return NextResponse.json({
      stats: {
        users: { total: totalUsers, new: newUsersToday, active: activeUsers },
        listings: { total: totalListings, active: activeListings, pending: pendingListings },
        orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders, revenue },
        disputes: { total: totalDisputes, open: openDisputes, resolved: resolvedDisputes }
      },
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'právě teď'
  if (diffMins < 60) return `před ${diffMins} min`
  if (diffHours < 24) return `před ${diffHours} hod`
  if (diffDays === 1) return 'včera'
  if (diffDays < 7) return `před ${diffDays} dny`
  return date.toLocaleDateString('cs-CZ')
}
