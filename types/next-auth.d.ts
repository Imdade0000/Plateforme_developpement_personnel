// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      twoFactorEnabled?: boolean
    } & DefaultSession["user"]
    
    requiresTwoFactor?: boolean
  }

  interface User extends DefaultUser {
    role: string
    twoFactorEnabled?: boolean
    requiresTwoFactor?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    twoFactorEnabled?: boolean
    pendingTwoFactor?: boolean
  }
}