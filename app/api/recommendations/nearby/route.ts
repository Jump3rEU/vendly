import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const where: any = {
      status: 'ACTIVE',
      location: location, // Exact match for now
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    // Find nearby listings in the same location
    const nearbyListings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            trustScore: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: [
        // Prioritize high trust score sellers
        { seller: { trustScore: 'desc' } },
        // Then by recency
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      listings: nearbyListings,
      location,
      count: nearbyListings.length,
    });
  } catch (error) {
    console.error('Error fetching nearby listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby listings' },
      { status: 500 }
    );
  }
}
