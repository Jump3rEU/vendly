'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
      return
    }
    
    if (session?.user) {
      // Přesměruj na profil s nickname nebo ID
      const userIdentifier = session.user.nickname || session.user.id
      router.push(`/profil/${userIdentifier}`)
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Načítám profil...</p>
      </div>
    </div>
  )
}