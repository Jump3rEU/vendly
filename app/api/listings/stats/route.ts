import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get category counts for active listings
    const categoryStats = await prisma.listing.groupBy({
      by: ['category'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get total active listings
    const totalActive = await prisma.listing.count({
      where: { status: 'ACTIVE' }
    })

    // Transform to cleaner format
    const categories = categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count.id
    }))

    return NextResponse.json({
      categories,
      total: totalActive
    })
  } catch (error) {
    console.error('Error fetching listing stats:', error)
    return NextResponse.json({ categories: [], total: 0 })
  }
}
