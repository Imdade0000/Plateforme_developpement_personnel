// app/auth/two-factor/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// Composant qui utilise useSearchParams
function TwoFactorContent() {
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'2fa' | 'backup'>('2fa')
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    // Rediriger si l'utilisateur n'a pas besoin de 2FA
    if (session && !(session as any).requiresTwoFactor) {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twoFactorCode: activeTab === '2fa' ? twoFactorCode : undefined,
          backupCode: activeTab === 'backup' ? backupCode : undefined,
        }),
      })

      const data = await result.json()

      if (!result.ok) {
        throw new Error(data.error || 'Erreur de vérification')
      }

      // Mettre à jour la session
      await update()
      
      // Redirection vers la page demandée
      router.push(callbackUrl)

    } catch (error: any) {
      console.error('2FA verification error:', error)
      setError(error.message || 'Erreur lors de la vérification')
      
      // Réinitialiser les champs en cas d'erreur
      if (activeTab === '2fa') setTwoFactorCode('')
      if (activeTab === 'backup') setBackupCode('')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session || !(session as any).requiresTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 z-10">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vérification de sécurité
            </h2>
            <p className="mt-3 text-gray-600 text-lg font-medium">
              Pour finaliser votre connexion
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-shake">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Onglets */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('2fa')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === '2fa'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } rounded-t-lg`}
            >
              Code 2FA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'backup'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } rounded-t-lg`}
            >
              Code de secours
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {activeTab === '2fa' ? (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  Code de vérification à 6 chiffres
                </label>
                <div className="relative">
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-[0.5em] placeholder-gray-300 shadow-sm transition-all duration-200 text-gray-900"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setTwoFactorCode(value)
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Entrez le code à 6 chiffres de votre application d'authentification
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="backupCode" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Code de secours
                </label>
                <div className="relative">
                  <input
                    id="backupCode"
                    name="backupCode"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono uppercase tracking-wider placeholder-gray-300 shadow-sm text-gray-900"
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      setBackupCode(value)
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Entrez l'un de vos codes de secours à 8 caractères
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Vérification...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Vérifier et continuer</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas accès à votre authentificateur ?{' '}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === '2fa' ? 'backup' : '2fa')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Utiliser {activeTab === '2fa' ? 'un code de secours' : 'le code 2FA'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        input::placeholder {
          color: #9CA3AF;
        }
        
        .text-gray-900 {
          color: #111827;
        }
      `}</style>
    </div>
  )
}

// Composant principal avec Suspense
export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <TwoFactorContent />
    </Suspense>
  )
}