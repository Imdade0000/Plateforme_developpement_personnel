// src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from '../../../../../lib/auth'
import NextAuth from 'next-auth'
import { handlers } from '@/app/auth'
// Configuration de NextAuth
const handler = NextAuth(authOptions)

// Export des handlers GET et POST pour toutes les routes NextAuth
export { handler as GET, handler as POST }