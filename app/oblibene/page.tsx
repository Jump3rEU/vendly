'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Search, Filter, ChevronDown, Trash2, Package } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Listing {
  id: string
  title: string
  price: number
  images: string[]
  location: string
  condition: string
  status: string
  createdAt: string
  seller: {
    id: string
    name: string
    avatar: string | null
    trustScore: number
  }
}

interface FavoriteItem {
  id: string
  likedAt: string
  listing: Listing
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status])

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites')
      const data = await res.json()
      
      if (res.ok) {
        setFavorites(data.likes || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth, redirecting, or fetching data
  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{status === 'loading' ? 'Ověřování...' : 'Načítání...'}</p>
        </div>
      </div>
    )
  }

  const handleUnlike = async (listingId: string) => {
    // Optimistic update
    const originalFavorites = [...favorites]
    setFavorites(favorites.filter(fav => fav.listing.id !== listingId))

    try {
      const res = await fetch(`/api/listings/${listingId}/like`, {
        method: 'POST',
      })

      if (!res.ok) {
        // Rollback on error
        setFavorites(originalFavorites)
      }
    } catch (error) {
      // Rollback on error
      setFavorites(originalFavorites)
      console.error('Error unliking:', error)
    }
  }

  // Filter and sort
  let filteredFavorites = favorites.filter(fav => 
    fav.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  switch (sortBy) {
    case 'price-asc':
      filteredFavorites.sort((a, b) => a.listing.price - b.listing.price)
      break
    case 'price-desc':
      filteredFavorites.sort((a, b) => b.listing.price - a.listing.price)
      break
    case 'recent':
    default:
      filteredFavorites.sort((a, b) => 
        new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Oblíbené</h1>
          </div>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'inzerát' : favorites.length < 5 ? 'inzeráty' : 'inzerátů'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat v oblíbených..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="recent">Nejnovější</option>
                <option value="price-asc">Cena (nejnižší)</option>
                <option value="price-desc">Cena (nejvyšší)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Žádné výsledky
                </h3>
                <p className="text-gray-600 mb-6">
                  Zkuste změnit vyhledávací dotaz
                </p>
                <Button onClick={() => setSearchQuery('')} variant="secondary">
                  Vymazat hledání
                </Button>
              </>
            ) : (
              <>
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Zatím nemáte žádné oblíbené
                </h3>
                <p className="text-gray-600 mb-6">
                  Začněte procházet inzeráty a přidávejte si oblíbené
                </p>
                <Link href="/inzeraty">
                  <Button variant="primary">
                    <Package className="w-5 h-5" />
                    Prohlížet inzeráty
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <Link href={`/inzeraty/${favorite.listing.id}`}>
                  <div className="relative aspect-square bg-gray-200">
                    {favorite.listing.images[0] ? (
                      <img
                        src={favorite.listing.images[0]}
                        alt={favorite.listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Unlike button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleUnlike(favorite.listing.id)
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                      title="Odebrat z oblíbených"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>

                    {/* Condition badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                      {favorite.listing.condition === 'NEW' && 'Nový'}
                      {favorite.listing.condition === 'LIKE_NEW' && 'Jako nový'}
                      {favorite.listing.condition === 'GOOD' && 'Dobrý stav'}
                      {favorite.listing.condition === 'FAIR' && 'Používaný'}
                      {favorite.listing.condition === 'POOR' && 'Opotřebený'}
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/inzeraty/${favorite.listing.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {favorite.listing.title}
                    </h3>
                  </Link>

                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {favorite.listing.price.toLocaleString('cs-CZ')} Kč
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{favorite.listing.location}</span>
                    <Link 
                      href={`/profil/${favorite.listing.seller.id}`}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-medium">Trust: {favorite.listing.seller.trustScore}</span>
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Přidáno {new Date(favorite.likedAt).toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
