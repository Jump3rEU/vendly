'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Edit, Trash2, Eye, Heart, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'

interface MyListing {
  id: string
  title: string
  price: number
  images: string[]
  status: string
  views: number
  createdAt: string
  _count: {
    likes: number
  }
}

export default function MyListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<MyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'draft'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (status === 'authenticated') {
      fetchMyListings()
    }
  }, [status, filter])

  const fetchMyListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase())
      }

      const response = await fetch(`/api/listings?sellerId=${session?.user?.id}&${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setListings(data.data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento inzerát?')) return

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setListings(listings.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Koncept', color: 'bg-gray-100 text-gray-700' },
    ACTIVE: { label: 'Aktivní', color: 'bg-trust-100 text-trust-700' },
    SOLD: { label: 'Prodáno', color: 'bg-success-100 text-success-700' },
    REMOVED: { label: 'Odstraněno', color: 'bg-danger-100 text-danger-700' },
    SUSPENDED: { label: 'Pozastaveno', color: 'bg-warning-100 text-warning-700' },
  }

  // Show loading while checking auth or if unauthenticated (redirect in progress)
  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{status === 'loading' ? 'Ověřování...' : 'Načítání inzerátů...'}</p>
        </div>
      </div>
    )
  }

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true
    return l.status === filter.toUpperCase()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Moje inzeráty
              </h1>
              <p className="text-gray-600">
                Spravujte své prodeje
              </p>
            </div>
            <Link href="/prodat">
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5" />
                Nový inzerát
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
            {[
              { value: 'all', label: 'Vše' },
              { value: 'active', label: 'Aktivní' },
              { value: 'sold', label: 'Prodané' },
              { value: 'draft', label: 'Koncepty' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap transition-smooth font-semibold ${
                  filter === f.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="card-surface rounded-xl overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/inzeraty/${listing.id}`} className="block">
                    <div className="aspect-square bg-gray-200 relative overflow-hidden group">
                      {listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg font-semibold text-sm ${statusLabels[listing.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[listing.status]?.label || listing.status}
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/inzeraty/${listing.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-smooth">
                        {listing.title}
                      </h3>
                    </Link>
                    
                    <p className="text-2xl font-bold text-primary-600 mb-3">
                      {listing.price.toLocaleString('cs-CZ')} Kč
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{listing._count.likes}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/inzeraty/${listing.id}/upravit`} className="flex-1">
                        <Button variant="secondary" size="sm" fullWidth>
                          <Edit className="w-4 h-4" />
                          Upravit
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="px-4 py-2 bg-danger-50 text-danger-600 hover:bg-danger-100 rounded-lg transition-smooth"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Žádné inzeráty
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Zatím jste nevytvořili žádný inzerát'
                  : `Nemáte žádné ${filter === 'active' ? 'aktivní' : filter === 'sold' ? 'prodané' : 'koncepty'} inzeráty`
                }
              </p>
              <Link href="/prodat">
                <Button variant="primary">
                  <Plus className="w-5 h-5" />
                  Vytvořit první inzerát
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
