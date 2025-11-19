// src/app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation' // ← Ajoutez cette importation

interface UserData {
  subscription: any
  purchases: any[]
  recentContent: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      // Simuler le chargement des données utilisateur
      setTimeout(() => {
        setUserData({
          subscription: { status: 'ACTIVE', plan: 'PREMIUM' },
          purchases: [],
          recentContent: []
        })
        setLoading(false)
      }, 1000)
    }
  }, [status])

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Cette condition ne sera plus atteinte grâce à la redirection
  if (!session) {
    return null // ← Retourne null car la redirection va se faire
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Tableau de bord - Bienvenue, {session.user?.name}!
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Carte d'abonnement */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Votre abonnement</h3>
            {userData?.subscription ? (
              <div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {userData.subscription.plan}
                </span>
                <p className="text-gray-600 mt-2">Statut: Actif</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Aucun abonnement actif</p>
                <Link href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Choisir un abonnement
                </Link>
              </div>
            )}
          </div>

          {/* Carte de contenu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Votre contenu</h3>
            <p className="text-2xl font-bold text-blue-600">{userData?.purchases.length || 0}</p>
            <p className="text-gray-600">Contenus achetés</p>
          </div>

          {/* Carte de progression */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Votre progression</h3>
            <p className="text-2xl font-bold text-green-600">0%</p>
            <p className="text-gray-600">Contenu complété</p>
          </div>
        </div>

        {/* Contenu récent */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Contenu récent</h3>
          <div className="text-center py-8">
            <p className="text-gray-600">Aucun contenu récent</p>
            <Link href="/content" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Explorer le contenu →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}