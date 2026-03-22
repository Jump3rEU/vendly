'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Star, Package, Calendar, ShieldCheck, 
  MessageCircle, Share2, CheckCircle,
  Settings, PlusCircle, ShoppingBag,
  Heart, MapPin, Award, Sparkles,
  TrendingUp, Zap, Target, Medal,
  Trophy, Crown, Flame, Eye, Moon, Sun,
  Clock, ThumbsUp, BarChart3, TrendingDown,
  Users, Info
} from 'lucide-react'
import ReviewsList from '@/components/ReviewsList'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'

interface User {
  id: string
  name: string
  nickname?: string
  avatar: string | null
  trustScore: number
  totalSales: number
  totalPurchases: number
  idVerified: boolean
  phoneVerified: boolean
  createdAt: string
  averageRating?: number
  reviewCount?: number
  totalProfileViews?: number
  satisfactionRate?: number
}

interface Listing {
  id: string
  title: string
  price: number
  images: string[]
  slug: string
  location?: string
  createdAt: string
}

// Gamification helpers
const getUserLevel = (sales: number) => {
  if (sales >= 100) return { name: 'Master Seller', icon: Crown, color: 'from-blue-500 to-cyan-500', level: 5 }
  if (sales >= 51) return { name: 'Expert', icon: Trophy, color: 'from-yellow-500 to-orange-500', level: 4 }
  if (sales >= 21) return { name: 'Advanced', icon: Medal, color: 'from-teal-500 to-emerald-500', level: 3 }
  if (sales >= 6) return { name: 'Intermediate', icon: Target, color: 'from-green-500 to-emerald-500', level: 2 }
  return { name: 'Beginner', icon: Sparkles, color: 'from-gray-500 to-gray-600', level: 1 }
}

const getNextLevelProgress = (sales: number) => {
  if (sales >= 100) return { current: sales, next: 100, percentage: 100 }
  if (sales >= 51) return { current: sales, next: 100, percentage: ((sales - 51) / 49) * 100 }
  if (sales >= 21) return { current: sales, next: 51, percentage: ((sales - 21) / 30) * 100 }
  if (sales >= 6) return { current: sales, next: 21, percentage: ((sales - 6) / 15) * 100 }
  return { current: sales, next: 6, percentage: (sales / 6) * 100 }
}

const getProfileCompletion = (user: User, hasListings: boolean) => {
  let score = 0
  let missing = []
  
  // Jméno a příjmení (základní)
  if (user.name && user.name.split(' ').length >= 2) {
    score += 15
  } else {
    missing.push({ text: 'Přidej celé jméno', points: 15 })
  }
  
  // Profilová fotka
  if (user.avatar) {
    score += 15
  } else {
    missing.push({ text: 'Přidej profilovou fotku', points: 15 })
  }
  
  // Ověření ID (důležité pro důvěru)
  if (user.idVerified) {
    score += 30
  } else {
    missing.push({ text: 'Ověř své ID', points: 30 })
  }
  
  // Ověření telefonu (důležité pro komunikaci)
  if (user.phoneVerified) {
    score += 20
  } else {
    missing.push({ text: 'Ověř telefon', points: 20 })
  }
  
  // První inzerát
  if (hasListings) {
    score += 10
  } else {
    missing.push({ text: 'Přidej první inzerát', points: 10 })
  }
  
  // První prodej
  if (user.totalSales > 0) {
    score += 10
  } else {
    missing.push({ text: 'Uskuteční první prodej', points: 10 })
  }
  
  return { score, missing }
}

const getUserBadges = (user: User, listings: number) => {
  const badges = []
  
  if (user.totalSales >= 1) badges.push({ 
    name: 'První prodej', icon: Star, color: 'from-yellow-400 to-orange-400' 
  })
  if (user.totalSales >= 10) badges.push({ 
    name: '10+ prodejů', icon: Trophy, color: 'from-blue-500 to-cyan-500' 
  })
  if (user.totalSales >= 50) badges.push({ 
    name: '50+ prodejů', icon: Crown, color: 'from-purple-500 to-pink-500' 
  })
  if (user.trustScore >= 80) badges.push({ 
    name: 'Vysoce důvěryhodný', icon: Award, color: 'from-green-500 to-emerald-500' 
  })
  if (user.idVerified && user.phoneVerified) badges.push({ 
    name: 'Plně ověřený', icon: ShieldCheck, color: 'from-indigo-500 to-purple-500' 
  })
  if (listings >= 5) badges.push({ 
    name: 'Aktivní prodejce', icon: Zap, color: 'from-orange-500 to-red-500' 
  })
  
  return badges
}

// Trust Score Breakdown
const getTrustScoreBreakdown = (user: User, hasListings: boolean) => {
  const breakdown = []
  
  if (user.idVerified) breakdown.push({ label: 'Ověřené ID', points: 20, achieved: true })
  else breakdown.push({ label: 'Ověřené ID', points: 20, achieved: false })
  
  if (user.phoneVerified) breakdown.push({ label: 'Ověřený telefon', points: 15, achieved: true })
  else breakdown.push({ label: 'Ověřený telefon', points: 15, achieved: false })
  
  if (user.avatar) breakdown.push({ label: 'Profilová fotka', points: 5, achieved: true })
  else breakdown.push({ label: 'Profilová fotka', points: 5, achieved: false })
  
  const salesPoints = Math.min(user.totalSales * 5, 40)
  breakdown.push({ label: `Úspěšné prodeje (${user.totalSales})`, points: salesPoints, max: 40, achieved: user.totalSales > 0 })
  
  if (hasListings) breakdown.push({ label: 'Aktivní inzeráty', points: 10, achieved: true })
  else breakdown.push({ label: 'Aktivní inzeráty', points: 10, achieved: false })
  
  const reviewBonus = Math.min(10, 10)
  breakdown.push({ label: 'Hodnocení zákazníků', points: reviewBonus, max: 10, achieved: true })
  
  return breakdown
}

// Social Proof helpers (based on real data from API)
const getSocialProof = (user: User) => {
  // Response time based on total sales (experienced sellers respond faster)
  const avgResponseTime = user.totalSales >= 50 ? 'cca 1 hodina' : user.totalSales >= 20 ? 'cca 2 hodiny' : user.totalSales >= 5 ? 'cca 4 hodiny' : 'cca 12 hodin'
  
  // Use real satisfaction rate from API (based on actual reviews)
  const satisfactionRate = user.satisfactionRate || 0
  
  // Use real profile views from API (sum of all listing views)
  const profileViews = user.totalProfileViews || 0
  
  return { avgResponseTime, satisfactionRate, profileViews }
}

// Ranking helper
const getUserRanking = (trustScore: number, totalSales: number) => {
  let percentile = 50
  if (trustScore >= 80 && totalSales >= 20) percentile = 95
  else if (trustScore >= 70 && totalSales >= 10) percentile = 85
  else if (trustScore >= 60 && totalSales >= 5) percentile = 70
  
  return percentile
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { data: session } = useSession()

  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [milestoneText, setMilestoneText] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'reviews'>('overview')
  const [showTrustBreakdown, setShowTrustBreakdown] = useState(false)
  const [tabTransitioning, setTabTransitioning] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUser()
      fetchListings()
      fetchFavorites()
    }
  }, [userId])

  // Check for milestones
  useEffect(() => {
    if (!user) return
    
    // Check for milestone achievements
    if (user.totalSales === 1 && !showMilestone) {
      setMilestoneText('🎉 Gratulujeme! První prodej!')
      setShowMilestone(true)
      setTimeout(() => setShowMilestone(false), 5000)
    } else if (user.totalSales === 10 && !showMilestone) {
      setMilestoneText('🏆 Wow! 10 prodejů dokončeno!')
      setShowMilestone(true)
      setTimeout(() => setShowMilestone(false), 5000)
    } else if (user.totalSales === 50 && !showMilestone) {
      setMilestoneText('👑 Neuvěřitelné! 50 prodejů!')
      setShowMilestone(true)
      setTimeout(() => setShowMilestone(false), 5000)
    }
  }, [user?.totalSales, showMilestone])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchListings = async () => {
    try {
      const res = await fetch(`/api/listings?sellerId=${userId}&limit=12`)
      const data = await res.json()
      
      if (data.success && data.data?.listings) {
        setListings(data.data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    }
  }

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`/api/favorites?userId=${userId}`)
      const data = await res.json()
      
      if (data.success && data.favorites) {
        setFavorites(data.favorites)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const handleMessage = () => {
    if (user?.nickname) {
      router.push(`/zpravy?user=${user.nickname}`)
    }
  }

  const handleShare = async () => {
    const shareUrl = user?.nickname 
      ? `${window.location.origin}/profil/${user.nickname}`
      : window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: `${user?.name || 'Profil'} - Vendly`, 
          url: shareUrl 
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Link zkopírován!')
    }
  }

  const handleTabChange = (tab: 'overview' | 'listings' | 'reviews') => {
    if (tab === activeTab) return
    setTabTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      setTabTransitioning(false)
    }, 150)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/40 via-rose-50/30 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200/60 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/40 via-rose-50/30 to-white flex items-center justify-center px-4">
        <div className="text-center backdrop-blur-xl bg-white/70 p-10 rounded-3xl shadow-2xl border border-white/60 max-w-md">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil nenalezen</h1>
          <p className="text-gray-600 mb-6">Tento uživatel neexistuje nebo byl smazán.</p>
          <Link 
            href="/inzeraty"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Zpět na inzeráty
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === user.id || session?.user?.nickname === userId;
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: cs });
  const trustLevel = user.trustScore >= 80 ? 'Vynikající' : user.trustScore >= 60 ? 'Velmi dobrá' : user.trustScore >= 40 ? 'Dobrá' : 'Začínající';
  const trustColor = user.trustScore >= 80 ? '#10b981' : user.trustScore >= 60 ? '#3b82f6' : user.trustScore >= 40 ? '#f59e0b' : '#9ca3af';
  
  // Gamification
  const userLevel = getUserLevel(user.totalSales);
  const levelProgress = getNextLevelProgress(user.totalSales);
  const profileCompletionData = getProfileCompletion(user, listings.length > 0);
  const badges = getUserBadges(user, listings.length);
  
  // New features
  const trustBreakdown = getTrustScoreBreakdown(user, listings.length > 0);
  const socialProof = getSocialProof(user);
  const userRanking = getUserRanking(user.trustScore, user.totalSales);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-red-50/40 via-rose-50/30 to-white'}`}>
      
      {/* Milestone Celebration Overlay */}
      {showMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-75"></div>
            </div>
            <div className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 px-12 py-8 rounded-3xl shadow-2xl border-4 border-yellow-400 animate-bounce">
              <div className="text-4xl font-black text-center bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {milestoneText}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dark Mode Toggle - Fixed */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 z-40 p-3 rounded-xl shadow-lg backdrop-blur-md transition-all hover:scale-110 ${
          darkMode 
            ? 'bg-gray-800 text-yellow-400 border border-gray-700' 
            : 'bg-white/80 text-gray-700 border border-white/60'
        }`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-red-900/20' : 'bg-red-300/20'}`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-rose-900/20' : 'bg-rose-300/20'}`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-rose-900/15' : 'bg-white/30'}`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        
        {/* Top Header Card */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/60 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-400 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl overflow-hidden flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span></span>
                    )}
                  </div>
                  {user.trustScore >= 80 && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-1.5 rounded-lg shadow-lg animate-pulse">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h1>
                    {user.idVerified && (
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                        <CheckCircle className="w-3 h-3" />
                        Ověřený
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">@{user.nickname || user.id}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {memberSince}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Package className="w-3.5 h-3.5" />
                      {user.totalSales + user.totalPurchases} transakcí
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${userLevel.color} text-white shadow-md`}>
                      <userLevel.icon className="w-3 h-3" />
                      {userLevel.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Link
                      href="/nastaveni"
                      className="px-4 py-2 backdrop-blur-md bg-white/80 border border-gray-200/50 text-gray-700 rounded-xl hover:bg-white hover:shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Nastavení
                    </Link>
                    <Link
                      href="/prodat"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Přidat inzerát
                    </Link>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleMessage}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Napsat
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 backdrop-blur-md bg-white/80 border border-gray-200/50 text-gray-700 rounded-xl hover:bg-white hover:shadow-md transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-xl border overflow-hidden mb-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
          <div className="flex relative">
            {/* Animated indicator */}
            <div 
              className={`absolute bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out`}
              style={{
                width: '33.333%',
                left: activeTab === 'overview' ? '0%' : activeTab === 'listings' ? '33.333%' : '66.666%'
              }}
            />
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'overview'
                  ? darkMode
                    ? 'bg-gradient-to-r from-primary-600/50 to-primary-500/50 text-white'
                    : 'bg-gradient-to-r from-primary-500/10 to-primary-400/10 text-primary-600'
                  : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              📊 Přehled
            </button>
            <button
              onClick={() => handleTabChange('listings')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'listings'
                  ? darkMode
                    ? 'bg-gradient-to-r from-primary-600/50 to-primary-500/50 text-white'
                    : 'bg-gradient-to-r from-primary-500/10 to-primary-400/10 text-primary-600'
                  : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              📦 Inzeráty ({listings.length})
            </button>
            <button
              onClick={() => handleTabChange('reviews')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'reviews'
                  ? darkMode
                    ? 'bg-gradient-to-r from-primary-600/50 to-primary-500/50 text-white'
                    : 'bg-gradient-to-r from-primary-500/10 to-primary-400/10 text-primary-600'
                  : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              ⭐ Hodnocení
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${tabTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            
            {/* Profile Completion - Own Profile Only */}
            {isOwnProfile && profileCompletionData.score < 100 && (
              <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-orange-500" />
                  <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dokončit profil</h2>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-2">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{profileCompletionData.score}% kompletní</span>
                    <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{100 - profileCompletionData.score}% zbývá</span>
                  </div>
                  <div className={`relative h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${profileCompletionData.score}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {profileCompletionData.missing.map((item, index) => (
                    <div key={index} className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      {item.text} (+{item.points}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Social Proof Indicators */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Aktivita & Důvěra</h2>
              </div>
              <div className="space-y-3">
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${darkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Zobrazení profilu</span>
                  </div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{socialProof.profileViews}</div>
                  <div className="text-[10px] text-gray-500">tento měsíc</div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${darkMode ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-100/ 50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Průměrná odpověď</span>
                  </div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{socialProof.avgResponseTime}</div>
                  <div className="text-[10px] text-gray-500">obvykle</div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${darkMode ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-50 border-yellow-100/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp className="w-4 h-4 text-yellow-600" />
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Spokojenost</span>
                  </div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{socialProof.satisfactionRate}%</div>
                  <div className="text-[10px] text-gray-500">spokojených zákazníků</div>
                </div>
              </div>
            </div>
            
            {/* Ranking */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Porovnání</h2>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg mb-3`}>
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="mb-3">
                  <div className={`text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent`}>
                    Top {100 - userRanking}%
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>prodejců na portálu</div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${darkMode ? 'bg-primary-900/20 border-primary-800/50' : 'bg-primary-50 border-primary-100/50'}`}>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Lepší než {userRanking}% prodejců
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
              <div className="flex items-center gap-2 mb-4">
                <userLevel.icon className="w-5 h-5 text-primary-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Level {userLevel.level}</h2>
              </div>
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${userLevel.color} text-white shadow-lg mb-2`}>
                  <userLevel.icon className="w-10 h-10" />
                </div>
                <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userLevel.name}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.totalSales} prodejů</div>
              </div>
              {levelProgress.percentage < 100 && (
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Další level</span>
                    <span className="font-bold text-primary-600">{levelProgress.next - levelProgress.current} prodejů</span>
                  </div>
                  <div className={`relative h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${userLevel.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${levelProgress.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-bold text-gray-900 text-sm">Odznaky</h2>
                  <span className="ml-auto text-xs font-bold text-primary-600">{badges.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="group relative"
                      title={badge.name}
                    >
                      <div className={`aspect-square rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer`}>
                        <badge.icon className="w-6 h-6" />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trust Score Card */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 p-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <defs>
                      <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: trustColor, stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: trustColor, stopOpacity: 0.6}} />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="56" 
                      stroke="#e5e7eb" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="56" 
                      stroke="url(#trustGradient)"
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - user.trustScore / 100)}`}
                      strokeLinecap="round"
                      style={{ 
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                      }}
                    />
                  </svg>
                  <div className="absolute">
                    <div className={`text-3xl font-black bg-gradient-to-br ${darkMode ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>{user.trustScore}</div>
                  </div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${darkMode  ? 'bg-gradient-to-br from-blue-900/30 to-teal-900/30 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-teal-50 border-blue-100/50'}`}>
                  <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trustLevel} důvěra</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Trust Score</div>
                </div>
              </div>
              
              {/* Trust Score Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button 
                  onClick={() => setShowTrustBreakdown(!showTrustBreakdown)}
                  className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-teal-700 mb-3 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showTrustBreakdown ? 'Skrýt breakdown' : 'Jak se počítá Trust Score?'}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showTrustBreakdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-2">
                  { trustBreakdown.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between text-xs transition-all duration-300 ${
                        item.achieved ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-gray-500' : 'text-gray-400')
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: showTrustBreakdown ? 'slideIn 0.3s ease-out forwards' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {item.achieved ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold">
                        {item.max ? `${item.points}/${item.max}` : `+${item.points}`}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Statistiky</h2>
              </div>
              <div className="space-y-4">
                <div className={`backdrop-blur-md rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Package className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Prodáno</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">{user.totalSales}</span>
                  </div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Koupeno</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user.totalPurchases}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Card */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60' }`}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ověření</h2>
              </div>
              <div className="space-y-2">
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${user.idVerified ? (darkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100/50') : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className={`w-4 h-4 ${user.idVerified ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={user.idVerified ? 'text-green-700 font-medium' : 'text-gray-400'}>Ověřené ID</span>
                    </div>
                    {user.idVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-3 border ${user.phoneVerified ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100/50' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className={`w-4 h-4 ${user.phoneVerified ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={user.phoneVerified ? 'text-green-700 font-medium' : 'text-gray-400'}>Ověřený telefon</span>
                    </div>
                    {user.phoneVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links - Own Profile */}
            {isOwnProfile && (
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 p-6">
                <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary-500" />
                  Můj účet
                </h2>
                <div className="space-y-2">
                  <Link href="/moje-inzeraty" className="flex items-center gap-3 px-4 py-3 backdrop-blur-md bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all border border-red-100/50 group">
                    <Package className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Moje inzeráty</span>
                    <span className="ml-auto text-xs font-bold text-primary-600">{listings.length}</span>
                  </Link>
                  <Link href="/oblibene" className="flex items-center gap-3 px-4 py-3 backdrop-blur-md bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all border border-rose-100/50 group">
                    <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Oblíbené</span>
                    <span className="ml-auto text-xs font-bold text-rose-600">{favorites.length}</span>
                  </Link>
                  <Link href="/objednavky" className="flex items-center gap-3 px-4 py-3 backdrop-blur-md bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all border border-red-100/50 group">
                    <ShoppingBag className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Objednávky</span>
                  </Link>
                  <Link href="/zpravy" className="flex items-center gap-3 px-4 py-3 backdrop-blur-md bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all border border-green-100/50 group">
                    <MessageCircle className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Zprávy</span>
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Tab - Summary */}
            {activeTab === 'overview' && (
              <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-8 text-center ${darkMode ? 'bg-gray-800/70 border-gray-700/60' : 'bg-white/70 border-white/60'}`}>
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg mb-4`}>
                    <Award className="w-10 h-10" />
                  </div>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isOwnProfile ? 'Vítej zpět!' : `Profil uživatele ${user.name}`}
                </h2>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isOwnProfile 
                    ? 'Tvůj profil vypadá skvěle! Podívej se na své statistiky a úroveň.'
                    : `${user.name} je ${trustLevel.toLowerCase()} prodejce s ${user.totalSales} úspěšnými prodeji.`
                  }
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`backdrop-blur-md rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-primary-900/30 to-rose-900/30 border-primary-800/50' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100/50'}`}>
                    <div className={`text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent`}>{user.totalSales}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Prodejů</div>
                  </div>
                  <div className={`backdrop-blur-md rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-primary-900/30 to-rose-900/30 border-primary-800/50' : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100/50'}`}>
                    <div className={`text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent`}>{user.trustScore}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trust Score</div>
                  </div>
                  <div className={`backdrop-blur-md rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100/50'}`}>
                    <div className={`text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}>{listings.length}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inzerátů</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <>
            {/* Active Listings */}
            {listings.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                <div className="p-5 border-b border-purple-100/50 backdrop-blur-md bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      {isOwnProfile ? 'Moje inzeráty' : 'Aktivní inzeráty'}
                      <span className="ml-1 px-2 py-0.5 bg-white/80 rounded-full text-xs font-bold text-purple-600">{listings.length}</span>
                    </h2>
                    {listings.length > 8 && (
                      <Link 
                        href={isOwnProfile ? '/moje-inzeraty' : `/inzeraty?seller=${user.nickname || userId}`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                      >
                        Zobrazit vše 
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listings.slice(0, 8).map((listing) => (
                      <Link 
                        key={listing.id}
                        href={`/inzerat/${listing.slug}`}
                        className="group backdrop-blur-md bg-white/80 border border-red-100/50 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="aspect-square bg-gradient-to-br from-red-50 to-rose-50 overflow-hidden relative">
                          {listing.images && listing.images[0] ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-10 h-10 text-primary-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                            {listing.price.toLocaleString('cs-CZ')} Kč
                          </p>
                          {listing.location && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {listing.location}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Listings */}
            {listings.length === 0 && (
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 p-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Žádné inzeráty</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isOwnProfile ? 'Zatím jste nepřidal žádný inzerát.' : 'Tento uživatel momentálně nic neprodává.'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/prodat"
                    className="inline-block px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-bold"
                  >
                    Přidat první inzerát
                  </Link>
                )}
              </div>
            )}

            {/* Favorites */}
            {isOwnProfile && favorites.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                <div className="p-5 border-b border-red-100/50 backdrop-blur-md bg-gradient-to-r from-red-50/50 to-pink-50/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      Oblíbené
                      <span className="ml-1 px-2 py-0.5 bg-white/80 rounded-full text-xs font-bold text-red-600">{favorites.length}</span>
                    </h2>
                    {favorites.length > 4 && (
                      <Link 
                        href="/oblibene"
                        className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                      >
                        Zobrazit vše 
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {favorites.slice(0, 4).map((listing) => (
                      <Link 
                        key={listing.id}
                        href={`/inzerat/${listing.slug}`}
                        className="group backdrop-blur-md bg-white/80 border border-red-100/50 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                      >
                        <div className="aspect-square bg-gradient-to-br from-red-50 to-pink-50 overflow-hidden">
                          {listing.images && listing.images[0] ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-10 h-10 text-red-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 backdrop-blur-md bg-white/90 rounded-full p-1.5 shadow-lg">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                            {listing.price.toLocaleString('cs-CZ')} Kč
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            </>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/60 overflow-hidden">
              <div className="p-5 border-b border-yellow-100/50 backdrop-blur-md bg-gradient-to-r from-yellow-50/50 to-orange-50/50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Hodnocení
                </h2>
              </div>
              <div className="p-5">
                <ReviewsList userId={user.id} />
              </div>
            </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}