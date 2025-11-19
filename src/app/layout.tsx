// src/app/layout.tsx
import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "Plateforme de Développement Personnel",
  description: "Transformez votre vie grâce à nos ressources",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
