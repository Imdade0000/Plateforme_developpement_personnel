// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = request.nextUrl

  // Routes protégées
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Routes admin seulement - PROTECTION RENFORCÉE
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    // Vérification stricte du rôle ADMIN
    if (token.role !== 'ADMIN') {
      // Rediriger vers une page "non autorisé"
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ]
}