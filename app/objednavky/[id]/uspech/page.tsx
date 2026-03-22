'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, Shield, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setOrderDetails(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="card-surface rounded-2xl p-8 text-center mb-8">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Platba úspěšná!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vaše objednávka byla vytvořena a platba je držena v bezpečí
            </p>

            {orderDetails && (
              <div className="inline-block bg-primary-50 border border-primary-200 rounded-xl px-6 py-4 mb-8">
                <p className="text-sm text-primary-700 mb-1">Číslo objednávky</p>
                <p className="text-2xl font-mono font-bold text-primary-900">
                  {orderDetails.orderNumber}
                </p>
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">Co bude následovat?</h3>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Prodejce připraví zásilku
                  </h4>
                  <p className="text-sm text-gray-600">
                    Prodejce byl informován o vaší objednávce a připraví zboží k odeslání
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Sledujte zásilku
                  </h4>
                  <p className="text-sm text-gray-600">
                    Po odeslání obdržíte trackingové číslo pro sledování zásilky
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Potvrďte převzetí
                  </h4>
                  <p className="text-sm text-gray-600">
                    Po obdržení zboží potvrďte převzetí a peníze budou uvolněny prodejci
                  </p>
                </div>
              </div>
            </div>

            {/* Escrow Protection */}
            <div className="bg-trust-50 border border-trust-200 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-trust-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-trust-900 mb-2">
                    Vaše peníze jsou v bezpečí
                  </h4>
                  <p className="text-sm text-trust-700">
                    Platba je držena v escrow systému. Prodejce obdrží peníze až po potvrzení převzetí zboží. 
                    Pokud zboží neodpovídá popisu, můžete otevřít spor a získat vrácení peněz.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href={`/objednavky/${params.id}`} className="flex-1">
                <Button variant="primary" size="lg" fullWidth className="justify-center">
                  <Package className="w-5 h-5" />
                  Zobrazit objednávku
                </Button>
              </Link>
              <Link href="/inzeraty" className="flex-1">
                <Button variant="secondary" size="lg" fullWidth className="justify-center">
                  Procházet další
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Card */}
          <div className="card-surface rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600">
              Potřebujete pomoc?{' '}
              <Link href="/podpora" className="text-primary-600 hover:text-primary-700 font-semibold">
                Kontaktujte podporu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
