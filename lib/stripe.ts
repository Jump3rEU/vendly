// Stripe Client Configuration

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Escrow configuration
export const ESCROW_CONFIG = {
  // Platform fee percentage (5%)
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'),
  
  // Auto-release days if no dispute
  autoReleaseDays: parseInt(process.env.AUTO_RELEASE_DAYS || '7'),
  
  // Currency
  currency: 'czk',
  
  // Payment description template
  descriptionTemplate: (orderNumber: string, listingTitle: string) => 
    `Vendly - ${orderNumber} - ${listingTitle}`,
}
