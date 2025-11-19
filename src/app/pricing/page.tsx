// app/pricing/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "discovery",
      name: "Découverte",
      price: 0,
      currency: "XOF",
      period: "gratuit",
      features: [
        "Accès à 3 contenus gratuits",
        "Newsletter hebdomadaire",
        "Support de base"
      ],
      cta: "Commencer gratuitement",
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      price: 5000,
      currency: "XOF",
      period: "mois",
      features: [
        "Accès à tous les contenus",
        "Nouveaux contenus chaque semaine",
        "Support prioritaire",
        "Accès aux cours exclusifs"
      ],
      cta: "S'abonner maintenant",
      popular: true
    },
    {
      id: "a-la-carte",
      name: "À la carte",
      price: 1000,
      currency: "XOF",
      period: "contenu",
      features: [
        "Achat de contenus individuels",
        "Accès permanent aux achats",
        "Pas d'engagement"
      ],
      cta: "Voir le contenu",
      popular: false
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    
    if (!session) {
      // Rediriger vers la connexion
      window.location.href = '/auth/signin?returnTo=/pricing'
      return
    }

    // Simuler le processus de paiement
    const plan = plans.find(p => p.id === planId)
    if (plan && plan.price > 0) {
      alert(`Fonctionnalité de paiement pour ${plan.name} à venir!`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choisissez votre formule</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sélectionnez l'option qui correspond le mieux à vos besoins de développement personnel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform ${
                plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : 'hover:scale-105'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Plus populaire
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString('fr-FR')}
                  </span>
                  {plan.price > 0 && (
                    <>
                      <span className="text-gray-600"> {plan.currency}</span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.price === 0
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.price === 0 && !session ? 'Créer un compte' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section d'information */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">✅ Garantie satisfait ou remboursé</h3>
            <p className="text-gray-600">
              Vous avez 14 jours pour changer d'avis. Si notre contenu ne vous convient pas, 
              nous vous remboursons intégralement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}