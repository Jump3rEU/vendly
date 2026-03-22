import { BadgeCheck } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-trust-600 group" title="Ověřený prodejce">
      <div className="relative">
        {/* Icon with subtle animation */}
        <BadgeCheck className={`${iconSizes[size]} group-hover:scale-110 transition-smooth`} />
      </div>
      {size !== 'sm' && (
        <span className={`${textSizes[size]} font-semibold`}>Ověřeno</span>
      )}
    </div>
  )
}
