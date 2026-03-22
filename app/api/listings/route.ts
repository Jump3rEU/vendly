// Listings API - Create new listing
// POST /api/listings

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { apiRateLimiter } from '@/lib/rate-limit'
import { ListingStatus, ListingCondition } from '@prisma/client'

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    
  // Czech characters
  slug = slug
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ř/g, 'r')
    .replace(/ž/g, 'z')
    .replace(/ý/g, 'y')
    .replace(/á/g, 'a')
    .replace(/í/g, 'i')
    .replace(/é/g, 'e')
    .replace(/ě/g, 'e')
    .replace(/ú/g, 'u')
    .replace(/ů/g, 'u')
    .replace(/ó/g, 'o')
    .replace(/ď/g, 'd')
    .replace(/ť/g, 't')
    .replace(/ň/g, 'n')
    
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    
  return slug
}

const createListingSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  category: z.string().min(1),
  condition: z.nativeEnum(ListingCondition),
  price: z.number().positive().max(10000000),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1).max(10),
  location: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryMethods: z.array(z.string()).default([]),
  shippingPrice: z.number().positive().optional().nullable(),
  allowsOffers: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = req.ip || 'anonymous'
    const rateLimit = await apiRateLimiter.check(identifier)
    if (!rateLimit.success) {
      return errorResponse('Příliš mnoho požadavků. Zkuste to později.', 429)
    }

    // Authentication
    const user = await requireAuth()

    // Parse and validate body
    const body = await req.json()
    const validatedData = createListingSchema.parse(body)

    // Generate base slug
    const baseSlug = generateSlug(validatedData.title)

    // Create listing (let database generate ID first)
    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        slug: baseSlug, // temporary, will update with ID
        price: validatedData.price.toString(),
        originalPrice: validatedData.originalPrice?.toString(),
        shippingPrice: validatedData.shippingPrice?.toString(),
        thumbnailUrl: validatedData.images[0],
        sellerId: user.id,
        status: ListingStatus.ACTIVE,
      },
    })

    // Update slug with ID suffix for uniqueness
    const finalSlug = `${baseSlug}-${listing.id.slice(-8)}`
    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: { slug: finalSlug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            trustScore: true,
            totalSales: true,
            createdAt: true,
          }
        }
      }
    })

    return successResponse(updatedListing, 'Inzerát byl úspěšně vytvořen', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(`Neplatná data: ${error.errors[0].message}`)
    }
    
    if (error.message === 'Unauthorized') {
      return errorResponse('Pro vytvoření inzerátu se musíte přihlásit', 401)
    }

    console.error('Error creating listing:', error)
    return serverErrorResponse()
  }
}

// GET /api/listings - Search and filter
const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  condition: z.nativeEnum(ListingCondition).optional(),
  location: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'popular']).default('newest'),
  page: z.string().default('1'),
  limit: z.string().default('20'),
})

export async function GET(req: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(req.url)
    const params = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      condition: searchParams.get('condition') || undefined,
      location: searchParams.get('location') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validated = searchSchema.parse(params)
    const page = parseInt(validated.page)
    const limit = Math.min(parseInt(validated.limit), 100) // Max 100 per page
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: ListingStatus.ACTIVE,
    }

    if (validated.q) {
      where.OR = [
        { title: { contains: validated.q, mode: 'insensitive' } },
        { description: { contains: validated.q, mode: 'insensitive' } },
      ]
    }

    if (validated.category) {
      where.category = validated.category
    }

    if (validated.condition) {
      where.condition = validated.condition
    }

    if (validated.location) {
      where.location = { contains: validated.location, mode: 'insensitive' }
    }

    if (validated.minPrice || validated.maxPrice) {
      where.price = {}
      if (validated.minPrice) {
        where.price.gte = validated.minPrice
      }
      if (validated.maxPrice) {
        where.price.lte = validated.maxPrice
      }
    }

    // Build orderBy
    let orderBy: any = {}
    switch (validated.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { views: 'desc' }
        break
    }

    // Execute query
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
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
      }),
      prisma.listing.count({ where })
    ])

    return successResponse({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return serverErrorResponse()
  }
}
