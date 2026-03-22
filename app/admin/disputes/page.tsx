'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  status: string;
  refundAmount: number | null;
  createdAt: string;
  resolvedAt: string | null;
  order: {
    id: string;
    totalAmount: number;
    listing: {
      title: string;
      price: number;
    };
    buyer: {
      id: string;
      name: string;
      email: string;
    };
    seller: {
      id: string;
      name: string;
      email: string;
    };
  };
  initiator: {
    id: string;
    name: string;
    email: string;
  };
}

interface ResolveModalProps {
  dispute: Dispute | null;
  onClose: () => void;
  onConfirm: (resolution: string, refundAmount: number | null, adminNotes: string) => void;
}

function ResolveModal({ dispute, onClose, onConfirm }: ResolveModalProps) {
  const [resolution, setResolution] = useState('FULL_REFUND');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  if (!dispute) return null;

  const orderTotal = Number(dispute.order.totalAmount);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Vyřešit spor
        </h3>

        {/* Dispute Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
          <div><strong>Inzerát:</strong> {dispute.order.listing.title}</div>
          <div><strong>Celková částka:</strong> {orderTotal.toLocaleString('cs-CZ')} Kč</div>
          <div><strong>Důvod sporu:</strong> {dispute.reason}</div>
          <div className="pt-2 border-t border-slate-200">
            <strong>Popis:</strong>
            <p className="text-sm text-slate-600 mt-1">{dispute.description}</p>
          </div>
        </div>

        {/* Resolution Type */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Rozhodnutí *
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="FULL_REFUND">Plná refundace kupujícímu</option>
            <option value="PARTIAL_REFUND">Částečná refundace</option>
            <option value="NO_REFUND">Bez refundace - ve prospěch prodejce</option>
          </select>
        </div>

        {/* Refund Amount */}
        {resolution === 'PARTIAL_REFUND' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Částka refundace (Kč) *
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={`Max: ${orderTotal}`}
              max={orderTotal}
              min={0}
              step="0.01"
            />
            <p className="text-xs text-slate-500 mt-1">
              Maximální částka: {orderTotal.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
        )}

        {/* Admin Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Zdůvodnění rozhodnutí *
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
            placeholder="Vysvětlete důvod vašeho rozhodnutí. Toto uvidí kupující i prodejce."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Zrušit
          </button>
          <button
            onClick={() => {
              const amount = resolution === 'PARTIAL_REFUND' ? parseFloat(refundAmount) : null;
              if (resolution === 'PARTIAL_REFUND' && (!amount || amount <= 0 || amount > orderTotal)) {
                alert('Neplatná částka refundace');
                return;
              }
              if (!adminNotes.trim()) {
                alert('Zdůvodnění je povinné');
                return;
              }
              onConfirm(resolution, amount, adminNotes);
            }}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Vyřešit spor
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/disputes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch disputes');

      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (resolution: string, refundAmount: number | null, adminNotes: string) => {
    if (!selectedDispute) return;

    try {
      const response = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution,
          refundAmount,
          adminNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Chyba: ${error.error}`);
        return;
      }

      alert('Spor vyřešen úspěšně');
      setShowModal(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Nepodařilo se vyřešit spor');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-700',
      INVESTIGATING: 'bg-yellow-100 text-yellow-700',
      AWAITING_BUYER_RESPONSE: 'bg-blue-100 text-blue-700',
      AWAITING_SELLER_RESPONSE: 'bg-blue-100 text-blue-700',
      RESOLVED_REFUND: 'bg-green-100 text-green-700',
      RESOLVED_PARTIAL_REFUND: 'bg-green-100 text-green-700',
      RESOLVED_NO_REFUND: 'bg-slate-100 text-slate-700',
      CLOSED: 'bg-slate-100 text-slate-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status: string) => {
    if (status.startsWith('RESOLVED')) return <CheckCircle className="w-5 h-5" />;
    if (status === 'CLOSED') return <XCircle className="w-5 h-5" />;
    if (status === 'OPEN') return <AlertCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="text-purple-600 hover:text-purple-800 font-medium mb-4 inline-block"
          >
            ← Zpět na dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            Správa sporů
          </h1>
          <p className="text-slate-600 mt-2">
            Řešení sporů mezi kupujícími a prodejci
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
          >
            <option value="all">Všechny stavy</option>
            <option value="OPEN">Otevřené</option>
            <option value="INVESTIGATING">Vyšetřování</option>
            <option value="AWAITING_BUYER_RESPONSE">Čeká na kupujícího</option>
            <option value="AWAITING_SELLER_RESPONSE">Čeká na prodejce</option>
            <option value="RESOLVED_REFUND">Vyřešeno - refundace</option>
            <option value="RESOLVED_PARTIAL_REFUND">Vyřešeno - částečná refundace</option>
            <option value="RESOLVED_NO_REFUND">Vyřešeno - bez refundace</option>
            <option value="CLOSED">Uzavřeno</option>
          </select>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Načítám spory...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Žádné spory nenalezeny</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {dispute.order.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(dispute.status)}`}>
                        {getStatusIcon(dispute.status)}
                        {dispute.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {Number(dispute.order.totalAmount).toLocaleString('cs-CZ')} Kč
                    </div>
                    {dispute.refundAmount && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Refundováno: {Number(dispute.refundAmount).toLocaleString('cs-CZ')} Kč
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Kupující</div>
                    <div className="font-medium text-slate-900">{dispute.order.buyer.name}</div>
                    <div className="text-sm text-slate-600">{dispute.order.buyer.email}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Prodejce</div>
                    <div className="font-medium text-slate-900">{dispute.order.seller.name}</div>
                    <div className="text-sm text-slate-600">{dispute.order.seller.email}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    Důvod sporu: {dispute.reason.replace(/_/g, ' ')}
                  </div>
                  <p className="text-sm text-slate-600">{dispute.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Vytvořeno: {new Date(dispute.createdAt).toLocaleString('cs-CZ')}
                    {dispute.resolvedAt && (
                      <> • Vyřešeno: {new Date(dispute.resolvedAt).toLocaleString('cs-CZ')}</>
                    )}
                  </div>
                  {!dispute.status.startsWith('RESOLVED') && dispute.status !== 'CLOSED' && (
                    <button
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Vyřešit spor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showModal && (
        <ResolveModal
          dispute={selectedDispute}
          onClose={() => {
            setShowModal(false);
            setSelectedDispute(null);
          }}
          onConfirm={handleResolve}
        />
      )}
    </div>
  );
}
