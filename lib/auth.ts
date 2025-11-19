// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt'
import { prisma } from './db'
import { TwoFactorService } from './twoFactor'

const parseBackupCodes = (backupCodes: string | null): string[] => {
  if (!backupCodes) return []
  try {
    return JSON.parse(backupCodes)
  } catch {
    return []
  }
}

const stringifyBackupCodes = (backupCodes: string[]): string => {
  return JSON.stringify(backupCodes)
}

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    twoFactorEnabled?: boolean
    requiresTwoFactor?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      twoFactorEnabled?: boolean
    }
    requiresTwoFactor?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    twoFactorEnabled?: boolean
    pendingTwoFactor?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Code 2FA", type: "text" },
        backupCode: { label: "Code de secours", type: "text" },
        isInitialAttempt: { label: "Initial", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Email ou mot de passe manquant')
          throw new Error('Email et mot de passe requis')
        }

        try {
          console.log('🔍 Tentative de connexion pour:', credentials.email)
          console.log('📝 Credentials reçus:', { 
            hasTwoFactorCode: !!credentials.twoFactorCode, 
            hasBackupCode: !!credentials.backupCode,
            isInitialAttempt: credentials.isInitialAttempt 
          })

          // Trouver l'utilisateur
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim() 
            }
          })

          if (!user) {
            console.log('❌ Utilisateur non trouvé:', credentials.email)
            throw new Error('Email ou mot de passe incorrect')
          }

          if (!user.password) {
            console.log('❌ Aucun mot de passe défini pour cet utilisateur')
            throw new Error('Méthode de connexion non supportée')
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect pour:', credentials.email)
            throw new Error('Email ou mot de passe incorrect')
          }

          console.log('✅ Mot de passe valide')

          // Vérification 2FA si activée
          if (user.twoFactorEnabled) {
            console.log('🔐 2FA activée pour:', user.email)
            console.log('📊 État 2FA utilisateur:', {
              twoFactorEnabled: user.twoFactorEnabled,
              hasSecret: !!user.twoFactorSecret,
              hasBackupCodes: !!user.twoFactorBackupCodes
            })
            
            // CORRECTION : Vérifier si c'est la première tentative (pas de code fourni)
            const isFirstAttempt = !credentials.twoFactorCode && !credentials.backupCode
            
            if (isFirstAttempt) {
              console.log('🆕 Première tentative - génération et envoi du code 2FA')
              
              try {
                // Générer et envoyer le code par email
                await TwoFactorService.generateAndSend2FACode(user.email, user.name)
                console.log('✅ Code 2FA généré et envoyé')
              } catch (emailError) {
                console.error('❌ Erreur génération/envoi code 2FA:', emailError)
                throw new Error('Erreur lors de l\'envoi du code de vérification')
              }
              
              // Lancer une erreur spécifique pour demander le code 2FA
              throw new Error('2FA_REQUIRED')
            }

            // Si on arrive ici, l'utilisateur a fourni un code - le vérifier
            let twoFactorValid = false

            if (credentials.twoFactorCode) {
              console.log('🔢 Vérification du code 2FA email...')
              console.log('🔍 Code fourni:', credentials.twoFactorCode)
              
              twoFactorValid = await TwoFactorService.verifyEmailCode(
                user.email,
                credentials.twoFactorCode.trim()
              )
              
              if (!twoFactorValid) {
                console.log('❌ Code 2FA email invalide')
                throw new Error('Code de vérification invalide ou expiré')
              }
              console.log('✅ Code 2FA email valide')
              
            } else if (credentials.backupCode) {
              console.log('🔑 Vérification du code de secours...')
              const backupCodes = parseBackupCodes(user.twoFactorBackupCodes)
              
              twoFactorValid = TwoFactorService.verifyBackupCode(
                backupCodes,
                credentials.backupCode
              )
              
              if (!twoFactorValid) {
                console.log('❌ Code de secours invalide')
                throw new Error('Code de secours invalide')
              }

              console.log('✅ Code de secours valide')

              // Mettre à jour les codes de secours
              const updatedBackupCodes = backupCodes.filter(
                (code: string) => code !== credentials.backupCode
              )
              
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  twoFactorBackupCodes: stringifyBackupCodes(updatedBackupCodes)
                }
              })
              
              console.log(`📝 Codes de secours mis à jour. Restants: ${updatedBackupCodes.length}`)
            }
          }

          console.log('✅ Connexion réussie pour:', user.email)

          // Retourner les données utilisateur
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled
          }
        } catch (error: any) {
          console.error('❌ Erreur d\'authentification:', error.message)
          console.log('📋 Détails erreur:', {
            name: error.name,
            code: error.code,
            stack: error.stack
          })
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    // CORRECTION : Ajout de l'expiration de session (30 jours)
    maxAge: 30 * 24 * 60 * 60, // 30 jours en secondes
  },
  jwt: {
    // CORRECTION : Expiration du token JWT (30 jours)
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.twoFactorEnabled = user.twoFactorEnabled
        
        if (user.requiresTwoFactor) {
          token.pendingTwoFactor = true
        }
      }

      if (trigger === "update" && session?.twoFactorEnabled !== undefined) {
        token.twoFactorEnabled = session.twoFactorEnabled
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        
        if (token.pendingTwoFactor) {
          session.requiresTwoFactor = true
        }
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  events: {
    async signIn({ user, isNewUser }) {
      console.log(`🔐 Utilisateur ${isNewUser ? 'nouveau' : 'existant'} connecté:`, user.email)
    },
    async signOut({ token }) {
      console.log('👋 Utilisateur déconnecté:', token.email)
    },
    async createUser({ user }) {
      console.log('🎉 Nouvel utilisateur créé:', user.email)
    }
  },

  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata)
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code)
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  }
}

export { parseBackupCodes, stringifyBackupCodes }