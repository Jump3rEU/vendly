// AI Service for marketplace analysis
// Uses OpenAI API for listing analysis and fraud detection

import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface ListingAnalysis {
  suspicionScore: number // 0-100, higher = more suspicious
  suspicionReasons: string[]
  scamIndicators: {
    type: string
    confidence: number
    description: string
  }[]
  qualityScore: number // 0-100, listing quality
  suggestions: {
    category: 'title' | 'description' | 'pricing' | 'images' | 'category'
    issue: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export interface ImprovedContent {
  originalTitle: string
  suggestedTitles: string[]
  originalDescription: string
  suggestedDescription: string
  improvements: string[]
  warnings: string[]
}

export interface AdminInsights {
  overallRiskAssessment: string
  userBehaviorAnalysis: string
  marketTrends: string[]
  actionRecommendations: string[]
}

// Analyze listing for suspicious content and quality
export async function analyzeListingForFraud(listing: {
  title: string
  description: string
  price: number
  category: string
  images: string[]
  seller: {
    trustScore: number
    totalSales: number
    createdAt: Date
  }
}): Promise<ListingAnalysis> {
  try {
    const prompt = `Analyze this marketplace listing for fraud indicators and quality issues. Respond in JSON format.

Listing Details:
- Title: ${listing.title}
- Description: ${listing.description}
- Price: ${listing.price} CZK
- Category: ${listing.category}
- Images count: ${listing.images.length}
- Seller trust score: ${listing.seller.trustScore}/100
- Seller total sales: ${listing.seller.totalSales}
- Seller account age: ${Math.floor((Date.now() - listing.seller.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days

Analyze for:
1. Scam indicators (unrealistic prices, too-good-to-be-true offers, suspicious language)
2. Content quality issues (unclear descriptions, missing information)
3. Red flags (urgency tactics, payment outside platform, contact details in text)
4. Category mismatch
5. Pricing anomalies

Respond with JSON:
{
  "suspicionScore": 0-100,
  "suspicionReasons": ["reason1", "reason2"],
  "scamIndicators": [{"type": "string", "confidence": 0-100, "description": "string"}],
  "qualityScore": 0-100,
  "suggestions": [{"category": "title|description|pricing|images|category", "issue": "string", "suggestion": "string", "priority": "high|medium|low"}]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a fraud detection expert for a Czech marketplace. Analyze listings for scam indicators and quality issues. Always respond in valid JSON format. Be conservative but thorough.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const analysis: ListingAnalysis = JSON.parse(content)
    return analysis
  } catch (error) {
    console.error('AI analysis error:', error)
    // Return safe default on error
    return {
      suspicionScore: 0,
      suspicionReasons: [],
      scamIndicators: [],
      qualityScore: 50,
      suggestions: [],
    }
  }
}

// Suggest improvements for listing content
export async function suggestListingImprovements(
  title: string,
  description: string,
  category: string,
  price: number
): Promise<ImprovedContent> {
  try {
    const prompt = `Suggest improvements for this Czech marketplace listing. Keep the Czech language. Respond in JSON format.

Current listing:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Price: ${price} CZK

Provide:
1. 3 improved title variations (max 80 chars each, SEO-friendly, clear)
2. Improved description (clear structure, highlights, specifications)
3. List of specific improvements made
4. Any warnings about content

Respond with JSON:
{
  "originalTitle": "string",
  "suggestedTitles": ["title1", "title2", "title3"],
  "originalDescription": "string",
  "suggestedDescription": "string",
  "improvements": ["improvement1", "improvement2"],
  "warnings": ["warning1"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a Czech marketplace listing optimization expert. Suggest clear, honest improvements. Never exaggerate or add false information. Keep suggestions factual and based only on provided information. Maintain Czech language.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const improved: ImprovedContent = JSON.parse(content)
    return improved
  } catch (error) {
    console.error('AI improvement suggestion error:', error)
    return {
      originalTitle: title,
      suggestedTitles: [],
      originalDescription: description,
      suggestedDescription: '',
      improvements: [],
      warnings: ['Návrhy nejsou momentálně dostupné'],
    }
  }
}

// Generate admin insights from multiple listings
export async function generateAdminInsights(data: {
  recentListings: Array<{
    title: string
    category: string
    price: number
    status: string
    suspicionScore?: number
  }>
  recentReports: Array<{
    reason: string
    status: string
  }>
  userStats: {
    newUsers: number
    suspendedUsers: number
    activeListings: number
  }
}): Promise<AdminInsights> {
  try {
    const prompt = `Analyze marketplace data and provide admin insights. Respond in JSON format.

Recent Listings (${data.recentListings.length}):
${data.recentListings.slice(0, 20).map(l => `- ${l.title} (${l.category}, ${l.price} CZK, status: ${l.status})`).join('\n')}

Recent Reports (${data.recentReports.length}):
${data.recentReports.slice(0, 10).map(r => `- ${r.reason} (${r.status})`).join('\n')}

User Stats:
- New users today: ${data.userStats.newUsers}
- Suspended users: ${data.userStats.suspendedUsers}
- Active listings: ${data.userStats.activeListings}

Provide:
1. Overall risk assessment
2. User behavior patterns
3. Market trends
4. Recommended actions for admins

Respond with JSON:
{
  "overallRiskAssessment": "string",
  "userBehaviorAnalysis": "string",
  "marketTrends": ["trend1", "trend2"],
  "actionRecommendations": ["action1", "action2"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a marketplace analytics expert. Provide actionable insights for administrators. Be specific and data-driven. Focus on security, fraud prevention, and user experience.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const insights: AdminInsights = JSON.parse(content)
    return insights
  } catch (error) {
    console.error('AI insights error:', error)
    return {
      overallRiskAssessment: 'Data momentálně nedostupná',
      userBehaviorAnalysis: 'Analýza nedostupná',
      marketTrends: [],
      actionRecommendations: [],
    }
  }
}

// Quick scam check for real-time validation
export async function quickScamCheck(text: string): Promise<{
  isHighRisk: boolean
  flags: string[]
}> {
  // Rule-based quick check (no API call for performance)
  const flags: string[] = []
  const lowerText = text.toLowerCase()

  // Suspicious patterns
  const suspiciousPatterns = [
    { pattern: /(?:whatsapp|telegram|viber|signal)[\s:]+[\+\d]/i, flag: 'Kontakt mimo platformu' },
    { pattern: /(?:western union|moneygram|bitcoi|krypto)/i, flag: 'Neobvyklá platební metoda' },
    { pattern: /(?:ihned|rychle|dnes|teď|naléhavé|limited|limited time|poslední|nutno prodat)/i, flag: 'Naléhavá taktika' },
    { pattern: /(?:100%|zaručen[oýá]|garantovan[oýá]|bez rizika|záruka vrácení peněz)/i, flag: 'Nerealistické garance' },
    { pattern: /(?:win|vyhr[aá]l|loterie|dárek|zdarma|free|akce|sleva 90)/i, flag: 'Příliš dobré na pravdu' },
    { pattern: /(?:předplacen[oýá]|platba předem|záloha|depositum)/i, flag: 'Platba předem' },
  ]

  for (const { pattern, flag } of suspiciousPatterns) {
    if (pattern.test(lowerText)) {
      flags.push(flag)
    }
  }

  // Check for email/phone in text
  if (/[\w\.-]+@[\w\.-]+\.\w+/.test(text)) {
    flags.push('Email v textu')
  }
  if (/[\+\d]{9,}/.test(text.replace(/\s/g, ''))) {
    flags.push('Telefonní číslo v textu')
  }

  return {
    isHighRisk: flags.length >= 2,
    flags,
  }
}
