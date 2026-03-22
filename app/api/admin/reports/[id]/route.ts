import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await req.json()

    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'review':
        updateData.status = 'REVIEWED'
        break
      case 'resolve':
        updateData.status = 'RESOLVED'
        break
      case 'dismiss':
        updateData.status = 'DISMISSED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
      include: {
        reporter: true,
        reportedUser: true,
        reportedListing: true
      }
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Error updating report:', error)
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

    await prisma.report.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
