// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur avec un token valide
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    })

    console.log('✅ Mot de passe réinitialisé pour:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    })

  } catch (error: any) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}