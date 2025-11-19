// components/profile/TwoFactorEmailSection.tsx
'use client'

import { useState } from 'react'

interface TwoFactorEmailSectionProps {
  user: {
    twoFactorEnabled: boolean
  }
}

export default function TwoFactorEmailSection({ user }: TwoFactorEmailSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleToggle2FA = async (enable: boolean) => {
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const endpoint = enable 
        ? '/api/auth/2fa/enable' 
        : '/api/auth/2fa/disable'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(enable 
          ? 'Authentification à deux facteurs activée avec succès !' 
          : 'Authentification à deux facteurs désactivée.'
        )
        // Recharger la page pour mettre à jour l'état
        window.location.reload()
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Nouveaux codes de secours générés avec succès !')
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Authentification à deux facteurs (2FA)
      </h3>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">
              Authentification par email
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {user.twoFactorEnabled 
                ? '✅ 2FA activée - Vous recevrez un code par email à chaque connexion'
                : 'Recevez un code de vérification par email pour sécuriser votre compte'
              }
            </p>
          </div>
          
          <button
            onClick={() => handleToggle2FA(!user.twoFactorEnabled)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium ${
              user.twoFactorEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 transition`}
          >
            {isLoading ? 'Chargement...' : 
             user.twoFactorEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
          </button>
        </div>

        {user.twoFactorEnabled && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-medium text-yellow-800 mb-2">
              🔑 Codes de secours
            </h5>
            <p className="text-sm text-yellow-700 mb-3">
              En cas de perte d'accès à votre email, utilisez ces codes pour vous connecter.
              Chaque code ne peut être utilisé qu'une seule fois.
            </p>
            <button
              onClick={handleRegenerateBackupCodes}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 transition"
            >
              Régénérer les codes
            </button>
          </div>
        )}

        {/* Informations sur le fonctionnement */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Comment ça marche :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Activez la 2FA pour sécuriser votre compte</li>
            <li>À chaque connexion, vous recevrez un code à 6 chiffres par email</li>
            <li>Entrez ce code pour finaliser votre connexion</li>
            <li>Conservez vos codes de secours en lieu sûr</li>
          </ul>
        </div>
      </div>
    </div>
  )
}