'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, SlidersHorizontal, MapPin, Heart, TrendingUp,
  Car, Smartphone, Shirt, Home, Dumbbell, Gamepad2, 
  BookOpen, Music, Bike, MoreHorizontal, X, Truck, TrendingDown, Package, Zap
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LikeButton from '@/components/LikeButton'
import ListingCardSkeleton from '@/components/ui/ListingCardSkeleton'
import SwipeDiscovery from '@/components/SwipeDiscovery'

const categoryConfig: Record<string, { icon: any; emoji: string; color: string; bg: string }> = {
  'VĂ„Ä…Ă‹â€ˇe': { icon: MoreHorizontal, emoji: 'Ă„â€ÄąĹźÄąËťÄąÂ»', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
  'Auto-moto': { icon: Car, emoji: 'Ă„â€ÄąĹźÄąË‡Ă˘â‚¬â€ť', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  'Elektronika': { icon: Smartphone, emoji: 'Ă„â€ÄąĹźĂ˘â‚¬Ĺ›Ă‚Â±', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
  'MĂ„â€šÄąâ€šda': { icon: Shirt, emoji: 'Ă„â€ÄąĹźĂ˘â‚¬ÂĂ˘â‚¬Ë', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50' },
  'DĂ„Ä…ÄąÂ»m a zahrada': { icon: Home, emoji: 'Ă„â€ÄąĹźÄąÄ…Ă‹â€ˇ', color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  'Sport': { icon: Dumbbell, emoji: 'Ä‚ËÄąË‡Ă‹ĹĄ', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
  'HraÄ‚â€žÄąÂ¤ky a hry': { icon: Gamepad2, emoji: 'Ă„â€ÄąĹźÄąËťĂ‚Â®', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50' },
  'Knihy a Ä‚â€žÄąÂ¤asopisy': { icon: BookOpen, emoji: 'Ă„â€ÄąĹźĂ˘â‚¬Ĺ›ÄąË‡', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
  'Hudba': { icon: Music, emoji: 'Ă„â€ÄąĹźÄąËťĂ‚Â¸', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
  'Cyklo': { icon: Bike, emoji: 'Ă„â€ÄąĹźÄąË‡Ă‚Â´', color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50' },
  'OstatnĂ„â€šĂ‚Â­': { icon: MoreHorizontal, emoji: 'Ă„â€ÄąĹźĂ˘â‚¬Ĺ›Ă‚Â¦', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
}

const categories = Object.keys(categoryConfig)

const sortOptions = [
  { value: 'newest', label: 'NejnovÄ‚â€žĂ˘â‚¬ĹźjĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­' },
  { value: 'price-asc', label: 'Cena: od nejniĂ„Ä…Ă„ÄľĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­' },
  { value: 'price-desc', label: 'Cena: od nejvyĂ„Ä…Ă‹â€ˇĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­' },
  { value: 'popular', label: 'NejoblĂ„â€šĂ‚Â­benÄ‚â€žĂ˘â‚¬ĹźjĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­' },
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
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)
  const [showSwipeMode, setShowSwipeMode] = useState(false)
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

  // Pull to refresh
  // const { pullDistance, isRefreshing } = usePullToRefresh({
  //   onRefresh: async () => {
  //     await fetchListings()
  //   },
  // })
  const pullDistance = 0
  const isRefreshing = false

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'VĹˇe') {
          params.append(key, value)
        }
      })

      // Update URL without reload
      const newUrl = params.toString() ? `/inzeraty?${params.toString()}` : '/inzeraty'
      router.replace(newUrl, { scroll: false })

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
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

  // Debounced search
  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, q: value })
    
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    
    const timeout = setTimeout(() => {
      fetchListings()
    }, 500)
    
    setSearchDebounce(timeout)
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = category === 'VĹˇe' ? '' : category
    setFilters({ ...filters, category: newCategory })
  }

  useEffect(() => {
    fetchListings()
  }, [filters.category, filters.sort])

  return <div className="min-h-screen bg-white">
      {/* Swipe Discovery Modal */}
      {showSwipeMode && (
        <SwipeDiscovery 
          onClose={() => setShowSwipeMode(false)}
          initialCategory={filters.category}
        />
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-12 border-b border-primary-900/20">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        
        <div className="safe-container relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">
              ProchĂˇzet inzerĂˇty
            </h1>
            <p className="text-xl text-white/90">
              BezpeÄŤnĂ˝ nĂˇkup s ochranou kupujĂ­cĂ­ch
            
            {/* Swipe Mode Button */}
            <button
              onClick={() => setShowSwipeMode(true)}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all duration-300 group"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-semibold">Swipe mĂłd</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mt-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Hledat inzerĂ„â€šĂ‹â€ˇty (auto-complete)..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                />
                {filters.q && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, q: '' })
                      fetchListings()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="px-8"
              >
                Hledat
              </Button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden md:inline">Filtry</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories with Icons - Tugedr Inspired */}
      <div className="bg-white border-b border-gray-100">
        <div className="safe-container">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-6">
            {categories.map((cat) => {
              const config = categoryConfig[cat]
              const Icon = config.icon
              const isActive = (cat === 'VĂ„Ä…Ă‹â€ˇe' && !filters.category) || filters.category === cat
              
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`group relative p-8 rounded-[2rem] transition-all duration-500 ${
                    isActive
                      ? 'shadow-xl shadow-primary-100/50 bg-gradient-to-br from-primary-50 to-primary-100 scale-105'
                      : 'bg-white shadow-lg hover:shadow-2xl hover:shadow-primary-100/40 hover:-translate-y-3'
                  }`}
                >
                  {/* Large emoji illustration */}
                  <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    {config.emoji}
                  </div>
                  
                  <span className={`text-base font-black block text-center transition-colors duration-500 ${
                    isActive ? 'text-primary-700' : 'text-gray-900 group-hover:text-primary-600'
                  }`}>
                    {cat}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="safe-container">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-bold text-gray-800 whitespace-nowrap flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              RychlĂ„â€šĂ‚Â© filtry:
            </span>
            <button
              onClick={() => setFilters({ ...filters, sort: 'newest' })}
              className={`group px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md ${
                filters.sort === 'newest'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary-200 scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <span className="inline-block group-hover:scale-110 transition-transform mr-1">Ä‚ËÄąâ€şĂ‚Â¨</span>
              NejnovÄ‚â€žĂ˘â‚¬ĹźjĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­
            </button>
            <button
              onClick={() => setFilters({ ...filters, sort: 'price-asc' })}
              className={`group px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md ${
                filters.sort === 'price-asc'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200 scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <span className="inline-block group-hover:scale-110 transition-transform mr-1">Ă„â€ÄąĹźĂ˘â‚¬â„˘Ă‚Â°</span>
              NejlevnÄ‚â€žĂ˘â‚¬ĹźjĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­
            </button>
            <button
              onClick={() => setFilters({ ...filters, sort: 'popular' })}
              className={`group px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md ${
                filters.sort === 'popular'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200 scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <span className="inline-block group-hover:scale-110 transition-transform mr-1">Ă„â€ÄąĹźĂ˘â‚¬ĹĄĂ„â€ž</span>
              NejoblĂ„â€šĂ‚Â­benÄ‚â€žĂ˘â‚¬ĹźjĂ„Ä…Ă‹â€ˇĂ„â€šĂ‚Â­
            </button>
            <button className="group px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md">
              <TrendingDown className="w-4 h-4 inline mr-1.5 group-hover:scale-110 transition-transform" />
              PĂ„Ä…Ă˘â€žËijĂ„â€šĂ‚Â­mĂ„â€šĂ‹â€ˇ nabĂ„â€šĂ‚Â­dky
            </button>
            <button className="group px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md">
              <Truck className="w-4 h-4 inline mr-1.5 group-hover:scale-110 transition-transform" />
              S dopravou
            </button>
            <button className="group px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md">
              <Package className="w-4 h-4 inline mr-1.5 group-hover:scale-110 transition-transform" />
              NovĂ„â€šĂ‚Â©
            </button>
          </div>
        </div>
      </div>

      <div className="safe-container py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <div className="card-surface rounded-2xl p-6 sticky top-32 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Filtry</h3>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Cena
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Od"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Do"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Stav
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">VĂ„Ä…Ă‹â€ˇe</option>
                    <option value="NEW">NovĂ„â€šĂ‚Â©</option>
                    <option value="LIKE_NEW">Jako novĂ„â€šĂ‚Â©</option>
                    <option value="GOOD">DobrĂ„â€šĂ‚Â©</option>
                    <option value="FAIR">PouĂ„Ä…Ă„ÄľitĂ„â€šĂ‚Â©</option>
                    <option value="POOR">OpotĂ„Ä…Ă˘â€žËebovanĂ„â€šĂ‚Â©</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Lokalita
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="MÄ‚â€žĂ˘â‚¬Ĺźsto"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Apply Filters */}
                <Button
                  onClick={fetchListings}
                  variant="primary"
                  fullWidth
                >
                  PouĂ„Ä…Ă„ÄľĂ„â€šĂ‚Â­t filtry
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
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-smooth"
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
              <p className="text-gray-600">
                {loading ? 'NaÄ‚â€žÄąÂ¤Ă„â€šĂ‚Â­tĂ„â€šĂ‹â€ˇnĂ„â€šĂ‚Â­...' : `${listings.length} inzerĂ„â€šĂ‹â€ˇtĂ„Ä…ÄąÂ»`}
              </p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Listings Grid */}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="card-surface-hover rounded-xl overflow-hidden group relative"
                  >
                    <Link href={`/inzeraty/${listing.id}`}>
                      {/* Image */}
                      <div className="aspect-square bg-gray-200 relative overflow-hidden">
                        {listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
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
                          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
                            <Heart className="w-3 h-3 text-danger-600" />
                            <span className="text-xs font-semibold">{listing._count.likes}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-smooth">
                          {listing.title}
                        </h3>
                        
                        <p className="text-2xl font-bold text-primary-600 mb-3">
                          {listing.price.toLocaleString('cs-CZ')} KÄ‚â€žÄąÂ¤
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-trust-600" />
                            <span className="font-semibold">{listing.seller.trustScore}</span>
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
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Nic jsme nenaĂ„Ä…Ă‹â€ˇli</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Zkus zmÄ‚â€žĂ˘â‚¬Ĺźnit filtry nebo vyhledĂ„â€šĂ‹â€ˇvanĂ„â€šĂ‹ĹĄ vĂ„â€šĂ‹ĹĄraz.
                  MoĂ„Ä…Ă„ÄľnĂ„â€šĂ‹â€ˇ zkus swipe mĂ„â€šÄąâ€šd pro prochĂ„â€šĂ‹â€ˇzenĂ„â€šĂ‚Â­!
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
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
                    }}
                    variant="outline"
                  >
                    Vymazat filtry
                  </Button>
                  <Button
                    onClick={() => setShowSwipeMode(true)}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Swipe mĂ„â€šÄąâ€šd
                  </Button>
                </div>
              </div>
            )}
                      location: '',
                      sort: 'newest',
                    })
                    fetchListings()
                  }}
                  variant="secondary"
                >
                  Vymazat filtry
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Swipe Mode Button (Mobile) */}
      <button
        onClick={() => setShowSwipeMode(true)}
        className="md:hidden fixed bottom-24 right-6 z-40 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform group"
        aria-label="Swipe mĂ„â€šÄąâ€šd"
      >
        <Zap className="w-6 h-6 group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-ping" />
      </button>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="h-40 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}