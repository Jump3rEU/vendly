'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, MapPin, Heart, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import LikeButton from '@/components/LikeButton'

const categories = [
  { label: 'Vše', value: '' },
  { label: '📱 Elektronika', value: 'Elektronika' },
  { label: '👕 Móda', value: 'Móda' },
  { label: '🚗 Auto-moto', value: 'Auto-moto' },
  { label: '🏠 Dům a zahrada', value: 'Dům a zahrada' },
  { label: '⚽ Sport', value: 'Sport' },
  { label: '🎮 Hračky a hry', value: 'Hračky a hry' },
  { label: '📚 Knihy', value: 'Knihy a časopisy' },
  { label: '🎸 Hudba', value: 'Hudba' },
  { label: '🚴 Cyklo', value: 'Cyklo' },
  { label: '📦 Ostatní', value: 'Ostatní' },
]

const priceFilters = [
  { label: '💰 Do 500 Kč', maxPrice: '500' },
  { label: '💳 Do 2 000 Kč', maxPrice: '2000' },
  { label: '🏷️ Do 10 000 Kč', maxPrice: '10000' },
]

const sortOptions = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'price-asc', label: 'Cena: od nejnižší' },
  { value: 'price-desc', label: 'Cena: od nejvyšší' },
  { value: 'popular', label: 'Nejoblíbenější' },
]

interface Listing {
  id: string
  title: string
  price: number
  images: string[]
  location: string
  status: string
  createdAt: string
  seller: {
    name: string
    trustScore: number
  }
  _count?: {
    likes: number
  }
}

function ListingsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'Vše') {
          // API expects 'sortBy' not 'sort'
          params.append(key === 'sort' ? 'sortBy' : key, value)
        }
      })

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (response.ok && data.data?.listings) {
        setListings(data.data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchListings()
  }

  const handleCategoryClick = (value: string) => {
    setFilters({ ...filters, category: value })
  }

  const handlePriceFilter = (maxPrice: string) => {
    const newMax = filters.maxPrice === maxPrice ? '' : maxPrice
    setFilters({ ...filters, maxPrice: newMax })
  }

  useEffect(() => {
    fetchListings()
  }, [filters.category, filters.sort, filters.maxPrice])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Red/Rose Gradient matching Header */}
      <div className="relative hero-gradient py-12 md:py-20 overflow-hidden">
        {/* Decorative Elements matching header gradient */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-red-200/35 via-rose-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-rose-200/40 via-red-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-red-300/20 to-rose-300/10 rounded-full blur-xl animate-pulse" />
        
        <div className="safe-container relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Title & Search */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100/70 to-rose-50/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-rose-700 mb-4 border border-white/50 shadow-glass">
                <TrendingUp className="w-4 h-4" />
                Tisíce spokojených uživatelů
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                Najděte to pravé
              </h1>
              <p className="text-gray-600 mb-8 text-lg md:text-xl max-w-lg">
                Procházejte tisíce inzerátů s jistotou bezpečného nákupu
              </p>

              {/* Search Bar - Enhanced Glassmorphism */}
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      type="text"
                      value={filters.q}
                      onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                      placeholder="Co hledáte?"
                      className="w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/80 border border-rose-100/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300/40 focus:bg-white/90 shadow-soft transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="px-6 sm:px-8 rounded-2xl flex-1 sm:flex-initial"
                    >
                      Hledat
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-4 backdrop-blur-xl border rounded-2xl transition-all flex items-center gap-2 font-semibold ${
                        showFilters 
                          ? 'bg-primary-500 text-white border-primary-500 shadow-button-primary' 
                          : 'bg-white/80 text-gray-700 hover:bg-white border-white/60 shadow-soft'
                      }`}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                      <span className="hidden md:inline">Filtry</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Stats Cards (desktop only) */}
            <div className="hidden lg:flex flex-col gap-4">
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-5 shadow-soft">
                <div className="text-3xl font-black text-gray-900">10k+</div>
                <div className="text-sm text-gray-600 font-medium">Aktivních inzerátů</div>
              </div>
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-5 shadow-soft">
                <div className="text-3xl font-black text-rose-600">100%</div>
                <div className="text-sm text-gray-600 font-medium">Ochrana kupujících</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="bg-gradient-to-r from-white via-rose-50/30 to-white backdrop-blur-sm border-b border-rose-100/50 sticky top-[72px] z-40 shadow-sm">
        <div className="safe-container">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {/* Category pills */}
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-semibold text-sm flex-shrink-0 ${
                  filters.category === cat.value
                    ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-button-primary'
                    : 'bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-700 border border-gray-100 hover:border-rose-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px bg-gray-200 flex-shrink-0 my-1" />

            {/* Price filter pills */}
            {priceFilters.map((pf) => (
              <button
                key={pf.maxPrice}
                onClick={() => handlePriceFilter(pf.maxPrice)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-semibold text-sm flex-shrink-0 ${
                  filters.maxPrice === pf.maxPrice
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-100 hover:border-emerald-200'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="safe-container py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <div className="backdrop-blur-xl bg-white/80 border border-white/60 rounded-2xl sticky top-32 p-6 shadow-soft space-y-6">
                <h3 className="font-black text-gray-900 text-lg">Filtry</h3>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cena
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Od"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-1/2 px-3 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Do"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-1/2 px-3 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 transition-all"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Stav
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 transition-all"
                  >
                    <option value="">Vše</option>
                    <option value="NEW">Nové</option>
                    <option value="LIKE_NEW">Jako nové</option>
                    <option value="GOOD">Dobré</option>
                    <option value="FAIR">Použité</option>
                    <option value="POOR">Opotřebované</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lokalita
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Město"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 transition-all"
                    />
                  </div>
                </div>

                {/* Apply Filters */}
                <Button
                  onClick={fetchListings}
                  variant="primary"
                  fullWidth
                >
                  Použít filtry
                </Button>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilters({
                      q: '',
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      condition: '',
                      location: '',
                      sort: 'newest',
                    })
                    fetchListings()
                  }}
                  className="w-full text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Vymazat filtry
                </button>
              </div>
            </aside>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 font-medium">
                {loading ? 'Načítání...' : `${listings.length} inzerátů`}
              </p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 font-medium shadow-soft"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-soft">
                    <div className="aspect-square bg-gray-100"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-lg"></div>
                      <div className="h-4 bg-gray-100 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Listings Grid */}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden group relative shadow-soft hover:shadow-glass hover:border-rose-100 hover:-translate-y-1 transition-all duration-300"
                  >
                    <Link href={`/inzeraty/${listing.id}`}>
                      {/* Image */}
                      <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        {listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">Bez fotky</span>
                          </div>
                        )}
                        
                        {/* Like button */}
                        <div className="absolute top-3 right-3 z-10">
                          <LikeButton listingId={listing.id} size="md" />
                        </div>

                        {/* Like count */}
                        {listing._count && listing._count.likes > 0 && (
                          <div className="absolute top-3 left-3 px-2.5 py-1.5 backdrop-blur-xl bg-white/90 border border-white/60 rounded-xl flex items-center gap-1.5 shadow-soft">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span className="text-xs font-bold text-gray-900">{listing._count.likes}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                          {listing.title}
                        </h3>
                        
                        <p className="text-2xl font-bold text-rose-600 mb-3">
                          {listing.price.toLocaleString('cs-CZ')} Kč
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                            <span className="font-semibold text-green-700 text-xs">{listing.seller.trustScore}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && listings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-soft">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Nic jsme nenašli
                </h3>
                <p className="text-gray-500 mb-2 text-lg max-w-md mx-auto">
                  Pro tuto kombinaci filtrů není k dispozici žádný inzerát.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                  Zkuste upravit nebo smazat filtry
                </p>
                <Button
                  onClick={() => {
                    setFilters({
                      q: '',
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      condition: '',
                      location: '',
                      sort: 'newest',
                    })
                    fetchListings()
                  }}
                  variant="primary"
                >
                  Zobrazit vše
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsPageSkeleton />}>
      <ListingsPageContent />
    </Suspense>
  )
}

function ListingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero skeleton */}
      <div className="hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-white/40 rounded-2xl w-64 mb-4"></div>
            <div className="h-6 bg-white/30 rounded-xl w-48 mb-8"></div>
            <div className="h-14 bg-white/50 rounded-2xl max-w-4xl"></div>
          </div>
        </div>
      </div>
      
      {/* Categories skeleton */}
      <div className="backdrop-blur-md bg-white/80 border-b border-white/40 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card-white overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}