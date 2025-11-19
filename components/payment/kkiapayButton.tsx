// components/payment/KkiaPayButton.tsx
'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    openKkiapayWidget: (config: any) => void;
    closeKkiapayWidget: () => void;
  }
}

interface KkiaPayButtonProps {
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

export default function KkiaPayButton({
  amount,
  currency,
  description,
  productId,
  productType,
  customer,
  onSuccess,
  onError
}: KkiaPayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  // Charger le script KkiaPay
  useEffect(() => {
    const loadKkiapayScript = () => {
      if (typeof window.openKkiapayWidget !== 'undefined') {
        setWidgetLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.kkiapay.me/k.js'
      script.async = true
      script.onload = () => {
        console.log('✅ Script KkiaPay chargé avec succès')
        setWidgetLoaded(true)
        
        // Écouter les messages du widget KkiaPay
        window.addEventListener('message', handleKkiaPayMessage)
      }
      script.onerror = () => {
        console.error('❌ Erreur chargement script KkiaPay')
        setWidgetLoaded(false)
      }

      document.head.appendChild(script)

      // Nettoyage
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
        window.removeEventListener('message', handleKkiaPayMessage)
      }
    }

    loadKkiapayScript()
  }, [])

  // Gérer les messages du widget KkiaPay
  const handleKkiaPayMessage = (event: MessageEvent) => {
    // Vérifier que le message vient de KkiaPay
    if (event.origin !== 'https://widget.kkiapay.me') return

    console.log('📨 Message reçu de KkiaPay:', event.data)

    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'paymentSuccess':
          console.log('✅ Paiement réussi via message:', event.data)
          setLoading(false)
          if (currentTransactionId) {
            onSuccess?.(currentTransactionId)
          }
          break
        
        case 'paymentFailed':
          console.error('❌ Paiement échoué via message:', event.data)
          setLoading(false)
          onError?.(event.data.message || 'Paiement échoué')
          break
        
        case 'widgetClosed':
          console.log('ℹ️ Widget fermé via message')
          setLoading(false)
          break
      }
    }
  }

  const handlePayment = async () => {
    try {
      if (typeof window.openKkiapayWidget === 'undefined') {
        throw new Error('Widget KkiaPay non chargé. Veuillez réessayer.')
      }

      setLoading(true)

      // Appeler l'API pour préparer le paiement et obtenir les métadonnées
      const response = await fetch('/api/payments/kkiapay/initiate', {
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

      console.log('✅ Configuration KkiaPay reçue:', result.data)

      // Stocker l'ID de transaction pour les callbacks
      setCurrentTransactionId(result.data.transactionId)

      // CORRECTION: Configuration simplifiée sans fonctions de callback
      const widgetOptions = {
        amount: result.data.widgetConfig.amount,
        key: result.data.widgetConfig.key,
        sandbox: result.data.widgetConfig.sandbox,
        phone: result.data.widgetConfig.phone,
        name: result.data.widgetConfig.name,
        email: result.data.widgetConfig.email,
        data: result.data.widgetConfig.data,
        callback: result.data.widgetConfig.callback,
        theme: result.data.widgetConfig.theme,
        country: result.data.widgetConfig.country,
        description: result.data.widgetConfig.description
        // SUPPRIMÉ: onSuccess, onFailed, onClosed (causent l'erreur)
      }

      console.log('🚀 Ouverture du widget avec:', widgetOptions)

      // OUVERTURE DU WIDGET KKIAPAY
      window.openKkiapayWidget(widgetOptions)

      // Surveiller la fermeture du widget (fallback)
      const checkWidgetClosed = setInterval(() => {
        // Cette méthode n'est pas fiable mais peut servir de fallback
        // La méthode principale est via les messages
      }, 1000)

      // Nettoyer après 5 minutes
      setTimeout(() => {
        clearInterval(checkWidgetClosed)
        setLoading(false)
      }, 300000)

    } catch (error: any) {
      console.error('❌ Erreur paiement KkiaPay:', error)
      setLoading(false)
      onError?.(error.message || 'Erreur lors du lancement du paiement')
    }
  }

  // Test direct depuis la console (pour debug)
  const testWidgetDirectly = () => {
    if (typeof window.openKkiapayWidget === 'undefined') {
      alert('Script KkiaPay non chargé!')
      return
    }

    const testConfig = {
      amount: 100,
      key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '114d0d80d7f011ef8aabe7627301e68c',
      sandbox: true,
      phone: '22997979797', // Numéro de test
      name: 'Test Utilisateur',
      email: 'test@example.com',
      callback: `${window.location.origin}/api/payments/kkiapay/callback`,
      theme: '#0095ff',
      country: '229',
      description: 'Paiement test'
    }

    console.log('🧪 Test direct du widget:', testConfig)
    window.openKkiapayWidget(testConfig)
  }

  return (
    <div className="space-y-4">
      {/* Bouton de paiement principal */}
      <button
        onClick={handlePayment}
        disabled={loading || !widgetLoaded}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Ouverture du paiement...
          </div>
        ) : !widgetLoaded ? (
          'Chargement du widget...'
        ) : (
          `Payer ${amount} ${currency} avec KkiaPay`
        )}
      </button>

      {/* Statut du chargement */}
      {!widgetLoaded && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-sm text-yellow-700">
              Chargement du module de paiement...
            </span>
          </div>
        </div>
      )}

      {loading && widgetLoaded && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">
              Ouverture de l'interface de paiement...
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Si la fenêtre ne s'ouvre pas, vérifiez votre bloqueur de popups.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-500 mt-0.5">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Comment procéder :</p>
            <ul className="mt-1 space-y-1">
              <li>• Le widget KkiaPay s'ouvrira dans une fenêtre</li>
              <li>• Choisissez "Mobile Money" ou "Carte Bancaire"</li>
              <li>• Utilisez un numéro de test pour les tests</li>
              <li>• Vous serez redirigé automatiquement après paiement</li>
              <li>• Le statut sera mis à jour via notre système</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bouton de test (debug) - à retirer en production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Mode développement :</p>
          <button
            onClick={testWidgetDirectly}
            className="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600"
          >
            Tester le widget directement
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Test avec numéro: <strong>22997979797</strong>
          </p>
        </div>
      )}

      {/* Détails de sécurité */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p className="flex items-center justify-center">
          <span className="mr-1">🔒</span> Paiement 100% sécurisé par KkiaPay
        </p>
        <p>Le statut sera mis à jour automatiquement après paiement</p>
      </div>
    </div>
  )
}