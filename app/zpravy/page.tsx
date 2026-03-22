'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle, Search, Package, Shield, Clock, User as UserIcon, ChevronRight,
  Filter, DollarSign, ShoppingCart, Inbox, AlertCircle
} from 'lucide-react'

// Filter types for conversations
type ConversationFilter = 'all' | 'unread' | 'offers' | 'orders' | 'buying' | 'selling'

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar: string | null
    trustScore: number
  }
  listing: {
    id: string
    title: string
    thumbnailUrl: string | null
    images: string[]
    price: number
    status: string
    sellerId: string
  } | null
  order: {
    id: string
    orderNumber: string
    status: string
  } | null
  lastMessage: {
    id: string
    content: string
    type: string
    createdAt: string
    senderId: string
    read: boolean
  } | null
  unreadCount: number
  lastMessageAt: string
  hasActiveOffer?: boolean
}

const filterConfig: { value: ConversationFilter; label: string; icon: any }[] = [
  { value: 'all', label: 'Všechny', icon: Inbox },
  { value: 'unread', label: 'Nepřečtené', icon: AlertCircle },
  { value: 'offers', label: 'Nabídky', icon: DollarSign },
  { value: 'orders', label: 'Objednávky', icon: ShoppingCart },
  { value: 'buying', label: 'Nakupuji', icon: Package },
  { value: 'selling', label: 'Prodávám', icon: Package },
]

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (status === 'authenticated') {
      fetchConversations()
    }
  }, [status])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        conv.otherUser.name.toLowerCase().includes(query) ||
        conv.listing?.title.toLowerCase().includes(query)
      )
      if (!matchesSearch) return false
    }

    // Type filter
    switch (activeFilter) {
      case 'unread':
        return conv.unreadCount > 0
      case 'offers':
        return conv.lastMessage?.type === 'OFFER' || conv.hasActiveOffer
      case 'orders':
        return conv.order !== null
      case 'buying':
        // Conversations where I am the buyer (listing seller is the other user)
        return conv.listing?.sellerId === conv.otherUser.id
      case 'selling':
        // Conversations where I am the seller
        return conv.listing?.sellerId === session?.user?.id
      default:
        return true
    }
  })

  // Count for filter badges
  const getFilterCount = (filter: ConversationFilter): number => {
    return conversations.filter(conv => {
      switch (filter) {
        case 'unread':
          return conv.unreadCount > 0
        case 'offers':
          return conv.lastMessage?.type === 'OFFER' || conv.hasActiveOffer
        case 'orders':
          return conv.order !== null
        case 'buying':
          return conv.listing?.sellerId === conv.otherUser.id
        case 'selling':
          return conv.listing?.sellerId === session?.user?.id
        default:
          return true
      }
    }).length
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Právě teď'
    if (diffMins < 60) return `${diffMins} min`
    if (diffHours < 24) return `${diffHours} h`
    if (diffDays < 7) return `${diffDays} d`
    
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
  }

  // Show loading while checking auth or redirecting
  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání konverzací...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-primary-600" />
              Zprávy
            </h1>
            <p className="text-gray-600">
              Komunikujte s prodejci a kupujícími
            </p>
          </div>

          {/* Search */}
          <div className="card-surface rounded-2xl p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat konverzace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterConfig.map((filter) => {
              const count = filter.value === 'all' ? conversations.length : getFilterCount(filter.value)
              const isActive = activeFilter === filter.value
              const Icon = filter.icon
              
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                  {count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : filter.value === 'unread' 
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Conversations List */}
          {filteredConversations.length === 0 ? (
            <div className="card-surface rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || activeFilter !== 'all' 
                  ? 'Žádné konverzace nenalezeny' 
                  : 'Zatím nemáte žádné zprávy'}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchQuery || activeFilter !== 'all'
                  ? 'Zkuste změnit filtr nebo hledaný výraz'
                  : 'Začněte konverzaci s prodejcem nebo kupujícím'}
              </p>
              {!searchQuery && activeFilter === 'all' && (
                <Link href="/inzeraty">
                  <button className="btn-primary">
                    Procházet inzeráty
                  </button>
                </Link>
              )}
              {activeFilter !== 'all' && (
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="btn-secondary"
                >
                  Zobrazit všechny zprávy
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/zpravy/${conv.id}`}
                  className="card-surface rounded-2xl p-4 hover-scale group flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {conv.otherUser.avatar ? (
                        <img
                          src={conv.otherUser.avatar}
                          alt={conv.otherUser.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        conv.otherUser.name[0].toUpperCase()
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-danger-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-smooth">
                          {conv.otherUser.name}
                        </h3>
                        {conv.otherUser.trustScore >= 80 && (
                          <Shield className="w-4 h-4 text-trust-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    {/* Listing context */}
                    {conv.listing && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="truncate">{conv.listing.title}</span>
                        <span className="font-semibold text-primary-600">
                          {parseFloat(conv.listing.price.toString()).toLocaleString('cs-CZ')} Kč
                        </span>
                      </div>
                    )}

                    {/* Last message */}
                    {conv.lastMessage && (
                      <p className={`text-sm truncate ${
                        conv.unreadCount > 0 && conv.lastMessage.senderId !== session?.user?.id
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-600'
                      }`}>
                        {conv.lastMessage.type === 'OFFER' && '💰 '}
                        {conv.lastMessage.type === 'SYSTEM' && '🔔 '}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-smooth flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
