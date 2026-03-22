'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, User, Clock, Eye, Trash2, Search,
  AlertCircle
} from 'lucide-react'

interface Participant {
  id: string
  name: string | null
  email: string
}

interface Conversation {
  id: string
  createdAt: string
  updatedAt: string
  participant1: Participant
  participant2: Participant
  messages: {
    id: string
    content: string
    createdAt: string
    sender: { id: string; name: string | null }
  }[]
  _count: { messages: number }
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  async function fetchConversations() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(conversationId: string) {
    if (!confirm('Opravdu chcete smazat tuto konverzaci? Všechny zprávy budou smazány.')) return
    
    try {
      const res = await fetch(`/api/admin/messages/${conversationId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchConversations()
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const getParticipants = (conv: Conversation): Participant[] => {
    return [conv.participant1, conv.participant2]
  }

  const filteredConversations = conversations.filter(conv => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const participants = getParticipants(conv)
    return participants.some(p => 
      p.name?.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower)
    ) || conv.messages.some(m => m.content.toLowerCase().includes(searchLower))
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Správa zpráv</h1>
        <span className="text-sm text-gray-500">{conversations.length} konverzací</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat v konverzacích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-2">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Žádné konverzace</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
                  selectedConversation?.id === conv.id 
                    ? 'border-primary-500 ring-2 ring-primary-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {getParticipants(conv).map(p => p.name || p.email.split('@')[0]).join(' & ')}
                      </p>
                      <p className="text-xs text-gray-500">{conv._count.messages} zpráv</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {conv.messages[0] && (
                  <p className="text-sm text-gray-600 truncate">
                    {conv.messages[0].content}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(conv.updatedAt).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getParticipants(selectedConversation).map(p => p.name || p.email).join(' & ')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation._count.messages} zpráv
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getParticipants(selectedConversation).map(p => (
                      <Link
                        key={p.id}
                        href={`/admin/uzivatele?id=${p.id}`}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                      >
                        {p.name || p.email.split('@')[0]}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {msg.sender.name || 'Uživatel'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  Jako admin nemůžete psát zprávy do konverzací uživatelů
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Vyberte konverzaci pro zobrazení</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
