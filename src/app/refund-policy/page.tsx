import Link from 'next/link'

export default function RefundPolicyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Politique de remboursement</h1>
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
                Chez DéveloppementPersonnel, nous nous engageons à fournir des contenus de qualité. 
                Si vous n'êtes pas satisfait de votre achat, notre politique de remboursement 
                vise à vous protéger et à garantir votre satisfaction.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Délai de rétractation</h2>
              <p className="text-gray-600 mb-8">
                Conformément au droit de la consommation, vous disposez d'un délai de 14 jours 
                à compter de la date d'achat pour demander un remboursement, sans avoir à justifier 
                de motifs.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Conditions de remboursement</h2>
              <p className="text-gray-600 mb-4">
                Les remboursements sont accordés dans les cas suivants :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Demande formulée dans les 14 jours suivant l'achat</li>
                <li>Problème technique empêchant l'accès au contenu que nous ne pouvons pas résoudre</li>
                <li>Erreur de notre part (double facturation, contenu non conforme à la description)</li>
                <li>Contenu inaccessible pour des raisons techniques de notre côté</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Cas de non-remboursement</h2>
              <p className="text-gray-600 mb-4">
                Les remboursements ne sont pas accordés dans les situations suivantes :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Après expiration du délai de 14 jours</li>
                <li>Si vous avez consulté plus de 20% du contenu payant</li>
                <li>Changement d'avis après avoir accédé au contenu</li>
                <li>Problèmes techniques liés à votre équipement ou connexion internet</li>
                <li>Non-satisfaction personnelle sans raison technique valable</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Procédure de remboursement</h2>
              <p className="text-gray-600 mb-4">
                Pour demander un remboursement :
              </p>
              <ol className="text-gray-600 mb-8 list-decimal list-inside space-y-2">
                <li>Envoyez un email à support@developpementpersonnel.com</li>
                <li>Indiquez votre nom, email et numéro de commande</li>
                <li>Précisez la raison de votre demande</li>
                <li>Joignez toute preuve utile (captures d'écran, etc.)</li>
              </ol>
              <p className="text-gray-600 mb-8">
                Nous traiterons votre demande dans un délai maximum de 15 jours ouvrables.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Méthodes de remboursement</h2>
              <p className="text-gray-600 mb-8">
                Les remboursements sont effectués selon la méthode de paiement originale. 
                Le délai d'arrivée des fonds dépend de votre banque ou prestataire de paiement.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Abonnements récurrents</h2>
              <p className="text-gray-600 mb-4">
                Pour les abonnements mensuels ou annuels :
              </p>
              <ul className="text-gray-600 mb-8 list-disc list-inside space-y-2">
                <li>Vous pouvez annuler à tout moment</li>
                <li>L'annulation prend effet à la fin de la période payée</li>
                <li>Aucun remboursement partiel n'est accordé pour les périodes non utilisées</li>
                <li>Les nouveaux cycles de facturation sont automatiquement annulés</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Contenu premium</h2>
              <p className="text-gray-600 mb-8">
                Pour les achats de contenu premium individuel (non abonnement), le remboursement 
                est possible dans les 14 jours si vous n'avez pas consulté plus de 20% du contenu.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Questions et support</h2>
              <p className="text-gray-600 mb-4">
                Avant de demander un remboursement, n'hésitez pas à contacter notre support 
                technique qui pourra peut-être résoudre votre problème :
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Email :</strong> support@developpementpersonnel.com
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Réponse sous :</strong> 48 heures ouvrables
              </p>

              <div className="bg-green-50 p-6 rounded-lg mt-8">
                <h3 className="font-bold text-green-800 mb-2">Satisfaction garantie</h3>
                <p className="text-green-700">
                  Notre objectif est votre satisfaction. Si vous rencontrez un problème 
                  avec notre contenu ou service, nous ferons tout notre possible pour 
                  le résoudre avant d'envisager un remboursement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}