// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcrypt'
import { stringifyBackupCodes } from '../../../../../lib/auth'
import { EmailService } from '../../../../../lib/email' // Import du service email

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, country, password } = await request.json()

    console.log('Tentative d\'inscription:', { name, email, phone, country })

    // Validation des données
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validation du téléphone (format international simplifié)
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Format de téléphone invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        country,
        password: hashedPassword,
        role: "USER",
        twoFactorBackupCodes: stringifyBackupCodes([]),
        twoFactorEnabled: false,
      },
    })

    console.log('✅ Utilisateur créé avec succès:', newUser.id)

    // ENVOI DE L'EMAIL DE BIENVENUE
    try {
      await EmailService.sendWelcomeEmail(newUser.email, newUser.name)
      console.log('✅ Email de bienvenue envoyé à:', newUser.email)
    } catch (emailError) {
      console.error('❌ Erreur envoi email de bienvenue:', emailError)
      // On ne bloque pas l'inscription si l'email échoue
      // Mais on log l'erreur pour debugging
    }

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Compte créé avec succès. Un email de bienvenue a été envoyé.'
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Registration error:', error)
    
    // Gestion des erreurs spécifiques Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}