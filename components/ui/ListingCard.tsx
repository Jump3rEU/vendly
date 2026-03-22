import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, TrendingDown, Truck, Package, Heart } from 'lucide-react'

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

// Premium listing card with improved visual hierarchy and trust signals
export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.thumbnailUrl || listing.images?.[0] || listing.image
  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price
  const isVerified = listing.seller?.idVerified || listing.sellerVerified
  const hasDelivery = listing.deliveryMethods && listing.deliveryMethods.length > 0

  return (
    <Link 
      href={`/inzeraty/${listing.slug || listing.id}`}
      className="group block bg-white rounded-[2rem] border-0 overflow-hidden relative shadow-lg hover:shadow-2xl hover:shadow-primary-100/40 hover:-translate-y-3 transition-all duration-500"
    >
      {/* Image with subtle overlay */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <span className="text-5xl">📷</span>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          {/* Condition badge */}
          {listing.condition && (
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold text-gray-900 shadow-xl border border-white/50">
              {conditionLabels[listing.condition] || listing.condition}
            </div>
          )}
          
          {/* Verified badge */}
          {isVerified && (
            <div className="bg-gradient-to-br from-trust-500 to-trust-600 text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl ml-auto">
              <BadgeCheck className="w-4 h-4" />
              <span>Ověřeno</span>
            </div>
          )}
        </div>

        {/* Bottom badges - Features */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          {listing.allowsOffers && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xl">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Nabídky</span>
            </div>
          )}
          {hasDelivery && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xl">
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

      {/* Content with better spacing */}
      <div className="p-6">
        {/* Title with improved readability */}
        <h3 className="font-black text-gray-900 mb-3 line-clamp-2 text-lg group-hover:text-primary-700 transition-colors duration-500 leading-snug">
          {listing.title}
        </h3>
        
        {/* Meta info with better visual separation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Price - visually dominant with glow effect on hover */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="text-2xl font-bold text-primary-600 tracking-tight group-hover:text-primary-700 transition-colors duration-500">
              {price.toLocaleString('cs-CZ')} Kč
            </div>
            {/* Price underline effect on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-700 group-hover:w-full transition-all duration-500"></div>
          </div>
          {listing.seller && listing.seller.trustScore && (
            <div className="text-sm font-semibold text-amber-600 flex items-center gap-1 bg-gradient-to-br from-amber-50 to-amber-100 px-2.5 py-1.5 rounded-lg shadow-sm">
              ⭐ {(listing.seller.trustScore / 20).toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
