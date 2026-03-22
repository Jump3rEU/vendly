// Image Upload API
// POST /api/upload - Secure image upload to Cloudinary

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'
import { uploadRateLimiter } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = req.ip || 'anonymous'
    const rateLimit = await uploadRateLimiter.check(identifier)
    if (!rateLimit.success) {
      return errorResponse('Příliš mnoho nahrávání. Zkuste to později.', 429)
    }

    // Authentication
    let user
    try {
      user = await requireAuth()
    } catch (authError: any) {
      return errorResponse('Pro nahrání obrázků se musíte přihlásit', 401)
    }

    // Parse form data
    const formData = await req.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return errorResponse('Žádné soubory nebyly nahrány')
    }

    if (files.length > 10) {
      return errorResponse('Můžete nahrát maximálně 10 obrázků')
    }

    // Validate files
    const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10') * 1024 * 1024 // 10 MB default
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(`Neplatný typ souboru: ${file.name}. Povoleny jsou pouze JPEG, PNG a WebP.`)
      }

      if (file.size > MAX_SIZE) {
        return errorResponse(`Soubor ${file.name} je příliš velký. Maximální velikost je ${process.env.MAX_UPLOAD_SIZE_MB || 10} MB.`)
      }
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      return uploadImage(buffer, `vendly/${user.id}`)
    })

    const results = await Promise.all(uploadPromises)

    return successResponse({
      images: results.map(r => ({
        url: r.url,
        publicId: r.publicId,
      }))
    }, 'Obrázky byly úspěšně nahrány')
  } catch (error: any) {
    console.error('Upload error:', error)
    return serverErrorResponse('Chyba při nahrávání obrázků')
  }
}
