import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        },
        orders: {
          select: { id: true, status: true, totalAmount: true }
        },
        _count: {
          select: { likes: true, reports: true }
        }
      }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...listing,
      price: Number(listing.price),
      originalPrice: listing.originalPrice ? Number(listing.originalPrice) : null
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, title, description, price, status } = body

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData.status = 'ACTIVE'
        break
      case 'suspend':
        updateData.status = 'SUSPENDED'
        break
      case 'remove':
        updateData.status = 'REMOVED'
        break
      case 'update':
        if (title) updateData.title = title
        if (description) updateData.description = description
        if (price) updateData.price = price
        if (status) updateData.status = status
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      ...updatedListing,
      price: Number(updatedListing.price)
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.listing.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
