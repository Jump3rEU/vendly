'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, MoreVertical, User, Mail, Phone, Calendar,
  Shield, Ban, Trash2, Edit, Eye, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  emailVerified: Date | null
  createdAt: string
  _count: {
    listings: number
    orders: number
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState<'view' | 'edit' | 'ban' | 'delete'>('view')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter.toUpperCase())
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string, userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (res.ok) {
        fetchUsers()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  function openModal(user: UserData, type: 'view' | 'edit' | 'ban' | 'delete') {
    setSelectedUser(user)
    setActionType(type)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Správa uživatelů</h1>
        <span className="text-sm text-gray-500">{users.length} uživatelů</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat podle jména nebo emailu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'suspended', 'banned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Všichni' : f === 'active' ? 'Aktivní' : f === 'suspended' ? 'Pozastaveni' : 'Zakázáni'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uživatel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrace</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Žádní uživatelé nenalezeni
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Bez jména'}</p>
                          <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <p>{user._count.listings} inzerátů</p>
                        <p>{user._count.orders} objednávek</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <p>{new Date(user.createdAt).toLocaleDateString('cs-CZ')}</p>
                        <p className="text-xs text-gray-400">
                          {user.emailVerified ? '✓ Ověřen' : '✗ Neověřen'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user, 'view')}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Zobrazit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user, 'edit')}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Upravit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user, 'ban')}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
                          title="Zablokovat"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user, 'delete')}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <UserModal
          user={selectedUser}
          type={actionType}
          onClose={() => setShowModal(false)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    ACTIVE: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Aktivní' },
    SUSPENDED: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle, label: 'Pozastaven' },
    BANNED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Zakázán' },
  }
  
  const cfg = config[status as keyof typeof config] || config.ACTIVE
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function UserModal({ user, type, onClose, onAction }: {
  user: UserData
  type: 'view' | 'edit' | 'ban' | 'delete'
  onClose: () => void
  onAction: (action: string, userId: string) => void
}) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    role: user.role,
    status: user.status,
  })

  const titles = {
    view: 'Detail uživatele',
    edit: 'Upravit uživatele',
    ban: 'Zablokovat uživatele',
    delete: 'Smazat uživatele',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{titles[type]}</h2>
        </div>

        <div className="p-6 space-y-4">
          {type === 'view' && (
            <>
              <InfoRow label="ID" value={user.id} />
              <InfoRow label="Jméno" value={user.name || '-'} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Telefon" value={user.phone || '-'} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Status" value={user.status} />
              <InfoRow label="Registrace" value={new Date(user.createdAt).toLocaleString('cs-CZ')} />
              <InfoRow label="Email ověřen" value={user.emailVerified ? 'Ano' : 'Ne'} />
              <InfoRow label="Počet inzerátů" value={user._count.listings.toString()} />
              <InfoRow label="Počet objednávek" value={user._count.orders.toString()} />
            </>
          )}

          {type === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USER">Uživatel</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">Aktivní</option>
                  <option value="SUSPENDED">Pozastaven</option>
                  <option value="BANNED">Zakázán</option>
                </select>
              </div>
            </>
          )}

          {type === 'ban' && (
            <div className="text-center py-4">
              <Ban className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Opravdu chcete zablokovat uživatele?
              </p>
              <p className="text-gray-600 text-sm">
                {user.name || user.email}
              </p>
            </div>
          )}

          {type === 'delete' && (
            <div className="text-center py-4">
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Opravdu chcete smazat uživatele?
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {user.name || user.email}
              </p>
              <p className="text-red-600 text-sm">
                Tato akce je nevratná a smaže všechna data uživatele.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zrušit
          </button>
          {type === 'edit' && (
            <button
              onClick={() => onAction('update', user.id)}
              className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Uložit změny
            </button>
          )}
          {type === 'ban' && (
            <button
              onClick={() => onAction('ban', user.id)}
              className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Zablokovat
            </button>
          )}
          {type === 'delete' && (
            <button
              onClick={() => onAction('delete', user.id)}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Smazat trvale
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
