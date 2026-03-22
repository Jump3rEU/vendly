import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            listing: true,
            buyer: true,
            seller: true
          }
        },
        initiator: true
      }
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json(dispute)
  } catch (error) {
    console.error('Error fetching dispute:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, decision, resolution } = await req.json()

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: { order: true }
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'resolve':
        updateData = {
          status: 'RESOLVED',
          resolution: resolution || `Rozhodnuto ve prospěch ${decision === 'buyer' ? 'kupujícího' : 'prodejce'}`
        }
        
        // Also update the order status based on decision
        if (decision === 'buyer') {
          await prisma.order.update({
            where: { id: dispute.orderId },
            data: { status: 'REFUNDED' }
          })
        } else {
          await prisma.order.update({
            where: { id: dispute.orderId },
            data: { status: 'COMPLETED' }
          })
        }
        break
        
      case 'close':
        updateData.status = 'CLOSED'
        break
        
      case 'progress':
        updateData.status = 'IN_PROGRESS'
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: params.id },
      data: updateData,
      include: {
        order: true,
        initiator: true
      }
    })

    return NextResponse.json(updatedDispute)
  } catch (error) {
    console.error('Error updating dispute:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.dispute.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting dispute:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
