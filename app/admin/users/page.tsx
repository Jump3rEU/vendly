'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  trustScore: number;
  totalSales: number;
  totalPurchases: number;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    listings: number;
    orders: number;
    reviews: number;
    reports: number;
  };
}

interface SuspendModalProps {
  user: User | null;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
  action: 'suspend' | 'ban' | 'unsuspend';
}

function SuspendModal({ user, onClose, onConfirm, action }: SuspendModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!user) return null;

  const titles = {
    suspend: 'Pozastavit účet',
    ban: 'Trvale zakázat účet',
    unsuspend: 'Obnovit účet',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          {titles[action]}
        </h3>
        <p className="text-slate-600 mb-4">
          Uživatel: <strong>{user.name}</strong> ({user.email})
        </p>

        {action !== 'unsuspend' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Důvod *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Porušení pravidel, spam, podvod..."
              required
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Poznámky
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={3}
            placeholder="Interní poznámky pro audit log..."
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
            onClick={() => onConfirm(reason, notes)}
            disabled={action !== 'unsuspend' && !reason}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              action === 'ban'
                ? 'bg-red-600 hover:bg-red-700'
                : action === 'suspend'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Potvrdit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'ban' | 'unsuspend' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'suspend' | 'ban' | 'unsuspend', user: User) => {
    setSelectedUser(user);
    setModalAction(action);
  };

  const confirmAction = async (reason: string, notes: string) => {
    if (!selectedUser || !modalAction) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/${modalAction}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Admin action', notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Chyba: ${error.error}`);
        return;
      }

      alert('Akce provedena úspěšně');
      setModalAction(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Nepodařilo se provést akci');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      SUSPENDED: 'bg-yellow-100 text-yellow-700',
      BANNED: 'bg-red-100 text-red-700',
      PENDING_VERIFICATION: 'bg-blue-100 text-blue-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      SELLER: 'bg-blue-100 text-blue-700',
      USER: 'bg-slate-100 text-slate-700',
      SUSPENDED: 'bg-red-100 text-red-700',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
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
            <Users className="w-8 h-8 text-purple-600" />
            Správa uživatelů
          </h1>
          <p className="text-slate-600 mt-2">
            Pozastavení účtů, ban, správa oprávnění
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Hledat podle jména nebo emailu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
            >
              <option value="all">Všechny stavy</option>
              <option value="ACTIVE">Aktivní</option>
              <option value="SUSPENDED">Pozastavené</option>
              <option value="BANNED">Zakázané</option>
              <option value="PENDING_VERIFICATION">Čekající ověření</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Načítám uživatele...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Žádní uživatelé nenalezeni</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Uživatel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Role / Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Statistiky
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Důvěryhodnost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Registrován: {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="text-slate-900">{user._count.listings} inzerátů</div>
                          <div className="text-slate-600">{user.totalSales} prodejů</div>
                          <div className="text-slate-600">{user._count.reports} nahlášení</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.trustScore >= 4 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : user.trustScore >= 3 ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-semibold text-slate-900">
                            {user.trustScore.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'ADMIN' && (
                          <div className="flex justify-end gap-2">
                            {user.status === 'SUSPENDED' ? (
                              <button
                                onClick={() => handleAction('unsuspend', user)}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                              >
                                Obnovit
                              </button>
                            ) : user.status !== 'BANNED' ? (
                              <>
                                <button
                                  onClick={() => handleAction('suspend', user)}
                                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                                >
                                  Pozastavit
                                </button>
                                <button
                                  onClick={() => handleAction('ban', user)}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                >
                                  Zakázat
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-slate-500">Zakázaný účet</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Suspend/Ban Modal */}
      {modalAction && (
        <SuspendModal
          user={selectedUser}
          action={modalAction}
          onClose={() => {
            setModalAction(null);
            setSelectedUser(null);
          }}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}
