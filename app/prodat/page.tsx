'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Upload, X, MapPin, Euro, Package, AlertCircle, 
  LogIn, UserPlus, Shield, CheckCircle, Car, Smartphone,
  Shirt, Home, Dumbbell, Gamepad2, BookOpen, Music, Bike, MoreHorizontal,
  ChevronRight, Info, Sparkles
} from 'lucide-react'
import Button from '@/components/ui/Button'
import ScamDetector from '@/components/ScamDetector'

// Rozšířené kategorie s ikonami a subcategoriemi
const categoryConfig = {
  'Auto-moto': {
    icon: Car,
    color: 'bg-blue-100 text-blue-600',
    subcategories: ['Osobní auta', 'Motocykly', 'Náhradní díly', 'Příslušenství', 'Dodávky', 'Karavany'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'select', required: true, 
        options: ['Škoda', 'Volkswagen', 'BMW', 'Audi', 'Mercedes-Benz', 'Ford', 'Toyota', 'Honda', 'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Opel', 'Mazda', 'Volvo', 'Jiná'] },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'např. Octavia, Golf, 3 Series...' },
      { name: 'year', label: 'Rok výroby', type: 'number', required: true, min: 1900, max: new Date().getFullYear() + 1 },
      { name: 'mileage', label: 'Najeto (km)', type: 'number', required: false, placeholder: '150000' },
      { name: 'fuel', label: 'Palivo', type: 'select', required: false,
        options: ['Benzín', 'Diesel', 'Elektro', 'Hybrid', 'LPG', 'CNG'] },
      { name: 'transmission', label: 'Převodovka', type: 'select', required: false,
        options: ['Manuální', 'Automatická', 'Poloautomatická'] },
      { name: 'engineSize', label: 'Objem motoru (ccm)', type: 'number', required: false, placeholder: '1600' },
      { name: 'power', label: 'Výkon (kW)', type: 'number', required: false, placeholder: '110' },
    ]
  },
  'Elektronika': {
    icon: Smartphone,
    color: 'bg-purple-100 text-purple-600',
    subcategories: ['Mobilní telefony', 'Notebooky', 'Tablety', 'TV a monitory', 'Foto a video', 'Audio', 'Herní konzole', 'Příslušenství'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'select', required: true,
        options: ['Apple', 'Samsung', 'Sony', 'LG', 'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Xiaomi', 'Huawei', 'Canon', 'Nikon', 'JBL', 'Bose', 'Jiná'] },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'např. iPhone 14 Pro, Galaxy S23...' },
      { name: 'storage', label: 'Úložiště', type: 'select', required: false,
        options: ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB+'] },
      { name: 'color', label: 'Barva', type: 'text', required: false, placeholder: 'např. Space Gray' },
    ]
  },
  'Móda': {
    icon: Shirt,
    color: 'bg-pink-100 text-pink-600',
    subcategories: ['Dámské oblečení', 'Pánské oblečení', 'Dětské oblečení', 'Obuv', 'Doplňky', 'Šperky', 'Hodinky'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'text', required: false, placeholder: 'např. Nike, Zara, H&M...' },
      { name: 'size', label: 'Velikost', type: 'select', required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Univerzální', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
      { name: 'color', label: 'Barva', type: 'text', required: false, placeholder: 'např. Černá, Modrá...' },
      { name: 'material', label: 'Materiál', type: 'text', required: false, placeholder: 'např. Bavlna, Kůže...' },
    ]
  },
  'Dům a zahrada': {
    icon: Home,
    color: 'bg-green-100 text-green-600',
    subcategories: ['Nábytek', 'Dekorace', 'Zahrada', 'Nářadí', 'Stavební materiál', 'Elektro', 'Sanitární'],
    fields: [
      { name: 'dimensions', label: 'Rozměry', type: 'text', required: false, placeholder: 'např. 120x80x45 cm' },
      { name: 'material', label: 'Materiál', type: 'text', required: false, placeholder: 'např. Dřevo, Kov...' },
    ]
  },
  'Sport': {
    icon: Dumbbell,
    color: 'bg-orange-100 text-orange-600',
    subcategories: ['Fitness', 'Cyklistika', 'Lyžování', 'Vodní sporty', 'Míčové sporty', 'Outdoor', 'Jiné'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'text', required: false, placeholder: 'např. Nike, Adidas...' },
      { name: 'size', label: 'Velikost', type: 'text', required: false, placeholder: 'např. L, 42, 28\"...' },
    ]
  },
  'Hračky a hry': {
    icon: Gamepad2,
    color: 'bg-yellow-100 text-yellow-600',
    subcategories: ['Videohry', 'Stolní hry', 'LEGO', 'Panenky', 'Autíčka', 'Venkovní hračky', 'Vzdělávací'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'text', required: false, placeholder: 'např. LEGO, Hasbro...' },
      { name: 'ageRange', label: 'Věková kategorie', type: 'select', required: false,
        options: ['0-2 roky', '3-5 let', '6-8 let', '9-12 let', '13+ let', 'Pro dospělé'] },
    ]
  },
  'Knihy a časopisy': {
    icon: BookOpen,
    color: 'bg-amber-100 text-amber-600',
    subcategories: ['Beletrie', 'Naučné', 'Učebnice', 'Časopisy', 'Komiksy', 'Dětské knihy'],
    fields: [
      { name: 'author', label: 'Autor', type: 'text', required: false, placeholder: 'Jméno autora' },
      { name: 'isbn', label: 'ISBN', type: 'text', required: false, placeholder: '978-...' },
      { name: 'language', label: 'Jazyk', type: 'select', required: false,
        options: ['Čeština', 'Angličtina', 'Němčina', 'Slovenština', 'Jiný'] },
    ]
  },
  'Hudba': {
    icon: Music,
    color: 'bg-indigo-100 text-indigo-600',
    subcategories: ['Nástroje', 'Příslušenství', 'Vinyl', 'CD/DVD', 'Audio technika'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'text', required: false, placeholder: 'např. Fender, Yamaha...' },
      { name: 'instrumentType', label: 'Typ nástroje', type: 'text', required: false, placeholder: 'např. Elektrická kytara' },
    ]
  },
  'Cyklo': {
    icon: Bike,
    color: 'bg-teal-100 text-teal-600',
    subcategories: ['Horská kola', 'Silniční kola', 'Městská kola', 'Elektrokola', 'Dětská kola', 'Díly a příslušenství'],
    fields: [
      { name: 'brand', label: 'Značka', type: 'text', required: true, placeholder: 'např. Specialized, Trek...' },
      { name: 'frameSize', label: 'Velikost rámu', type: 'select', required: false,
        options: ['XS', 'S', 'M', 'L', 'XL', '14\"', '16\"', '18\"', '20\"', '26\"', '27.5\"', '29\"'] },
      { name: 'wheelSize', label: 'Velikost kol', type: 'select', required: false,
        options: ['12\"', '16\"', '20\"', '24\"', '26\"', '27.5\"', '28\"', '29\"', '700c'] },
      { name: 'year', label: 'Rok výroby', type: 'number', required: false, min: 1990, max: new Date().getFullYear() + 1 },
    ]
  },
  'Ostatní': {
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-600',
    subcategories: ['Sběratelství', 'Umění', 'Zvířata', 'Služby', 'Vstupenky', 'Jiné'],
    fields: []
  },
}

const conditions = [
  { value: 'NEW', label: 'Nové', description: 'Nikdy nepoužité, originální balení' },
  { value: 'LIKE_NEW', label: 'Jako nové', description: 'Minimálně použité, bez známek opotřebení' },
  { value: 'GOOD', label: 'Dobrý stav', description: 'Normální opotřebení, plně funkční' },
  { value: 'FAIR', label: 'Použité', description: 'Viditelné známky používání' },
  { value: 'POOR', label: 'Na díly/opravu', description: 'Poškozené nebo nefunkční' },
]

// Komponenta pro nepřihlášené uživatele
function GuestPrompt() {
  return (
    <div className="min-h-screen hero-gradient py-16 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl" />
      
      <div className="safe-container relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Ikona */}
          <div className="w-24 h-24 backdrop-blur-md bg-white/60 border border-white/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glass">
            <Shield className="w-12 h-12 text-primary-600" />
          </div>

          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Připraveni prodávat?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Pro vytvoření inzerátu se nejprve přihlaste nebo vytvořte účet. 
            Je to rychlé a bezpečné.
          </p>

          {/* Výhody */}
          <div className="glass-card-white p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Proč prodávat na Vendly?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Escrow ochrana</h3>
                  <p className="text-sm text-gray-600">Peníze jsou v bezpečí, dokud kupující nepotvrdí převzetí</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ověření kupující</h3>
                  <p className="text-sm text-gray-600">Obchodujte pouze s ověřenými uživateli</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Jednoduché</h3>
                  <p className="text-sm text-gray-600">Inzerát vytvoříte za pár minut</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA tlačítka */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/prihlaseni?callbackUrl=/prodat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-smooth shadow-soft"
            >
              <LogIn className="w-5 h-5" />
              Přihlásit se
            </Link>
            <Link
              href="/registrace?callbackUrl=/prodat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-smooth"
            >
              <UserPlus className="w-5 h-5" />
              Vytvořit účet
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Registrace je zdarma a zabere jen chvíli
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SellPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: kategorie, 2: detaily, 3: cena a lokalita
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: 'GOOD',
    price: '',
    originalPrice: '',
    location: '',
    images: [] as string[],
    // Dynamická pole
    customFields: {} as Record<string, string>,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Získej konfiguraci pro vybranou kategorii
  const selectedCategoryConfig = formData.category ? categoryConfig[formData.category as keyof typeof categoryConfig] : null

  // Loading stav
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  // Nepřihlášený uživatel - ukázat hezkou stránku
  if (status === 'unauthenticated') {
    return <GuestPrompt />
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + imageFiles.length > 10) {
      setError('Můžete nahrát maximálně 10 obrázků')
      return
    }

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
    setImageFiles([...imageFiles, ...files])
    setError('')
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const uploadImages = async () => {
    if (imageFiles.length === 0) return []

    setUploadingImages(true)
    const formDataUpload = new FormData()
    
    imageFiles.forEach((file) => {
      formDataUpload.append('images', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include', // Ensure session cookie is sent
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload selhal')
      }

      const data = await response.json()
      return data.data.images.map((img: { url: string }) => img.url)
    } catch (err: any) {
      throw new Error(err.message || 'Nepodařilo se nahrát obrázky')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Upload images first
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages()
      }

      // Build description with custom fields
      let fullDescription = formData.description
      if (Object.keys(formData.customFields).length > 0) {
        const fieldLabels: Record<string, string> = {}
        selectedCategoryConfig?.fields?.forEach(f => {
          fieldLabels[f.name] = f.label
        })
        
        const customFieldsText = Object.entries(formData.customFields)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${fieldLabels[key] || key}: ${value}`)
          .join('\n')
        
        if (customFieldsText) {
          fullDescription = `${formData.description}\n\n--- Specifikace ---\n${customFieldsText}`
        }
      }

      // Create listing
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: fullDescription,
          category: formData.subcategory ? `${formData.category} > ${formData.subcategory}` : formData.category,
          condition: formData.condition,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          location: formData.location,
          images: imageUrls,
          status: 'ACTIVE',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Nepodařilo se vytvořit inzerát')
        setLoading(false)
        return
      }

      router.push(`/inzeraty/${data.data.id}`)
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při vytváření inzerátu')
      setLoading(false)
    }
  }

  const canProceedToStep2 = formData.category !== ''
  const canProceedToStep3 = formData.title && formData.description && formData.condition
  const canSubmit = canProceedToStep3 && formData.price && formData.location && imageFiles.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
              Vytvořit inzerát
            </h1>
            <p className="text-gray-600">
              Prodejte své věci rychle a bezpečně
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-smooth ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">1</span>
                <span className="hidden sm:inline">Kategorie</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => canProceedToStep2 && setStep(2)}
                disabled={!canProceedToStep2}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-smooth ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                } ${!canProceedToStep2 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">2</span>
                <span className="hidden sm:inline">Detaily</span>
              </button>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => canProceedToStep3 && setStep(3)}
                disabled={!canProceedToStep3}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-smooth ${
                  step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                } ${!canProceedToStep3 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">3</span>
                <span className="hidden sm:inline">Dokončení</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Kategorie */}
            {step === 1 && (
              <div className="card-surface rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Vyberte kategorii
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(categoryConfig).map(([name, config]) => {
                    const IconComponent = config.icon
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: name, subcategory: '', customFields: {} })
                        }}
                        className={`p-4 rounded-xl border-2 transition-smooth text-center ${
                          formData.category === name
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Subcategories */}
                {selectedCategoryConfig && selectedCategoryConfig.subcategories.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Upřesnit kategorii (volitelné)</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryConfig.subcategories.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setFormData({ ...formData, subcategory: sub })}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                            formData.subcategory === sub
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    variant="primary"
                    size="lg"
                  >
                    Pokračovat
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Detaily */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Fotografie */}
                <div className="card-surface rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Fotografie
                  </h2>
                  
                  <div className="space-y-4">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img
                              src={preview}
                              alt={`Náhled ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-7 h-7 bg-danger-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg">
                                Hlavní
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {imagePreviews.length < 10 && (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-smooth">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {imagePreviews.length === 0 ? 'Nahrát fotografie' : 'Přidat další'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {10 - imagePreviews.length} zbývá (max. 10)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={loading || uploadingImages}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Základní info */}
                <div className="card-surface rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Základní informace
                  </h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                      Název inzerátu *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder={formData.category === 'Auto-moto' ? 'např. Škoda Octavia 2.0 TDI Elegance' : 'např. iPhone 14 Pro Max 256GB'}
                      required
                      disabled={loading}
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth resize-none"
                      placeholder="Popište stav zboží, důvod prodeje, co je součástí..."
                      rows={5}
                      required
                      disabled={loading}
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length} / 2000 znaků
                    </p>
                  </div>

                  {/* Scam Detection */}
                  {(formData.title || formData.description) && (
                    <ScamDetector text={`${formData.title} ${formData.description}`} />
                  )}

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Stav *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {conditions.map((cond) => (
                        <button
                          key={cond.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: cond.value })}
                          className={`p-3 rounded-xl border-2 text-left transition-smooth ${
                            formData.condition === cond.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <span className="font-medium text-gray-900 text-sm block">{cond.label}</span>
                          <span className="text-xs text-gray-500 hidden md:block">{cond.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamická pole podle kategorie */}
                {selectedCategoryConfig && selectedCategoryConfig.fields.length > 0 && (
                  <div className="card-surface rounded-2xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Specifikace {formData.category}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedCategoryConfig.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {field.label} {field.required && '*'}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={formData.customFields[field.name] || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customFields: { ...formData.customFields, [field.name]: e.target.value }
                              })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                              required={field.required}
                              disabled={loading}
                            >
                              <option value="">Vyberte...</option>
                              {(field as any).options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={formData.customFields[field.name] || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customFields: { ...formData.customFields, [field.name]: e.target.value }
                              })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                              placeholder={field.placeholder}
                              required={field.required}
                              disabled={loading}
                              min={(field as any).min}
                              max={(field as any).max}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-between">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="secondary"
                    size="lg"
                  >
                    Zpět
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    variant="primary"
                    size="lg"
                  >
                    Pokračovat
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Cena a lokalita */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="card-surface rounded-2xl p-6 md:p-8 space-y-6">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth text-xl font-bold"
                        placeholder="0"
                        required
                        disabled={loading}
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                        placeholder="0"
                        disabled={loading}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">Cena inzerátu</span>
                        <span className="font-semibold">{parseInt(formData.price).toLocaleString('cs-CZ')} Kč</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">Poplatek platformy (5%)</span>
                        <span className="text-sm text-gray-600">-{Math.round(parseFloat(formData.price) * 0.05).toLocaleString('cs-CZ')} Kč</span>
                      </div>
                      <div className="border-t border-primary-200 pt-2 flex justify-between items-center">
                        <span className="font-semibold text-primary-900">Dostanete</span>
                        <span className="text-xl font-bold text-primary-600">
                          {Math.round(parseFloat(formData.price) * 0.95).toLocaleString('cs-CZ')} Kč
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-surface rounded-2xl p-6 md:p-8">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                      placeholder="např. Praha, Brno, Ostrava..."
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="card-surface rounded-2xl p-6 md:p-8 bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Shrnutí inzerátu</h2>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategorie:</span>
                      <span className="ml-2 font-medium">{formData.subcategory ? `${formData.category} > ${formData.subcategory}` : formData.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stav:</span>
                      <span className="ml-2 font-medium">{conditions.find(c => c.value === formData.condition)?.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fotky:</span>
                      <span className="ml-2 font-medium">{imageFiles.length} {imageFiles.length === 1 ? 'fotka' : imageFiles.length < 5 ? 'fotky' : 'fotek'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lokalita:</span>
                      <span className="ml-2 font-medium">{formData.location || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-between">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="secondary"
                    size="lg"
                  >
                    Zpět
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || uploadingImages || !canSubmit}
                  >
                    {loading ? 'Vytváření...' : uploadingImages ? 'Nahrávání fotek...' : 'Publikovat inzerát'}
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
