// app/api/auth/2fa/disable/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { stringifyBackupCodes } from '../../../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Désactiver la 2FA
    await prisma.user.update({
  where: { id: user.id },
  data: {
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorBackupCodes: stringifyBackupCodes([]), // Tableau vide stringifié
  },
})
    return NextResponse.json({
      success: true,
      message: '2FA désactivée avec succès'
    })

  } catch (error: any) {
    console.error('❌ Disable 2FA error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la désactivation de la 2FA' },
      { status: 500 }
    )
  }
}