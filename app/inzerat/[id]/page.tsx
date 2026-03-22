'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPin, Clock, Shield, AlertTriangle, MessageCircle, Heart,
  TrendingDown, Package, Truck, Home as HomeIcon, CheckCircle, Info
} from 'lucide-react'
import Button from '@/components/ui/Button'
import VerifiedBadge from '@/components/trust/VerifiedBadge'
import EscrowExplanation from '@/components/trust/EscrowExplanation'
import SellerCard from '@/components/ui/SellerCard'
import OfferModal from '@/components/OfferModal'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  images: string[]
  location: string
  views: number
  status: string
  deliveryMethods: string[]
  shippingPrice: number | null
  allowsOffers: boolean
  createdAt: string
  seller: {
    id: string
    name: string
    nickname?: string
    avatar: string | null
    trustScore: number
    totalSales: number
    createdAt: string
    idVerified: boolean
    phoneVerified: boolean
  }
  _count: {
    likes: number
  }
}

const deliveryLabels: Record<string, { label: string; icon: any }> = {
  PERSONAL: { label: 'Osobní předání', icon: HomeIcon },
  POST: { label: 'Česká pošta', icon: Package },
  ZASILKOVNA: { label: 'Zásilkovna', icon: Package },
  COURIER: { label: 'Kurýr', icon: Truck },
}

const conditionLabels: Record<string, string> = {
  NEW: 'Nové',
  LIKE_NEW: 'Jako nové',
  GOOD: 'Dobrý stav',
  FAIR: 'Použité',
  POOR: 'Na díly',
}

export default function InzeratDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${params.id}`)
      if (res.ok) {
        const response = await res.json()
        if (response.success && response.data) {
          setListing(response.data)
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!session) {
      router.push('/prihlaseni')
      return
    }

    try {
      const res = await fetch('/api/favorites', {
        method: liked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id }),
      })
      
      if (res.ok) {
        setLiked(!liked)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleContact = () => {
    if (!session) {
      router.push('/prihlaseni')
      return
    }
    router.push(`/zpravy?listing=${params.id}&seller=${listing?.seller?.id}`)
  }

  const handleBuyNow = () => {
    if (!session) {
      router.push('/prihlaseni')
      return
    }
    router.push(`/checkout?listing=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="safe-container">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl h-96"></div>
            <div className="bg-white rounded-xl h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="safe-container text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inzerát nenalezen</h1>
          <p className="text-gray-600 mb-6">
            Tento inzerát neexistuje nebo byl odstraněn.
          </p>
          <Button href="/inzeraty" variant="primary">
            Zobrazit všechny inzeráty
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === listing?.seller?.id
  const memberSince = new Date(listing?.seller?.createdAt || new Date()).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="safe-container">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50">
              {listing.images?.length > 0 ? (
                <>
                  <div className="aspect-square relative bg-gray-100">
                    <Image
                      src={listing.images[selectedImage]}
                      alt={listing?.title || 'Obrázek inzerátu'}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {listing.images.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto">
                      {listing.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                            selectedImage === idx
                              ? 'border-primary-500 ring-4 ring-primary-200 scale-105'
                              : 'border-gray-200 hover:border-primary-300 hover:scale-105'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${listing?.title || 'Inzerát'} - obrázek ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">📱 Žádné foto</span>
                </div>
              )}
            </div>

            {/* Title, Price & Actions */}
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-gray-200/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary-700 bg-gradient-to-br from-primary-50 to-primary-100 px-3 py-1.5 rounded-full">
                      {listing?.category || 'Ostatní'}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      • {conditionLabels[listing?.condition || 'GOOD']}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 mb-4">
                    {listing?.title || 'Bez názvu'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing?.location || 'Neznámá lokalita'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {listing?.createdAt ? new Date(listing.createdAt).toLocaleDateString('cs-CZ') : 'Nedostupné'}
                    </span>
                    <span className="text-gray-400">
                      • {listing?.views || 0} zobrazení
                    </span>
                    <span className="text-gray-400">
                      • {listing._count?.likes || 0} oblíbených
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLike}
                  className="touch-target p-3 hover:bg-red-50 rounded-2xl transition-all duration-500 hover:scale-110"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-500 ${
                      liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-br from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
                  {(listing?.price || 0).toLocaleString('cs-CZ')} Kč
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-br from-trust-100 to-trust-200 text-trust-700 px-4 py-2 rounded-2xl text-sm font-bold">
                    <Shield className="w-4 h-4" />
                    Chráněno escrow systémem
                  </div>
                  {listing?.allowsOffers && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold">
                      <TrendingDown className="w-4 h-4" />
                      Přijímá nabídky
                    </div>
                  )}
                </div>
              </div>

              {!isOwner && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="primary" fullWidth onClick={handleBuyNow}>
                    Koupit nyní
                  </Button>
                  {listing?.allowsOffers && (
                    <Button
                      size="lg"
                      variant="outline"
                      fullWidth
                      onClick={() => setShowOfferModal(true)}
                    >
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Nabídnout cenu
                    </Button>
                  )}
                  <Button size="lg" variant="outline" onClick={handleContact}>
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Toto je váš inzerát</p>
                    <p className="text-blue-700">
                      Můžete ho upravit nebo odstranit ve{' '}
                      <Link href="/moje-inzeraty" className="underline font-medium">
                        vašich inzerátech
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            {listing.deliveryMethods?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-gray-200/50 border-2 border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Možnosti dopravy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.deliveryMethods?.map((method) => {
                    const config = deliveryLabels[method]
                    if (!config) return null
                    return (
                      <div
                        key={method}
                        className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-100 hover:border-primary-200 transition-all duration-500 hover:shadow-lg"
                      >
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl">
                          <config.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{config.label}</p>
                          {method !== 'PERSONAL' && listing?.shippingPrice && (
                            <p className="text-sm text-gray-600 font-semibold">
                              +{listing.shippingPrice.toLocaleString('cs-CZ')} Kč
                            </p>
                          )}
                        </div>
                        <CheckCircle className="w-5 h-5 text-trust-600" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-gray-200/50 border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Popis
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {listing?.description || 'Popis není k dispozici.'}
              </div>
            </div>

            {/* Legal Disclaimer (CRITICAL) */}
            <div className="bg-warning-100 border border-warning-500 rounded-xl p-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-warning-900 mb-2">
                    Důležité informace o odpovědnosti
                  </h3>
                  <p className="text-sm text-warning-800 leading-relaxed">
                    <strong>Vendly je zprostředkovatelská platforma.</strong> Za popis, stav a kvalitu 
                    této položky odpovídá prodávající. Vendly neposkytuje záruku na tento produkt. 
                    Před koupí si ověřte všechny detaily s prodávajícím. Peníze držíme v bezpečí, 
                    dokud nepotvrdíte převzetí.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <SellerCard 
              sellerId={listing?.seller?.id || ''}
              sellerNickname={listing?.seller?.nickname}
              name={listing?.seller?.name || 'Uživatel'}
              verified={listing?.seller?.idVerified}
              rating={(listing?.seller?.trustScore || 0) / 20} // Convert 0-100 to 0-5
              totalSales={listing?.seller?.totalSales}
              memberSince={memberSince}
            />

            {/* Escrow Explanation */}
            <EscrowExplanation />

            {/* Safety Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Bezpečnostní tipy
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-trust-600 flex-shrink-0">✓</span>
                  <span>Platbu vždy provádějte přes Vendly</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-trust-600 flex-shrink-0">✓</span>
                  <span>Osobní předání na veřejném místě</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-trust-600 flex-shrink-0">✓</span>
                  <span>Před potvrzením si produkt důkladně prohlédněte</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-danger-600 flex-shrink-0">✗</span>
                  <span>Nikdy neplaťte mimo platformu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-danger-600 flex-shrink-0">✗</span>
                  <span>Nedávejte důvěru podezřelým nabídkám</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && listing && (
        <OfferModal
          listingId={listing.id}
          listingPrice={Number(listing?.price || 0)}
          listingTitle={listing?.title || 'Inzerát'}
          onClose={() => setShowOfferModal(false)}
          onSuccess={() => {
            alert('Nabídka byla úspěšně odeslána!')
            fetchListing()
          }}
        />
      )}
    </div>
  )
}
