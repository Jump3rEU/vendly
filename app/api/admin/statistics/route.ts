import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get user stats
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalListings,
      activeListings,
      listingsThisMonth,
      listingsLastMonth,
      totalOrders,
      completedOrders,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.listing.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.order.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      })
    ])

    // Get top categories by listing count
    const topCategoriesRaw = await prisma.listing.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    const topCategories = topCategoriesRaw.map(c => ({
      name: c.category || 'Bez kategorie',
      count: c._count.id
    }))

    // Generate recent activity data
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

      const [dayUsers, dayOrders, dayRevenue] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
        prisma.order.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
        prisma.order.aggregate({
          where: { status: 'COMPLETED', createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { totalAmount: true }
        })
      ])

      recentActivity.push({
        date: dayStart.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric' }),
        users: dayUsers,
        orders: dayOrders,
        revenue: Number(dayRevenue._sum.totalAmount) || 0
      })
    }

    // Calculate growth percentages
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const revenueThisMonthNum = Number(revenueThisMonth._sum.totalAmount) || 0
    const revenueLastMonthNum = Number(revenueLastMonth._sum.totalAmount) || 0
    const totalRevenueNum = Number(totalRevenue._sum.totalAmount) || 0

    const stats = {
      users: {
        total: totalUsers,
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        growth: calcGrowth(usersThisMonth, usersLastMonth)
      },
      listings: {
        total: totalListings,
        active: activeListings,
        thisMonth: listingsThisMonth,
        growth: calcGrowth(listingsThisMonth, listingsLastMonth)
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        thisMonth: ordersThisMonth,
        growth: calcGrowth(ordersThisMonth, ordersLastMonth)
      },
      revenue: {
        total: totalRevenueNum,
        thisMonth: revenueThisMonthNum,
        lastMonth: revenueLastMonthNum,
        growth: calcGrowth(revenueThisMonthNum, revenueLastMonthNum)
      },
      topCategories,
      recentActivity
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
