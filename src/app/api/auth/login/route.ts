// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Tentative de connexion:', { email })

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont obligatoires' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe
    if (!user.password) {
      return NextResponse.json(
        { error: 'Méthode de connexion non supportée' },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user

    console.log('✅ Connexion réussie:', user.id)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Connexion réussie'
    })

  } catch (error: any) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}