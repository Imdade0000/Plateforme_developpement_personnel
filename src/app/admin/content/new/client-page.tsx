// app/admin/content/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ContentType = 'ARTICLE' | 'VIDEO' | 'EBOOK' | 'AUDIO' | 'COURSE'
type ContentStatus = 'DRAFT' | 'PUBLISHED'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewContentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    description: '',
    contentType: 'ARTICLE' as ContentType,
    category: 'OTHER', // Catégorie thématique (ContentType enum)
    isFree: true,
    price: 0,
    status: 'DRAFT' as ContentStatus,
    isFeatured: false,
    fileUrl: '',
    thumbnail: '',
  })

  // Charger les catégories disponibles
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        return result.fileUrl
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        return result.fileUrl
      }
      return ''
    } catch (error) {
      console.error('Thumbnail upload error:', error)
      return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let fileUrl = formData.fileUrl
      let thumbnailUrl = formData.thumbnail

      const needsFileUpload = formData.contentType === 'VIDEO' || 
                            formData.contentType === 'EBOOK' || 
                            formData.contentType === 'AUDIO' || 
                            formData.contentType === 'COURSE'
      
      if (file && needsFileUpload) {
        fileUrl = await handleFileUpload(file)
      }

      const thumbnailInput = document.getElementById('thumbnail') as HTMLInputElement
      if (thumbnailInput?.files?.[0]) {
        thumbnailUrl = await handleThumbnailUpload(thumbnailInput.files[0])
      }

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fileUrl: needsFileUpload ? fileUrl : undefined,
          thumbnail: thumbnailUrl,
          categoryIds: selectedCategories, // Ajouter les IDs des catégories
        }),
      })

      if (response.ok) {
        const content = await response.json()
        alert('Contenu créé avec succès !')
        router.push('/admin/content')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error: any) {
      alert(`Erreur lors de la création: ${error.message || 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getAcceptedFiles = () => {
    switch (formData.contentType) {
      case 'VIDEO': return 'video/*,.mp4,.avi,.mov,.mkv'
      case 'EBOOK': return '.pdf,.epub,.mobi,.doc,.docx'
      case 'AUDIO': return 'audio/*,.mp3,.wav,.m4a,.aac'
      case 'COURSE': return '.zip,.rar,.pdf'
      default: return '*'
    }
  }

  const requiresFileUpload = formData.contentType === 'VIDEO' || 
                           formData.contentType === 'EBOOK' || 
                           formData.contentType === 'AUDIO' || 
                           formData.contentType === 'COURSE'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau contenu</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Retour
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titre attractif pour votre contenu"
              />
            </div>

            {/* Extrait */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Extrait *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description courte et accrocheuse"
              />
            </div>

            {/* Description complète */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description complète
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description détaillée du contenu"
              />
            </div>

            {/* Type de contenu */}
            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                Type de contenu *
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ARTICLE">Article (texte)</option>
                <option value="VIDEO">Vidéo</option>
                <option value="EBOOK">PDF/Ebook</option>
                <option value="AUDIO">Audio</option>
                <option value="COURSE">Cours (fichiers multiples)</option>
              </select>
            </div>

            {/* Catégorie thématique */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie thématique *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MEDITATION">Méditation</option>
                <option value="PRODUCTIVITY">Productivité</option>
                <option value="RELATIONSHIP">Relations</option>
                <option value="HEALTH">Santé</option>
                <option value="FINANCE">Finance</option>
                <option value="CAREER">Carrière</option>
                <option value="SPIRITUALITY">Spiritualité</option>
                <option value="MINDSET">État d'esprit</option>
                <option value="PARENTING">Parentalité</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            {/* Catégories (multi-sélection) */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégories (optionnel)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`cat-${category.id}`} className="ml-2 block text-sm text-gray-700">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload de fichier */}
            {requiresFileUpload && (
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier {
                    formData.contentType === 'VIDEO' ? 'vidéo' : 
                    formData.contentType === 'EBOOK' ? 'PDF/Ebook' : 
                    formData.contentType === 'AUDIO' ? 'audio' : 
                    'du cours'
                  } *
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept={getAcceptedFiles()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={requiresFileUpload}
                />
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload en cours... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                Image de preview (thumbnail)
              </label>
              <input
                type="file"
                id="thumbnail"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contenu texte */}
            {formData.contentType === 'ARTICLE' && (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contenu détaillé de votre article..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statut */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (XOF)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  disabled={formData.isFree}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
                  Contenu gratuit
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                  En vedette
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isUploading ? 'Upload...' : 'Création...'}
                  </>
                ) : (
                  'Créer le contenu'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}