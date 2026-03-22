import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, TrendingDown, Truck, Heart, Sparkles } from 'lucide-react'

interface ListingCardProps {
  listing: {
    id: string
    slug?: string | null
    title: string
    price: number | string
    location: string
    images?: string[]
    thumbnailUrl?: string
    image?: string
    condition?: string
    status?: string
    deliveryMethods?: string[]
    allowsOffers?: boolean
    seller?: {
      name?: string
      trustScore?: number
      idVerified?: boolean
    }
    sellerVerified?: boolean
    _count?: {
      likes?: number
    }
    createdAt?: string
  }
}

const conditionLabels: Record<string, string> = {
  NEW: 'Nové',
  LIKE_NEW: 'Jako nové',
  GOOD: 'Dobrý stav',
  FAIR: 'Použité',
  POOR: 'Opotřebené',
}

function isNewToday(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  return diffMs < 24 * 60 * 60 * 1000
}

function getTrustColor(score?: number): { bg: string; text: string; dot: string } {
  if (!score) return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  if (score >= 70) return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
  if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
  return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
}

// Premium listing card with improved visual hierarchy and trust signals
export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.thumbnailUrl || listing.images?.[0] || listing.image
  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price
  const isVerified = listing.seller?.idVerified || listing.sellerVerified
  const hasDelivery = listing.deliveryMethods && listing.deliveryMethods.length > 0
  const newToday = isNewToday(listing.createdAt)
  const trustColors = getTrustColor(listing.seller?.trustScore)

  return (
    <Link
      href={`/inzeraty/${listing.slug || listing.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden relative shadow-soft hover:shadow-glass hover:border-rose-100 hover:-translate-y-2 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl">📷</span>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-left badges row */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {/* Nové dnes badge */}
          {newToday && (
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              <span>Nové dnes</span>
            </div>
          )}
          {/* Condition badge */}
          {listing.condition && (
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md border border-white/50">
              {conditionLabels[listing.condition] || listing.condition}
            </div>
          )}
        </div>

        {/* Top-right: verified badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Ověřeno</span>
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 flex-wrap">
          {listing.allowsOffers && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Cena dohodou</span>
            </div>
          )}
          {hasDelivery && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Truck className="w-3.5 h-3.5" />
              <span>Doprava</span>
            </div>
          )}
        </div>

        {/* Like counter */}
        {listing._count?.likes && listing._count.likes > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-1 shadow-sm">
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
            {listing._count.likes}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-rose-600 transition-colors duration-300 leading-snug">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Price + Trust Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl font-black text-rose-600 tracking-tight">
            {price.toLocaleString('cs-CZ')} Kč
          </div>
          {listing.seller?.trustScore !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold ${trustColors.bg} ${trustColors.text}`}>
              <div className={`w-2 h-2 rounded-full ${trustColors.dot}`} />
              {(listing.seller.trustScore / 20).toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
