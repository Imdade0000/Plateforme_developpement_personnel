// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import crypto from 'crypto'
import { EmailService } from '../../../../../lib/email' // Import du service email

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      })
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }
    })

    // ENVOI DE L'EMAIL DE RÉINITIALISATION
    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken)
      console.log('✅ Email de réinitialisation envoyé à:', user.email)
    } catch (emailError) {
      console.error('❌ Erreur envoi email de réinitialisation:', emailError)
      // On log l'erreur mais on ne bloque pas la réponse
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    })

  } catch (error: any) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    )
  }
}