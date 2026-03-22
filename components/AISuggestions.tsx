'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sparkles, AlertTriangle, CheckCircle, Lightbulb, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AISuggestionsProps {
  listingId: string
  onApplySuggestion?: (field: string, value: string) => void
}

export default function AISuggestions({ listingId, onApplySuggestion }: AISuggestionsProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [error, setError] = useState('')

  const fetchSuggestions = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/listings/${listingId}/suggestions`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst návrhy')
      }

      setSuggestions(data.suggestions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = (field: string, value: string) => {
    onApplySuggestion?.(field, value)
  }

  if (!session) return null

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">AI Návrhy na zlepšení</h3>
          <p className="text-sm text-gray-600">
            Získejte návrhy jak vylepšit váš inzerát pro lepší viditelnost
          </p>
        </div>
      </div>

      {!suggestions ? (
        <Button
          onClick={fetchSuggestions}
          disabled={loading}
          variant="secondary"
          className="w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generuji návrhy...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Získat AI návrhy
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Title Suggestions */}
          {suggestions.suggestedTitles && suggestions.suggestedTitles.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Návrhy na titulek
              </h4>
              <div className="space-y-2">
                {suggestions.suggestedTitles.map((title: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 flex-1">{title}</span>
                    <button
                      onClick={() => applySuggestion('title', title)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
                    >
                      Použít
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Suggestion */}
          {suggestions.suggestedDescription && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Navrhovaný popis
              </h4>
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                {suggestions.suggestedDescription}
              </div>
              <button
                onClick={() => applySuggestion('description', suggestions.suggestedDescription)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Použít tento popis
              </button>
            </div>
          )}

          {/* Improvements */}
          {suggestions.improvements && suggestions.improvements.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Vylepšení
              </h4>
              <ul className="space-y-1">
                {suggestions.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {suggestions.warnings && suggestions.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Upozornění
              </h4>
              <ul className="space-y-1">
                {suggestions.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 bg-white rounded p-3 border border-gray-200">
            <strong>Poznámka:</strong> Tyto návrhy jsou generované AI a slouží jako inspirace. 
            Vždy zkontrolujte, že informace odpovídají skutečnosti a nevytvářejte nepravdivá tvrzení.
          </div>

          <button
            onClick={() => setSuggestions(null)}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Načíst nové návrhy
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
