'use client'

import { useState } from 'react'
import { X, MessageCircle, TrendingDown, AlertCircle } from 'lucide-react'
import Button from './ui/Button'

interface OfferModalProps {
  listingId: string
  listingPrice: number
  listingTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function OfferModal({
  listingId,
  listingPrice,
  listingTitle,
  onClose,
  onSuccess,
}: OfferModalProps) {
  const [offerPrice, setOfferPrice] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const price = parseFloat(offerPrice)
    
    if (isNaN(price) || price <= 0) {
      setError('Zadejte platnou částku')
      setLoading(false)
      return
    }

    if (price >= listingPrice) {
      setError('Nabídka musí být nižší než požadovaná cena')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          offerPrice: price,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Chyba při odeslání nabídky')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = () => {
    const price = parseFloat(offerPrice)
    if (isNaN(price)) return 0
    return Math.round(((listingPrice - price) / listingPrice) * 100)
  }

  const discount = calculateDiscount()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nabídnout cenu</h2>
            <p className="text-sm text-gray-600 mt-1">
              {listingTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Price */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Požadovaná cena</p>
            <p className="text-2xl font-bold text-gray-900">
              {listingPrice.toLocaleString('cs-CZ')} Kč
            </p>
          </div>

          {/* Offer Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaše nabídka *
            </label>
            <div className="relative">
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Zadejte částku"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                required
                min="1"
                max={listingPrice - 1}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Kč
              </span>
            </div>
            
            {offerPrice && discount > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <TrendingDown className="w-4 h-4 text-primary-600" />
                <span className="text-primary-600 font-medium">
                  Sleva {discount}% od požadované ceny
                </span>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zpráva prodávajícímu (nepovinné)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Např. Jsem vážný zájemce, mohu si vyzvednout ihned..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Jak to funguje?</p>
              <p className="text-blue-700">
                Prodávající obdrží vaši nabídku a může ji přijmout, odmítnout nebo poslat protinabídku. 
                Nabídka vyprší za 48 hodin.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Zrušit
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Odesílám...' : 'Odeslat nabídku'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
