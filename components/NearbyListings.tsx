'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Heart, Eye, Navigation } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  location: string;
  category: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    trustScore: number;
  };
  _count: {
    likes: number;
  };
}

interface NearbyListingsProps {
  location: string;
  excludeId?: string;
  limit?: number;
}

export default function NearbyListings({
  location,
  excludeId,
  limit = 4,
}: NearbyListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      fetchNearby();
    }
  }, [location, excludeId]);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        location,
        limit: limit.toString(),
      });
      if (excludeId) params.set('excludeId', excludeId);

      const response = await fetch(`/api/recommendations/nearby?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Navigation className="w-6 h-6 text-purple-600" />
        V okolí: {location}
      </h2>
      <p className="text-slate-600 mb-6">
        Další inzeráty ve vaší lokalitě
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/inzeraty/${listing.id}`}
            className="group bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              {listing.images[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="w-12 h-12 text-slate-300" />
                </div>
              )}
              {/* Category badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-900">
                {listing.category}
              </div>
              {/* Trust badge for high trust sellers */}
              {listing.seller.trustScore >= 4 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                  ⭐ Ověřený
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {listing.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-slate-900">
                  {listing.price.toLocaleString('cs-CZ')} Kč
                </div>
                {listing._count.likes > 0 && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    {listing._count.likes}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
