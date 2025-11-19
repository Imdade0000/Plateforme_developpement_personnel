// lib/twoFactor.ts
import { prisma } from './db'
import { EmailService } from './email'

export class TwoFactorService {
  static async generateAndSend2FACode(email: string, userName: string | null): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    console.log(`📧 Génération code 2FA pour ${email}: ${code}`)

    try {
      console.log('🔍 Vérification connexion base de données...')
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Connexion base OK')

      console.log(`💾 Tentative de stockage du code pour ${email}...`)
      
      // CORRECTION: Utiliser email_code compound unique
      const result = await prisma.twoFactorCode.upsert({
        where: { 
          email_code: {
            email: email,
            code: code
          }
        },
        update: { 
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
        create: { 
          email, 
          code, 
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      })
      
      console.log(`✅ Code stocké avec succès. ID: ${result.id}`)

      // Vérification
      const verify = await prisma.twoFactorCode.findFirst({
        where: { email, code }
      })
      console.log(`🔍 Vérification stockage:`, verify ? 'SUCCÈS' : 'ÉCHEC')

    } catch (dbError: any) {
      console.error('❌ Erreur critique stockage code:', dbError)
      throw new Error(`Impossible de stocker le code de sécurité: ${dbError.message}`)
    }

    try {
      await EmailService.send2FACodeEmail(email, userName, code)
      console.log('📧 Email envoyé avec succès')
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
    }
    
    return code
  }

  static async verifyEmailCode(email: string, userCode: string): Promise<boolean> {
    try {
      console.log(`🔍 Recherche du code pour: ${email}`)
      
      // CORRECTION: Utiliser findFirst au lieu de findUnique
      const storedCode = await prisma.twoFactorCode.findFirst({
        where: { 
          email,
          code: userCode
        }
      })
      
      if (!storedCode) {
        console.log('❌ Aucun code 2FA trouvé')
        const allCodes = await prisma.twoFactorCode.findMany()
        console.log(`📋 Codes en base (${allCodes.length}):`, allCodes)
        return false
      }

      console.log(`⏰ Vérification expiration: ${storedCode.expiresAt}`)
      
      if (storedCode.expiresAt < new Date()) {
        console.log('❌ Code 2FA expiré')
        await prisma.twoFactorCode.delete({ where: { id: storedCode.id } })
        return false
      }

      console.log(`🔢 Code valide`)
      console.log('✅ Code 2FA email valide')
      await prisma.twoFactorCode.delete({ where: { id: storedCode.id } })
      
      return true
    } catch (error) {
      console.error('❌ Erreur vérification code email:', error)
      return false
    }
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    console.log('🔑 Codes de secours générés')
    return codes
  }

  static verifyBackupCode(backupCodes: string[], code: string): boolean {
    try {
      const index = backupCodes.indexOf(code.toUpperCase().trim())
      if (index > -1) {
        console.log('✅ Code de secours valide')
        return true
      }
      console.log('❌ Code de secours invalide')
      return false
    } catch (error) {
      console.error('❌ Erreur vérification code de secours:', error)
      return false
    }
  }

  static generateSecret(email: string) {
    console.log('🔐 Méthode generateSecret appelée (compatibilité)')
    return { base32: '' }
  }

  static async generateQRCode(otpauthUrl: string): Promise<string> {
    console.log('📷 Méthode generateQRCode appelée (compatibilité)')
    return ''
  }

  static verifyToken(secret: string, token: string): boolean {
    console.log('🔢 Méthode verifyToken appelée (compatibilité)')
    return false
  }
}