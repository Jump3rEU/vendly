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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        include: {
          participant1: {
            select: { id: true, name: true, email: true }
          },
          participant2: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              sender: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.conversation.count()
    ])

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
