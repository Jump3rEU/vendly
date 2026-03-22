import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get the current listing details
    const currentListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        category: true,
        price: true,
        condition: true,
        location: true,
        sellerId: true,
      },
    });

    if (!currentListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Calculate price range (±30%)
    const priceNumber = Number(currentListing.price);
    const priceMin = priceNumber * 0.7;
    const priceMax = priceNumber * 1.3;

    // Find similar listings based on multiple criteria
    const similarListings = await prisma.listing.findMany({
      where: {
        AND: [
          { id: { not: listingId } },
          { status: 'ACTIVE' },
          { sellerId: { not: currentListing.sellerId } }, // Exclude same seller
          {
            OR: [
              // Same category is primary match
              { category: currentListing.category },
              // Same condition as fallback
              { condition: currentListing.condition },
            ],
          },
        ],
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
      take: limit * 2, // Get more for sorting
    });

    // Score each listing based on similarity
    const scoredListings = similarListings.map((listing) => {
      let score = 0;

      // Category match (highest weight)
      if (listing.category === currentListing.category) {
        score += 50;
      }

      // Price similarity (0-30 points based on how close)
      const listingPrice = Number(listing.price);
      const priceDiff = Math.abs(listingPrice - priceNumber);
      const priceScore = Math.max(0, 30 - (priceDiff / priceNumber) * 30);
      score += priceScore;

      // Condition match
      if (listing.condition === currentListing.condition) {
        score += 15;
      }

      // Location proximity (basic string comparison)
      if (listing.location === currentListing.location) {
        score += 5;
      }

      return {
        ...listing,
        similarityScore: score,
      };
    });

    // Sort by score and take top results
    const topSimilar = scoredListings
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return NextResponse.json({
      listings: topSimilar,
      criteria: {
        category: currentListing.category,
        priceRange: { min: priceMin, max: priceMax },
        condition: currentListing.condition,
      },
    });
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar listings' },
      { status: 500 }
    );
  }
}
