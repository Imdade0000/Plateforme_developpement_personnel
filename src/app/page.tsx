// app/(public)/page.tsx
import Link from 'next/link'
import Footer from '../../components/layout/Footer'

// Fonction temporaire pour éviter l'erreur de base de données
async function getFeaturedContent() {
  // Retournez des données mockées temporairement
  return [
    {
      id: "1",
      title: "Introduction au développement personnel",
      slug: "introduction-developpement-personnel",
      excerpt: "Découvrez les bases du développement personnel pour transformer votre vie.",
      content: "Contenu de l'article...",
      type: "ARTICLE",
      thumbnail: null,
      fileUrl: null,
      duration: null,
      fileSize: null,
      isPremium: false,
      price: 0,
      currency: "XOF",
      tags: ["développement", "introduction"],
      views: 100,
      likes: 25,
      rating: 4.5,
      totalReviews: 10,
      status: "PUBLISHED",
      featured: true,
      authorId: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Techniques de méditation guidée",
      slug: "techniques-meditation-guidee",
      excerpt: "Apprenez à méditer efficacement pour réduire le stress.",
      content: "Contenu de l'article...",
      type: "VIDEO",
      thumbnail: null,
      fileUrl: null,
      duration: 30,
      fileSize: null,
      isPremium: true,
      price: 2000,
      currency: "XOF",
      tags: ["méditation", "stress"],
      views: 150,
      likes: 40,
      rating: 4.8,
      totalReviews: 15,
      status: "PUBLISHED",
      featured: true,
      authorId: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
}

export default async function HomePage() {
  const featuredContent = await getFeaturedContent()
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transformez votre vie
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Découvrez des ressources exclusives de développement personnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/content"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explorer le contenu
            </Link>
            <Link 
              href="/auth/signup"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 container mx-auto px-4 flex-grow">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Contenu en vedette</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez nos ressources les plus populaires.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContent.map((content) => (
            <div key={content.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">
              <h3 className="font-bold text-lg mb-2 text-gray-800">{content.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{content.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  content.isPremium 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'bg-gradient-to-r from-green-400 to-teal-400 text-white'
                }`}>
                  {content.isPremium ? 'Premium' : 'Gratuit'}
                </span>
                <Link 
                  href={`/content/${content.slug}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                >
                  Voir plus
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Sections */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pourquoi nous choisir ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Contenu de qualité</h3>
              <p className="text-gray-600">Des ressources créées par des experts en développement personnel.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Accès sécurisé</h3>
              <p className="text-gray-600">Votre progression et vos données sont protégées.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Communauté active</h3>
              <p className="text-gray-600">Rejoignez une communauté bienveillante et motivée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}