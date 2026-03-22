'use client'

import Link from 'next/link'
import { Shield, Lock, Users, Smartphone, Zap, CheckCircle, ArrowRight, Clock, Car, Shirt, Home, Dumbbell, Gamepad2, BookOpen, Music, Bike, MoreHorizontal, Search, TrendingUp, Star } from 'lucide-react'
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

export default function HomePage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const [totalListings, setTotalListings] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const listingsRes = await fetch('/api/listings?limit=12')
        const listingsData = await listingsRes.json()
        if (listingsData.data?.listings) {
          setListings(listingsData.data.listings)
          setTotalListings(listingsData.data.pagination?.total || listingsData.data.listings.length)
        }

        const statsRes = await fetch('/api/listings/stats')
        const statsData = await statsRes.json()
        if (statsData.categories) {
          setCategoryCounts(statsData.categories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-button-primary flex-shrink-0"
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

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="safe-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatItem
              value={totalListings > 0 ? `${totalListings.toLocaleString('cs-CZ')}+` : '100+'}
              label="Aktivních inzerátů"
              icon={<TrendingUp className="w-5 h-5 text-primary-500" />}
            />
            <StatItem
              value="100%"
              label="Zabezpečené platby"
              icon={<Lock className="w-5 h-5 text-trust-600" />}
            />
            <StatItem
              value="5%"
              label="Poplatek platformy"
              icon={<CheckCircle className="w-5 h-5 text-primary-500" />}
            />
            <StatItem
              value="⭐ 4.8"
              label="Spokojenost uživatelů"
              icon={<Star className="w-5 h-5 text-amber-500" />}
            />
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
              className="hidden sm:flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors group"
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
                className="inline-flex items-center gap-2 text-primary-600 font-bold"
              >
                Zobrazit všechny inzeráty
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl" />

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
              icon={<Shield className="w-8 h-8 text-primary-600" />}
              title="Escrow ochrana"
              description="Peníze jsou v bezpečí, dokud kupující nepotvrdí převzetí. Žádné podvody."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary-600" />}
              title="Ověření uživatelé"
              description="Hodnocení, historie transakcí. Víte, s kým obchodujete."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-primary-600" />}
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
              <div className="p-2 bg-primary-50 rounded-xl">
                <Shield className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  Vendly je zprostředkovatelská platforma
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Vendly propojuje kupující a prodávající, ale není prodávajícím ani kupujícím zboží.
                  Za popis položky odpovídá prodávající, za akceptaci kupující.
                  Více informací v <Link href="/pravni/obchodni-podminky" className="text-primary-600 hover:underline font-medium">obchodních podmínkách</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/80 via-white to-primary-50/60" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl" />

        <div className="safe-container text-center relative">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Připraveni na bezpečnější obchodování?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
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
      <div className="absolute -top-4 left-6 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-button-primary group-hover:scale-110 transition-transform">
        {number}
      </div>

      <div className="mt-2 mb-3 text-primary-500">
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
