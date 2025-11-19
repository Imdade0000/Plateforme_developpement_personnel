import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Politique de confidentialité</h1>
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
                Chez DéveloppementPersonnel, nous prenons la protection de vos données personnelles 
                très au sérieux. Cette politique explique comment nous collectons, utilisons et 
                protégeons vos informations.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Informations que nous collectons</h2>
              <p className="text-gray-600 mb-6">
                Nous collectons les informations suivantes lorsque vous utilisez notre plateforme :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Informations de compte (nom, email, mot de passe)</li>
                <li>Informations de profil (photo, biographie, préférences)</li>
                <li>Données de navigation et d'utilisation de la plateforme</li>
                <li>Informations de paiement (traitées de manière sécurisée par nos prestataires)</li>
                <li>Contenu que vous créez ou partagez sur la plateforme</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Utilisation des informations</h2>
              <p className="text-gray-600 mb-6">
                Nous utilisons vos informations pour :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Vous proposer du contenu pertinent</li>
                <li>Traiter vos paiements</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Partage des informations</h2>
              <p className="text-gray-600 mb-6">
                Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous pouvons 
                partager vos informations dans les cas suivants :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Avec votre consentement explicite</li>
                <li>Avec nos prestataires de services (hébergement, paiement, email)</li>
                <li>Pour respecter des obligations légales</li>
                <li>Pour protéger nos droits ou la sécurité des utilisateurs</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Protection des données</h2>
              <p className="text-gray-600 mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                appropriées pour protéger vos données contre tout accès non autorisé, modification, 
                divulgation ou destruction.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Vos droits</h2>
              <p className="text-gray-600 mb-6">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies</h2>
              <p className="text-gray-600 mb-6">
                Nous utilisons des cookies pour améliorer votre expérience utilisateur, analyser 
                le trafic et personnaliser le contenu. Vous pouvez contrôler les cookies via 
                les paramètres de votre navigateur.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Contact</h2>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour 
                exercer vos droits, contactez-nous à :
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Email :</strong> privacy@developpementpersonnel.com
              </p>
              <p className="text-gray-600">
                <strong>Adresse :</strong> 123 Rue du Développement, 75000 Paris, France
              </p>

              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h3 className="font-bold text-blue-800 mb-2">Modifications de la politique</h3>
                <p className="text-blue-700">
                  Nous pouvons mettre à jour cette politique de confidentialité périodiquement. 
                  Nous vous informerons de tout changement important par email ou via une 
                  notification sur notre plateforme.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}