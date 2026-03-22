import { LucideIcon } from 'lucide-react'

interface TrustBadgeProps {
  icon: LucideIcon
  text: string
}

export default function TrustBadge({ icon: Icon, text }: TrustBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 text-gray-700 group">
      {/* Premium icon container with subtle animation */}
      <div className="w-10 h-10 bg-gradient-to-br from-trust-50 to-trust-100 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 transition-smooth">
        <Icon className="w-5 h-5 text-trust-600" />
      </div>
      <span className="text-base font-semibold">{text}</span>
    </div>
  )
}
