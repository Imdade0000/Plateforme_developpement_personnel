// src/app/api/auth/2fa/enable/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { TwoFactorService } from '../../../../../../lib/twoFactor'
import { stringifyBackupCodes } from '../../../../../../lib/auth'
import { EmailService } from '../../../../../../lib/email'

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

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA déjà activée' },
        { status: 400 }
      )
    }

    // SUPPRIMEZ la génération de secret et QR Code
    // Générez seulement les codes de secours
    const backupCodes = TwoFactorService.generateBackupCodes()

    // Activez DIRECTEMENT la 2FA sans validation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true, // ← Active directement
        twoFactorBackupCodes: stringifyBackupCodes(backupCodes),
      },
    })

    console.log('✅ 2FA activée directement pour:', user.email)

    // Envoyez les emails de confirmation
    try {
      await EmailService.sendTwoFactorEnabledEmail(user.email, user.name)
      console.log('✅ Email de confirmation 2FA envoyé à:', user.email)

      await EmailService.sendBackupCodesEmail(user.email, user.name, backupCodes)
      console.log('✅ Email des codes de secours envoyé à:', user.email)
    } catch (emailError) {
      console.error('❌ Erreur envoi emails 2FA:', emailError)
    }

    return NextResponse.json({
      success: true,
      backupCodes, // Retourne les codes de secours pour affichage
      message: '2FA activée avec succès. Des emails de confirmation ont été envoyés.'
    })

  } catch (error: any) {
    console.error('❌ Enable 2FA error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation de la 2FA' },
      { status: 500 }
    )
  }
}