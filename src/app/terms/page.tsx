import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conditions d'utilisation</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Bienvenue sur DéveloppementPersonnel. En accédant à notre plateforme et en utilisant 
                nos services, vous acceptez les conditions générales d'utilisation suivantes.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-600 mb-8">
                En créant un compte ou en utilisant nos services, vous acceptez d'être lié par 
                ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez 
                ne pas utiliser notre plateforme.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Compte utilisateur</h2>
              <p className="text-gray-600 mb-4">
                Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes 
                responsable de :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Toutes les activités effectuées depuis votre compte</li>
                <li>Fournir des informations exactes et à jour</li>
                <li>Vous assurer que vous avez au moins 16 ans</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Contenu et licence</h2>
              <p className="text-gray-600 mb-4">
                Tous les contenus disponibles sur notre plateforme (articles, vidéos, formations) 
                sont protégés par le droit d'auteur. Nous vous accordons une licence limitée, 
                non exclusive et non transférable pour :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Accéder au contenu pour votre usage personnel</li>
                <li>Utiliser le contenu dans le cadre de votre développement personnel</li>
                <li>Partager des extraits raisonnables avec mention de la source</li>
              </ul>
              <p className="text-gray-600 mb-8">
                Il est interdit de reproduire, distribuer, modifier ou vendre notre contenu 
                sans autorisation préalable.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Comportement des utilisateurs</h2>
              <p className="text-gray-600 mb-4">
                Vous vous engagez à ne pas :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Utiliser la plateforme à des fins illégales</li>
                <li>Partager du contenu inapproprié ou nuisible</li>
                <li>Harceler d'autres utilisateurs</li>
                <li>Tenter de contourner les mesures de sécurité</li>
                <li>Utiliser des robots ou scripts automatisés</li>
                <li>Partager votre compte avec d'autres personnes</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Paiements et abonnements</h2>
              <p className="text-gray-600 mb-4">
                Certains contenus sont accessibles via des abonnements payants :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Les prix sont indiqués en XOF et TTC</li>
                <li>Les abonnements sont renouvelés automatiquement</li>
                <li>Vous pouvez annuler à tout moment</li>
                <li>Les remboursements sont soumis à notre politique de remboursement</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Limitation de responsabilité</h2>
              <p className="text-gray-600 mb-8">
                DéveloppementPersonnel fournit du contenu éducatif et informatif. Nous ne 
                garantissons pas des résultats spécifiques et déclinons toute responsabilité 
                concernant les décisions que vous prenez basées sur notre contenu. Le 
                développement personnel nécessite un engagement personnel et les résultats 
                peuvent varier selon les individus.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Résiliation</h2>
              <p className="text-gray-600 mb-8">
                Nous nous réservons le droit de suspendre ou résilier votre compte en cas 
                de violation des présentes conditions. Vous pouvez résilier votre compte 
                à tout moment via les paramètres de votre profil.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Modifications des conditions</h2>
              <p className="text-gray-600 mb-8">
                Nous pouvons modifier ces conditions d'utilisation. Les modifications 
                prendront effet 30 jours après leur publication. Votre utilisation 
                continue de la plateforme constitue votre acceptation des nouvelles conditions.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Droit applicable</h2>
              <p className="text-gray-600 mb-8">
                Ces conditions sont régies par le droit français. Tout litige relèvera 
                de la compétence des tribunaux français.
              </p>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">Contact</h3>
                <p className="text-yellow-700">
                  Pour toute question concernant ces conditions d'utilisation, 
                  contactez-nous à : legal@developpementpersonnel.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}