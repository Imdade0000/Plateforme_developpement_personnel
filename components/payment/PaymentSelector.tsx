// components/payment/PaymentSelector.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import KkiaPayButton from './kkiapayButton'
import FedaPayButton from './FedaPayButton'

interface PaymentSelectorProps {
  amount: number
  currency: string
  description: string
  productId: string
  productType: 'SUBSCRIPTION' | 'CONTENT'
  onSuccess?: () => void
  onError?: (error: string) => void
}

// Liste des pays supportés avec leurs indicatifs
const SUPPORTED_COUNTRIES = [
  { code: '229', name: 'Bénin', flag: '🇧🇯' },
  { code: '225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '227', name: 'Niger', flag: '🇳🇪' },
  { code: '228', name: 'Togo', flag: '🇹🇬' },
  { code: '233', name: 'Ghana', flag: '🇬🇭' },
  { code: '234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '235', name: 'Tchad', flag: '🇹🇩' },
  { code: '236', name: 'Centrafrique', flag: '🇨🇫' },
  { code: '240', name: 'Guinée équatoriale', flag: '🇬🇶' },
  { code: '241', name: 'Gabon', flag: '🇬🇦' },
  { code: '242', name: 'Congo', flag: '🇨🇬' },
  { code: '243', name: 'RDC', flag: '🇨🇩' },
  { code: '250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '251', name: 'Éthiopie', flag: '🇪🇹' },
  { code: '252', name: 'Somalie', flag: '🇸🇴' },
  { code: '253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '254', name: 'Kenya', flag: '🇰🇪' },
  { code: '255', name: 'Tanzanie', flag: '🇹🇿' },
  { code: '256', name: 'Ouganda', flag: '🇺🇬' },
  { code: '212', name: 'Maroc', flag: '🇲🇦' },
  { code: '213', name: 'Algérie', flag: '🇩🇿' },
  { code: '216', name: 'Tunisie', flag: '🇹🇳' },
  { code: '218', name: 'Libye', flag: '🇱🇾' },
  { code: '220', name: 'Gambie', flag: '🇬🇲' },
  { code: '221', name: 'Sénégal', flag: '🇸🇳' },
  { code: '222', name: 'Mauritanie', flag: '🇲🇷' },
  { code: '223', name: 'Mali', flag: '🇲🇱' },
  { code: '224', name: 'Guinée', flag: '🇬🇳' }
];

// CORRECTION: Type pour les méthodes de paiement
type PaymentMethod = 'kkiapay' | 'fedapay' | 'payoneer';

export default function PaymentSelector({
  amount,
  currency,
  description,
  productId,
  productType,
  onSuccess,
  onError
}: PaymentSelectorProps) {
  // CORRECTION: Utiliser le type PaymentMethod
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('kkiapay')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('225') // Côte d'Ivoire par défaut
  const [phoneError, setPhoneError] = useState('')
  const [detectedCountry, setDetectedCountry] = useState<{code: string, name: string} | null>(null)
  const { data: session, status } = useSession()

  const handlePaymentSuccess = () => {
    onSuccess?.()
  }

  const handlePaymentError = (error: string) => {
    onError?.(error)
  }

  // Détection automatique du pays quand le numéro change
  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value)
    setPhoneError('')

    // Détection automatique de l'indicatif
    if (value.length >= 3) {
      const cleaned = value.replace(/[^\d+]/g, '')
      let processed = cleaned

      if (processed.startsWith('+')) processed = processed.substring(1)
      if (processed.startsWith('00')) processed = processed.substring(2)

      // Chercher l'indicatif pays
      for (let i = 3; i >= 1; i--) {
        const potentialCode = processed.substring(0, i)
        const country = SUPPORTED_COUNTRIES.find(c => c.code === potentialCode)
        if (country) {
          setDetectedCountry({ code: country.code, name: country.name })
          return
        }
      }
    }
    
    setDetectedCountry(null)
  }

  // Formater le numéro avec l'indicatif sélectionné
  const getFormattedPhone = () => {
    if (!customerPhone) return ''

    let number = customerPhone.replace(/[^\d]/g, '')
    
    // Si le numéro commence déjà par un indicatif pays, le garder
    const hasCountryCode = SUPPORTED_COUNTRIES.some(country => 
      number.startsWith(country.code)
    )

    if (!hasCountryCode) {
      // Ajouter l'indicatif sélectionné
      number = selectedCountry + number
    }

    return number
  }

  const customerData = {
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: getFormattedPhone()
  }

  const selectedCountryInfo = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)

  if (status === 'loading') {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de méthode */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choisissez votre méthode de paiement
        </label>
        <div className="grid grid-cols-1 gap-3">
          {/* KkiaPay */}
          <label className="flex items-center p-3 border-2 border-transparent rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
            <input
              type="radio"
              value="kkiapay"
              checked={selectedMethod === 'kkiapay'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-3 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center mr-3 font-bold">
                KK
              </div>
              <div>
                <div className="font-medium">KkiaPay</div>
                <div className="text-sm text-gray-500">Mobile Money • Carte Bancaire</div>
              </div>
            </div>
          </label>

          {/* FedaPay */}
          <label className="flex items-center p-3 border-2 border-transparent rounded-lg hover:border-green-300 cursor-pointer transition-colors">
            <input
              type="radio"
              value="fedapay"
              checked={selectedMethod === 'fedapay'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-3 text-green-600 focus:ring-green-500"
            />
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center mr-3 font-bold">
                FP
              </div>
              <div>
                <div className="font-medium">FedaPay</div>
                <div className="text-sm text-gray-500">Mobile Money • Carte • Virement</div>
              </div>
            </div>
          </label>

          {/* Payoneer */}
          <label className="flex items-center p-3 border-2 border-transparent rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="radio"
              value="payoneer"
              checked={selectedMethod === 'payoneer'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 font-bold">
                P
              </div>
              <div>
                <div className="font-medium">Payoneer</div>
                <div className="text-sm text-gray-500">Carte internationale • Virement</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Saisie du numéro de téléphone pour les méthodes mobiles */}
      {(selectedMethod === 'kkiapay' || selectedMethod === 'fedapay') && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez votre pays
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} (+{country.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex space-x-2">
              <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-700">
                +{selectedCountry}
              </div>
              <input
                type="tel"
                placeholder="Ex: 0123456789"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Détection automatique */}
            {detectedCountry && detectedCountry.code !== selectedCountry && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                <p>
                  📍 Nous avons détecté le {detectedCountry.name} (+{detectedCountry.code})
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCountry(detectedCountry.code)}
                  className="text-blue-600 hover:text-blue-700 underline mt-1"
                >
                  Utiliser {detectedCountry.name} à la place
                </button>
              </div>
            )}

            {/* Aide */}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                💡 <strong>Formats acceptés :</strong>
              </p>
              <p className="text-xs text-gray-600">
                • <strong>Avec indicatif :</strong> +229012345678, 229012345678, 00229012345678
              </p>
              <p className="text-xs text-gray-600">
                • <strong>Sans indicatif :</strong> 0123456789 (utilisera +{selectedCountry})
              </p>
              <p className="text-xs text-gray-600">
                • <strong>Pays détecté :</strong> {selectedCountryInfo?.flag} {selectedCountryInfo?.name}
              </p>
            </div>

            {/* Aperçu du numéro formaté */}
            {customerPhone && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <p className="text-green-700">
                  <strong>Numéro envoyé :</strong> +{getFormattedPhone()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons de paiement dynamiques */}
      {selectedMethod === 'kkiapay' && (
        <KkiaPayButton
          amount={amount}
          currency={currency}
          description={description}
          productId={productId}
          productType={productType}
          customer={customerData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {selectedMethod === 'fedapay' && (
        <FedaPayButton
          amount={amount}
          currency={currency}
          description={description}
          productId={productId}
          productType={productType}
          customer={customerData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {selectedMethod === 'payoneer' && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            Intégration Payoneer en cours de développement
          </p>
          <button
            disabled
            className="mt-2 bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed"
          >
            Bientôt disponible
          </button>
        </div>
      )}

      {/* Sécurité et informations */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p className="flex items-center justify-center">
          <span className="mr-1">🔒</span> Paiement 100% sécurisé
        </p>
        <p>Support: support@votresite.com • +225 XX XX XX XX</p>
      </div>
    </div>
  )
}