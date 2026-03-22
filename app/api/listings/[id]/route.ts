// Listing Detail API
// GET/PATCH/DELETE /api/listings/[id]

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdminOrOwner } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response'
import { ListingStatus, ListingCondition } from '@prisma/client'
import { deleteMultipleImages } from '@/lib/cloudinary'

interface RouteParams {
  params: { id: string }
}

// GET single listing
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Try to find by slug first, then by ID
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            trustScore: true,
            totalSales: true,
            createdAt: true,
            idVerified: true,
            phoneVerified: true,
          }
        },
        _count: {
          select: {
            likes: true,
          }
        }
      }
    })

    if (!listing) {
      return notFoundResponse('Inzerát nebyl nalezen')
    }

    // Increment view count (async, don't await)
    prisma.listing.update({
      where: { id: listing.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views:', err))

    return successResponse(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return serverErrorResponse()
  }
}

// PATCH - Update listing
const updateListingSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(50).max(5000).optional(),
  category: z.string().min(1).optional(),
  condition: z.nativeEnum(ListingCondition).optional(),
  price: z.number().positive().max(10000000).optional(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1).max(10).optional(),
  location: z.string().min(2).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true, images: true }
    })

    if (!existingListing) {
      return notFoundResponse('Inzerát nebyl nalezen')
    }

    // Authorization - must be owner or admin
    await requireAdminOrOwner(existingListing.sellerId)

    // Validate request body
    const body = await req.json()
    const validatedData = updateListingSchema.parse(body)

    // Cannot edit sold listings
    if (existingListing.status === ListingStatus.SOLD) {
      return errorResponse('Nelze upravit prodaný inzerát')
    }

    // Delete removed images from Cloudinary
    if (validatedData.images && existingListing.images) {
      const removedImages = existingListing.images.filter(
        oldImage => !validatedData.images!.includes(oldImage)
      )
      
      if (removedImages.length > 0) {
        deleteMultipleImages(removedImages).catch(err => {
          console.error('Failed to delete removed images from Cloudinary:', err)
        })
      }
    }

    // Update listing
    const updateData: any = { ...validatedData }
    
    if (validatedData.price) {
      updateData.price = validatedData.price.toString()
    }
    
    if (validatedData.originalPrice) {
      updateData.originalPrice = validatedData.originalPrice.toString()
    }

    if (validatedData.images) {
      updateData.thumbnailUrl = validatedData.images[0]
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
          }
        }
      }
    })

    return successResponse(updatedListing, 'Inzerát byl aktualizován')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }

    if (error.message.includes('authorized')) {
      return errorResponse(error.message, 403)
    }

    console.error('Error updating listing:', error)
    return serverErrorResponse()
  }
}

// DELETE - Remove listing
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { 
        sellerId: true, 
        status: true,
        images: true,
        orders: {
          where: {
            status: {
              in: ['PAYMENT_HELD', 'AWAITING_SHIPMENT', 'SHIPPED']
            }
          }
        }
      }
    })

    if (!existingListing) {
      return notFoundResponse('Inzerát nebyl nalezen')
    }

    // Authorization
    await requireAdminOrOwner(existingListing.sellerId)

    // Cannot delete if there are active orders
    if (existingListing.orders.length > 0) {
      return errorResponse('Nelze smazat inzerát s aktivními objednávkami')
    }

    // Delete images from Cloudinary (async, don't block response)
    if (existingListing.images && existingListing.images.length > 0) {
      deleteMultipleImages(existingListing.images).catch(err => {
        console.error('Failed to delete Cloudinary images:', err)
      })
    }

    // Soft delete - mark as REMOVED instead of actual deletion
    await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.REMOVED }
    })

    return successResponse(null, 'Inzerát byl odstraněn')
  } catch (error: any) {
    if (error.message.includes('authorized')) {
      return errorResponse(error.message, 403)
    }

    console.error('Error deleting listing:', error)
    return serverErrorResponse()
  }
}
