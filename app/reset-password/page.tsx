'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validatePasswords = () => {
    if (password.length < 8) {
      return 'Heslo musí mít alespoň 8 znaků'
    }
    if (password !== confirmPassword) {
      return 'Hesla se neshodují'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validatePasswords()
    if (validation) {
      setError(validation)
      return
    }

    if (!token) {
      setError('Chybějící reset token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/prihlaseni?message=Heslo bylo změněno')
        }, 3000)
      } else {
        setError(data.message || 'Nastala chyba při změně hesla')
      }
    } catch (err) {
      setError('Nastala chyba při změně hesla')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chybějící token</h2>
          <p className="text-gray-600 mb-6">
            Reset hesla vyžaduje platný token. Zkuste znovu požádat o reset hesla.
          </p>
          <Link
            href="/prihlaseni"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na přihlášení
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Heslo změněno!</h2>
          <p className="text-gray-600 mb-6">
            Vaše heslo bylo úspěšně změněno. Za chvilku budete přesměrováni na přihlášení.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 mx-auto mb-8 group"
          >
            <div className="w-12 h-12 bg-primary-600 rounded-[1.25rem] flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:shadow-primary-300/50 transition-all duration-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-gray-900">Vendly</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nové heslo
          </h2>
          <p className="text-gray-600">
            Zadejte své nové heslo níže
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[1rem] text-sm">
              {error}
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
              Nové heslo
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-[1.25rem] shadow-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 focus:shadow-2xl transition-all duration-500 text-base"
                placeholder="Alespoň 8 znaků"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-5 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-sm text-red-600 mt-1">Heslo musí mít alespoň 8 znaků</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
              Potvrdit heslo
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-[1.25rem] shadow-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 focus:shadow-2xl transition-all duration-500 text-base"
                placeholder="Zadejte heslo znovu"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-5 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Hesla se neshodují</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
            className="w-full py-4 text-base font-bold"
          >
            {loading ? 'Měním heslo...' : 'Změnit heslo'}
          </Button>

          {/* Back to login */}
          <div className="text-center">
            <Link
              href="/prihlaseni"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Zpět na přihlášení
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}