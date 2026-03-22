'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Star, ChevronLeft, AlertCircle } from 'lucide-react'

interface Order {
  id: string
  listing: {
    id: string
    title: string
    images: string[]
  }
  seller: {
    id: string
    name: string
    avatar: string | null
  }
  buyer: {
    id: string
    name: string
    avatar: string | null
  }
  finalPrice: number
  status: string
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    fetchOrderData()
  }, [orderId])

  const fetchOrderData = async () => {
    try {
      const [orderRes, reviewRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch(`/api/orders/${orderId}/review`),
      ])

      if (!orderRes.ok) {
        throw new Error('Objednávka nenalezena')
      }

      const orderData = await orderRes.json()
      const reviewData = await reviewRes.json()

      setOrder(orderData)
      setCanReview(reviewData.canReview)

      if (reviewData.hasReview) {
        router.push(`/objednavky/${orderId}`)
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při načítání dat')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Prosím vyberte hodnocení')
      return
    }

    if (comment.trim().length < 10) {
      setError('Komentář musí mít alespoň 10 znaků')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Chyba při odesílání hodnocení')
      }

      router.push(`/objednavky/${orderId}?reviewed=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order || !canReview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nelze hodnotit
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Tuto objednávku nemůžete hodnotit.'}
          </p>
          <button
            onClick={() => router.push(`/objednavky/${orderId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ChevronLeft className="w-5 h-5" />
            Zpět na objednávku
          </button>
        </div>
      </div>
    )
  }

  // Determine who is being reviewed (buyer or seller)
  // Assuming current user info would come from session
  const reviewedUser = order.seller // In real app, determine based on current user

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Zpět
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Hodnocení</h1>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <img
              src={order.listing.images[0] || '/placeholder.png'}
              alt={order.listing.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 mb-1">
                {order.listing.title}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Cena: {order.finalPrice} Kč
              </p>
              <div className="flex items-center gap-2">
                <img
                  src={reviewedUser.avatar || '/avatar-placeholder.png'}
                  alt={reviewedUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">
                  {reviewedUser.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jak byste ohodnotili tuto transakci?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 5 && '⭐ Výborné'}
                {rating === 4 && '👍 Velmi dobré'}
                {rating === 3 && '😐 Průměrné'}
                {rating === 2 && '👎 Podprůměrné'}
                {rating === 1 && '❌ Špatné'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Komentář
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Popište svou zkušenost s touto transakcí (min. 10 znaků)..."
              required
              minLength={10}
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length} / 500 znaků
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Buďte upřímní a konstruktivní. Vaše hodnocení pomůže ostatním uživatelům.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Odesílání...' : 'Odeslat hodnocení'}
          </button>
        </form>
      </div>
    </div>
  )
}
