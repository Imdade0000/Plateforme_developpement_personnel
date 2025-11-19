import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">À propos de nous</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Découvrez notre mission et notre vision pour votre développement personnel
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notre Mission</h2>
              <p className="text-gray-600 mb-6">
                DéveloppementPersonnel a été créé avec une vision simple mais puissante : 
                rendre le développement personnel accessible à tous. Nous croyons que chaque 
                individu mérite de vivre une vie épanouie et équilibrée.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-6">
                Fondé en 2025, notre plateforme est née du constat que les ressources 
                de qualité en développement personnel étaient souvent dispersées ou 
                difficilement accessibles. Nous avons donc décidé de créer un espace 
                unique où chacun peut trouver des contenus adaptés à ses besoins.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Nos Valeurs</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg text-blue-800 mb-2">Authenticité</h3>
                  <p className="text-blue-700">
                    Nous partageons des conseils pratiques et réalistes, basés sur 
                    des méthodes éprouvées.
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Accessibilité</h3>
                  <p className="text-purple-700">
                    Des contenus gratuits et premium adaptés à tous les budgets.
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg text-green-800 mb-2">Qualité</h3>
                  <p className="text-green-700">
                    Tous nos contenus sont créés et validés par des experts certifiés.
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg text-orange-800 mb-2">Communauté</h3>
                  <p className="text-orange-700">
                    Une plateforme bienveillante où chacun peut progresser à son rythme.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notre Équipe</h2>
              <p className="text-gray-600 mb-8">
                Notre équipe est composée de coachs certifiés, de psychologues et 
                d'experts en développement personnel passionnés par l'accompagnement 
                des personnes dans leur épanouissement personnel et professionnel.
              </p>

              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Rejoignez-nous</h3>
                <p className="text-gray-600 mb-4">
                  Commencez votre voyage vers une vie plus épanouissante dès aujourd'hui.
                </p>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block"
                >
                  Créer un compte gratuit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}