// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'BJ', // Bénin par défaut
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()

  const countries = [
    { code: 'BJ', name: 'Bénin' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'TG', name: 'Togo' },
    { code: 'ML', name: 'Mali' },
    { code: 'NE', name: 'Niger' },
    { code: 'GN', name: 'Guinée' },
    { code: 'CM', name: 'Cameroun' },
    { code: 'CD', name: 'République Démocratique du Congo' },
    { code: 'CG', name: 'République du Congo' },
    { code: 'GA', name: 'Gabon' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'MA', name: 'Maroc' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'ES', name: 'Espagne' },
    { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'SE', name: 'Suède' },
    { code: 'NO', name: 'Norvège' },
    { code: 'DK', name: 'Danemark' },
    { code: 'FI', name: 'Finlande' },
    { code: 'RU', name: 'Russie' },
    { code: 'CN', name: 'Chine' },
    { code: 'JP', name: 'Japon' },
    { code: 'KR', name: 'Corée du Sud' },
    { code: 'IN', name: 'Inde' },
    { code: 'BR', name: 'Brésil' },
    { code: 'MX', name: 'Mexique' },
    { code: 'AR', name: 'Argentine' },
    { code: 'AU', name: 'Australie' },
    { code: 'NZ', name: 'Nouvelle-Zélande' },
    { code: 'ZA', name: 'Afrique du Sud' },
    { code: 'NG', name: 'Nigéria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'ET', name: 'Éthiopie' },
    { code: 'EG', name: 'Égypte' },
    { code: 'SA', name: 'Arabie Saoudite' },
    { code: 'AE', name: 'Émirats Arabes Unis' },
    { code: 'IL', name: 'Israël' },
    { code: 'TR', name: 'Turquie' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError('Le nom est obligatoire')
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('L\'email est obligatoire')
      setIsLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('Le numéro de téléphone est obligatoire')
      setIsLoading(false)
      return
    }

    try {
      // Appel API d'inscription
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // Afficher le modal de succès
      setShowSuccessModal(true)

    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('')
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    // Rediriger vers la page de connexion
    router.push('/auth/signin?message=Inscription réussie ! Vous pouvez maintenant vous connecter.')
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8 z-10">
          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Commençons
              </h2>
              <p className="mt-3 text-gray-600 text-lg font-medium">
                Rejoignez notre communauté
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Votre voyage vers le développement personnel commence ici
              </p>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                        placeholder="+229 XX XX XX XX"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                      Pays *
                    </label>
                    <div className="relative">
                      <select
                        id="country"
                        name="country"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none shadow-sm text-gray-900"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                      placeholder="Minimum 6 caractères"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                      placeholder="Retapez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Création du compte...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Créer mon compte</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>

              <div className="text-center pt-4">
                <Link 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            </form>

            {/* Conditions d'utilisation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  conditions d'utilisation
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

            {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 transform transition-all animate-scale-in shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Icône de succès animée */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-green-500 mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Félicitations !
              </h3>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes nos ressources de développement personnel pour transformer votre vie.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleSuccessModalClose}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Me connecter maintenant
                </button>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Continuer l'exploration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-checkmark {
          animation: checkmark 0.5s ease-in-out;
        }
        
        /* Styles pour améliorer la lisibilité */
        select option {
          background: white;
          color: black;
          padding: 8px;
        }
        
        select option:hover {
          background: #f3f4f6;
        }
        
        /* Assurer que le texte est visible dans tous les champs */
        input::placeholder {
          color: #9CA3AF;
        }
        
        select {
          color: #111827;
        }
        
        /* Améliorer le contraste pour l'accessibilité */
        .text-gray-900 {
          color: #111827;
        }
      `}</style>
    </>
  )
}