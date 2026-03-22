'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Package, ShoppingCart, AlertTriangle, TrendingUp, 
  TrendingDown, DollarSign, Eye, Clock, CheckCircle, XCircle,
  ArrowRight, Zap
} from 'lucide-react'

interface Stats {
  users: { total: number; new: number; active: number }
  listings: { total: number; active: number; pending: number }
  orders: { total: number; pending: number; completed: number; revenue: number }
  disputes: { total: number; open: number; resolved: number }
}

interface RecentActivity {
  id: string
  type: 'user' | 'listing' | 'order' | 'dispute'
  message: string
  time: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentActivity(data.recentActivity || [])
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Poslední aktualizace: {new Date().toLocaleString('cs-CZ')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Uživatelé"
          value={stats?.users.total || 0}
          change={stats?.users.new || 0}
          changeLabel="nových dnes"
          icon={Users}
          color="blue"
          href="/admin/uzivatele"
        />
        <StatCard
          title="Inzeráty"
          value={stats?.listings.total || 0}
          change={stats?.listings.pending || 0}
          changeLabel="čeká na schválení"
          icon={Package}
          color="green"
          href="/admin/inzeraty"
        />
        <StatCard
          title="Objednávky"
          value={stats?.orders.total || 0}
          change={stats?.orders.pending || 0}
          changeLabel="probíhajících"
          icon={ShoppingCart}
          color="purple"
          href="/admin/objednavky"
        />
        <StatCard
          title="Disputy"
          value={stats?.disputes.total || 0}
          change={stats?.disputes.open || 0}
          changeLabel="otevřených"
          icon={AlertTriangle}
          color="red"
          href="/admin/disputy"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">Celkové tržby (tento měsíc)</p>
            <p className="text-4xl font-bold mt-1">
              {(stats?.orders.revenue || 0).toLocaleString('cs-CZ')} Kč
            </p>
            <p className="text-primary-200 text-sm mt-2">
              {stats?.orders.completed || 0} dokončených objednávek
            </p>
          </div>
          <DollarSign className="w-16 h-16 text-primary-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" />
            Rychlé akce
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <QuickAction
              href="/admin/inzeraty?status=pending"
              label="Schválit inzeráty"
              count={stats?.listings.pending || 0}
              icon={Package}
              color="green"
            />
            <QuickAction
              href="/admin/disputy?status=open"
              label="Vyřešit disputy"
              count={stats?.disputes.open || 0}
              icon={AlertTriangle}
              color="red"
            />
            <QuickAction
              href="/admin/users?verification=pending"
              label="Ověřit uživatele"
              count={0}
              icon={Users}
              color="blue"
            />
            <QuickAction
              href="/admin/objednavky?status=disputed"
              label="Problémové objednávky"
              count={stats?.disputes.open || 0}
              icon={ShoppingCart}
              color="purple"
            />
            <QuickAction
              href="/admin/reports"
              label="Nahlášený obsah"
              count={0}
              icon={AlertTriangle}
              color="red"
            />
            <QuickAction
              href="/admin/logs"
              label="Systémové logy"
              count={0}
              icon={Eye}
              color="blue"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Poslední aktivita
          </h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Žádná nedávná aktivita</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Stav systému
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SystemStatus label="Databáze" status="ok" />
          <SystemStatus label="Redis Cache" status="ok" />
          <SystemStatus label="Cloudinary" status="ok" />
          <SystemStatus label="Stripe API" status="ok" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, changeLabel, icon: Icon, color, href }: {
  title: string
  value: number
  change: number
  changeLabel: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'red'
  href: string
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Link href={href} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('cs-CZ')}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      {change > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{change}</span> {changeLabel}
        </p>
      )}
    </Link>
  )
}

function QuickAction({ href, label, count, icon: Icon, color }: {
  href: string
  label: string
  count: number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {count > 0 && (
          <p className="text-sm text-gray-500">{count} čekajících</p>
        )}
      </div>
    </Link>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    user: <Users className="w-4 h-4 text-blue-600" />,
    listing: <Package className="w-4 h-4 text-green-600" />,
    order: <ShoppingCart className="w-4 h-4 text-purple-600" />,
    dispute: <AlertTriangle className="w-4 h-4 text-red-600" />,
  }
  
  return (
    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
      {icons[type as keyof typeof icons] || <Clock className="w-4 h-4 text-gray-600" />}
    </div>
  )
}

function SystemStatus({ label, status }: { label: string; status: 'ok' | 'warning' | 'error' }) {
  const statusConfig = {
    ok: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, text: 'Online' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, text: 'Pomalý' },
    error: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, text: 'Offline' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-900">{label}</span>
      <div className={`flex items-center gap-2 px-3 py-1 ${config.bg} rounded-full`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
      </div>
    </div>
  )
}
