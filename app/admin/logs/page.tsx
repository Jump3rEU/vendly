'use client';

import { useState, useEffect } from 'react';
import { FileText, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';

interface AdminAction {
  id: string;
  actionType: string;
  targetUserId: string | null;
  targetListingId: string | null;
  targetOrderId: string | null;
  reason: string;
  notes: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [actionTypeFilter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (actionTypeFilter !== 'all') {
        params.set('actionType', actionTypeFilter);
      }

      const response = await fetch(`/api/admin/logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (actionType: string) => {
    const colors: Record<string, string> = {
      SUSPEND_USER: 'bg-yellow-100 text-yellow-700',
      BAN_USER: 'bg-red-100 text-red-700',
      REMOVE_LISTING: 'bg-orange-100 text-orange-700',
      RESOLVE_DISPUTE: 'bg-purple-100 text-purple-700',
      MANUAL_REFUND: 'bg-green-100 text-green-700',
      VERIFY_USER: 'bg-blue-100 text-blue-700',
      WARNING_ISSUED: 'bg-yellow-100 text-yellow-700',
    };
    return colors[actionType] || 'bg-slate-100 text-slate-700';
  };

  const formatActionType = (actionType: string) => {
    const labels: Record<string, string> = {
      SUSPEND_USER: 'Pozastavení uživatele',
      BAN_USER: 'Ban uživatele',
      REMOVE_LISTING: 'Odebrání inzerátu',
      RESOLVE_DISPUTE: 'Vyřešení sporu',
      MANUAL_REFUND: 'Manuální refundace',
      VERIFY_USER: 'Ověření uživatele',
      WARNING_ISSUED: 'Varování',
    };
    return labels[actionType] || actionType;
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
            <FileText className="w-8 h-8 text-purple-600" />
            Audit Log
          </h1>
          <p className="text-slate-600 mt-2">
            Historie všech administrátorských akcí
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={actionTypeFilter}
              onChange={(e) => {
                setActionTypeFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
            >
              <option value="all">Všechny akce</option>
              <option value="SUSPEND_USER">Pozastavení uživatele</option>
              <option value="BAN_USER">Ban uživatele</option>
              <option value="REMOVE_LISTING">Odebrání inzerátu</option>
              <option value="RESOLVE_DISPUTE">Vyřešení sporu</option>
              <option value="MANUAL_REFUND">Manuální refundace</option>
              <option value="VERIFY_USER">Ověření uživatele</option>
              <option value="WARNING_ISSUED">Varování</option>
            </select>
          </div>
        </div>

        {/* Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Načítám logy...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Žádné záznamy nenalezeny</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-slate-600">
                          {new Date(log.createdAt).toLocaleString('cs-CZ', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Admin: {log.admin.name} ({log.admin.email})
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(log.actionType)}`}
                    >
                      {formatActionType(log.actionType)}
                    </span>
                  </div>

                  <div className="pl-8">
                    <div className="font-semibold text-slate-900 mb-1">
                      {log.reason}
                    </div>
                    {log.notes && (
                      <p className="text-sm text-slate-600">{log.notes}</p>
                    )}

                    {/* Target IDs */}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      {log.targetUserId && (
                        <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          User ID: {log.targetUserId}
                        </div>
                      )}
                      {log.targetListingId && (
                        <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                          Listing ID: {log.targetListingId}
                        </div>
                      )}
                      {log.targetOrderId && (
                        <div className="px-2 py-1 bg-green-50 text-green-700 rounded">
                          Order ID: {log.targetOrderId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Předchozí
                </button>
                <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
                  Strana {page} z {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Další
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
