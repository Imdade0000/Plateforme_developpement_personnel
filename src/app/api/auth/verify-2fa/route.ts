// src/app/api/auth/verify-2fa/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { TwoFactorService } from '../../../../../lib/twoFactor'
import { parseBackupCodes, stringifyBackupCodes } from '../../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { code, backupCode } = await request.json()

    if (!code && !backupCode) {
      return NextResponse.json(
        { error: 'Code 2FA ou code de secours requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    let isValid = false

    if (code && user.twoFactorSecret) {
      // Vérifier le code 2FA normal
      isValid = TwoFactorService.verifyToken(user.twoFactorSecret, code)
    } else if (backupCode) {
      // Vérifier le code de secours
      const backupCodes = parseBackupCodes(user.twoFactorBackupCodes)
      isValid = TwoFactorService.verifyBackupCode(backupCodes, backupCode)

      if (isValid) {
        // Mettre à jour les codes de secours
        const updatedBackupCodes = backupCodes.filter(
          (existingCode: string) => existingCode !== backupCode // Utilisez 'backupCode' au lieu de 'credentials.backupCode'
        )

        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorBackupCodes: stringifyBackupCodes(updatedBackupCodes),
          },
        })
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      )
    }

    // Activer la 2FA si ce n'est pas déjà fait
    if (!user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
        },
      })
    }

    return NextResponse.json({ 
      success: true,
      message: '2FA vérifiée avec succès'
    })

  } catch (error) {
    console.error('Erreur vérification 2FA:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}