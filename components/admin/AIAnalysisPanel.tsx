'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, Zap, Loader2, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AIAnalysisPanelProps {
  listingId: string
}

export default function AIAnalysisPanel({ listingId }: AIAnalysisPanelProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/analyze`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setAnalysis(data.analysis)
      } else {
        alert(data.error || 'Chyba při analýze')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Nepodařilo se spustit analýzu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Analýza</h3>
            <p className="text-sm text-gray-600">Detekce podvodů a problémů</p>
          </div>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          variant="primary"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzuji...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Spustit analýzu
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4 mt-6">
          {/* Suspicion Score */}
          <div className={`p-4 rounded-lg border-2 ${
            analysis.suspicionScore >= 70 ? 'bg-red-50 border-red-200' :
            analysis.suspicionScore >= 40 ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Míra podezření</span>
              <span className={`text-2xl font-bold ${
                analysis.suspicionScore >= 70 ? 'text-red-600' :
                analysis.suspicionScore >= 40 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {analysis.suspicionScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  analysis.suspicionScore >= 70 ? 'bg-red-500' :
                  analysis.suspicionScore >= 40 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${analysis.suspicionScore}%` }}
              />
            </div>
          </div>

          {/* Quality Score */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Kvalita inzerátu</span>
              <span className="text-2xl font-bold text-blue-600">
                {analysis.qualityScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${analysis.qualityScore}%` }}
              />
            </div>
          </div>

          {/* Suspicion Reasons */}
          {analysis.suspicionReasons && analysis.suspicionReasons.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Důvody podezření
              </h4>
              <ul className="space-y-1">
                {analysis.suspicionReasons.map((reason: string, index: number) => (
                  <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scam Indicators */}
          {analysis.scamIndicators && analysis.scamIndicators.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Indikátory podvodu
              </h4>
              <div className="space-y-3">
                {analysis.scamIndicators.map((indicator: any, index: number) => (
                  <div key={index} className="bg-white rounded p-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900">{indicator.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        indicator.confidence >= 80 ? 'bg-red-100 text-red-700' :
                        indicator.confidence >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {indicator.confidence}% jistota
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Návrhy na zlepšení</h4>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded bg-white border-l-4 ${
                      suggestion.priority === 'high' ? 'border-red-500' :
                      suggestion.priority === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">{suggestion.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{suggestion.issue}</p>
                    <p className="text-sm text-gray-900">→ {suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-100 rounded p-3 text-xs text-gray-600">
            <strong>Poznámka:</strong> AI analýza je pomocný nástroj. Vždy prověřte inzerát manuálně před akcí.
          </div>
        </div>
      )}
    </div>
  )
}
