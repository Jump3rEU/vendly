import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { listingIds } = await request.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: 'Listing IDs array is required' },
        { status: 400 }
      );
    }

    // Fetch listings by IDs (they might not all exist)
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        status: 'ACTIVE', // Only show active listings
      },
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
    });

    // Sort by the order they were viewed (most recent first)
    const sortedListings = listingIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NonNullable<typeof l> => l !== undefined);

    return NextResponse.json({
      listings: sortedListings,
      count: sortedListings.length,
    });
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent listings' },
      { status: 500 }
    );
  }
}
