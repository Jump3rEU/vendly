import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import AuthProvider from '@/components/providers/AuthProvider'
import CookieConsent from '@/components/CookieConsent'
import CronStarter from '@/components/CronStarter'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#e11d48',
}

export const metadata: Metadata = {
  title: 'Vendly - Bezpečný lokální prodej. Peníze v klidu.',
  description: 'Moderní český marketplace s ochranou kupujících i prodávajících. Prodávejte a nakupujte bezpečně díky escrow systému.',
  keywords: 'marketplace, bazar, prodej, nákup, bezpečný prodej, escrow, česko',
  authors: [{ name: 'Vendly' }],
  openGraph: {
    title: 'Vendly - Bezpečný lokální prodej',
    description: 'Moderní český marketplace s ochranou kupujících i prodávajících.',
    type: 'website',
    locale: 'cs_CZ',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          {/* Initialize cron jobs */}
          <CronStarter />
          
          {/* Stable global header */}
          <Header />
          
          {/* Main content area */}
          <main className="flex-1 pt-20">
            {children}
          </main>
          
          {/* Footer with legal links */}
          <Footer />
          
          {/* Mobile Bottom Navigation */}
          <BottomNav />
          
          {/* Cookie Consent Banner (GDPR) */}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}
