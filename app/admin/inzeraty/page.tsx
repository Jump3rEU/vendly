'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, AlertTriangle, CheckCircle, Clock, Ban } from 'lucide-react';
import AIAnalysisPanel from '@/components/admin/AIAnalysisPanel';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  suspicionScore: number | null;
  createdAt: string;
  seller: {
    name: string;
    email: string;
  };
  category: {
    name: string;
  };
  _count: {
    reports: number;
  };
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/listings?${params}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'SUSPENDED':
        return <Ban className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSuspicionColor = (score: number | null) => {
    if (!score) return 'bg-slate-100 text-slate-700';
    if (score >= 70) return 'bg-red-100 text-red-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="text-purple-600 hover:text-purple-800 font-medium mb-4 inline-block"
          >
            ← Zpět na dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            Správa inzerátů
          </h1>
          <p className="text-slate-600 mt-2">
            AI analýza a moderace inzerátů
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Hledat inzerát nebo prodejce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">Všechny stavy</option>
                <option value="ACTIVE">Aktivní</option>
                <option value="PENDING">Čekající</option>
                <option value="SUSPENDED">Pozastavené</option>
                <option value="SOLD">Prodané</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchListings}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Obnovit seznam
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Načítám inzeráty...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Žádné inzeráty nenalezeny</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Listings List */}
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    selectedListing === listing.id
                      ? 'border-purple-500 shadow-lg'
                      : 'border-slate-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedListing(listing.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {listing.seller.name} • {listing.category.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(listing.status)}
                      {listing._count.reports > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {listing._count.reports}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-900">
                      {listing.price.toLocaleString('cs-CZ')} Kč
                    </div>
                    {listing.suspicionScore !== null && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSuspicionColor(listing.suspicionScore)}`}>
                        Riziko: {listing.suspicionScore}%
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                    Vytvořeno: {new Date(listing.createdAt).toLocaleDateString('cs-CZ')}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Analysis Panel */}
            <div className="sticky top-4 h-fit">
              {selectedListing ? (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-600">
                    <h2 className="text-xl font-bold text-white">AI Analýza</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Detekce podvodů a hodnocení kvality
                    </p>
                  </div>
                  <div className="p-6">
                    <AIAnalysisPanel listingId={selectedListing} />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">
                    Vyberte inzerát pro zobrazení AI analýzy
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
