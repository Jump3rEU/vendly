'use client'

import Link from 'next/link'
import { Shield, Lock, Users, Smartphone, Zap, CheckCircle, ArrowRight, Clock, Car, Shirt, Home, Dumbbell, Gamepad2, BookOpen, Music, Bike, MoreHorizontal, Search, TrendingUp, Star, Camera, Sparkles, BadgeCheck, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import ListingCard from '@/components/ui/ListingCard'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Listing {
  id: string
  slug?: string
  title: string
  price: number
  location: string
  images: string[]
  thumbnailUrl?: string
  condition?: string
  deliveryMethods?: string[]
  allowsOffers?: boolean
  seller?: {
    name?: string
    trustScore?: number
    idVerified?: boolean
  }
  _count?: {
    likes?: number
  }
  createdAt: string
  category: string
}

interface CategoryCount {
  category: string
  count: number
}

const MOCK_LISTINGS: Listing[] = [
  { id: 'm1', slug: 'iphone-13-pro-256gb', title: 'iPhone 13 Pro 256GB – skvělý stav', price: 15990, location: 'Praha 2', images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80'], condition: 'VERY_GOOD', allowsOffers: true, seller: { name: 'Martin N.', trustScore: 95, idVerified: true }, createdAt: new Date().toISOString(), category: 'Elektronika' },
  { id: 'm2', slug: 'trek-marlin-7-2022', title: 'Trek Marlin 7 2022 – vel. L', price: 8500, location: 'Brno-střed', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'], condition: 'GOOD', allowsOffers: true, seller: { name: 'Jana K.', trustScore: 88, idVerified: false }, createdAt: new Date().toISOString(), category: 'Cyklo' },
  { id: 'm3', slug: 'sony-playstation-5', title: 'Sony PlayStation 5 + 2 ovladače', price: 11000, location: 'Ostrava', images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80'], condition: 'GOOD', allowsOffers: false, seller: { name: 'Petr S.', trustScore: 72 }, createdAt: new Date(Date.now() - 3600000).toISOString(), category: 'Elektronika' },
  { id: 'm4', slug: 'patagonia-nano-puff', title: 'Zimní bunda Patagonia Nano Puff – M', price: 2200, location: 'Praha 5', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80'], condition: 'VERY_GOOD', allowsOffers: true, seller: { name: 'Martin N.', trustScore: 95, idVerified: true }, createdAt: new Date(Date.now() - 7200000).toISOString(), category: 'Móda' },
  { id: 'm5', slug: 'macbook-air-m2', title: 'MacBook Air M2 – 8/256GB', price: 28500, location: 'Praha 1', images: ['https://images.unsplash.com/photo-1611186871525-c5edd9c7bbad?w=400&q=80'], condition: 'LIKE_NEW', allowsOffers: true, seller: { name: 'Jana K.', trustScore: 88, idVerified: false }, createdAt: new Date(Date.now() - 10800000).toISOString(), category: 'Elektronika' },
  { id: 'm6', slug: 'ikea-kivik-rohova', title: 'Rohová sedačka IKEA KIVIK – šedá', price: 4900, location: 'Plzeň', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'], condition: 'GOOD', allowsOffers: true, seller: { name: 'Petr S.', trustScore: 72 }, createdAt: new Date(Date.now() - 86400000).toISOString(), category: 'Dům a zahrada' },
  { id: 'm7', slug: 'nike-air-max-90', title: 'Nike Air Max 90 – vel. 42, nové', price: 1800, location: 'Brno', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'], condition: 'NEW', allowsOffers: false, seller: { name: 'Martin N.', trustScore: 95, idVerified: true }, createdAt: new Date(Date.now() - 43200000).toISOString(), category: 'Móda' },
  { id: 'm8', slug: 'xiaomi-robot-vacuum', title: 'Xiaomi Robot Vacuum X10+ – robot vysavač', price: 3200, location: 'Praha 3', images: ['https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400&q=80'], condition: 'GOOD', allowsOffers: true, seller: { name: 'Jana K.', trustScore: 88, idVerified: false }, createdAt: new Date(Date.now() - 14400000).toISOString(), category: 'Dům a zahrada' },
]


// Category configuration matching the sell page
const categoryIcons: Record<string, { icon: any; emoji: string; color: string }> = {
  'Auto-moto': { icon: Car, emoji: '🚗', color: 'from-blue-500 to-blue-600' },
  'Elektronika': { icon: Smartphone, emoji: '📱', color: 'from-purple-500 to-purple-600' },
  'Móda': { icon: Shirt, emoji: '👕', color: 'from-pink-500 to-pink-600' },
  'Dům a zahrada': { icon: Home, emoji: '🏠', color: 'from-green-500 to-green-600' },
  'Sport': { icon: Dumbbell, emoji: '⚽', color: 'from-orange-500 to-orange-600' },
  'Hračky a hry': { icon: Gamepad2, emoji: '🎮', color: 'from-yellow-500 to-yellow-600' },
  'Knihy a časopisy': { icon: BookOpen, emoji: '📚', color: 'from-amber-500 to-amber-600' },
  'Hudba': { icon: Music, emoji: '🎸', color: 'from-indigo-500 to-indigo-600' },
  'Cyklo': { icon: Bike, emoji: '🚴', color: 'from-teal-500 to-teal-600' },
  'Ostatní': { icon: MoreHorizontal, emoji: '📦', color: 'from-gray-500 to-gray-600' },
}

// Animated counter hook
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started || target === 0) return
    const steps = 60
    const stepDuration = duration / steps
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

export default function HomePage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [newTodayListings, setNewTodayListings] = useState<Listing[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const [totalListings, setTotalListings] = useState(0)
  const [safeTransactions, setSafeTransactions] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { count: txCount, ref: txRef } = useCountUp(safeTransactions || 1247)

  useEffect(() => {
    async function fetchData() {
      try {
        const listingsRes = await fetch('/api/listings?limit=12&sortBy=newest')
        const listingsData = await listingsRes.json()
        if (listingsData.data?.listings && listingsData.data.listings.length > 0) {
          const all: Listing[] = listingsData.data.listings
          setListings(all)
          setTotalListings(listingsData.data.pagination?.total || all.length)

          // Filter listings from last 24h
          const now = new Date()
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          const fresh = all.filter(l => new Date(l.createdAt) > oneDayAgo)
          setNewTodayListings(fresh)
        }

        const statsRes = await fetch('/api/listings/stats')
        const statsData = await statsRes.json()
        if (statsData.categories) {
          setCategoryCounts(statsData.categories)
        }
        if (statsData.safeTransactions) {
          setSafeTransactions(statsData.safeTransactions)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getCategoryCount = (category: string) => {
    const found = categoryCounts.find(c => c.category.toLowerCase().includes(category.toLowerCase()))
    return found?.count || 0
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/inzeraty?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient py-20 md:py-32 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-red-200/40 via-rose-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-rose-200/35 via-red-100/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-red-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/50 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-red-300/25 to-rose-300/15 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 left-20 w-32 h-32 bg-gradient-to-br from-rose-300/20 to-red-300/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="safe-container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Glass Badge */}
            <div className="inline-flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-red-100/80 via-rose-50/70 to-red-100/80 border border-white/60 text-rose-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-glass">
              <Shield className="w-4 h-4" />
              Bezpečný marketplace s escrow ochranou
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Prodávejte a nakupujte<br />
              <span className="text-gradient">s jistotou.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Moderní alternativa k Bazoši. Peníze držíme v bezpečí, dokud nezískáte zboží.
              Žádné podvody, žádný stres.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center backdrop-blur-md bg-white/90 border border-white/70 rounded-2xl shadow-glass overflow-hidden p-1.5">
                <Search className="w-5 h-5 text-rose-500 ml-3 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Co hledáte? iPhone, kolo, gauč..."
                  className="flex-1 px-3 py-3 bg-transparent text-gray-800 placeholder:text-gray-400 text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-button-primary flex-shrink-0"
                >
                  Hledat
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button href="/inzeraty" size="lg" variant="primary">
                Procházet inzeráty
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button href="/prodat" size="lg" variant="secondary">
                Začít prodávat zdarma
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-red-100/70 to-rose-50/70 border border-white/60 px-4 py-2.5 rounded-full shadow-glass">
                <Lock className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Escrow ochrana</span>
              </div>
              <div className="flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-rose-50/70 to-red-100/70 border border-white/60 px-4 py-2.5 rounded-full shadow-glass">
                <Users className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Ověření uživatelé</span>
              </div>
              <div className="flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-red-100/70 to-rose-100/70 border border-white/60 px-4 py-2.5 rounded-full shadow-glass">
                <Shield className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Zabezpečené platby</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Trust Counter */}
      <section ref={txRef} className="py-10 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
        <div className="safe-container relative">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium opacity-90">Již</span>
            </div>
            <span className="text-4xl md:text-5xl font-black tabular-nums">
              {txCount.toLocaleString('cs-CZ')}
            </span>
            <span className="text-lg font-semibold opacity-90">bezpečných transakcí 🎉</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="safe-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatItem
              value={totalListings > 0 ? `${totalListings.toLocaleString('cs-CZ')}+` : '100+'}
              label="Aktivních inzerátů"
              icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
            />
            <StatItem
              value="100%"
              label="Zabezpečené platby"
              icon={<Lock className="w-5 h-5 text-emerald-600" />}
            />
            <StatItem
              value="5%"
              label="Poplatek platformy"
              icon={<CheckCircle className="w-5 h-5 text-rose-500" />}
            />
            <StatItem
              value="⭐ 4.8"
              label="Spokojenost uživatelů"
              icon={<Star className="w-5 h-5 text-amber-500" />}
            />
          </div>
        </div>
      </section>

      {/* Quick Filters Bar */}
      <section className="py-4 bg-white border-b border-gray-100 sticky top-[72px] z-30 shadow-sm">
        <div className="safe-container">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { label: 'Vše', href: '/inzeraty' },
              { label: '📱 Elektronika', href: '/inzeraty?kategorie=elektronika' },
              { label: '👕 Móda', href: '/inzeraty?kategorie=m%C3%B3da' },
              { label: '🚗 Auto-moto', href: '/inzeraty?kategorie=auto-moto' },
              { label: '⚽ Sport', href: '/inzeraty?kategorie=sport' },
              { label: '💰 Do 500 Kč', href: '/inzeraty?maxPrice=500' },
              { label: '💳 Do 2000 Kč', href: '/inzeraty?maxPrice=2000' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 hover:bg-rose-500 hover:text-white text-gray-700 text-sm font-semibold transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-rose-50/30 to-white" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full blur-3xl" />

        <div className="safe-container relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Prozkoumejte kategorie
            </h2>
            <p className="text-gray-600 text-lg">
              {totalListings > 0
                ? `Celkem ${totalListings.toLocaleString('cs-CZ')} aktivních inzerátů`
                : 'Vyberte kategorii a začněte objevovat'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {Object.entries(categoryIcons).map(([name, config]) => {
              const count = getCategoryCount(name)
              return (
                <Link
                  key={name}
                  href={`/inzeraty?kategorie=${encodeURIComponent(name.toLowerCase())}`}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-soft hover:shadow-glass hover:border-rose-200/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 via-rose-50/0 to-red-50/0 group-hover:from-red-50/50 group-hover:via-rose-50/30 group-hover:to-red-50/50 transition-all duration-300" />

                  <div className="relative">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {config.emoji}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-rose-600 transition-colors">
                      {name}
                    </h3>
                    {count > 0 && (
                      <p className="text-xs text-gray-500">
                        {count.toLocaleString('cs-CZ')} inzerátů
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Nové dnes section */}
      {(newTodayListings.length > 0 || loading) && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-rose-50 via-white to-pink-50 border-y border-rose-100/50">
          <div className="safe-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Nové dnes
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  Přidáno dnes
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Nejčerstvější nabídky za posledních 24 hodin
                </p>
              </div>
              <Link
                href="/inzeraty?sortBy=newest"
                className="hidden sm:flex items-center gap-2 text-rose-600 font-bold hover:text-rose-700 transition-colors group text-sm"
              >
                Zobrazit vše
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-2xl mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : newTodayListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newTodayListings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-rose-100">
                <div className="text-5xl mb-3">🌅</div>
                <p className="text-gray-600 font-medium">Dnes zatím nic nového</p>
                <p className="text-gray-400 text-sm mt-1">Zkuste to znovu za chvíli</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Latest Listings */}
      <section className="py-16 md:py-20 bg-white">
        <div className="safe-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Nejnovější nabídky
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                Čerstvé inzeráty od ověřených prodejců
              </p>
            </div>
            <Link
              href="/inzeraty"
              className="hidden sm:flex items-center gap-2 text-rose-600 font-bold hover:text-rose-700 transition-colors group"
            >
              Zobrazit vše
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {listings.slice(0, 12).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-soft">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Zatím zde nejsou žádné inzeráty
              </h3>
              <p className="text-gray-500 mb-6">
                Buďte první, kdo přidá inzerát!
              </p>
              <Button href="/prodat" variant="primary">
                Vytvořit první inzerát
              </Button>
            </div>
          )}

          {listings.length > 0 && (
            <div className="sm:hidden mt-8 text-center">
              <Link
                href="/inzeraty"
                className="inline-flex items-center gap-2 text-rose-600 font-bold"
              >
                Zobrazit všechny inzeráty
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Prodej za 2 minuty section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(225,29,72,0.10)_0%,transparent_60%)]" />

        <div className="safe-container relative">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Zap className="w-4 h-4" />
                  Prodej za 2 minuty
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                  Vyfotit. Popsat.<br />
                  <span className="text-rose-400">Prodáno.</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Přidání inzerátu trvá méně než 2 minuty.
                  Bez registrace poplatků, bez komplikací.
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    { icon: '📸', text: 'Přidejte fotky přímo z telefonu' },
                    { icon: '✍️', text: 'Stručný popis a nastavte cenu' },
                    { icon: '💰', text: 'Peníze dorazí bezpečně přes escrow' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {step.icon}
                      </div>
                      <span className="text-gray-300 font-medium">{step.text}</span>
                    </div>
                  ))}
                </div>
                <Button href="/prodat" size="lg" variant="primary">
                  Zkusit zdarma
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Social proof cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl font-black text-white mb-1">2 min</div>
                  <div className="text-gray-400 text-sm">průměrný čas přidání inzerátu</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl font-black text-rose-400 mb-1">5%</div>
                  <div className="text-gray-400 text-sm">poplatek pouze při prodeji</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl font-black text-white mb-1">100%</div>
                  <div className="text-gray-400 text-sm">ochrana escrow systémem</div>
                </div>
                <div className="bg-gradient-to-br from-rose-500/30 to-pink-500/20 border border-rose-500/30 rounded-2xl p-5">
                  <div className="text-3xl font-black text-rose-300 mb-1">⭐ 4.8</div>
                  <div className="text-gray-400 text-sm">hodnocení prodejců</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />

        <div className="safe-container relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Jak to funguje?
            </h2>
            <p className="text-gray-600 text-lg">
              Tři jednoduché kroky k bezpečné transakci
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Najděte nebo nabídněte"
              description="Procházejte inzeráty nebo vytvořte vlastní během pár minut"
              icon={<Smartphone className="w-6 h-6" />}
            />
            <StepCard
              number="2"
              title="Bezpečná platba"
              description="Peníze držíme v escrow, dokud nepotvrdíte převzetí zboží"
              icon={<Lock className="w-6 h-6" />}
            />
            <StepCard
              number="3"
              title="Předání a hodnocení"
              description="Po převzetí uvolníme peníze prodávajícímu. Jednoduché."
              icon={<CheckCircle className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Why Vendly */}
      <section className="py-16 md:py-20 bg-white">
        <div className="safe-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Proč přejít z Bazoše?
            </h2>
            <p className="text-gray-600 text-lg">
              Vendly = Bazoš + bezpečnost + důvěra
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-rose-600" />}
              title="Escrow ochrana"
              description="Peníze jsou v bezpečí, dokud kupující nepotvrdí převzetí. Žádné podvody."
            />
            <FeatureCard
              icon={<BadgeCheck className="w-8 h-8 text-emerald-600" />}
              title="Ověření uživatelé"
              description="Hodnocení, historie transakcí. Víte, s kým obchodujete."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-rose-600" />}
              title="Moderní a rychlé"
              description="Čistý design, rychlé načítání, snadné ovládání na mobilu i PC."
            />
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-10 bg-gray-50/50">
        <div className="safe-container">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Shield className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Vendly je zprostředkovatelská platforma
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Vendly propojuje kupující a prodávající, ale není prodávajícím ani kupujícím zboží.
                  Za popis položky odpovídá prodávající, za akceptaci kupující.
                  Více informací v <Link href="/pravni/obchodni-podminky" className="text-rose-600 hover:underline font-medium">obchodních podmínkách</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-white to-rose-50/60" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl" />

        <div className="safe-container text-center relative">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center gap-1 mb-6">
              {['⭐', '⭐', '⭐', '⭐', '⭐'].map((star, i) => (
                <span key={i} className="text-2xl">{star}</span>
              ))}
            </div>
            <blockquote className="text-lg text-gray-600 italic mb-6">
              "Konečně marketplace, kde se nebojím platit předem. Escrow systém je skvělý!"
            </blockquote>
            <p className="text-sm text-gray-400 mb-10">— Martin K., spokojený uživatel Vendly</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Připraveni na bezpečnější obchodování?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Založte si účet zdarma a začněte prodávat nebo nakupovat ještě dnes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/registrace" size="lg" variant="primary">
                Vytvořit účet zdarma
              </Button>
              <Link
                href="/jak-to-funguje"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white/80 border border-white/60 hover:bg-white transition-all shadow-soft"
              >
                Zjistit více
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Stat item component
function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 rounded-xl mb-3 border border-gray-100">
        {icon}
      </div>
      <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-6 pt-8 group shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
      <div className="absolute -top-4 left-6 w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-button-primary group-hover:scale-110 transition-transform">
        {number}
      </div>

      <div className="mt-2 mb-3 text-rose-500">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl border border-gray-100 mb-5 group-hover:scale-110 transition-all shadow-soft">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

