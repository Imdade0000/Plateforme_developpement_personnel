// app/admin/content/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

const DeleteContentButton = dynamic(() => import('../../../components/admin/DeleteContentButton'))

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions)

   // DOUBLE PROTECTION
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }
  
  // Récupérer tous les contenus
  const contents = await prisma.content.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          purchases: true,
          reviews: true,
        },
      },
    },
  })

  // Fonction pour obtenir l'emoji du type de contenu
  const getContentTypeEmoji = (contentType: string) => {
    switch (contentType) {
      case 'VIDEO': return '🎬'
      case 'ARTICLE': return '📝'
      case 'EBOOK': return '📚'
      case 'AUDIO': return '🎧'
      case 'PODCAST': return '🎙️'
      case 'COURSE': return '📚'
      default: return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des contenus</h1>
              <p className="text-gray-600 mt-1">Interface d'administration</p>
            </div>
            <Link
              href="/admin/content/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <span>+</span>
              Nouveau contenu
            </Link>
          </div>

          {contents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun contenu</h2>
              <p className="text-gray-600 mb-6">Commencez par créer votre premier contenu</p>
              <Link
                href="/admin/content/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Créer le premier contenu
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm">
                              {getContentTypeEmoji(content.contentType)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {content.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{content.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{content.author.name}</div>
                        <div className="text-sm text-gray-500">{content.author.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          content.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : content.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {content.status === 'PUBLISHED' ? 'Publié' : 
                           content.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            content.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {content.isFree ? 'Gratuit' : `${content.price} XOF`}
                          </span>
                          {content.isFeatured && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold">{content._count.purchases}</div>
                          <div className="text-xs text-gray-400">ventes</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/content/${content.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            Voir
                          </Link>
                          <Link
                            href={`/admin/content/edit/${content.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Éditer
                          </Link>
                          <DeleteContentButton id={content.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}