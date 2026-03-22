'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, Search, User, Menu, Shield, LogOut, 
  MessageCircle, Heart, Settings, X, ChevronDown 
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/inzeraty?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="safe-container">
        <div className="backdrop-blur-xl bg-gradient-to-r from-red-100/90 via-rose-100/90 to-red-50/90 border border-white/50 rounded-[1.5rem] shadow-glass">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 bg-white rounded-[1rem] flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300">
                <Shield className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black text-gray-800 font-inter">Vendly</span>
            </Link>

            {/* Center Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat produkty..."
                  className="w-full pl-10 pr-4 py-2 bg-white/70 hover:bg-white/85 focus:bg-white/95 border border-rose-200/50 rounded-[1rem] focus:ring-2 focus:ring-rose-300/50 transition-all duration-200 text-sm text-gray-800 placeholder:text-gray-400 font-inter"
                />
              </div>
            </form>

            {/* Right - Navigation & Actions */}
            <div className="flex items-center gap-3">
              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link 
                  href="/inzeraty" 
                  className="px-4 py-2 rounded-[1rem] text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-white/50 transition-all duration-200 font-inter"
                >
                  Procházet
                </Link>
                <Link 
                  href="/prodat" 
                  className="px-4 py-2 rounded-[1rem] text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-all duration-200 font-inter"
                >
                  Prodat
                </Link>
                <Link 
                  href="/jak-to-funguje" 
                  className="px-4 py-2 rounded-[1rem] text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-all duration-200 font-inter"
                >
                  Jak funguje
                </Link>
              </nav>

              {status === 'loading' ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              ) : status === 'authenticated' && session?.user ? (
                <>
                  <Link 
                    href="/zpravy"
                    aria-label="Zprávy"
                    className="relative w-10 h-10 flex items-center justify-center text-primary-500 hover:text-primary-700 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="/oblibene"
                    aria-label="Oblíbené"
                    className="w-10 h-10 flex items-center justify-center text-primary-500 hover:text-primary-700 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  
                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="hidden md:flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm">{session.user?.name?.split(' ')[0] || 'Účet'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 backdrop-blur-2xl bg-white/98 rounded-2xl shadow-soft-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-bold text-gray-900 text-sm">{session.user?.name}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      
                        <Link 
                          href="/profil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl mx-2 mt-2 transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          Můj profil
                        </Link>
                        <Link 
                          href="/moje-inzeraty"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl mx-2 transition-all duration-200"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Moje inzeráty
                        </Link>
                        <Link 
                          href="/objednavky"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl mx-2 transition-all duration-200"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Objednávky
                        </Link>
                        <Link 
                          href="/nastaveni"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-xl mx-2 transition-all duration-200"
                        >
                          <Settings className="w-4 h-4" />
                          Nastavení
                        </Link>

                        {session.user?.role === 'ADMIN' && (
                          <Link 
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-xl mx-2 transition-all duration-200"
                          >
                            <Shield className="w-4 h-4" />
                            Administrace
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-primary-600 font-medium text-sm hover:bg-primary-50 rounded-xl mx-2 transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            Odhlásit se
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile profile icon */}
                  <Link 
                    href="/profil"
                    aria-label="Profil"
                    className="md:hidden w-10 h-10 flex items-center justify-center text-primary-500 hover:text-primary-700 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  {/* Desktop - Login/Register buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link 
                      href="/prihlaseni"
                      className="text-gray-700 hover:text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-[1rem] hover:bg-white/50 transition-all duration-200 font-inter"
                    >
                      Přihlásit se
                    </Link>
                    <Link 
                      href="/registrace"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm px-6 py-2.5 rounded-[1rem] hover:from-primary-600 hover:to-primary-700 shadow-button-primary hover:shadow-lg transition-all duration-200 font-inter"
                    >
                      Registrovat
                    </Link>
                  </div>
                  {/* Mobile - Login icon */}
                  <Link 
                    href="/prihlaseni"
                    aria-label="Přihlásit se"
                    className="md:hidden w-10 h-10 flex items-center justify-center text-primary-500 hover:text-primary-700 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-[1rem] transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-6 pb-4 pt-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat inzeráty..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all text-sm"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden px-6 pb-4 pt-2 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <Link 
                href="/inzeraty" 
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Procházet
              </Link>
              <Link 
                href="/prodat" 
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prodat
              </Link>
              {status === 'authenticated' && session?.user && (
                <>
                  <Link 
                    href="/moje-inzeraty" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Moje inzeráty
                  </Link>
                  <Link 
                    href="/objednavky" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Objednávky
                  </Link>
                  <Link 
                    href="/zpravy" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Zprávy
                  </Link>
                  <Link 
                    href="/oblibene" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Oblíbené
                  </Link>
                </>
              )}
              <Link 
                href="/jak-to-funguje" 
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jak to funguje
              </Link>
              
              <div className="border-t border-gray-100 my-2" />
              
              {status === 'authenticated' && session?.user ? (
                <>
                  <Link 
                    href="/profil" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Můj profil
                  </Link>
                  <Link 
                    href="/nastaveni" 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-all focus-ring"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Nastavení
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-all focus-ring"
                  >
                    Odhlásit se
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/prihlaseni" 
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-all focus-ring text-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Přihlásit se
                  </Link>
                  <Link 
                    href="/registrace" 
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all focus-ring text-center font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrovat se
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}