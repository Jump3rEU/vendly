'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  listingId: string
  initialLiked?: boolean
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  onToggle?: (liked: boolean) => void
  className?: string
}

export default function LikeButton({
  listingId,
  initialLiked = false,
  size = 'md',
  showCount = false,
  onToggle,
  className = '',
}: LikeButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (status === 'authenticated') {
      checkLikeStatus()
    }
  }, [status, listingId])

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/like`)
      const data = await res.json()
      setLiked(data.liked)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Require authentication
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
      return
    }

    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    if (showCount) {
      setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))
    }
    
    // Call parent callback
    onToggle?.(newLiked)

    setIsLoading(true)

    try {
      const res = await fetch(`/api/listings/${listingId}/like`, {
        method: 'POST',
      })

      if (!res.ok) {
        // Rollback on error
        setLiked(!newLiked)
        if (showCount) {
          setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1)
        }
        onToggle?.(!newLiked)
        
        const data = await res.json()
        console.error('Like error:', data.error)
      }
    } catch (error) {
      // Rollback on error
      setLiked(!newLiked)
      if (showCount) {
        setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1)
      }
      onToggle?.(!newLiked)
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        bg-white rounded-full shadow-md 
        flex items-center justify-center
        hover:bg-gray-50 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${liked ? 'scale-110' : 'scale-100'}
        ${className}
      `}
      title={liked ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
    >
      <Heart
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${liked ? 'text-red-500 fill-red-500' : 'text-gray-600'}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      {showCount && likeCount > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {likeCount}
        </span>
      )}
    </button>
  )
}
