'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Send, ArrowLeft, Package, Shield, TrendingUp, MoreVertical,
  AlertTriangle, DollarSign, CheckCircle, XCircle, Clock, User as UserIcon
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface Message {
  id: string
  content: string
  type: string
  createdAt: string
  senderId: string
  read: boolean
  sender: {
    id: string
    name: string
    avatar: string | null
  }
  offer?: {
    id: string
    offerPrice: number
    status: string
    listing: {
      id: string
      title: string
      price: number
    }
  }
}

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
  messages: Message[]
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversation()
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setConversation(data.data)
      } else {
        router.push('/zpravy')
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
      router.push('/zpravy')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          type: 'TEXT',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.data],
        } : null)
        setNewMessage('')
      } else {
        alert(data.error || 'Nepodařilo se odeslat zprávu')
      }
    } catch (error) {
      alert('Nastala chyba')
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Dnes'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Včera'
    } else {
      return date.toLocaleDateString('cs-CZ', { 
        day: 'numeric', 
        month: 'long' 
      })
    }
  }

  const renderMessage = (message: Message, index: number, messages: Message[]) => {
    const isOwn = message.senderId === session?.user?.id
    const showDate = index === 0 || 
      new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString()

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <div className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
              {formatMessageDate(message.createdAt)}
            </div>
          </div>
        )}

        <div className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {!isOwn && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                message.sender.name[0].toUpperCase()
              )}
            </div>
          )}

          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
            {message.type === 'OFFER' && message.offer ? (
              <div className={`px-4 py-3 rounded-2xl ${
                isOwn 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Nabídka ceny</span>
                </div>
                <p className="text-2xl font-bold mb-1">
                  {parseFloat(message.offer.offerPrice.toString()).toLocaleString('cs-CZ')} Kč
                </p>
                <p className="text-sm opacity-90">
                  původní: {parseFloat(message.offer.listing.price.toString()).toLocaleString('cs-CZ')} Kč
                </p>
                {message.content && (
                  <p className="mt-2 text-sm">{message.content}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {message.offer.status === 'PENDING' && (
                    <>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Čeká na odpověď</span>
                    </>
                  )}
                  {message.offer.status === 'ACCEPTED' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-sm">Přijato</span>
                    </>
                  )}
                  {message.offer.status === 'REJECTED' && (
                    <>
                      <XCircle className="w-4 h-4 text-danger-600" />
                      <span className="text-sm">Odmítnuto</span>
                    </>
                  )}
                </div>
              </div>
            ) : message.type === 'SYSTEM' ? (
              <div className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl text-center">
                {message.content}
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-2xl ${
                isOwn 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwn && (
                <span>{message.read ? '✓✓' : '✓'}</span>
              )}
            </div>
          </div>

          {isOwn && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání konverzace...</p>
        </div>
      </div>
    )
  }

  if (!conversation) return null

  const isSeller = conversation.listing?.sellerId === session?.user?.id
  const canMakeOffer = conversation.listing && !isSeller && conversation.listing.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="safe-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="touch-target flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-smooth"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <Link href={`/profil/${conversation.otherUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-smooth">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {conversation.otherUser.avatar ? (
                    <img
                      src={conversation.otherUser.avatar}
                      alt={conversation.otherUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    conversation.otherUser.name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    {conversation.otherUser.name}
                    {conversation.otherUser.trustScore >= 80 && (
                      <Shield className="w-4 h-4 text-trust-600" />
                    )}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-trust-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-semibold">{conversation.otherUser.trustScore}</span>
                  </div>
                </div>
              </Link>
            </div>

            {conversation.listing && (
              <Link
                href={`/inzeraty/${conversation.listing.id}`}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-smooth"
              >
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Zobrazit inzerát</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Listing Banner */}
      {conversation.listing && (
        <div className="bg-white border-b border-gray-200">
          <div className="safe-container py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {conversation.listing.images[0] || conversation.listing.thumbnailUrl ? (
                  <img
                    src={conversation.listing.images[0] || conversation.listing.thumbnailUrl || ''}
                    alt={conversation.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{conversation.listing.title}</p>
                <p className="text-sm text-primary-600 font-bold">
                  {parseFloat(conversation.listing.price.toString()).toLocaleString('cs-CZ')} Kč
                </p>
              </div>
              {canMakeOffer && (
                <Button
                  onClick={() => setShowOfferModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  <DollarSign className="w-4 h-4" />
                  Nabídnout cenu
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="safe-container py-6">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Zatím žádné zprávy</p>
              <p className="text-sm text-gray-500 mt-1">Začněte konverzaci</p>
            </div>
          ) : (
            conversation.messages.map((message, index) => 
              renderMessage(message, index, conversation.messages)
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="safe-container py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napište zprávu..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="touch-target flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && conversation.listing && (
        <OfferModal
          listing={conversation.listing}
          conversationId={conversation.id}
          onClose={() => setShowOfferModal(false)}
          onOfferSent={() => {
            setShowOfferModal(false)
            fetchConversation()
          }}
        />
      )}
    </div>
  )
}

function OfferModal({
  listing,
  conversationId,
  onClose,
  onOfferSent,
}: {
  listing: any
  conversationId: string
  onClose: () => void
  onOfferSent: () => void
}) {
  const [offerPrice, setOfferPrice] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentPrice = parseFloat(listing.price.toString())
  const offerValue = parseFloat(offerPrice) || 0
  const discount = currentPrice > 0 ? ((currentPrice - offerValue) / currentPrice * 100).toFixed(0) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (offerValue <= 0 || offerValue >= currentPrice) {
      alert('Nabídka musí být větší než 0 a menší než aktuální cena')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          offerPrice: offerValue,
          message,
          conversationId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onOfferSent()
      } else {
        alert(data.error || 'Nepodařilo se odeslat nabídku')
      }
    } catch (error) {
      alert('Nastala chyba')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Nabídnout cenu</h3>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">{listing.title}</p>
          <p className="text-xl font-bold text-gray-900">
            {currentPrice.toLocaleString('cs-CZ')} Kč
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Vaše nabídka
            </label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="0"
              className="input-field text-2xl font-bold"
              min="1"
              max={currentPrice - 1}
              required
            />
            {offerValue > 0 && offerValue < currentPrice && (
              <p className="text-sm text-success-600 mt-2">
                Sleva {discount}% (úspora {(currentPrice - offerValue).toLocaleString('cs-CZ')} Kč)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Zpráva (nepovinné)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Můžete přidat zprávu k vaší nabídce..."
              className="input-field"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={submitting || offerValue <= 0 || offerValue >= currentPrice}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? 'Odesílání...' : 'Odeslat nabídku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
