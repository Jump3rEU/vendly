'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Heart, Eye, X } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

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

interface RecentlyViewedProps {
  limit?: number;
}

export default function RecentlyViewed({ limit = 6 }: RecentlyViewedProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { getRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const listingIds = getRecentlyViewed().slice(0, limit);

      if (listingIds.length === 0) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/recommendations/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingIds }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching recent listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearRecentlyViewed();
    setListings([]);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-600" />
          Nedávno prohlížené
        </h2>
        <button
          onClick={handleClear}
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Vymazat historii
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/inzeraty/${listing.id}`}
            className="group bg-white rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:shadow-md transition-all overflow-hidden"
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
                  <Eye className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-1 group-hover:text-slate-700 transition-colors">
                {listing.title}
              </h3>

              <div className="text-sm font-bold text-slate-900">
                {listing.price.toLocaleString('cs-CZ')} Kč
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
        <Eye className="w-3 h-3" />
        Historie je uložena pouze ve vašem prohlížeči a není sdílena
      </p>
    </div>
  );
}
