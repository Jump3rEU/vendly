'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, Check, Settings, X } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const save = (analytics: boolean, marketing: boolean) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true, analytics, marketing,
      timestamp: new Date().toISOString(),
    }))
    setIsVisible(false)
  }

  if (!isVisible) return null

  if (showDetails) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Nastavení cookies</h3>
            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Nezbytné</p>
                <p className="text-xs text-gray-500">Přihlášení, bezpečnost</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Vždy aktivní</span>
            </div>
            <label className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">Analytické</p>
                <p className="text-xs text-gray-500">Statistiky návštěvnosti</p>
              </div>
              <input type="checkbox" checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded" />
            </label>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">Marketingové</p>
                <p className="text-xs text-gray-500">Personalizovaný obsah</p>
              </div>
              <input type="checkbox" checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => save(preferences.analytics, preferences.marketing)}
              className="flex-1 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-colors">
              Uložit
            </button>
            <button onClick={() => save(true, true)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Přijmout vše
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Cookie className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <p className="text-xs text-gray-300 leading-snug">
              Používáme cookies pro zlepšení vašeho zážitku.{' '}
              <Link href="/pravni/cookies" className="text-rose-400 hover:text-rose-300 underline">
                Více info
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => save(false, false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors">
              Nezbytné
            </button>
            <button onClick={() => setShowDetails(true)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Nastavení
            </button>
            <button onClick={() => save(true, true)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
              <Check className="w-3 h-3" />
              Přijmout vše
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
