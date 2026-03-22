'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Check, Settings } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if consent was already given
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent))
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    const selectedConsent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('cookie-consent', JSON.stringify(selectedConsent))
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Používáme cookies
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Používáme cookies pro zlepšení vašeho zážitku, analýzu návštěvnosti a personalizaci obsahu. 
                Nezbytné cookies jsou vždy aktivní. Více informací najdete v našich{' '}
                <Link href="/pravni/cookies" className="text-primary-600 hover:underline">
                  zásadách používání cookies
                </Link>.
              </p>

              {/* Quick Actions */}
              {!showDetails && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Přijmout vše
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Pouze nezbytné
                  </button>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-5 py-2.5 text-gray-600 font-medium rounded-lg hover:text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Nastavení
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Settings */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Nezbytné cookies</p>
                    <p className="text-sm text-gray-500">
                      Nutné pro základní funkce webu (přihlášení, bezpečnost)
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                    Vždy aktivní
                  </div>
                </div>

                {/* Analytics Cookies */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Analytické cookies</p>
                    <p className="text-sm text-gray-500">
                      Pomáhají nám pochopit, jak používáte web
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Marketing Cookies */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Marketingové cookies</p>
                    <p className="text-sm text-gray-500">
                      Pro personalizovanou reklamu a obsah
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>

              {/* Save Preferences */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAcceptSelected}
                  className="flex-1 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Uložit nastavení
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Přijmout vše
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
