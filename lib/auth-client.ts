// lib/auth-client.ts
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getSession() {
  try {
    return await getServerSession(authOptions) // CORRECTION
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return null
  }
}