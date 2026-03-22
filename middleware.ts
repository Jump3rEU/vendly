// Middleware for route protection and security headers

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protected API routes that require authentication
const protectedApiRoutes = [
  '/api/listings', // POST only
  '/api/upload',
  '/api/messages',
  '/api/conversations',
  '/api/offers',
  '/api/orders',
  '/api/favorites',
  '/api/reviews',
  '/api/user',
]

// Admin-only routes
const adminRoutes = [
  '/api/admin',
  '/api/cron',
]

// Public API routes (no auth needed)
const publicApiRoutes = [
  '/api/auth',
  '/api/listings', // GET only
  '/api/users', // Public user profiles
  '/api/webhooks',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self'; " +
      "connect-src 'self' https://api.stripe.com https://api.openai.com wss:; " +
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
      "object-src 'none';"
    )
  }

  // Skip middleware for non-API routes (handled by NextAuth)
  if (!pathname.startsWith('/api')) {
    return response
  }

  // Allow public routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    // Special case: /api/listings GET is public, POST requires auth
    if (pathname === '/api/listings' && request.method === 'POST') {
      // Will be handled by protected routes check below
    } else if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/webhooks') || pathname.startsWith('/api/users')) {
      return response
    } else if (pathname.startsWith('/api/listings') && request.method === 'GET') {
      return response
    }
  }

  // Protect cron/admin routes with secret token
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // For cron routes, check for CRON_SECRET header
    if (pathname.startsWith('/api/cron')) {
      const cronSecret = request.headers.get('x-cron-secret')
      const expectedSecret = process.env.CRON_SECRET
      
      if (!expectedSecret || cronSecret !== expectedSecret) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid cron secret' },
          { status: 401 }
        )
      }
      return response
    }

    // For admin API routes, verify admin role
    const token = await getToken({ req: request })
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    return response
  }

  // For protected routes, verify authentication
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    // Skip GET for listings (already handled above)
    if (pathname.startsWith('/api/listings') && request.method === 'GET') {
      return response
    }

    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (token.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all API routes except static files
    '/api/:path*',
    // Match admin pages (for additional protection)
    '/admin/:path*',
  ],
}
