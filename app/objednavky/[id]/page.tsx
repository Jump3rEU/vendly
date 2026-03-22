'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, XCircle, TrendingUp, MapPin,
  Truck, Shield, AlertTriangle, ChevronRight, MessageCircle, Star
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  itemPrice: number
  platformFee: number
  totalAmount: number
  createdAt: string
  paymentHeldAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  completedAt: string | null
  trackingNumber: string | null
  buyer: {
    id: string
    name: string
    trustScore: number
  }
  seller: {
    id: string
    name: string
    trustScore: number
  }
  listing: {
    id: string
    title: string
    images: string[]
    location: string
  }
  payment: {
    status: string
    method: string
    heldAt: string | null
    capturedAt: string | null
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [hasReview, setHasReview] = useState(false)

  useEffect(() => {
    fetchOrder()
    checkReviewStatus()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.data)
      } else {
        router.push('/objednavky')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/objednavky')
    } finally {
      setLoading(false)
    }
  }

  const checkReviewStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}/review`)
      if (response.ok) {
        const data = await response.json()
        setCanReview(data.canReview || false)
        setHasReview(data.hasReview || false)
      }
    } catch (error) {
      console.error('Failed to check review status:', error)
    }
  }

  const handleConfirmReceipt = async () => {
    if (!confirm('Potvrzujete, že jste obdrželi zboží a odpovídá popisu?')) return

    setConfirming(true)
    try {
      const response = await fetch(`/api/orders/${params.id}/confirm`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchOrder()
        alert('Platba byla uvolněna prodejci')
      } else {
        const data = await response.json()
        alert(data.error || 'Nepodařilo se potvrdit objednávku')
      }
    } catch (error) {
      alert('Nastala chyba')
    } finally {
      setConfirming(false)
    }
  }

  const handleCancelOrder = async () => {
    const reason = prompt('Důvod zrušení objednávky:')
    if (!reason) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/orders/${params.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        await fetchOrder()
        alert('Objednávka byla zrušena')
      } else {
        const data = await response.json()
        alert(data.error || 'Nepodařilo se zrušit objednávku')
      }
    } catch (error) {
      alert('Nastala chyba')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání objednávky...</p>
        </div>
      </div>
    )
  }

  if (!order) return null

  const isBuyer = session?.user?.id === order.buyer.id
  const isSeller = session?.user?.id === order.seller.id

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING_PAYMENT: { label: 'Čeká na platbu', color: 'bg-warning-100 text-warning-700', icon: Clock },
    PAYMENT_HELD: { label: 'Platba držena', color: 'bg-trust-100 text-trust-700', icon: Shield },
    SHIPPED: { label: 'Odesláno', color: 'bg-primary-100 text-primary-700', icon: Truck },
    DELIVERED: { label: 'Doručeno', color: 'bg-success-100 text-success-700', icon: Package },
    COMPLETED: { label: 'Dokončeno', color: 'bg-success-100 text-success-700', icon: CheckCircle },
    CANCELLED: { label: 'Zrušeno', color: 'bg-danger-100 text-danger-700', icon: XCircle },
    REFUNDED: { label: 'Vráceno', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  }

  const currentStatus = statusConfig[order.status] || statusConfig.PENDING_PAYMENT
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/objednavky"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-smooth"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Zpět na objednávky
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Objednávka #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${currentStatus.color}`}>
                <StatusIcon className="w-5 h-5" />
                {currentStatus.label}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Timeline */}
              <div className="card-surface rounded-2xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Průběh objednávky</h2>
                
                <div className="space-y-6">
                  <TimelineStep
                    completed={true}
                    active={order.status === 'PENDING_PAYMENT'}
                    title="Objednávka vytvořena"
                    date={order.createdAt}
                  />
                  <TimelineStep
                    completed={order.paymentHeldAt !== null}
                    active={order.status === 'PAYMENT_HELD'}
                    title="Platba držena v escrow"
                    date={order.paymentHeldAt}
                  />
                  <TimelineStep
                    completed={order.shippedAt !== null}
                    active={order.status === 'SHIPPED'}
                    title="Zásilka odeslána"
                    date={order.shippedAt}
                    extra={order.trackingNumber ? `Tracking: ${order.trackingNumber}` : undefined}
                  />
                  <TimelineStep
                    completed={order.deliveredAt !== null}
                    active={order.status === 'DELIVERED'}
                    title="Zásilka doručena"
                    date={order.deliveredAt}
                  />
                  <TimelineStep
                    completed={order.completedAt !== null}
                    active={order.status === 'COMPLETED'}
                    title="Objednávka dokončena"
                    date={order.completedAt}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="card-surface rounded-2xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Produkt</h2>
                
                <Link
                  href={`/inzeraty/${order.listing.id}`}
                  className="flex gap-4 group"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    {order.listing.images[0] ? (
                      <img
                        src={order.listing.images[0]}
                        alt={order.listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-smooth mb-2">
                      {order.listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{order.listing.location}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {order.itemPrice.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                </Link>
              </div>

              {/* Actions */}
              {isSeller && order.status === 'PAYMENT_HELD' && (
                <div className="card-surface rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Připravte zásilku k odeslání
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Platba je držena v escrow. Po odeslání zboží označte objednávku jako odeslanou a zadejte číslo zásilky.
                      </p>
                      <Button
                        onClick={() => router.push(`/objednavky/${order.id}/odeslat`)}
                        variant="primary"
                      >
                        <Truck className="w-5 h-5" />
                        Označit jako odesláno
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isBuyer && (order.status === 'DELIVERED' || order.status === 'SHIPPED') && order.payment.status === 'HELD' && (
                <div className="card-surface rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-trust-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-trust-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Potvrďte převzetí zboží
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Po potvrzení bude platba uvolněna prodejci. Pokud zboží neodpovídá popisu, můžete otevřít spor.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleConfirmReceipt}
                          variant="primary"
                          disabled={confirming}
                        >
                          {confirming ? 'Potvrzování...' : 'Potvrdit převzetí'}
                        </Button>
                        <Button
                          onClick={() => alert('Funkce sporů bude brzy dostupná')}
                          variant="secondary"
                        >
                          Otevřít spor
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {canReview && !hasReview && (
                <div className="card-surface rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Ohodnoťte transakci
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Sdílejte svou zkušenost s {isBuyer ? 'prodejcem' : 'kupujícím'}. Pomůžete tak ostatním uživatelům.
                      </p>
                      <Button
                        onClick={() => router.push(`/objednavky/${order.id}/hodnotit`)}
                        variant="primary"
                      >
                        <Star className="w-5 h-5" />
                        Napsat hodnocení
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {hasReview && (
                <div className="card-surface rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Hodnocení odesláno
                      </h3>
                      <p className="text-sm text-gray-600">
                        Děkujeme za vaše hodnocení.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(isBuyer || isSeller) && ['PENDING_PAYMENT', 'PAYMENT_HELD'].includes(order.status) && (
                <div className="card-surface rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-danger-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Zrušit objednávku
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Objednávku lze zrušit před odesláním. Platba bude automaticky vrácena.
                      </p>
                      <Button
                        onClick={handleCancelOrder}
                        variant="secondary"
                        className="text-danger-600 hover:bg-danger-50"
                        disabled={cancelling}
                      >
                        {cancelling ? 'Rušení...' : 'Zrušit objednávku'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="card-surface rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Shrnutí platby</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cena položky</span>
                    <span className="font-semibold text-gray-900">
                      {order.itemPrice.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Poplatek platformy</span>
                    <span className="font-semibold text-gray-900">
                      {order.platformFee.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold text-gray-900">Celkem</span>
                    <span className="text-xl font-bold text-primary-600">
                      {order.totalAmount.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Způsob platby</span>
                    <span className="font-semibold text-gray-900 uppercase">
                      {order.payment.method}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buyer/Seller Info */}
              <div className="card-surface rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  {isBuyer ? 'Prodejce' : 'Kupující'}
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(isBuyer ? order.seller.name : order.buyer.name)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isBuyer ? order.seller.name : order.buyer.name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-trust-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">
                        {isBuyer ? order.seller.trustScore : order.buyer.trustScore}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" fullWidth className="justify-center">
                  <MessageCircle className="w-5 h-5" />
                  Napsat zprávu
                </Button>
              </div>

              {/* Escrow Protection */}
              <div className="bg-trust-50 border border-trust-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-trust-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-trust-900 mb-2">
                      Escrow ochrana
                    </h4>
                    <p className="text-sm text-trust-700">
                      Platba je držena v bezpečí, dokud {isBuyer ? 'nepotvrdíte' : 'kupující nepotvrdí'} převzetí zboží.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineStep({
  completed,
  active,
  title,
  date,
  extra,
}: {
  completed: boolean
  active: boolean
  title: string
  date: string | null
  extra?: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            completed
              ? 'bg-success-100 text-success-600'
              : active
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {completed ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <Clock className="w-6 h-6" />
          )}
        </div>
        {!extra && <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>}
      </div>
      <div className="flex-1 pb-6">
        <h4 className={`font-semibold mb-1 ${completed || active ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h4>
        {date && (
          <p className="text-sm text-gray-600">
            {new Date(date).toLocaleString('cs-CZ', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
        {extra && (
          <p className="text-sm text-gray-600 mt-1">{extra}</p>
        )}
      </div>
    </div>
  )
}
