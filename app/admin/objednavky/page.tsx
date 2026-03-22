'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, ShoppingCart, Clock, CheckCircle, XCircle, Truck,
  Eye, AlertTriangle, DollarSign, Package, User
} from 'lucide-react'

interface Order {
  id: string
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  totalAmount: number
  createdAt: string
  buyer: { id: string; name: string | null; email: string }
  seller: { id: string; name: string | null; email: string }
  listing: { id: string; title: string; price: number }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  async function fetchOrders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter.toUpperCase())
      
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string, orderId: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (res.ok) {
        fetchOrders()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  const statusFilters = ['all', 'pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Správa objednávek</h1>
        <span className="text-sm text-gray-500">{orders.length} objednávek</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objednávka</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Položka</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kupující</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodejce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Částka</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Žádné objednávky
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-mono text-sm text-gray-600">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/inzerat/${order.listing.id}`}
                        className="text-sm text-gray-900 hover:text-primary-600"
                      >
                        {order.listing.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{order.buyer.name || 'Bez jména'}</p>
                        <p className="text-gray-500">{order.buyer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{order.seller.name || 'Bez jména'}</p>
                        <p className="text-gray-500">{order.seller.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {order.totalAmount.toLocaleString('cs-CZ')} Kč
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    all: 'Všechny',
    pending: 'Čekající',
    paid: 'Zaplaceno',
    shipped: 'Odesláno',
    delivered: 'Doručeno',
    completed: 'Dokončeno',
    cancelled: 'Zrušeno',
    refunded: 'Vráceno'
  }
  return labels[status] || status
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Čekající' },
    PAID: { color: 'bg-blue-100 text-blue-700', icon: DollarSign, label: 'Zaplaceno' },
    SHIPPED: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Odesláno' },
    DELIVERED: { color: 'bg-green-100 text-green-700', icon: Package, label: 'Doručeno' },
    COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Dokončeno' },
    CANCELLED: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Zrušeno' },
    REFUNDED: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Vráceno' },
  }
  
  const cfg = config[status] || config.PENDING
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function OrderModal({ order, onClose, onAction }: {
  order: Order
  onClose: () => void
  onAction: (action: string, orderId: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail objednávky</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">ID objednávky</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Částka</span>
            <span className="font-bold text-lg">{order.totalAmount.toLocaleString('cs-CZ')} Kč</span>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Položka</h3>
            <Link href={`/inzerat/${order.listing.id}`} className="text-primary-600 hover:underline">
              {order.listing.title}
            </Link>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Kupující</h3>
            <p>{order.buyer.name || 'Bez jména'}</p>
            <p className="text-sm text-gray-500">{order.buyer.email}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Prodejce</h3>
            <p>{order.seller.name || 'Bez jména'}</p>
            <p className="text-sm text-gray-500">{order.seller.email}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Změnit status</h3>
            <div className="grid grid-cols-2 gap-2">
              {order.status !== 'COMPLETED' && (
                <button
                  onClick={() => onAction('complete', order.id)}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Dokončit
                </button>
              )}
              {order.status !== 'CANCELLED' && (
                <button
                  onClick={() => onAction('cancel', order.id)}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Zrušit
                </button>
              )}
              {order.status === 'PAID' && (
                <button
                  onClick={() => onAction('ship', order.id)}
                  className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Odesláno
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button
                  onClick={() => onAction('deliver', order.id)}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Doručeno
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  )
}
