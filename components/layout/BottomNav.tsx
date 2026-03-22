'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 50) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Fetch unread messages count
  useEffect(() => {
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const res = await fetch('/api/conversations/unread-count')
          if (res.ok) {
            const data = await res.json()
            setUnreadCount(data.count || 0)
          }
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      }
      fetchUnreadCount()
      
      // Poll every 30s
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const navItems = [
    {
      icon: Home,
      label: 'Domů',
      href: '/',
      active: pathname === '/',
    },
    {
      icon: Search,
      label: 'Hledat',
      href: '/inzeraty',
      active: pathname?.startsWith('/inzeraty') || pathname?.startsWith('/inzerat'),
    },
    {
      icon: PlusCircle,
      label: 'Prodat',
      href: '/prodat',
      active: pathname === '/prodat',
      highlight: true,
    },
    {
      icon: MessageCircle,
      label: 'Zprávy',
      href: session ? '/zpravy' : '/prihlaseni',
      active: pathname === '/zpravy',
      badge: unreadCount,
    },
    {
      icon: User,
      label: 'Profil',
      href: session ? '/profil' : '/prihlaseni',
      active: pathname === '/profil' || pathname === '/nastaveni',
    },
  ]

  // Hide on auth pages, checkout, admin
  const hideOnPaths = ['/prihlaseni', '/registrace', '/checkout', '/admin']
  if (hideOnPaths.some(path => pathname?.startsWith(path))) {
    return null
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation Bar */}
      <nav 
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
          transition-transform duration-300
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="safe-container-mobile px-0">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.active
              
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`
                    relative flex flex-col items-center justify-center gap-1
                    transition-all duration-200
                    ${isActive 
                      ? 'text-primary-600' 
                      : 'text-gray-500 hover:text-gray-900'
                    }
                    ${item.highlight ? 'scale-110' : ''}
                  `}
                >
                  {/* Icon with badge */}
                  <div className="relative">
                    {item.highlight ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-30" />
                        <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-full shadow-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    )}
                    
                    {/* Badge for unread messages */}
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-[10px] font-medium transition-all duration-200
                    ${isActive ? 'font-bold' : ''}
                    ${item.highlight ? 'hidden' : ''}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && !item.highlight && (
                    <div className="absolute bottom-0 w-12 h-1 bg-primary-600 rounded-t-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* iPhone notch spacer */}
        <div className="h-safe-bottom bg-white" />
      </nav>
    </>
  )
}
