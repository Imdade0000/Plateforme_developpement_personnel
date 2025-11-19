// app/admin/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../../../lib/auth';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  // Statistiques corrigées
  const stats = await prisma.$transaction([
    // Nombre de contenus (tous les contenus pour l'admin)
    prisma.content.count(),
    // Nombre d'utilisateurs
    prisma.user.count({ where: { role: 'USER' } }),
    // Revenus totaux (tous les achats)
    prisma.purchase.aggregate({ 
      _sum: { amount: true }
    }),
    // Note moyenne (toutes les reviews)
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { 
        rating: { gt: 0 }
      }
    })
  ]);

  const [contentCount, userCount, revenue, averageRating] = stats;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-gray-600 mb-8">
            Vue d'ensemble de votre plateforme
          </p>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{contentCount}</div>
                  <div className="text-gray-600 mt-1">Contenus Publiés</div>
                </div>
                <div className="text-blue-600 text-2xl">📚</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{userCount}</div>
                  <div className="text-gray-600 mt-1">Utilisateurs Inscrits</div>
                </div>
                <div className="text-green-600 text-2xl">👥</div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {revenue._sum.amount ? revenue._sum.amount.toLocaleString() : 0} XOF
                  </div>
                  <div className="text-gray-600 mt-1">Revenus Totaux</div>
                </div>
                <div className="text-purple-600 text-2xl">💰</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {averageRating._avg.rating ? averageRating._avg.rating.toFixed(1) : '0.0'}/5
                  </div>
                  <div className="text-gray-600 mt-1">Note Moyenne</div>
                </div>
                <div className="text-yellow-600 text-2xl">⭐</div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Gestion du Contenu</h3>
              <div className="space-y-3">
                <a 
                  href="/admin/content/new" 
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>+</span>
                  Créer un Nouveau Contenu
                </a>
                <a 
                  href="/admin/content" 
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>📝</span>
                  Gérer tous les Contenus
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Administration</h3>
              <div className="space-y-3">
                <a 
                  href="/admin/users" 
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>👥</span>
                  Gérer les Utilisateurs
                </a>
                <a 
                  href="/admin/analytics" 
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>📊</span>
                  Statistiques Détaillées
                </a>
              </div>
            </div>
          </div>

          {/* Contenu récent - Section optionnelle */}
          <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Contenus Récents</h3>
            <div className="space-y-3">
              {/* Vous pouvez ajouter une liste des contenus récents ici */}
              <p className="text-gray-600 text-center py-4">
                Fonctionnalité à venir : Liste des contenus récemment publiés
              </p>
              <a 
                href="/admin/content" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                Voir tous les contenus →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}