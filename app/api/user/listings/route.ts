import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'ACTIVE'

    const skip = (page - 1) * limit

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { 
          sellerId: session.user.id,
          ...(status !== 'all' && { status: status as any })
        },
        include: {
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.listing.count({
        where: { 
          sellerId: session.user.id,
          ...(status !== 'all' && { status: status as any })
        }
      })
    ])

    return NextResponse.json({
      listings: listings.map(l => ({
        ...l,
        price: Number(l.price)
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
