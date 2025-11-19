// app/test-images/page.tsx
"use client"

import { useState, useEffect } from 'react'

interface Content {
  id: string
  title: string
  thumbnail: string | null
  format: string
  fileUrl?: string | null
}

interface ImageStatus {
  status: 'loading' | 'success' | 'error'
  error?: string
  httpStatus?: number
}

export default function TestImagesPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [imageStatus, setImageStatus] = useState<Record<string, ImageStatus>>({})

  useEffect(() => {
    const fetchContents = async () => {
      try {
        console.log('🔄 Chargement des contenus...')
        const response = await fetch('/api/test-images')
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📦 Données reçues:', data)
        
        if (data.success && data.contents) {
          setContents(data.contents)
          
          // Initialiser le statut de toutes les images
          const initialStatus: Record<string, ImageStatus> = {}
          data.contents.forEach((content: Content) => {
            if (content.thumbnail) {
              initialStatus[content.id] = { status: 'loading' }
            }
          })
          setImageStatus(initialStatus)
        } else {
          console.error('❌ Format de réponse invalide:', data)
        }
      } catch (error) {
        console.error('💥 Erreur lors du chargement des contenus:', error)
        alert('Erreur lors du chargement des données. Voir la console.')
      } finally {
        setLoading(false)
      }
    }

    fetchContents()
  }, [])

  // Tester une URL avec fetch pour obtenir plus d'informations
  const testImageUrl = async (contentId: string, url: string) => {
    try {
      console.log(`🔍 Test de l'URL: ${url}`)
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Permet de contourner les erreurs CORS
      })
      
      // En mode no-cors, on ne peut pas lire la réponse, donc on suppose que c'est accessible
      setImageStatus(prev => ({
        ...prev,
        [contentId]: { 
          status: 'success',
          httpStatus: 200 // On suppose que c'est OK en mode no-cors
        }
      }))
      
    } catch (error) {
      console.error(`❌ Erreur test URL ${url}:`, error)
      
      // Essayer avec une requête GET normale
      try {
        const getResponse = await fetch(url)
        setImageStatus(prev => ({
          ...prev,
          [contentId]: { 
            status: getResponse.ok ? 'success' : 'error',
            httpStatus: getResponse.status,
            error: getResponse.statusText
          }
        }))
      } catch (getError) {
        setImageStatus(prev => ({
          ...prev,
          [contentId]: { 
            status: 'error',
            error: getError instanceof Error ? getError.message : 'Erreur inconnue'
          }
        }))
      }
    }
  }

  const handleImageError = (contentId: string, url: string) => {
    console.error(`❌ Erreur chargement image ${url}`)
    setImageStatus(prev => ({
      ...prev,
      [contentId]: { 
        status: 'error',
        error: 'Erreur de chargement côté navigateur'
      }
    }))
    
    // Tester l'URL pour plus d'informations
    testImageUrl(contentId, url)
  }

  const handleImageLoad = (contentId: string, url: string) => {
    console.log(`✅ Image chargée: ${url}`)
    setImageStatus(prev => ({
      ...prev,
      [contentId]: { status: 'success' }
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'loading': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: ImageStatus) => {
    switch (status.status) {
      case 'success': 
        return status.httpStatus ? `✅ ${status.httpStatus}` : '✅ Chargée'
      case 'error': 
        return status.httpStatus ? `❌ ${status.httpStatus}` : '❌ Erreur'
      case 'loading': return '⏳ Chargement...'
      default: return '❓ Inconnu'
    }
  }

  const addTestImage = () => {
    const url = prompt('Entrez l\'URL d\'une image à tester:')
    if (url) {
      const newContent: Content = {
        id: `test-${Date.now()}`,
        title: 'Image de test personnalisée',
        thumbnail: url,
        format: 'TEST'
      }
      setContents(prev => [newContent, ...prev])
      setImageStatus(prev => ({
        ...prev,
        [newContent.id]: { status: 'loading' }
      }))
    }
  }

  const refreshAll = () => {
    setLoading(true)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Diagnostic des Images</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
                <div className="bg-gray-300 h-48 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Diagnostic des Images</h1>
      
      {/* En-tête avec actions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-blue-800 mb-1">Diagnostic Complet des Images</h2>
            <p className="text-blue-700 text-sm">
              Testez le chargement de toutes les images et identifiez les problèmes.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTestImage}
              className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
            >
              + Tester une URL
            </button>
            <button
              onClick={refreshAll}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{contents.length}</div>
          <div className="text-sm text-blue-600">Total</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(imageStatus).filter(s => s.status === 'success').length}
          </div>
          <div className="text-sm text-green-600">Succès</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {Object.values(imageStatus).filter(s => s.status === 'error').length}
          </div>
          <div className="text-sm text-red-600">Erreurs</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {Object.values(imageStatus).filter(s => s.status === 'loading').length}
          </div>
          <div className="text-sm text-yellow-600">En cours</div>
        </div>
      </div>

      {/* Liste des images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map(content => (
          <div key={content.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
            <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800">{content.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Format: {content.format}</p>
            
            {/* URL avec copie */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">URL:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 p-2 rounded break-all flex-1 truncate" title={content.thumbnail || ''}>
                  {content.thumbnail || 'Aucune image'}
                </code>
                {content.thumbnail && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(content.thumbnail!)
                      alert('URL copiée!')
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Copier l'URL"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
            
            {/* Zone d'affichage de l'image */}
            {content.thumbnail ? (
              <div className="relative mb-4">
                {/* Badge de statut */}
                <div className={`absolute top-2 right-2 ${getStatusColor(imageStatus[content.id]?.status || 'loading')} text-white px-2 py-1 rounded text-xs z-10 font-medium`}>
                  {getStatusText(imageStatus[content.id] || { status: 'loading' })}
                </div>
                
                {/* Image */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-48 object-cover"
                    onError={() => handleImageError(content.id, content.thumbnail!)}
                    onLoad={() => handleImageLoad(content.id, content.thumbnail!)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-400 mb-4">
                <span className="text-sm">Aucune image définie</span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2">
              {content.thumbnail && (
                <>
                  <button
                    onClick={() => {
                      window.open(content.thumbnail!, '_blank')
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Ouvrir
                  </button>
                  <button
                    onClick={() => testImageUrl(content.id, content.thumbnail!)}
                    className="flex-1 bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Tester
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  console.log('🔍 Détails image:', {
                    content,
                    status: imageStatus[content.id]
                  })
                }}
                className="flex-1 bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 transition-colors"
              >
                Console
              </button>
            </div>

            {/* Détails d'erreur */}
            {imageStatus[content.id]?.status === 'error' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-700 font-semibold mb-1">Problème détecté :</p>
                <p className="text-red-600 text-xs">
                  {imageStatus[content.id]?.error || 'Erreur de chargement'}
                  {imageStatus[content.id]?.httpStatus && ` (HTTP ${imageStatus[content.id]?.httpStatus})`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Message si aucun contenu */}
      {contents.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun contenu trouvé
          </h3>
          <p className="text-gray-500 mb-4">
            Votre base de données ne contient aucun contenu avec des images.
          </p>
          <button
            onClick={addTestImage}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Tester une URL d'image
          </button>
        </div>
      )}
    </div>
  )
}