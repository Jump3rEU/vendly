'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, Bell, Shield, CreditCard, Eye, Lock, 
  Smartphone, Mail, Trash2, ChevronRight, Save, Check, X, AlertCircle, Upload, Camera
} from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NastaveniPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profil')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar: '',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    showEmail: false,
    showPhone: false,
  })
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni')
    }
    if (session?.user) {
      // Fetch full user profile
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFormData(prev => ({
              ...prev,
              name: data.data.name || '',
              nickname: data.data.nickname || '',
              email: data.data.email || '',
              phone: data.data.phone || '',
              avatar: data.data.avatar || '',
            }))
            setAvatarPreview(data.data.avatar || '')
          }
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [session, status, router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ Nastavení bylo úspěšně uloženo')
      } else {
        setMessage(`❌ ${data.error || 'Nepodařilo se uložit nastavení'}`)
      }
    } catch {
      setMessage('❌ Nastala chyba')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vyplňte všechna pole')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Nové heslo musí mít alespoň 8 znaků')
      return
    }

    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('Heslo musí obsahovat alespoň jednu číslici')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Hesla se neshodují')
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess(true)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess(false)
        }, 2000)
      } else {
        setPasswordError(data.error || 'Nepodařilo se změnit heslo')
      }
    } catch {
      setPasswordError('Nastala chyba')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setMessage('Neplatný formát obrázku. Povoleny jsou pouze JPEG, PNG a WebP.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('Obrázek je příliš velký. Maximální velikost je 10 MB.')
      return
    }

    setUploadingAvatar(true)
    setMessage('')

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formDataUpload = new FormData()
      formDataUpload.append('images', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const uploadData = await uploadResponse.json()

      if (uploadResponse.ok && uploadData.success) {
        const imageUrl = uploadData.data.images[0].url
        setFormData({ ...formData, avatar: imageUrl })
        setAvatarPreview(imageUrl)
        setMessage('Fotka byla nahrána. Nezapomeňte uložit změny.')
      } else {
        setMessage(uploadData.error || 'Nepodařilo se nahrát fotku')
        setAvatarPreview(formData.avatar || '')
      }
    } catch (error) {
      setMessage('Nastala chyba při nahrávání fotky')
      setAvatarPreview(formData.avatar || '')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Show loading while checking auth or redirecting
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'notifikace', label: 'Notifikace', icon: Bell },
    { id: 'soukromi', label: 'Soukromí', icon: Eye },
    { id: 'bezpecnost', label: 'Bezpečnost', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="safe-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Nastavení</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-64 flex-shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {message && (
                  <div className={`mb-4 p-3 rounded-lg ${message.includes('uloženo') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                )}

                {activeTab === 'profil' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Osobní údaje</h2>
                    
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Profilová fotka</label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-12 h-12 text-white" />
                            )}
                          </div>
                          {uploadingAvatar && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            {uploadingAvatar ? 'Nahrávám...' : 'Změnit fotku'}
                          </Button>
                          <p className="text-xs text-gray-500">JPG, PNG nebo WebP. Max 10 MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Nickname */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Přezdívka (unikátní)
                      </label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="moje_prezidvka123"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pouze písmena, čísla, podtržítka a pomlčky. Min 3, max 30 znaků.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+420 123 456 789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lokalita</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Praha"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">O mně</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Něco o sobě..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'notifikace' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifikace</h2>
                    
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">E-mailové notifikace</p>
                          <p className="text-sm text-gray-500">Zprávy, objednávky, hodnocení</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Push notifikace</p>
                          <p className="text-sm text-gray-500">Okamžitá upozornění v prohlížeči</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.pushNotifications}
                        onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Marketingové e-maily</p>
                          <p className="text-sm text-gray-500">Novinky, tipy a akce</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.marketingEmails}
                        onChange={(e) => setFormData({ ...formData, marketingEmails: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                )}

                {activeTab === 'soukromi' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Nastavení soukromí</h2>
                    
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Zobrazovat e-mail na profilu</p>
                        <p className="text-sm text-gray-500">Ostatní uživatelé uvidí váš e-mail</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.showEmail}
                        onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Zobrazovat telefon na profilu</p>
                        <p className="text-sm text-gray-500">Ostatní uživatelé uvidí váš telefon</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.showPhone}
                        onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                )}

                {activeTab === 'bezpecnost' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Bezpečnost účtu</h2>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <p className="font-medium text-gray-900">Změna hesla</p>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Doporučujeme měnit heslo pravidelně</p>
                      <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
                        Změnit heslo
                      </Button>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <p className="font-medium text-red-900">Smazání účtu</p>
                      </div>
                      <p className="text-sm text-red-700 mb-3">Tato akce je nevratná. Všechna data budou smazána.</p>
                      <Button variant="danger" size="sm">Smazat účet</Button>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Ukládám...' : 'Uložit změny'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Změna hesla</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">Heslo bylo změněno!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Současné heslo
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nové heslo
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Minimálně 8 znaků, včetně číslice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potvrdit nové heslo
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Zopakujte nové heslo"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordError('')
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button
                    fullWidth
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Měním...' : 'Změnit heslo'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
