import { RefreshCw } from 'lucide-react'

interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  threshold?: number
}

export default function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0) return null

  const progress = Math.min((pullDistance / threshold) * 100, 100)
  const isTriggered = pullDistance >= threshold

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-safe-top"
      style={{ 
        transform: `translateY(${Math.min(pullDistance - threshold, 0)}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Background */}
      <div className="w-full bg-gradient-to-br from-primary-500 to-primary-600 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          {/* Spinner */}
          <div className="relative w-8 h-8">
            <RefreshCw 
              className={`w-8 h-8 absolute inset-0 transition-transform ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${progress * 3.6}deg)`
              }}
            />
            {!isRefreshing && (
              <svg className="w-8 h-8 absolute inset-0 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-white/30"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-white"
                  strokeDasharray={`${progress * 0.88} 88`}
                  style={{ transition: 'stroke-dasharray 0.1s ease-out' }}
                />
              </svg>
            )}
          </div>
          
          {/* Text */}
          <div className="font-semibold">
            {isRefreshing ? (
              'Obnovuji...'
            ) : isTriggered ? (
              'Pusť pro obnovení 🎉'
            ) : (
              'Táhni dolů pro obnovení'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
