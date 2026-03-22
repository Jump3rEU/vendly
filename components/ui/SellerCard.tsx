import { Star, MessageCircle } from 'lucide-react'
import VerifiedBadge from '@/components/trust/VerifiedBadge'
import Button from '@/components/ui/Button'

interface SellerCardProps {
  sellerId: string
  sellerNickname?: string
  name: string
  verified: boolean
  rating: number
  totalSales: number
  memberSince: string
}

export default function SellerCard({ 
  sellerId,
  sellerNickname,
  name, 
  verified, 
  rating, 
  totalSales, 
  memberSince 
}: SellerCardProps) {
  return (
    <div className="card-surface-hover rounded-2xl p-7 shadow-soft border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-6">Prodávající</h3>
      
      {/* Avatar and Name with better visual hierarchy */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-3xl shadow-soft">
          👤
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg text-gray-900">{name}</div>
          {verified && (
            <div className="mt-1">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Stats with improved spacing and visual hierarchy */}
      <div className="space-y-3.5 mb-6 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hodnocení</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-900">{rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Prodáno</span>
          <span className="font-bold text-gray-900">{totalSales} položek</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Členem od</span>
          <span className="font-bold text-gray-900">{memberSince}</span>
        </div>
      </div>

      {/* Actions with better spacing */}
      <div className="space-y-3">
        <Button fullWidth variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Napsat zprávu
        </Button>
        <Button fullWidth variant="secondary" href={`/profil/${sellerNickname || sellerId}`}>
          Zobrazit profil
        </Button>
      </div>
    </div>
  )
}
