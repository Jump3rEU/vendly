// API Response Helpers
// Standardized response format for consistency

import { NextResponse } from 'next/server'

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as APIResponse<T>,
    { status }
  )
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as APIResponse,
    { status }
  )
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = 'Not found') {
  return errorResponse(message, 404)
}

export function rateLimitResponse(message = 'Too many requests') {
  return errorResponse(message, 429)
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500)
}
