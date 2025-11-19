// components/content/contentCard.tsx - Version corrigée
"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Content, ContentFormat } from '@prisma/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ContentCardProps {
  content: Content & {
    author?: {
      name: string | null
      image: string | null
    }
    _count?: {
      purchases: number
      reviews: number
      favorites: number
    }
  }
}

export function ContentCard({ content, showPrice = true, showActions = true }: ContentCardProps & { showPrice?: boolean; showActions?: boolean }) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Fonction pour obtenir une URL d'image complète
  const getImageUrl = (url: string | null) => {
    if (!url) return null
    
    // Si l'URL est déjà complète (commence par http), la retourner telle quelle
    if (url.startsWith('http')) {
      return url
    }
    
    // Si c'est un chemin relatif, construire l'URL complète
    if (url.startsWith('/')) {
      // Vérifier si on est côté client (browser)
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${url}`
      } else {
        // Côté serveur, utiliser une URL de base par défaut
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        return `${baseUrl}${url}`
      }
    }
    
    return url
  }

  const getContentIcon = () => {
    switch (content.format) {
      case ContentFormat.ARTICLE:
        return <FileTextIcon className="w-8 h-8" />
      case ContentFormat.VIDEO:
        return <VideoIcon className="w-8 h-8" />
      case ContentFormat.EBOOK:
        return <BookIcon className="w-8 h-8" />
      case ContentFormat.AUDIO:
        return <AudioIcon className="w-8 h-8" />
      case ContentFormat.PODCAST:
        return <PodcastIcon className="w-8 h-8" />
      case ContentFormat.COURSE:
        return <CourseIcon className="w-8 h-8" />
      default:
        return <FileIcon className="w-8 h-8" />
    }
  }

  const getDurationText = () => {
    if (content.durationMinutes) {
      if (content.durationMinutes < 60) {
        return `${content.durationMinutes} min`
      } else {
        const hours = Math.floor(content.durationMinutes / 60)
        const minutes = content.durationMinutes % 60
        return minutes > 0 ? `${hours}h${minutes}` : `${hours}h`
      }
    }
    
    if (content.pagesCount) {
      return `${content.pagesCount} pages`
    }
    
    return null
  }

  const formatPrice = (price: number | null) => {
    const actualPrice = price || 0
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: content.currency || 'XOF'
    }).format(actualPrice)
  }

  const getContentFormatText = () => {
    switch (content.format) {
      case ContentFormat.ARTICLE:
        return 'article'
      case ContentFormat.VIDEO:
        return 'vidéo'
      case ContentFormat.EBOOK:
        return 'ebook'
      case ContentFormat.AUDIO:
        return 'audio'
      case ContentFormat.PODCAST:
        return 'podcast'
      case ContentFormat.COURSE:
        return 'cours'
      default:
        return 'contenu'
    }
  }

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Si le contenu est payant, toujours rediriger vers la page de détail
    if (!content.isFree) {
      router.push(`/content/${content.slug}`)
      return
    }

    // Pour les contenus gratuits, tenter le téléchargement
    if (!content.fileUrl && content.format !== 'ARTICLE') {
      alert('Fichier non disponible')
      router.push(`/content/${content.slug}`)
      return
    }
    
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/content/${content.id}/download`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 403) {
          if (errorData.needsAuth) {
            alert('Vous devez être connecté pour télécharger ce contenu')
            router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/content/${content.slug}`))
            return
          }
          if (errorData.needsPurchase) {
            router.push(`/content/${content.slug}`)
            return
          }
        }
        
        if (response.status === 404) {
          alert('Fichier non trouvé sur le serveur')
          return
        }
        
        throw new Error(errorData.error || 'Erreur de téléchargement')
      }

      // Télécharger le fichier
      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('Fichier vide')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      
      // Nom du fichier
      const extension = getFileExtension(content.fileUrl || '')
      a.download = `${content.slug}${extension || getDefaultExtension(content.format)}`
      
      document.body.appendChild(a)
      a.click()
      
      // Nettoyer
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
      
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error)
      alert(error.message || 'Erreur lors du téléchargement. Veuillez réessayer.')
    } finally {
      setIsDownloading(false)
    }
  }

  const getFileExtension = (url: string): string => {
    if (!url) return ''
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
    return match ? `.${match[1]}` : ''
  }

  const getDefaultExtension = (format: ContentFormat): string => {
    const extensionMap: { [key in ContentFormat]: string } = {
      [ContentFormat.ARTICLE]: '.html',
      [ContentFormat.EBOOK]: '.pdf',
      [ContentFormat.VIDEO]: '.mp4',
      [ContentFormat.AUDIO]: '.mp3',
      [ContentFormat.PODCAST]: '.mp3',
      [ContentFormat.COURSE]: '.zip'
    }
    return extensionMap[format] || '.txt'
  }

  const imageUrl = getImageUrl(content.thumbnail)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link href={`/content/${content.slug}`}>
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 group overflow-hidden">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={content.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-gray-400">
                {getContentIcon()}
              </div>
            </div>
          )}
          
          {/* Badges */}
          {content.isFree ? (
            <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Gratuit
            </span>
          ) : (
            <span className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {formatPrice(content.price)}
            </span>
          )}

          {/* Overlay au survol */}
          <div className="absolute inset-0 bg-transparent transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
              <ViewIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/content/${content.slug}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors text-gray-800 duration-200 line-clamp-2 min-h-[56px]">
            {content.title}
          </h3>
        </Link>

        {content.excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed min-h-[40px]">
            {content.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium capitalize">
              {getContentFormatText()}
            </span>
          </div>
          
          {getDurationText() && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {getDurationText()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center space-x-2">
            {content.author?.image ? (
              <Image
                src={getImageUrl(content.author.image) || ''}
                alt={content.author.name || 'Auteur'}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-xs text-gray-600 truncate max-w-[120px]">
              {content.author?.name || 'Auteur'}
            </span>
          </div>
        </div>

        {/* Bouton d'action */}
        {content.isFree ? (
          <button
            onClick={() => router.push(`/content/${content.slug}`)}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            <span>Accéder</span>
          </button>
        ) : (
          <button
            onClick={handleAction}
            disabled={isDownloading}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md hover:shadow-lg"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Téléchargement...</span>
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                <span>Voir les détails</span>
              </>
            )}
          </button>
        )}

        {/* Statistiques */}
        {content._count && (
          <div className="flex items-center justify-between mt-3 pt-3">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <EyeIcon className="w-3 h-3" />
                <span>{content.views || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <StarIcon className="w-3 h-3" />
                <span>{content._count.reviews}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DownloadIcon className="w-3 h-3" />
                <span>{content.downloads || 0}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Tous les composants d'icônes (gardez ceux existants et ajoutez EyeIcon)
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

// Composants d'icônes
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function PodcastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function CourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function FileSizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function PageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}