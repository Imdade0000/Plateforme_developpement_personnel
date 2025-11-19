// app/unauthorized/page.tsx
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Cette zone est réservée aux administrateurs.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Se connecter avec un autre compte
          </Link>
        </div>
      </div>
    </div>
  );
}