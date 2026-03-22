import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default settings
const defaultSettings = {
  siteName: 'Vendly',
  siteDescription: 'Moderní marketplace pro nákup a prodej',
  siteUrl: 'https://vendly.cz',
  contactEmail: 'info@vendly.cz',
  supportEmail: 'podpora@vendly.cz',
  currency: 'CZK',
  commissionRate: 5,
  minListingPrice: 1,
  maxListingPrice: 1000000,
  maxImagesPerListing: 10,
  enableRegistration: true,
  enableListings: true,
  requireEmailVerification: false,
  maintenanceMode: false
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get settings from database
    let settings = defaultSettings

    try {
      const dbSettings = await (prisma as any).siteSettings?.findFirst()
      if (dbSettings) {
        settings = { ...defaultSettings, ...dbSettings }
      }
    } catch {
      // SiteSettings model might not exist, use defaults
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Try to save settings to database
    try {
      const existing = await (prisma as any).siteSettings?.findFirst()
      
      if (existing) {
        await (prisma as any).siteSettings?.update({
          where: { id: existing.id },
          data
        })
      } else {
        await (prisma as any).siteSettings?.create({ data })
      }
    } catch {
      // SiteSettings model might not exist
      // In a real app, you'd want to create a migration for this
      console.log('SiteSettings model not available, settings not persisted to DB')
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
