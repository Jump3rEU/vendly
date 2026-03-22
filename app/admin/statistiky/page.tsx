'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react'

interface Stats {
  users: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  listings: {
    total: number
    active: number
    thisMonth: number
    growth: number
  }
  orders: {
    total: number
    completed: number
    thisMonth: number
    growth: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  topCategories: { name: string; count: number }[]
  recentActivity: { date: string; users: number; orders: number; revenue: number }[]
}

export default function AdminStatistics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchStats()
  }, [period])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/statistics?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Statistiky</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistiky</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Týden' : p === 'month' ? 'Měsíc' : 'Rok'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Uživatelé"
          value={stats.users.total}
          change={stats.users.growth}
          subtitle={`+${stats.users.thisMonth} tento měsíc`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Inzeráty"
          value={stats.listings.total}
          change={stats.listings.growth}
          subtitle={`${stats.listings.active} aktivních`}
          icon={Package}
          color="green"
        />
        <StatCard
          title="Objednávky"
          value={stats.orders.total}
          change={stats.orders.growth}
          subtitle={`${stats.orders.completed} dokončených`}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Tržby"
          value={stats.revenue.total}
          change={stats.revenue.growth}
          subtitle={`${stats.revenue.thisMonth.toLocaleString('cs-CZ')} Kč tento měsíc`}
          icon={DollarSign}
          color="orange"
          isCurrency
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aktivita</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity.map((day, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-20">{day.date}</span>
                <div className="flex-1 flex gap-2">
                  <div 
                    className="h-6 bg-blue-200 rounded"
                    style={{ width: `${Math.min(day.users * 5, 100)}%` }}
                    title={`${day.users} uživatelů`}
                  />
                  <div 
                    className="h-6 bg-green-200 rounded"
                    style={{ width: `${Math.min(day.orders * 10, 100)}%` }}
                    title={`${day.orders} objednávek`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span className="text-sm text-gray-500">Noví uživatelé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span className="text-sm text-gray-500">Objednávky</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top kategorie</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((cat, i) => {
                const maxCount = Math.max(...stats.topCategories.map(c => c.count))
                const percentage = (cat.count / maxCount) * 100
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm text-gray-500">{cat.count} inzerátů</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Žádné kategorie</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Porovnání tržeb</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Minulý měsíc</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.revenue.lastMonth.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
          <div className="text-center p-6 bg-primary-50 rounded-xl">
            <p className="text-sm text-primary-600 mb-2">Tento měsíc</p>
            <p className="text-3xl font-bold text-primary-700">
              {stats.revenue.thisMonth.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Celkem</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.revenue.total.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Průměrná hodnota objednávky" value={
          stats.orders.total > 0 
            ? `${Math.round(stats.revenue.total / stats.orders.total).toLocaleString('cs-CZ')} Kč`
            : '0 Kč'
        } />
        <QuickStat label="Konverzní poměr" value={
          stats.users.total > 0 
            ? `${((stats.orders.total / stats.users.total) * 100).toFixed(1)}%`
            : '0%'
        } />
        <QuickStat label="Průměr inzerátů na uživatele" value={
          stats.users.total > 0 
            ? (stats.listings.total / stats.users.total).toFixed(1)
            : '0'
        } />
        <QuickStat label="Úspěšnost objednávek" value={
          stats.orders.total > 0 
            ? `${((stats.orders.completed / stats.orders.total) * 100).toFixed(1)}%`
            : '0%'
        } />
      </div>
    </div>
  )
}

function StatCard({ title, value, change, subtitle, icon: Icon, color, isCurrency }: {
  title: string
  value: number
  change: number
  subtitle: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
  isCurrency?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {isCurrency ? `${value.toLocaleString('cs-CZ')} Kč` : value.toLocaleString('cs-CZ')}
      </p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}
