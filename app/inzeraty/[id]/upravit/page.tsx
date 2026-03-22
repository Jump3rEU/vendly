'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Upload, X, MapPin, Euro, Package, AlertCircle, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import AISuggestions from '@/components/AISuggestions'

const categories = [
  'Elektronika',
  'Móda',
  'Dům a zahrada',
  'Sport',
  'Auto-moto',
  'Nábytek',
  'Hračky',
  'Knihy',
  'Hudba',
  'Ostatní',
]

const conditions = [
  { value: 'NEW', label: 'Nové' },
  { value: 'LIKE_NEW', label: 'Jako nové' },
  { value: 'GOOD', label: 'Dobré' },
  { value: 'FAIR', label: 'Použité' },
  { value: 'POOR', label: 'Opotřebované' },
]

export default function EditListingPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'GOOD',
    price: '',
    originalPrice: '',
    location: '',
    images: [] as string[],
  })

  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    } else if (status === 'authenticated') {
      fetchListing()
    }
  }, [status, params.id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        // Check ownership
        if (data.data.seller.id !== session?.user?.id) {
          router.push(`/inzeraty/${params.id}`)
          return
        }

        setFormData({
          title: data.data.title,
          description: data.data.description,
          category: data.data.category,
          condition: data.data.condition,
          price: data.data.price.toString(),
          originalPrice: data.data.originalPrice?.toString() || '',
          location: data.data.location,
          images: data.data.images,
        })
      } else {
        router.push('/moje-inzeraty')
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
      router.push('/moje-inzeraty')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + formData.images.length + newImageFiles.length > 10) {
      setError('Můžete nahrát maximálně 10 obrázků')
      return
    }

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setNewImagePreviews([...newImagePreviews, ...newPreviews])
    setNewImageFiles([...newImageFiles, ...files])
    setError('')
  }

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index))
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index))
  }

  const uploadNewImages = async () => {
    if (newImageFiles.length === 0) return []

    setUploadingImages(true)
    const formData = new FormData()
    
    newImageFiles.forEach((file) => {
      formData.append('images', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.data.urls
    } catch (err) {
      throw new Error('Nepodařilo se nahrát obrázky')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Upload new images if any
      let newImageUrls: string[] = []
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadNewImages()
      }

      // Combine existing and new images
      const allImages = [...formData.images, ...newImageUrls]

      // Update listing
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          images: allImages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Nepodařilo se aktualizovat inzerát')
        setSaving(false)
        return
      }

      router.push(`/inzeraty/${params.id}`)
    } catch (err) {
      setError('Nastala chyba při aktualizaci inzerátu')
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="safe-container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/inzeraty/${params.id}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
              Zpět na inzerát
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Upravit inzerát
            </h1>
            <p className="text-gray-600">
              Aktualizujte informace o vašem produktu
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Upload */}
            <div className="card-surface rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Fotografie
              </h2>
              
              <div className="space-y-4">
                {/* Existing + New Images Grid */}
                {(formData.images.length > 0 || newImagePreviews.length > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Existing images */}
                    {formData.images.map((image, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={image}
                          alt={`Fotka ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-danger-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg">
                            Hlavní foto
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* New images */}
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-primary-400">
                        <img
                          src={preview}
                          alt={`Nová fotka ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-danger-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg">
                          Nová
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.images.length + newImagePreviews.length < 10 && (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-smooth">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Přidat další fotografie
                      </p>
                      <p className="text-xs text-gray-500">
                        Maximálně {10 - formData.images.length - newImagePreviews.length} dalších fotek
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={saving || uploadingImages}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="card-surface rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Základní informace
              </h2>

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Název *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                  required
                  disabled={saving}
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Popis *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth resize-none"
                  rows={6}
                  required
                  disabled={saving}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  {formData.description.length} / 2000 znaků
                </p>
              </div>

              {/* AI Suggestions */}
              <AISuggestions
                listingId={params.id}
                onApplySuggestion={(field, value) => {
                  setFormData({ ...formData, [field]: value })
                }}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                    Kategorie *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                    required
                    disabled={saving}
                  >
                    <option value="">Vyberte kategorii</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-semibold text-gray-900 mb-2">
                    Stav *
                  </label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                    required
                    disabled={saving}
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card-surface rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Cena
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
                    Prodejní cena * (Kč)
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                    required
                    disabled={saving}
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-semibold text-gray-900 mb-2">
                    Původní cena (volitelné)
                  </label>
                  <input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                    disabled={saving}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card-surface rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lokalita
              </h2>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                  Město *
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={saving || uploadingImages}
              >
                {saving ? 'Ukládání...' : uploadingImages ? 'Nahrávání fotek...' : 'Uložit změny'}
              </Button>
              <Link href={`/inzeraty/${params.id}`} className="flex-shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  disabled={saving || uploadingImages}
                >
                  Zrušit
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
