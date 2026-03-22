'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, XCircle, Shield,
  Filter, Search, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  listing: {
    id: string
    title: string
    images: string[]
  }
  buyer: {
    name: string
    trustScore: number
  }
  seller: {
    name: string
    trustScore: number
  }
  payment: {
    status: string
  }
}

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (sessionStatus === 'authenticated') {
      fetchOrders()
    }
  }, [sessionStatus, activeTab])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab === 'buying') params.append('type', 'buyer')
      if (activeTab === 'selling') params.append('type', 'seller')

      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (searchQuery && !order.listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING_PAYMENT: { label: 'Čeká na platbu', color: 'bg-warning-100 text-warning-700', icon: Clock },
    PAYMENT_HELD: { label: 'Platba držena', color: 'bg-trust-100 text-trust-700', icon: Shield },
    SHIPPED: { label: 'Odesláno', color: 'bg-primary-100 text-primary-700', icon: Package },
    DELIVERED: { label: 'Doručeno', color: 'bg-success-100 text-success-700', icon: Package },
    COMPLETED: { label: 'Dokončeno', color: 'bg-success-100 text-success-700', icon: CheckCircle },
    CANCELLED: { label: 'Zrušeno', color: 'bg-danger-100 text-danger-700', icon: XCircle },
    REFUNDED: { label: 'Vráceno', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  }

  // Show loading while checking auth or redirecting
  if (sessionStatus === 'loading' || sessionStatus === 'unauthenticated' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání objednávek...</p>
        </div>
      </div>
    )
  }

  const isBuyer = activeTab === 'all' || activeTab === 'buying'
  const isSeller = activeTab === 'all' || activeTab === 'selling'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Moje objednávky</h1>
            <p className="text-gray-600">
              Spravujte své nákupy a prodeje
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-smooth border-b-2 ${
                activeTab === 'all'
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Všechny
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              className={`px-6 py-3 font-semibold transition-smooth border-b-2 ${
                activeTab === 'buying'
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Moje nákupy
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-6 py-3 font-semibold transition-smooth border-b-2 ${
                activeTab === 'selling'
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Moje prodeje
            </button>
          </div>

          {/* Filters */}
          <div className="card-surface rounded-2xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hledat podle názvu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field pl-12"
                >
                  <option value="all">Všechny stavy</option>
                  <option value="PENDING_PAYMENT">Čeká na platbu</option>
                  <option value="PAYMENT_HELD">Platba držena</option>
                  <option value="SHIPPED">Odesláno</option>
                  <option value="DELIVERED">Doručeno</option>
                  <option value="COMPLETED">Dokončeno</option>
                  <option value="CANCELLED">Zrušeno</option>
                  <option value="REFUNDED">Vráceno</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="card-surface rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Žádné objednávky nenalezeny'
                  : 'Zatím nemáte žádné objednávky'
                }
              </h3>
              <p className="text-gray-600 mb-8">
                {searchQuery || statusFilter !== 'all'
                  ? 'Zkuste změnit filtry nebo hledaný výraz'
                  : 'Začněte nakupovat nebo prodávat na Vendly'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="flex gap-4 justify-center">
                  <Link href="/inzeraty">
                    <Button variant="secondary">
                      Procházet inzeráty
                    </Button>
                  </Link>
                  <Link href="/prodat">
                    <Button variant="primary">
                      Vytvořit inzerát
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING_PAYMENT
                const StatusIcon = status.icon
                const otherUser = activeTab === 'buying' ? order.seller : 
                                 activeTab === 'selling' ? order.buyer : null

                return (
                  <Link
                    key={order.id}
                    href={`/objednavky/${order.id}`}
                    className="card-surface rounded-2xl p-6 hover-scale group"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        {order.listing.images[0] ? (
                          <img
                            src={order.listing.images[0]}
                            alt={order.listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-smooth mb-1 truncate">
                              {order.listing.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Objednávka #{order.orderNumber}
                            </p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-primary-600">
                              {order.totalAmount.toLocaleString('cs-CZ')} Kč
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Status Badge */}
                            <div className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </div>

                            {/* Other User (if applicable) */}
                            {otherUser && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{activeTab === 'buying' ? 'Prodejce:' : 'Kupující:'}</span>
                                <span className="font-semibold text-gray-900">
                                  {otherUser.name}
                                </span>
                                <div className="flex items-center gap-1 text-trust-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="font-semibold">{otherUser.trustScore}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Required Badge */}
                          {order.status === 'DELIVERED' && order.payment.status === 'HELD' && activeTab === 'buying' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-warning-100 text-warning-700 rounded-lg text-sm font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              Čeká na potvrzení
                            </div>
                          )}

                          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-smooth" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
