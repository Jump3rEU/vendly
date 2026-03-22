'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Heart, Eye, ArrowLeft, Zap, TrendingDown } from 'lucide-react'
import Button from './ui/Button'

interface Listing {
  id: string
  slug?: string | null
  title: string
  price: number
  images: string[]
  location: string
  category: string
  condition: string
  allowsOffers: boolean
  seller: {
    name: string
    trustScore: number
    idVerified: boolean
  }
}

interface SwipeDiscoveryProps {
  onClose: () => void
  initialCategory?: string
}

export default function SwipeDiscovery({ onClose, initialCategory }: SwipeDiscoveryProps) {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [likedCount, setLikedCount] = useState(0)
  const [viewedCount, setViewedCount] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({ limit: '50', status: 'ACTIVE' })
      if (initialCategory && initialCategory !== 'Vše') {
        params.append('category', initialCategory)
      }
      
      const res = await fetch(`/api/listings?${params}`)
      const data = await res.json()
      
      if (data.data?.listings) {
        // Shuffle for variety
        const shuffled = [...data.data.listings].sort(() => Math.random() - 0.5)
        setListings(shuffled)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentListing = listings[currentIndex]

  const handleTouchStart = (e: React.TouchEvent) => {
    startPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const deltaX = e.touches[0].clientX - startPos.current.x
    const deltaY = e.touches[0].clientY - startPos.current.y
    
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 100
    
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        handleLike()
      } else {
        handleSkip()
      }
    } else if (dragOffset.y < -threshold) {
      handleQuickView()
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 })
    }
    
    setIsDragging(false)
  }

  const handleLike = async () => {
    if (!currentListing) return
    
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: currentListing.id }),
      })
      setLikedCount(prev => prev + 1)
    } catch (error) {
      console.error('Failed to like:', error)
    }
    
    nextCard()
  }

  const handleSkip = () => {
    nextCard()
  }

  const handleQuickView = () => {
    if (!currentListing) return
    router.push(`/inzerat/${currentListing.slug || currentListing.id}`)
  }

  const nextCard = () => {
    setViewedCount(prev => prev + 1)
    setDragOffset({ x: 0, y: 0 })
    
    if (currentIndex < listings.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Finished all cards
      onClose()
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
      </div>
    )
  }

  if (!currentListing) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">To je vše!</h2>
          <p className="text-white/80 mb-6">
            Prošel jsi všechny dostupné inzeráty
          </p>
          <Button onClick={onClose} variant="secondary">
            Zpět na seznam
          </Button>
        </div>
      </div>
    )
  }

  const rotation = dragOffset.x * 0.1
  const opacity = 1 - Math.abs(dragOffset.x) / 300

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-500 to-primary-700">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{likedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{viewedCount}/{listings.length}</span>
          </div>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pt-20 pb-32">
        {/* Next card (background) */}
        {listings[currentIndex + 1] && (
          <div className="absolute w-full max-w-md h-[600px] bg-white rounded-3xl shadow-2xl scale-95 opacity-50" />
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-md h-[600px] cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Image */}
            <div className="relative h-96">
              <Image
                src={currentListing.images[0] || '/placeholder.jpg'}
                alt={currentListing.title}
                fill
                className="object-cover"
              />
              
              {/* Swipe indicators */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: dragOffset.x > 50 ? dragOffset.x / 150 : 0 }}
              >
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg rotate-12">
                  LIKE ❤️
                </div>
              </div>
              
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: dragOffset.x < -50 ? Math.abs(dragOffset.x) / 150 : 0 }}
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg -rotate-12">
                  SKIP ✖️
                </div>
              </div>
              
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: dragOffset.y < -50 ? Math.abs(dragOffset.y) / 150 : 0 }}
              >
                <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                  ZOBRAZIT 👀
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
                  {currentListing.condition}
                </div>
                {currentListing.seller.idVerified && (
                  <div className="bg-trust-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    ✓ Ověřeno
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">
                  {currentListing.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{currentListing.location}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-black text-primary-600">
                  {currentListing.price.toLocaleString('cs-CZ')} Kč
                </div>
                
                {currentListing.allowsOffers && (
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
                    <TrendingDown className="w-4 h-4" />
                    Nabídky
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{currentListing.seller.name}</span>
                  <span className="text-yellow-500">★ {currentListing.seller.trustScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleSkip}
            className="bg-white p-6 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>
          
          <button
            onClick={handleQuickView}
            className="bg-white p-5 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <Eye className="w-7 h-7 text-blue-500" />
          </button>
          
          <button
            onClick={handleLike}
            className="bg-white p-6 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <Heart className="w-8 h-8 text-green-500 fill-green-500" />
          </button>
        </div>
        
        {/* Instructions */}
        <div className="text-center text-white/80 text-sm mt-4 space-y-1">
          <p>← Swipe doleva pro Skip</p>
          <p>→ Swipe doprava pro Like</p>
          <p>↑ Swipe nahoru pro detail</p>
        </div>
      </div>
    </div>
  )
}
