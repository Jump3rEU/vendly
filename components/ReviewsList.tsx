'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, Flag, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    avatar: string | null
    trustScore: number
  }
  order: {
    id: string
    listing: {
      title: string
      images: string[]
    }
  }
}

interface ReviewStats {
  avgRating: number
  totalReviews: number
  distribution: {
    [key: number]: number
  }
}

interface Props {
  userId: string
}

export default function ReviewsList({ userId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [userId])

  const fetchReviews = async (pageNum = 1) => {
    try {
      if (pageNum > 1) setLoadingMore(true)
      
      const res = await fetch(`/api/users/${userId}/reviews?page=${pageNum}&limit=10`)
      const data = await res.json()

      if (pageNum === 1) {
        setReviews(data.reviews)
        setStats(data.stats)
      } else {
        setReviews(prev => [...prev, ...data.reviews])
      }

      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleReport = async (reviewId: string) => {
    if (!confirm('Opravdu chcete nahlásit toto hodnocení?')) return

    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Hodnocení bylo nahlášeno')
      }
    } catch (error) {
      console.error('Error reporting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Zatím žádná hodnocení</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mb-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'hodnocení' : 'hodnocení'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0
              const percentage = (count / stats.totalReviews) * 100

              return (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4">
              {/* Reviewer Avatar */}
              <img
                src={review.reviewer.avatar || '/avatar-placeholder.png'}
                alt={review.reviewer.name}
                className="w-12 h-12 rounded-full"
              />

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {review.reviewer.name}
                      </h4>
                      {review.reviewer.trustScore >= 80 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <ThumbsUp className="w-3 h-3" />
                          Důvěryhodný
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: cs,
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReport(review.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Nahlásit hodnocení"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-3">{review.comment}</p>

                {/* Related Listing */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <img
                    src={review.order.listing.images[0] || '/placeholder.png'}
                    alt={review.order.listing.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="line-clamp-1">
                    {review.order.listing.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchReviews(page + 1)}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Načítání...
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Načíst další
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
