'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPin, Heart, Share2, Flag, MessageCircle, Shield, 
  TrendingUp, Calendar, Eye, ChevronLeft, ChevronRight,
  CheckCircle, Star, Edit, Trash2
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LikeButton from '@/components/LikeButton'
import SimilarListings from '@/components/SimilarListings'
import NearbyListings from '@/components/NearbyListings'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

interface ListingDetail {
  id: string
  title: string
  description: string
  category: string
  condition: string
  price: number
  originalPrice?: number
  images: string[]
  location: string
  status: string
  views: number
  createdAt: string
  seller: {
    id: string
    name: string
    avatar?: string
    trustScore: number
    totalSales: number
    createdAt: string
  }
  _count: {
    likes: number
  }
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const { addToRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    fetchListing()
  }, [params.id])

  useEffect(() => {
    // Add to recently viewed when listing is loaded
    if (listing) {
      addToRecentlyViewed(listing.id)
    }
  }, [listing, addToRecentlyViewed])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setListing(data.data)
        setLikesCount(data.data._count.likes)
      } else {
        router.push('/inzeraty')
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
      router.push('/inzeraty')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento inzerát?')) return

    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/moje-inzeraty')
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
    }
  }

  const handleContactSeller = async () => {
    if (!session) {
      router.push('/prihlaseni')
      return
    }

    if (!listing) {
      return
    }

    try {
      // Create or get conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otherUserId: listing.seller.id,
          listingId: listing.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/zpravy/${data.data.id}`)
      } else {
        alert(data.error || 'Nepodařilo se otevřít konverzaci')
      }
    } catch (error) {
      alert('Nastala chyba')
    }
  }

  const handleBuyNow = () => {
    if (!session) {
      router.push('/prihlaseni')
      return
    }
    router.push(`/objednavka/${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání inzerátu...</p>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const isOwner = session?.user?.id === listing.seller.id
  const canBuy = listing.status === 'ACTIVE' && !isOwner

  const conditionLabels: Record<string, string> = {
    NEW: 'Nové',
    LIKE_NEW: 'Jako nové',
    GOOD: 'Dobré',
    FAIR: 'Použité',
    POOR: 'Opotřebované',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="safe-container">
        {/* Back Button */}
        <Link
          href="/inzeraty"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-smooth"
        >
          <ChevronLeft className="w-5 h-5" />
          Zpět na inzeráty
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card-surface rounded-2xl overflow-hidden">
              {listing.images.length > 0 ? (
                <>
                  <div className="relative aspect-square bg-gray-200">
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((currentImageIndex - 1 + listing.images.length) % listing.images.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-smooth"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((currentImageIndex + 1) % listing.images.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-smooth"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-lg">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {listing.images.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto">
                      {listing.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-smooth ${
                            index === currentImageIndex
                              ? 'border-primary-600'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img src={img} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Bez fotografie</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-surface rounded-2xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {listing.title}
              </h1>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(listing.createdAt).toLocaleDateString('cs-CZ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{listing.views} zobrazení</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Popis</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Details */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detaily</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kategorie</p>
                    <p className="font-semibold text-gray-900">{listing.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stav</p>
                    <p className="font-semibold text-gray-900">{conditionLabels[listing.condition]}</p>
                  </div>
                  {listing.originalPrice && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Původní cena</p>
                      <p className="font-semibold text-gray-900">
                        {listing.originalPrice.toLocaleString('cs-CZ')} Kč
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <div className="card-surface rounded-2xl p-8 sticky top-24">
              <div className="flex items-baseline gap-3 mb-2">
                <p className="text-4xl font-bold text-primary-600">
                  {listing.price.toLocaleString('cs-CZ')} Kč
                </p>
                {listing.originalPrice && (
                  <p className="text-lg text-gray-400 line-through">
                    {listing.originalPrice.toLocaleString('cs-CZ')} Kč
                  </p>
                )}
              </div>

              {listing.originalPrice && (
                <p className="text-sm text-trust-600 font-semibold mb-6">
                  Ušetříte {((listing.originalPrice - listing.price) / listing.originalPrice * 100).toFixed(0)}%
                </p>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={() => router.push(`/inzeraty/${listing.id}/upravit`)}
                    variant="secondary"
                    fullWidth
                    className="justify-center"
                  >
                    <Edit className="w-5 h-5" />
                    Upravit inzerát
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="secondary"
                    fullWidth
                    className="justify-center text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="w-5 h-5" />
                    Smazat inzerát
                  </Button>
                </div>
              )}

              {/* Buyer Actions */}
              {canBuy && (
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleBuyNow}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="justify-center"
                  >
                    <Shield className="w-5 h-5" />
                    Koupit s ochranou
                  </Button>
                  <Button
                    onClick={handleContactSeller}
                    variant="secondary"
                    fullWidth
                    className="justify-center"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Napsat prodejci
                  </Button>
                </div>
              )}

              {/* Social Actions */}
              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <div className="flex-1 flex items-center gap-2">
                  <LikeButton 
                    listingId={listing.id} 
                    size="lg"
                    className="flex-1 !w-auto !h-auto px-4 py-3 !rounded-xl"
                  />
                  {likesCount > 0 && (
                    <span className="text-sm font-semibold text-gray-600">
                      {likesCount}
                    </span>
                  )}
                </div>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-smooth">
                  <Share2 className="w-5 h-5" />
                  <span className="font-semibold">Sdílet</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-smooth">
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 p-4 bg-trust-50 border border-trust-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-trust-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-trust-900 mb-1">
                      Bezpečný nákup
                    </h4>
                    <p className="text-xs text-trust-700">
                      Peníze držíme v bezpečí, dokud nepotvrdíte převzetí zboží
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="card-surface rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Prodávající</h3>
              
              <Link
                href={`/profil/${listing.seller.id}`}
                className="flex items-center gap-3 mb-4 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {listing.seller.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-smooth">
                    {listing.seller.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-trust-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{listing.seller.trustScore}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{listing.seller.totalSales} prodejů</span>
                  </div>
                </div>
              </Link>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-trust-600" />
                  <span>Ověřený účet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Na platformě od {new Date(listing.seller.createdAt).toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="safe-container mt-12 space-y-12">
          {/* Similar Listings */}
          <SimilarListings listingId={listing.id} limit={4} />

          {/* Nearby Listings */}
          <NearbyListings location={listing.location} excludeId={listing.id} limit={4} />
        </div>
      </div>
    </div>
  )
}
