// components/content/ContentPaymentSection.tsx
'use client'

import { useState } from 'react'
import PaymentSelector from '../payment/PaymentSelector'

interface ContentPaymentSectionProps {
  content: {
    id: string
    title: string
    price: number
    currency: string
    slug: string
  }
  session: any
}

export function ContentPaymentSection({ content, session }: ContentPaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentSuccess = () => {
    console.log('Paiement réussi - accès accordé')
    // Recharger la page pour mettre à jour l'accès
    window.location.reload()
  }

  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error)
    setIsProcessing(false)
    // Vous pouvez ajouter une notification toast ici
    alert(`Erreur de paiement: ${error}`)
  }

  const paymentData = {
    amount: content.price || 0,
    currency: content.currency || 'XOF',
    description: `Achat de "${content.title}"`,
    productId: content.id,
    productType: 'CONTENT' as const,
  }

  return (
    <div className="border-b bg-gradient-to-r from-orange-50 to-yellow-50">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Obtenez un accès immédiat à ce contenu
          </h3>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <PaymentSelector 
              {...paymentData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
          
          {/* Garanties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Accès immédiat</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600">🔄</span>
              <span>Remboursement 7 jours</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600">🔒</span>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}