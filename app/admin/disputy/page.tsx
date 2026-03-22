'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare,
  Eye, User, ShoppingCart, DollarSign
} from 'lucide-react'

interface Dispute {
  id: string
  reason: string
  description: string
  status: 'OPEN' | 'INVESTIGATING' | 'AWAITING_BUYER_RESPONSE' | 'AWAITING_SELLER_RESPONSE' | 'RESOLVED_REFUND' | 'RESOLVED_PARTIAL_REFUND' | 'RESOLVED_NO_REFUND' | 'CLOSED'
  resolution: string | null
  createdAt: string
  order: {
    id: string
    totalAmount: number
    listing: { id: string; title: string }
    buyer: { id: string; name: string | null; email: string }
    seller: { id: string; name: string | null; email: string }
  }
  initiator: { id: string; name: string | null; email: string }
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    fetchDisputes()
  }, [filter])

  async function fetchDisputes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter.toUpperCase())
      
      const res = await fetch(`/api/admin/disputes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDisputes(data.disputes || [])
      }
    } catch (error) {
      console.error('Error fetching disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(disputeId: string, decision: 'buyer' | 'seller') {
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'resolve',
          decision,
          resolution 
        })
      })
      
      if (res.ok) {
        fetchDisputes()
        setShowModal(false)
        setResolution('')
      }
    } catch (error) {
      console.error('Error resolving dispute:', error)
    }
  }

  async function handleClose(disputeId: string) {
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' })
      })
      
      if (res.ok) {
        fetchDisputes()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error closing dispute:', error)
    }
  }

  const statusFilters = ['all', 'open', 'investigating', 'closed']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Správa disputů</h1>
        <span className="text-sm text-gray-500">{disputes.length} disputů</span>
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

      {/* Disputes List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žádné disputy</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      dispute.status === 'OPEN' ? 'bg-red-100' : 
                      dispute.status === 'INVESTIGATING' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        dispute.status === 'OPEN' ? 'text-red-600' : 
                        dispute.status === 'INVESTIGATING' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dispute.reason}</h3>
                      <p className="text-sm text-gray-500">
                        #{dispute.id.slice(0, 8)} • {new Date(dispute.createdAt).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={dispute.status} />
                </div>

                <p className="text-gray-600 mb-4">{dispute.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Objednávka</p>
                      <Link href={`/admin/objednavky?id=${dispute.order.id}`} className="text-sm text-primary-600 hover:underline">
                        {dispute.order.listing.title}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Částka</p>
                      <p className="text-sm font-medium">{dispute.order.totalAmount.toLocaleString('cs-CZ')} Kč</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Strany</p>
                      <p className="text-sm">
                        {dispute.order.buyer.name || 'Kupující'} vs {dispute.order.seller.name || 'Prodejce'}
                      </p>
                    </div>
                  </div>
                </div>

                {dispute.resolution && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm text-green-800">
                      <strong>Rozhodnutí:</strong> {dispute.resolution}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setSelectedDispute(dispute); setShowModal(true); }}
                    className="px-4 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Detail & Řešení
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDispute && (
        <DisputeModal
          dispute={selectedDispute}
          resolution={resolution}
          setResolution={setResolution}
          onClose={() => { setShowModal(false); setResolution(''); }}
          onResolve={handleResolve}
          onCloseDispute={handleClose}
        />
      )}
    </div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    all: 'Všechny',
    open: 'Otevřené',
    investigating: 'Vyšetřování',
    closed: 'Uzavřené'
  }
  return labels[status] || status
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    OPEN: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Otevřený' },
    INVESTIGATING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Vyšetřování' },
    AWAITING_BUYER_RESPONSE: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Čeká na kupujícího' },
    AWAITING_SELLER_RESPONSE: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'Čeká na prodejce' },
    RESOLVED_REFUND: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Vráceno' },
    RESOLVED_PARTIAL_REFUND: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Částečně vráceno' },
    RESOLVED_NO_REFUND: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Zamítnuto' },
    CLOSED: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Uzavřený' },
  }
  
  const cfg = config[status] || config.OPEN
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function DisputeModal({ dispute, resolution, setResolution, onClose, onResolve, onCloseDispute }: {
  dispute: Dispute
  resolution: string
  setResolution: (r: string) => void
  onClose: () => void
  onResolve: (disputeId: string, decision: 'buyer' | 'seller') => void
  onCloseDispute: (disputeId: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Řešení disputu</h2>
            <StatusBadge status={dispute.status} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Důvod</h3>
            <p className="text-gray-600">{dispute.reason}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Popis</h3>
            <p className="text-gray-600">{dispute.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Kupující</h4>
              <p className="text-blue-700">{dispute.order.buyer.name || 'Bez jména'}</p>
              <p className="text-sm text-blue-600">{dispute.order.buyer.email}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-1">Prodejce</h4>
              <p className="text-orange-700">{dispute.order.seller.name || 'Bez jména'}</p>
              <p className="text-sm text-orange-600">{dispute.order.seller.email}</p>
            </div>
          </div>

          {dispute.status === 'OPEN' || dispute.status === 'INVESTIGATING' ? (
            <>
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Vaše rozhodnutí / Důvod
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Popište důvod vašeho rozhodnutí..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onResolve(dispute.id, 'buyer')}
                  disabled={!resolution}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Rozhodnout pro kupujícího
                </button>
                <button
                  onClick={() => onResolve(dispute.id, 'seller')}
                  disabled={!resolution}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Rozhodnout pro prodejce
                </button>
              </div>

              <button
                onClick={() => onCloseDispute(dispute.id)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Uzavřít bez rozhodnutí
              </button>
            </>
          ) : (
            dispute.resolution && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Rozhodnutí</h4>
                <p className="text-green-700">{dispute.resolution}</p>
              </div>
            )
          )}
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
