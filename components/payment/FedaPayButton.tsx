// components/payment/FedaPayButton.tsx
'use client'

import { useState } from 'react'

interface FedaPayButtonProps {
  amount: number
  currency: string
  description: string
  productId: string
  productType: 'SUBSCRIPTION' | 'CONTENT'
  customer: {
    name: string
    email: string
    phone: string
  }
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export default function FedaPayButton({
  amount,
  currency,
  description,
  productId,
  productType,
  customer,
  onSuccess,
  onError
}: FedaPayButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Appeler l'API pour initier le paiement FedaPay
      const response = await fetch('/api/payments/fedapay/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          productId,
          productType,
          customer
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log('✅ Paiement FedaPay initié:', result.data)

      // Rediriger vers la page de paiement FedaPay
      window.location.href = result.data.paymentUrl

    } catch (error: any) {
      console.error('❌ Erreur paiement FedaPay:', error)
      setLoading(false)
      onError?.(error.message || 'Erreur lors du lancement du paiement FedaPay')
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Initialisation FedaPay...
          </div>
        ) : (
          `Payer ${amount} ${currency} avec FedaPay`
        )}
      </button>

      {/* Instructions FedaPay */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-green-500 mt-0.5">💡</div>
          <div className="text-sm text-green-800">
            <p className="font-semibold">Avec FedaPay :</p>
            <ul className="mt-1 space-y-1">
              <li>• Vous serez redirigé vers FedaPay</li>
              <li>• Paiement par Mobile Money et Carte</li>
              <li>• Supporte tous les opérateurs</li>
              <li>• Retour automatique après paiement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}