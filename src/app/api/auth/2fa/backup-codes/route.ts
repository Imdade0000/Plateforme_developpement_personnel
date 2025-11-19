// app/api/auth/2fa/backup-codes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { TwoFactorService } from '../../../../../../lib/twoFactor'
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

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA non activée' },
        { status: 400 }
      )
    }

    // Générer de nouveaux codes de secours
    const backupCodes = TwoFactorService.generateBackupCodes()

    // Sauvegarder les nouveaux codes
   await prisma.user.update({
  where: { id: user.id },
  data: {
    twoFactorBackupCodes: stringifyBackupCodes(backupCodes),
  },
})

    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'Nouveaux codes de secours générés'
    })

  } catch (error: any) {
    console.error('❌ Generate backup codes error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des codes de secours' },
      { status: 500 }
    )
  }
}