// app/content/[slug]/page.tsx 
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { ContentViewer } from '../../../../components/content/contentViewer'
import { ImageWithFallback } from '../../../../components/ui/ImageWithFallback'
import { ContentPaymentSection } from '../../../../components/content/ContentPaymentSection'
import Footer from '../../../../components/layout/Footer'

interface PageProps {
  params: Promise<{ slug: string }>
}

const getFormatEmoji = (format: string) => {
  switch (format) {
    case 'ARTICLE': return '📝'
    case 'VIDEO': return '🎬'
    case 'EBOOK': return '📚'
    case 'AUDIO': return '🎧'
    case 'PODCAST': return '🎙️'
    case 'COURSE': return '🎓'
    default: return '📄'
  }
}

const getFormatColor = (format: string) => {
  switch (format) {
    case 'ARTICLE': return 'bg-green-100 text-green-800'
    case 'VIDEO': return 'bg-purple-100 text-purple-800'
    case 'EBOOK': return 'bg-blue-100 text-blue-800'
    case 'AUDIO': return 'bg-orange-100 text-orange-800'
    case 'PODCAST': return 'bg-pink-100 text-pink-800'
    case 'COURSE': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function ContentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  
  // CORRECTION : Forcer la connexion même pour le contenu gratuit
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Connexion requise
              </h2>
              <p className="text-gray-600 mb-6">
                Vous devez être connecté pour accéder à ce contenu, même s'il est gratuit.
              </p>
              <div className="space-y-3">
                <a
                  href={`/auth/signin?callbackUrl=/content/${slug}`}
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  Se connecter
                </a>
                <a
                  href="/auth/signup"
                  className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Créer un compte
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const content = await prisma.content.findFirst({
    where: { 
      slug: slug,
      status: 'PUBLISHED'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      purchases: {
        where: {
          userId: session.user.id
        }
      },
      _count: {
        select: {
          purchases: true,
          reviews: true,
          favorites: true,
        },
      },
      reviews: {
        where: {
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!content) {
    notFound()
  }

  const hasPurchased = content.purchases && content.purchases.length > 0
  const canAccess = content.isFree || hasPurchased || session?.user?.role === 'ADMIN'

  // Fallback pour l'image principale
  const mainImageFallback = (
    <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
      <span className="text-6xl">{getFormatEmoji(content.format)}</span>
    </div>
  )

  // Fallback pour l'image d'auteur
  const authorImageFallback = (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-sm text-gray-600">👤</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-8 border-b">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Image/Thumbnail */}
                <div className="lg:w-1/3">
                  <ImageWithFallback
                    src={content.thumbnail || ''}
                    alt={content.title}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md"
                    fallback={mainImageFallback}
                  />
                </div>

                {/* Informations */}
                <div className="lg:w-2/3">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFormatColor(content.format)}`}>
                      {content.format}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {content.difficulty}
                    </span>
                    {content.durationMinutes && (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        {content.durationMinutes} min
                      </span>
                    )}
                    {content.isFree ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Gratuit
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Premium
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {content.title}
                  </h1>

                  <p className="text-lg text-gray-600 mb-6">
                    {content.excerpt}
                  </p>

                  {/* Auteur */}
                  <div className="flex items-center gap-3 mb-6">
                    <ImageWithFallback
                      src={content.author.image || ''}
                      alt={content.author.name || 'Auteur'}
                      className="w-10 h-10 rounded-full object-cover"
                      fallback={authorImageFallback}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {content.author.name || 'Auteur'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Créateur de contenu
                      </p>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-6">
                    <span>👁️ {content.views} vues</span>
                    <span>❤️ {content.likes} likes</span>
                    <span>⭐ {content.rating?.toFixed(1) || '0.0'} ({content._count.reviews} avis)</span>
                    <span>🛒 {content._count.purchases} ventes</span>
                    <span>📥 {content.downloads} téléchargements</span>
                  </div>

                  {/* Prix et achat */}
                  <div className="flex items-center justify-between">
                    <div>
                      {content.isFree ? (
                        <span className="text-2xl font-bold text-green-600">Gratuit</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {content.price?.toLocaleString('fr-FR')} XOF
                          </span>
                          {content.discountPercent && content.discountPercent > 0 && (
                            <span className="text-sm text-red-600 line-through">
                              {content.price && (content.price * (1 + content.discountPercent / 100)).toFixed(0)} XOF
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Statut d'accès */}
                    <div>
                      {canAccess ? (
                        <span className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
                          ✅ Accès autorisé
                        </span>
                      ) : (
                        <span className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                          Acheter pour {content.price?.toLocaleString('fr-FR')} XOF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Paiement */}
            {!canAccess && !content.isFree && (
              <ContentPaymentSection 
                content={{
                  id: content.id,
                  title: content.title,
                  price: content.price || 0,
                  currency: content.currency || 'XOF',
                  slug: content.slug
                }}
                session={session}
              />
            )}

            {/* Contenu principal */}
            <div className="p-8">
              <ContentViewer 
                content={content}
                hasAccess={canAccess}
                session={session}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer intégré */}
      <Footer />
    </div>
  )
}