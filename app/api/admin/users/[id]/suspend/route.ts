// Admin User Management
// POST /api/admin/users/[id]/suspend

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { AccountStatus, AdminActionType, ListingStatus } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

const suspendUserSchema = z.object({
  reason: z.string().min(10).max(1000),
  duration: z.enum(['temporary', 'permanent']).default('temporary'),
})

// POST - Suspend user
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id: userId } = params
    const body = await req.json()
    const { reason, duration } = suspendUserSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true }
    })

    if (!user) {
      return notFoundResponse('Uživatel nebyl nalezen')
    }

    // Cannot suspend admin
    if (user.role === 'ADMIN') {
      return errorResponse('Nemůžete pozastavit účet administrátora')
    }

    // Suspend user and log action
    await prisma.$transaction(async (tx) => {
      // Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          status: duration === 'permanent' ? AccountStatus.BANNED : AccountStatus.SUSPENDED
        }
      })

      // Log admin action
      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          actionType: duration === 'permanent' ? AdminActionType.BAN_USER : AdminActionType.SUSPEND_USER,
          targetUserId: userId,
          reason,
          notes: `Duration: ${duration}`,
        }
      })

      // Deactivate all user's active listings
      await tx.listing.updateMany({
        where: {
          sellerId: userId,
          status: ListingStatus.ACTIVE,
        },
        data: {
          status: ListingStatus.SUSPENDED,
        }
      })
    })

    return successResponse(null, `Uživatel byl ${duration === 'permanent' ? 'trvale zablokován' : 'dočasně pozastaven'}`)
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return errorResponse(error.message, 403)
    }

    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    console.error('Error suspending user:', error)
    return serverErrorResponse()
  }
}
