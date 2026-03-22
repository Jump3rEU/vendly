'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  reportedListing: {
    id: string;
    title: string;
    status: string;
  } | null;
}

interface ResolveModalProps {
  report: Report | null;
  onClose: () => void;
  onConfirm: (status: string, resolution: string) => void;
}

function ResolveModal({ report, onClose, onConfirm }: ResolveModalProps) {
  const [status, setStatus] = useState('RESOLVED');
  const [resolution, setResolution] = useState('');

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Vyřešit nahlášení
        </h3>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
          <div><strong>Důvod:</strong> {report.reason}</div>
          <div><strong>Popis:</strong> {report.description}</div>
          {report.reportedListing && (
            <div><strong>Inzerát:</strong> {report.reportedListing.title}</div>
          )}
          {report.reportedUser && (
            <div><strong>Nahlášený uživatel:</strong> {report.reportedUser.name}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Rozhodnutí *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="RESOLVED">Vyřešeno - akce provedena</option>
            <option value="DISMISSED">Zamítnuto - neoprávněné</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Zdůvodnění *
          </label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
            placeholder="Popište, jaká akce byla provedena nebo proč bylo nahlášení zamítnuto..."
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Zrušit
          </button>
          <button
            onClick={() => {
              if (!resolution.trim()) {
                alert('Zdůvodnění je povinné');
                return;
              }
              onConfirm(status, resolution);
            }}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Vyřešit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (status: string, resolution: string) => {
    if (!selectedReport) return;

    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Chyba: ${error.error}`);
        return;
      }

      alert('Nahlášení vyřešeno');
      setShowModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Nepodařilo se vyřešit nahlášení');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      INVESTIGATING: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      DISMISSED: 'bg-slate-100 text-slate-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      SCAM: 'bg-red-100 text-red-700',
      FAKE_LISTING: 'bg-orange-100 text-orange-700',
      INAPPROPRIATE_CONTENT: 'bg-purple-100 text-purple-700',
      PROHIBITED_ITEM: 'bg-red-100 text-red-700',
      HARASSMENT: 'bg-pink-100 text-pink-700',
      FRAUD: 'bg-red-100 text-red-700',
      OTHER: 'bg-slate-100 text-slate-700',
    };
    return colors[reason] || 'bg-slate-100 text-slate-700';
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
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            Nahlášení
          </h1>
          <p className="text-slate-600 mt-2">
            Správa nahlášených uživatelů, inzerátů a zpráv
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
            <option value="PENDING">Čekající</option>
            <option value="INVESTIGATING">Vyšetřování</option>
            <option value="RESOLVED">Vyřešeno</option>
            <option value="DISMISSED">Zamítnuto</option>
          </select>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Načítám nahlášení...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Žádná nahlášení nenalezena</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReasonBadge(report.reason)}`}>
                        {report.reason.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-900 mb-4">{report.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Nahlásil</div>
                    <div className="font-medium text-slate-900">{report.reporter.name}</div>
                    <div className="text-sm text-slate-600">{report.reporter.email}</div>
                  </div>

                  {report.reportedUser && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-xs font-semibold text-red-600 mb-1">Nahlášený uživatel</div>
                      <div className="font-medium text-slate-900">{report.reportedUser.name}</div>
                      <div className="text-sm text-slate-600">{report.reportedUser.email}</div>
                    </div>
                  )}

                  {report.reportedListing && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs font-semibold text-orange-600 mb-1">Nahlášený inzerát</div>
                      <div className="font-medium text-slate-900">{report.reportedListing.title}</div>
                      <div className="text-sm text-slate-600">Status: {report.reportedListing.status}</div>
                    </div>
                  )}
                </div>

                {report.resolution && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4">
                    <div className="text-xs font-semibold text-blue-600 mb-1">Rozhodnutí</div>
                    <p className="text-sm text-slate-900">{report.resolution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Vytvořeno: {new Date(report.createdAt).toLocaleString('cs-CZ')}
                    {report.resolvedAt && (
                      <> • Vyřešeno: {new Date(report.resolvedAt).toLocaleString('cs-CZ')}</>
                    )}
                  </div>
                  {report.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Vyřešit
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
          report={selectedReport}
          onClose={() => {
            setShowModal(false);
            setSelectedReport(null);
          }}
          onConfirm={handleResolve}
        />
      )}
    </div>
  );
}
