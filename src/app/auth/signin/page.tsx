// src/app/auth/signin/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Composant qui utilise useSearchParams
function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    const messageParam = searchParams.get('message')
    const errorParam = searchParams.get('error')
    
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam))
    }
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    try {
      console.log('📝 Tentative de connexion initiale pour:', email)

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        isInitialAttempt: 'true'
      })

      console.log('📊 Résultat connexion:', result)

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          console.log('🔐 2FA requise - affichage du formulaire')
          setShow2FA(true)
          setPendingEmail(email)
          setError('')
          setMessage('✅ Un code de vérification à 6 chiffres a été envoyé à votre adresse email.')
        } else if (result.error === 'CredentialsSignin') {
          setError('Email ou mot de passe incorrect')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        console.log('✅ Connexion réussie sans 2FA')
        router.push(callbackUrl)
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    if (!useBackupCode && twoFactorCode.length !== 6) {
      setError('Le code de vérification doit contenir 6 chiffres')
      setIsLoading(false)
      return
    }

    if (useBackupCode && !backupCode.trim()) {
      setError('Veuillez entrer un code de secours')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔐 Vérification 2FA:', { 
        useBackupCode, 
        hasCode: useBackupCode ? !!backupCode : !!twoFactorCode 
      })

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        twoFactorCode: useBackupCode ? undefined : twoFactorCode,
        backupCode: useBackupCode ? backupCode.trim().toUpperCase() : undefined,
        redirect: false,
      })

      console.log('📊 Résultat 2FA:', result)

      if (result?.error) {
        console.error('❌ Erreur 2FA:', result.error)
        setError(result.error)
        
        if (useBackupCode) {
          setBackupCode('')
        } else {
          setTwoFactorCode('')
        }
      } else if (result?.ok) {
        console.log('✅ Connexion 2FA réussie')
        setMessage('Connexion réussie ! Redirection...')
        setTimeout(() => router.push(callbackUrl), 1000)
      }
    } catch (error: any) {
      console.error('❌ Erreur inattendue 2FA:', error)
      setError('Une erreur est survenue lors de la vérification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'email') setEmail(value)
    if (name === 'password') setPassword(value)
    if (error) setError('')
    if (message) setMessage('')
  }

  const handle2FACodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setTwoFactorCode(value)
    if (error) setError('')
  }

  const handleBackupCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackupCode(e.target.value.toUpperCase())
    if (error) setError('')
  }

  const reset2FAForm = () => {
    setShow2FA(false)
    setTwoFactorCode('')
    setBackupCode('')
    setUseBackupCode(false)
    setPendingEmail('')
    setError('')
    setMessage('')
  }

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode)
    setTwoFactorCode('')
    setBackupCode('')
    setError('')
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
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {show2FA ? 'Vérification' : 'Content de vous revoir'}
              </h2>
              <p className="mt-3 text-gray-600 text-lg font-medium">
                {show2FA 
                  ? (useBackupCode ? 'Utilisez un code de secours' : 'Entrez votre code de sécurité')
                  : 'Accédez à votre espace personnel'
                }
              </p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-scale-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-medium text-sm">{message}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {/* Main Login Form */}
            {!show2FA ? (
              <form className="mt-8 space-y-6" onSubmit={handleInitialSubmit}>
                <div className="space-y-5">
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 shadow-sm text-gray-900"
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Mot de passe oublié ?
                    </Link>
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
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Se connecter</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>

                <div className="text-center pt-4">
                  <span className="text-sm text-gray-600">Pas encore de compte ? </span>
                  <Link 
                    href="/auth/signup" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    S'inscrire
                  </Link>
                </div>
              </form>
            ) : (
              /* 2FA Form */
              <form className="mt-8 space-y-6" onSubmit={handleTwoFactorSubmit}>
                {/* Email Info */}
                {!useBackupCode && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-blue-800">Code envoyé à</p>
                      </div>
                      <p className="font-semibold text-blue-900 text-lg">{pendingEmail}</p>
                      <p className="text-xs text-blue-600 mt-2 bg-blue-100 rounded-full px-3 py-1 inline-block">
                        ⏱️ Le code expire dans 10 minutes
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {!useBackupCode ? (
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
                          onChange={handle2FACodeChange}
                          disabled={isLoading}
                          autoFocus
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
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
                          onChange={handleBackupCodeChange}
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
                </div>

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
                      <span>Vérifier le code</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Alternative Options */}
                <div className="space-y-3 text-center">
                  <button
                    type="button"
                    onClick={toggleBackupCode}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 inline-flex items-center"
                  >
                    {useBackupCode ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Utiliser le code par email
                      </>
                    ) : (
                      'Utiliser un code de secours'
                    )}
                  </button>
                  
                  <div>
                    <button
                      type="button"
                      onClick={reset2FAForm}
                      className="text-sm text-gray-600 hover:text-gray-700 transition-colors duration-200 inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour à la connexion
                    </button>
                  </div>
                </div>
              </form>
            )}
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
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        input::placeholder {
          color: #9CA3AF;
        }
        
        .text-gray-900 {
          color: #111827;
        }
      `}</style>
    </>
  )
}

// Composant principal avec Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}