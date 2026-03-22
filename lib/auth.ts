// Auth utilities and session helpers

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { UserRole, AccountStatus } from '@prisma/client'
import { NextRequest } from 'next/server'

/**
 * Get authenticated user session
 * Returns null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get authenticated user or throw error
 * Use in protected API routes - returns the user object directly
 */
export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getSession()
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (session.user.status !== AccountStatus.ACTIVE) {
    throw new Error('Account is not active')
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error('Access denied')
    }
  }

  return session.user
}

/**
 * Get authenticated session with user - for cases where session is needed
 */
export async function requireAuthSession(allowedRoles?: UserRole[]) {
  const session = await getSession()
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (session.user.status !== AccountStatus.ACTIVE) {
    throw new Error('Account is not active')
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error('Access denied')
    }
  }

  return session
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== UserRole.ADMIN) {
    throw new Error('Admin access required')
  }

  return user
}

/**
 * Check if user owns a resource
 */
export function checkOwnership(userId: string, ownerId: string) {
  if (userId !== ownerId) {
    throw new Error('Not authorized to access this resource')
  }
}

/**
 * Check if user is admin or resource owner
 */
export async function requireAdminOrOwner(ownerId: string) {
  const user = await requireAuth()
  
  if (user.role !== UserRole.ADMIN && user.id !== ownerId) {
    throw new Error('Not authorized to access this resource')
  }

  return user
}
