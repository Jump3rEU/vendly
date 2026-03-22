'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ShipOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/orders/${params.id}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber,
          carrier: shippingCarrier,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/objednavky/${params.id}`)
      } else {
        setError(data.error || 'Nepodařilo se označit jako odesláno')
      }
    } catch (err) {
      setError('Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět
          </button>

          <div className="card-surface rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Označit jako odesláno
                </h1>
                <p className="text-gray-600">
                  Zadejte informace o zásilce
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dopravce
                </label>
                <select
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Vyberte dopravce</option>
                  <option value="Česká pošta">Česká pošta</option>
                  <option value="DPD">DPD</option>
                  <option value="PPL">PPL</option>
                  <option value="GLS">GLS</option>
                  <option value="Zásilkovna">Zásilkovna</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Jiný">Jiný</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Číslo zásilky (tracking number)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input-field"
                  placeholder="např. CP123456789CZ"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Toto číslo umožní kupujícímu sledovat stav zásilky
                </p>
              </div>

              <div className="bg-trust-50 border border-trust-200 rounded-xl p-4">
                <h4 className="font-semibold text-trust-900 mb-2">
                  Co se stane po odeslání?
                </h4>
                <ul className="text-sm text-trust-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-trust-600 mt-0.5">•</span>
                    <span>Kupující obdrží notifikaci s číslem zásilky</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-600 mt-0.5">•</span>
                    <span>Platba zůstává držena v escrow až do potvrzení převzetí</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-600 mt-0.5">•</span>
                    <span>Po potvrzení kupujícího budou peníze uvolněny na váš účet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-600 mt-0.5">•</span>
                    <span>Pokud kupující nepotvrdí do 21 dnů, peníze budou automaticky uvolněny</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  fullWidth
                >
                  Zrušit
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  className="justify-center"
                >
                  <Truck className="w-5 h-5" />
                  {loading ? 'Ukládání...' : 'Potvrdit odeslání'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
