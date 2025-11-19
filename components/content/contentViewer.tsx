// components/content/ContentViewer.tsx
'use client'

import { Content, ContentFormat } from '@prisma/client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import useContentView from '../../src/hooks/useContentView'

interface ContentViewerProps {
  content: Content & {
    author: {
      id: string
      name: string | null
      image: string | null
      bio: string | null
    }
  }
  hasAccess: boolean
  session: any
}

export function ContentViewer({ content, hasAccess, session }: ContentViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { data: sessionData, update } = useSession()

  // Use centralized hook to register a single view per content per session
  useContentView(content.id, hasAccess, session?.user?.id)

  const handleDownload = async () => {
    if (!hasAccess) {
      alert('Vous devez acheter ce contenu pour le télécharger')
      return
    }

    if (!content.fileUrl) {
      alert('Fichier non disponible')
      return
    }

    setIsDownloading(true)
    try {
      console.log('📥 Début du téléchargement pour:', content.title)
      
      // CORRECTION : Utiliser la route API pour incrémenter les téléchargements
      const response = await fetch(`/api/content/${content.id}/download`)
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('Accès non autorisé. Achetez ce contenu pour y accéder.')
          return
        }
        throw new Error('Erreur de téléchargement')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      
      const extension = getFileExtension(content.fileUrl)
      a.download = `${content.slug}${extension}`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('✅ Téléchargement réussi')
      
      // Mettre à jour la session pour refléter les changements
      if (sessionData) {
        await update()
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleRead = async () => {
    if (!hasAccess) return

    try {
      console.log('📖 Marquage comme lu pour:', content.title)
      
      // CORRECTION : Marquer comme lu
      const response = await fetch(`/api/content/${content.id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          contentId: content.id
        })
      })

      if (response.ok) {
        console.log('✅ Contenu marqué comme lu')
      }

      // Mettre à jour la session
      if (sessionData) {
        await update()
      }
    } catch (error) {
      console.error('❌ Erreur marquage comme lu:', error)
    }
  }

  const getFileExtension = (url: string): string => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
    return match ? `.${match[1]}` : ''
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderContent = () => {
    if (!hasAccess) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-4">
              Contenu protégé
            </h3>
            <p className="text-gray-600 mb-6">
              {content.isFree 
                ? "Connectez-vous pour accéder à ce contenu gratuit"
                : "Achetez ce contenu pour y accéder immédiatement"
              }
            </p>
            {!session && (
              <a
                href="/auth/signin"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Se connecter
              </a>
            )}
          </div>
        </div>
      )
    }

    switch (content.format) {
      case ContentFormat.ARTICLE:
        return (
          <div className="prose max-w-none">
            {/* CORRECTION : Bouton pour marquer comme lu */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRead}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>📖</span>
                Marquer comme lu
              </button>
            </div>
            
            {content.content ? (
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun contenu disponible</p>
              </div>
            )}
          </div>
        )
      
      case ContentFormat.VIDEO:
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                controls 
                className="w-full h-full"
                poster={content.thumbnail || undefined}
              >
                <source src={content.fileUrl || ''} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
            {content.fileUrl && (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  <DownloadIcon className="w-5 h-5" />
                  {isDownloading ? 'Téléchargement...' : 'Télécharger la vidéo'}
                </button>
              </div>
            )}
          </div>
        )
      
      case ContentFormat.AUDIO:
      case ContentFormat.PODCAST:
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <div className="text-6xl mb-4">🎧</div>
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.excerpt}</p>
            </div>
            <audio 
              controls 
              className="w-full"
            >
              <source src={content.fileUrl || ''} type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            {content.fileUrl && (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  <DownloadIcon className="w-5 h-5" />
                  {isDownloading ? 'Téléchargement...' : 'Télécharger l\'audio'}
                </button>
              </div>
            )}
          </div>
        )
      
      case ContentFormat.EBOOK:
      case ContentFormat.COURSE:
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <div className="text-6xl mb-4">
                {content.format === ContentFormat.EBOOK ? '📚' : '🎓'}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{content.title}</h3>
              <p className="text-gray-600 mb-4">{content.excerpt}</p>
              {content.fileSize && (
                <p className="text-sm text-gray-500">
                  Taille: {formatFileSize(content.fileSize)}
                </p>
              )}
            </div>
            
            {content.fileUrl && (
              <div className="flex justify-center gap-4 flex-wrap">
                {content.format === ContentFormat.EBOOK && (
                  <a 
                    href={content.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <EyeIcon className="w-5 h-5" />
                    Voir dans le navigateur
                  </a>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <DownloadIcon className="w-5 h-5" />
                  {isDownloading ? 'Téléchargement...' : 'Télécharger'}
                </button>
              </div>
            )}

            {/* Aperçu PDF pour les ebooks */}
            {content.format === ContentFormat.EBOOK && content.fileUrl && (
              <div className="mt-8">
                <iframe 
                  src={content.fileUrl} 
                  className="w-full h-96 border rounded-lg"
                  title={`Aperçu de ${content.title}`}
                />
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-4">Fichier à télécharger</h3>
            <p className="text-gray-600 mb-6">
              Ce contenu est disponible en téléchargement
            </p>
            {content.fileUrl && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                <DownloadIcon className="w-5 h-5" />
                {isDownloading ? 'Téléchargement...' : 'Télécharger le fichier'}
              </button>
            )}
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* CORRECTION : Statistiques en temps réel */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>👁️</span>
            <span>{content.views} vues</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📥</span>
            <span>{content.downloads} téléchargements</span>
          </span>
        </div>
      </div>

      {renderContent()}
    </div>
  )
}

// Composants d'icônes
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}