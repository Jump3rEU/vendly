'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Shield, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  clientSecret: string
  orderId: string
  amount: number
  orderNumber: string
}

function CheckoutForm({ clientSecret, orderId, amount, orderNumber }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError('')

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/objednavky/${orderId}/uspech`,
        },
      })

      if (submitError) {
        setError(submitError.message || 'Payment failed')
        setProcessing(false)
      } else {
        setSucceeded(true)
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Badge */}
      <div className="bg-trust-50 border border-trust-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-trust-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-trust-900 mb-1">
              Bezpečná platba s escrow ochranou
            </h4>
            <p className="text-sm text-trust-700">
              Peníze držíme v bezpečí, dokud nepotvrdíte převzetí zboží. Prodejce dostane platbu pouze po úspěšné transakci.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="card-surface rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Platební údaje</h3>
        </div>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-danger-900 mb-1">Chyba platby</h4>
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {succeeded && (
        <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-success-900 mb-1">Platba úspěšná!</h4>
            <p className="text-sm text-success-700">Přesměrování...</p>
          </div>
        </div>
      )}

      {/* Amount Summary */}
      <div className="card-surface rounded-xl p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Číslo objednávky</span>
            <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Celkem k úhradě</span>
            <span className="text-2xl font-bold text-gray-900">
              {amount.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!stripe || processing || succeeded}
        className="justify-center"
      >
        <Lock className="w-5 h-5" />
        {processing ? 'Zpracování...' : succeeded ? 'Hotovo!' : 'Zaplatit bezpečně'}
      </Button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL šifrování</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>PCI DSS Level 1</span>
        </div>
      </div>
    </form>
  )
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (status === 'authenticated') {
      createPayment()
    }
  }, [status, params.id])

  const createPayment = async () => {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: params.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create payment')
        setLoading(false)
        return
      }

      setClientSecret(data.data.clientSecret)
      setOrderData(data.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to initialize checkout')
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Příprava platby...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="safe-container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-danger-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-danger-900 mb-2">Chyba platby</h2>
              <p className="text-danger-700 mb-6">{error}</p>
              <Button onClick={() => router.push('/inzeraty')} variant="secondary">
                Zpět na inzeráty
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bezpečná platba
          </h1>

          {clientSecret && orderData && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#2563eb',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                orderId={orderData.orderId}
                amount={orderData.amount}
                orderNumber={orderData.orderNumber}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
