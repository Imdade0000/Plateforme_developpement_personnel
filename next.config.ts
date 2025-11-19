// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Utiliser remotePatterns (recommandé)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // AJOUTEZ CECI pour les uploads locaux
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Permet tous les domaines en HTTPS
        pathname: '/uploads/**',
      },
    ],
    // Aussi ajouter domains pour compatibilité
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'localhost',
    ],
    // Désactiver l'optimisation en dev pour debug
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // AJOUTEZ CECI pour servir les fichiers statiques depuis le dossier public
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*', // Ou servez-les directement si dans public/
      },
    ]
  },
}

module.exports = nextConfig