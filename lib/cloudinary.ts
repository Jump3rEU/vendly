// Cloudinary Configuration & Upload Utility

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload image to Cloudinary
export async function uploadImage(
  file: File | Buffer,
  folder: string = 'vendly'
): Promise<{ url: string; publicId: string }> {
  // Validate Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME není nastaveno')
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY není nastaveno')
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET není nastaveno')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(new Error(`Cloudinary chyba: ${error.message || 'Upload selhal'}`))
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        } else {
          reject(new Error('Cloudinary nevrátil výsledek'))
        }
      }
    )

    if (file instanceof Buffer) {
      uploadStream.end(file)
    } else {
      reject(new Error('Soubor musí být typu Buffer'))
    }
  })
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error)
        reject(error)
      } else {
        console.log('Deleted image from Cloudinary:', publicId)
        resolve()
      }
    })
  })
}

// Extract publicId from Cloudinary URL
// URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{publicId}.{format}
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.*?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Error extracting publicId from URL:', url, error)
    return null
  }
}

// Delete multiple images
export async function deleteMultipleImages(urls: string[]): Promise<void> {
  const publicIds = urls
    .map(url => extractPublicId(url))
    .filter(id => id !== null) as string[]

  if (publicIds.length === 0) {
    console.log('No valid publicIds to delete')
    return
  }

  console.log(`Deleting ${publicIds.length} images from Cloudinary...`)
  
  const deletePromises = publicIds.map(id => 
    deleteImage(id).catch(err => {
      console.error(`Failed to delete image ${id}:`, err)
    })
  )

  await Promise.all(deletePromises)
  console.log('Cloudinary cleanup completed')
}
