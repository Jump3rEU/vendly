'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Flag, Clock, CheckCircle, XCircle, User, Package,
  Eye, Trash2, AlertTriangle
} from 'lucide-react'

interface Report {
  id: string
  reason: string
  description: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  reporter: { id: string; name: string | null; email: string }
  reportedUser?: { id: string; name: string | null; email: string } | null
  reportedListing?: { id: string; title: string } | null
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [filter])

  async function fetchReports() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter.toUpperCase())
      
      const res = await fetch(`/api/admin/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(reportId: string, action: string) {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (res.ok) {
        fetchReports()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  async function handleDelete(reportId: string) {
    if (!confirm('Opravdu chcete smazat tento report?')) return
    
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const statusFilters = ['all', 'pending', 'reviewed', 'resolved', 'dismissed']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Správa reportů</h1>
        <span className="text-sm text-gray-500">{reports.length} reportů</span>
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

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žádné reporty</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      report.status === 'PENDING' ? 'bg-red-100' : 
                      report.status === 'REVIEWED' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <Flag className={`w-5 h-5 ${
                        report.status === 'PENDING' ? 'text-red-600' : 
                        report.status === 'REVIEWED' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.reason}</h3>
                      <p className="text-sm text-gray-500">
                        #{report.id.slice(0, 8)} • {new Date(report.createdAt).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <p className="text-gray-600 mb-4">{report.description}</p>

                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Nahlásil</p>
                      <p className="text-sm font-medium">{report.reporter.name || report.reporter.email}</p>
                    </div>
                  </div>
                  
                  {report.reportedUser && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs text-gray-500">Nahlášený uživatel</p>
                        <Link 
                          href={`/admin/uzivatele?id=${report.reportedUser.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {report.reportedUser.name || report.reportedUser.email}
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {report.reportedListing && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Nahlášený inzerát</p>
                        <Link 
                          href={`/inzerat/${report.reportedListing.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {report.reportedListing.title}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedReport(report); setShowModal(true); }}
                    className="px-4 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Zpracovat
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedReport && (
        <ReportModal
          report={selectedReport}
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
    reviewed: 'Přezkoumáno',
    resolved: 'Vyřešeno',
    dismissed: 'Zamítnuto'
  }
  return labels[status] || status
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    PENDING: { color: 'bg-red-100 text-red-700', icon: Clock, label: 'Čekající' },
    REVIEWED: { color: 'bg-yellow-100 text-yellow-700', icon: Eye, label: 'Přezkoumáno' },
    RESOLVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Vyřešeno' },
    DISMISSED: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Zamítnuto' },
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

function ReportModal({ report, onClose, onAction }: {
  report: Report
  onClose: () => void
  onAction: (reportId: string, action: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Zpracování reportu</h2>
            <StatusBadge status={report.status} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Důvod</h3>
            <p className="text-gray-600">{report.reason}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-1">Popis</h3>
            <p className="text-gray-600">{report.description}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Akce</h3>
            <div className="space-y-2">
              {report.status === 'PENDING' && (
                <button
                  onClick={() => onAction(report.id, 'review')}
                  className="w-full px-4 py-2 text-left text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                >
                  Označit jako přezkoumáno
                </button>
              )}
              <button
                onClick={() => onAction(report.id, 'resolve')}
                className="w-full px-4 py-2 text-left text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
              >
                Označit jako vyřešeno
              </button>
              <button
                onClick={() => onAction(report.id, 'dismiss')}
                className="w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Zamítnout report
              </button>
              
              {report.reportedUser && (
                <Link
                  href={`/admin/uzivatele?id=${report.reportedUser.id}`}
                  className="w-full px-4 py-2 text-left text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Zobrazit profil nahlášeného uživatele
                </Link>
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
