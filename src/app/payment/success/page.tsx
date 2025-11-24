// app/payment/success/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Composant qui utilise useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transaction_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // Ici vous pouvez vérifier le statut de la transaction
    // Pour l'instant, on simule un succès
    setTimeout(() => {
      setStatus('success')
    }, 2000)
  }, [transactionId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre paiement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement Réussi !</h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre achat. Votre accès a été activé.
        </p>
        {transactionId && (
          <p className="text-sm text-gray-500 mb-4">
            Transaction ID: {transactionId}
          </p>
        )}
        <div className="space-y-3">
          <Link 
            href="/dashboard" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Accéder à mon tableau de bord
          </Link>
          <Link 
            href="/content" 
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition"
          >
            Explorer le contenu
          </Link>
        </div>
      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}