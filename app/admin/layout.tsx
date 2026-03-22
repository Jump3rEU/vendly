'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Package, ShoppingCart, AlertTriangle, 
  Settings, ChevronLeft, ChevronRight, LogOut, Shield, BarChart3,
  MessageSquare, Flag, Bell
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/uzivatele', label: 'Uživatelé', icon: Users },
  { href: '/admin/inzeraty', label: 'Inzeráty', icon: Package },
  { href: '/admin/objednavky', label: 'Objednávky', icon: ShoppingCart },
  { href: '/admin/disputy', label: 'Disputy', icon: AlertTriangle },
  { href: '/admin/reporty', label: 'Reporty', icon: Flag },
  { href: '/admin/zpravy', label: 'Zprávy', icon: MessageSquare },
  { href: '/admin/statistiky', label: 'Statistiky', icon: BarChart3 },
  { href: '/admin/nastaveni', label: 'Nastavení', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/admin')
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přístup odepřen</h1>
          <p className="text-gray-600 mb-4">Nemáte oprávnění pro přístup do administrace.</p>
          <Link href="/" className="text-primary-600 hover:underline">
            Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Admin Panel</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href || 
              (item.href !== '/admin' && currentPath.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCurrentPath(item.href)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle & User */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {sidebarOpen && <span>Zmenšit</span>}
          </button>
          
          {sidebarOpen && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Přihlášen jako</div>
              <div className="font-medium truncate">{session.user?.name || session.user?.email}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Administrace Vendly</h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/" className="text-sm text-gray-600 hover:text-primary-600">
                Zpět na web →
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
