import { useEffect, useState, useCallback } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull to refresh if at top of page
    if (window.scrollY === 0) {
      setCanPull(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull || isRefreshing) return

    const touch = e.touches[0]
    const distance = touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top

    if (distance > 0 && window.scrollY === 0) {
      // Prevent default scrolling
      e.preventDefault()
      
      // Apply resistance
      const adjustedDistance = distance / resistance
      setPullDistance(Math.min(adjustedDistance, threshold * 1.5))
    }
  }, [canPull, isRefreshing, resistance, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!canPull) return

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    setCanPull(false)
  }, [canPull, pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    pullDistance,
    isRefreshing,
    isTriggered: pullDistance >= threshold,
  }
}
