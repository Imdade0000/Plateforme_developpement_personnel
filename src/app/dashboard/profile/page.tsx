// app/profile/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

// Composant TwoFactorEmailSection intégré directement
function TwoFactorEmailSection({ user }: { user: { twoFactorEnabled: boolean } }) {
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

// Composant principal ProfilePage
export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        country: ''
      })
    }
  }, [session])

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    setProfileMessage('')
    setProfileError('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          country: formData.country
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfileMessage('Profil mis à jour avec succès !')
        setIsEditing(false)
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name
          }
        })
      } else {
        setProfileError(data.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (err) {
      setProfileError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Accès non autorisé</h2>
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {profileMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {profileMessage}
              </div>
            </div>
          )}

          {profileError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {profileError}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre nom complet"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{session.user?.name || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 py-2">{session.user?.email}</p>
                  <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    session.user?.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {session.user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+229 XX XX XX XX"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.phone || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez un pays</option>
                      <option value="BJ">Bénin</option>
                      <option value="FR">France</option>
                      <option value="SN">Sénégal</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="TG">Togo</option>
                      <option value="ML">Mali</option>
                      <option value="NE">Niger</option>
                      <option value="BF">Burkina Faso</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">
                      {formData.country === 'BJ' ? 'Bénin' : 
                       formData.country === 'FR' ? 'France' :
                       formData.country === 'SN' ? 'Sénégal' :
                       formData.country === 'CI' ? 'Côte d\'Ivoire' :
                       formData.country === 'TG' ? 'Togo' :
                       formData.country === 'ML' ? 'Mali' :
                       formData.country === 'NE' ? 'Niger' :
                       formData.country === 'BF' ? 'Burkina Faso' : 
                       'Non renseigné'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        name: session.user?.name || '',
                        email: session.user?.email || '',
                        phone: '',
                        country: ''
                      })
                      setIsEditing(false)
                      setProfileError('')
                      setProfileMessage('')
                    }}
                    disabled={isLoading}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-blue-800">Contenus achetés</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-green-800">Contenus terminés</p>
              </div>
            </div>
          </div>

          <TwoFactorEmailSection user={{
            twoFactorEnabled: session.user?.twoFactorEnabled || false,
          }} />
        </div>
      </div>
    </div>
  )
}