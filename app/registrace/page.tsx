'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, Check, X } from 'lucide-react'

// Password strength checker
function getPasswordStrength(password: string): { 
  score: number; 
  label: string; 
  color: string;
  checks: { label: string; passed: boolean }[]
} {
  const checks = [
    { label: 'Minimálně 8 znaků', passed: password.length >= 8 },
    { label: 'Obsahuje číslici', passed: /[0-9]/.test(password) },
    { label: 'Obsahuje velké písmeno', passed: /[A-Z]/.test(password) },
    { label: 'Obsahuje malé písmeno', passed: /[a-z]/.test(password) },
    { label: 'Obsahuje speciální znak', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  
  const score = checks.filter(c => c.passed).length
  
  let label = 'Velmi slabé'
  let color = 'bg-red-500'
  
  if (score === 5) {
    label = 'Velmi silné'
    color = 'bg-green-500'
  } else if (score >= 4) {
    label = 'Silné'
    color = 'bg-green-400'
  } else if (score >= 3) {
    label = 'Střední'
    color = 'bg-yellow-500'
  } else if (score >= 2) {
    label = 'Slabé'
    color = 'bg-orange-500'
  }
  
  return { score, label, color, checks }
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují')
      setLoading(false)
      return
    }

    // Validate password strength (at least 3 requirements met)
    if (passwordStrength.score < 3) {
      setError('Heslo je příliš slabé. Splňte alespoň 3 požadavky.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Nastala chyba při registraci')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/prihlaseni')
      }, 2000)
    } catch (err) {
      setError('Nastala chyba při registraci')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20">
      <div className="safe-container">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10">            <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl shadow-primary-200/50 mb-6">
              <User className="w-8 h-8 text-white" />
            </div>            <h1 className="text-5xl font-black text-gray-900 mb-4">
              Registrace
            </h1>
            <p className="text-lg text-gray-600">
              Vytvořte si účet a začněte prodávat
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-trust-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Registrace úspěšná!
                </h3>
                <p className="text-gray-600">
                  Přesměrováváme vás na přihlášení...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-danger-900">{error}</p>
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Celé jméno
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="Jan Novák"
                      required
                      disabled={loading}
                      minLength={2}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="vas@email.cz"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Telefon (volitelné)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="+420 123 456 789"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Heslo
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setShowPasswordRequirements(true)}
                      onBlur={() => setShowPasswordRequirements(false)}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-20 text-right">
                          {passwordStrength.label}
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      {showPasswordRequirements && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                          {passwordStrength.checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {check.passed ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-gray-400" />
                              )}
                              <span className={check.passed ? 'text-green-700' : 'text-gray-500'}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                    Potvrzení hesla
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Vytváření účtu...' : 'Vytvořit účet'}
                </Button>

                {/* Terms Agreement */}
                <p className="text-xs text-gray-500 text-center">
                  Registrací souhlasíte s našimi{' '}
                  <Link href="/pravni/obchodni-podminky" className="text-primary-600 hover:text-primary-700">
                    obchodními podmínkami
                  </Link>{' '}
                  a{' '}
                  <Link href="/pravni/ochrana-osobnich-udaju" className="text-primary-600 hover:text-primary-700">
                    zásadami ochrany osobních údajů
                  </Link>
                </p>
              </form>
            )}

            {!success && (
              <>
                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Už máte účet?</span>
                  </div>
                </div>

                {/* Login Link */}
                <Link href="/prihlaseni">
                  <Button variant="secondary" size="lg" fullWidth>
                    Přihlásit se
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
