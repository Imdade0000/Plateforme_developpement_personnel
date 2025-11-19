// app/api/auth/2fa/verify-setup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { TwoFactorService } from '../../../../../../lib/twoFactor'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code de vérification requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA non configurée' },
        { status: 400 }
      )
    }

    // Vérifier le code
    const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, code)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Code de vérification invalide' },
        { status: 401 }
      )
    }

    // Activer la 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA activée avec succès'
    })

  } catch (error: any) {
    console.error('❌ Verify 2FA setup error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification 2FA' },
      { status: 500 }
    )
  }
}