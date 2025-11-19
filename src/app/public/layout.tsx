// src/app/(public)/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Développement Personnel - Transformez votre vie',
  description: 'Des conseils, vidéos motivationnelles et ressources PDF pour votre épanouissement personnel.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // SUPPRIMEZ <html> et <body> - ce sont déjà dans le layout racine
    <div className={`${inter.className} min-h-screen flex flex-col`}>
      {children}
    </div>
  )
}