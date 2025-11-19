// components/layout/PublicHeader.tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function PublicHeader() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase()
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = () => {
    return session?.user?.name || session?.user?.email || 'Utilisateur'
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              DéveloppementPersonnel
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition font-medium">
              Accueil
            </Link>
            <Link href="/content" className="text-gray-600 hover:text-blue-600 transition font-medium">
              Contenu
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition font-medium">
              Tarifs
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition font-medium">
              À propos
            </Link>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex space-x-3">
                <div className="animate-pulse bg-gray-200 rounded-lg w-24 h-10"></div>
                <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Tableau de bord
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                      {getUserInitials()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium max-w-32 truncate">
                      {getDisplayName()}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Menu déroulant utilisateur */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2">
                      {/* En-tête du menu */}
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name || 'Utilisateur'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      
                      {/* Liens de navigation */}
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Mon profil
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Tableau de bord
                        </Link>
                        <Link 
                          href="/dashboard/purchases" 
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Mes achats
                        </Link>
                      </div>
                      
                      {/* Séparateur */}
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      {/* Déconnexion */}
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-blue-600 transition font-medium"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Menu Mobile Button */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu mobile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 pt-4">
              {/* Navigation principale */}
              <Link 
                href="/" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/content" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contenu
              </Link>
              <Link 
                href="/pricing" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                href="/about" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              
              {/* Séparateur */}
              <hr className="my-2 border-gray-200" />
              
              {/* Actions utilisateur */}
              {session ? (
                <>
                  {/* En-tête utilisateur mobile */}
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Tableau de bord
                  </Link>
                  <Link 
                    href="/profile" 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mon profil
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium flex items-center text-left"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}