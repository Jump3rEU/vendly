'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Nastala chyba, zkuste to znovu.')
      }
    } catch {
      setError('Nepodařilo se odeslat požadavek.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link 
          href="/prihlaseni" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na přihlášení
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email odeslán!
              </h1>
              <p className="text-gray-600 mb-6">
                Pokud účet s tímto emailem existuje, odeslali jsme vám instrukce pro obnovu hesla.
                Zkontrolujte svou emailovou schránku včetně složky spam.
              </p>
              <Link href="/prihlaseni">
                <Button fullWidth>Zpět na přihlášení</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Zapomenuté heslo
                </h1>
                <p className="text-gray-600">
                  Zadejte svůj email a my vám pošleme odkaz pro obnovu hesla.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailová adresa
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="vas@email.cz"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" disabled={loading}>
                  {loading ? 'Odesílám...' : 'Odeslat instrukce'}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Vzpomněli jste si?{' '}
          <Link href="/prihlaseni" className="text-primary-600 font-medium hover:underline">
            Přihlásit se
          </Link>
        </p>
      </div>
    </div>
  )
}
