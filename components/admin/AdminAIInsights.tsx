'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, TrendingUp, Activity, Sparkles, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function AdminAIInsights() {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchInsights()
  }, [days])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/insights?days=${days}`)
      const data = await res.json()

      if (res.ok) {
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Načítám AI analýzu...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nepodařilo se načíst insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Insights</h2>
              <p className="text-purple-100 text-sm">
                Poslední {insights.stats?.period || '7 dní'}
              </p>
            </div>
          </div>
          <Button
            onClick={fetchInsights}
            variant="secondary"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            Obnovit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.stats?.listingsAnalyzed || 0}</div>
            <div className="text-sm text-purple-100">Inzerátů analyzováno</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.stats?.activeListings || 0}</div>
            <div className="text-sm text-purple-100">Aktivních inzerátů</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.stats?.newUsersToday || 0}</div>
            <div className="text-sm text-purple-100">Nových uživatelů dnes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.stats?.suspendedUsers || 0}</div>
            <div className="text-sm text-purple-100">Suspendovaných uživatelů</div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Celkové zhodnocení rizik</h3>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">
          {insights.insights?.overallRiskAssessment || 'Žádná data'}
        </p>
      </div>

      {/* User Behavior */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Analýza chování uživatelů</h3>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">
          {insights.insights?.userBehaviorAnalysis || 'Žádná data'}
        </p>
      </div>

      {/* Market Trends */}
      {insights.insights?.marketTrends && insights.insights.marketTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tržní trendy</h3>
          </div>
          <ul className="space-y-2">
            {insights.insights.marketTrends.map((trend: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">▶</span>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Recommendations */}
      {insights.insights?.actionRecommendations && insights.insights.actionRecommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Doporučené akce</h3>
          </div>
          <ul className="space-y-2">
            {insights.insights.actionRecommendations.map((action: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-yellow-600 mt-1">⚠</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Poznámka:</strong> {insights.disclaimer || 'AI analýza slouží jako doporučení. Vždy ověřte fakta před akcí.'}
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 justify-center">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              days === d
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d} dní
          </button>
        ))}
      </div>
    </div>
  )
}
