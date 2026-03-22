import Link from 'next/link'

interface CategoryCardProps {
  title: string
  count: number
  emoji: string
  href: string
}

// WOW ZONE - Premium category cards with expressive micro-interactions
export default function CategoryCard({ title, count, emoji, href }: CategoryCardProps) {
  return (
    <Link 
      href={href}
      className="group relative card-surface-hover overflow-hidden"
    >
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/40 group-hover:to-primary-100/20 transition-smooth" />
      
      <div className="relative p-6">
        {/* Emoji with scale animation */}
        <div className="text-5xl mb-4 transition-smooth group-hover:scale-110">
          {emoji}
        </div>
        
        {/* Title with color shift */}
        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-primary-600 transition-smooth">
          {title}
        </h3>
        
        {/* Count with subtle emphasis */}
        <p className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-smooth">
          {count.toLocaleString('cs-CZ')} inzerátů
        </p>
      </div>
    </Link>
  )
}
