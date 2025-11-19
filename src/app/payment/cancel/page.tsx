// app/payment/cancel/page.tsx
import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-yellow-500 text-5xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement Annulé</h1>
        <p className="text-gray-600 mb-6">
          Vous avez annulé le processus de paiement.
        </p>
        <div className="space-y-3">
          <Link 
            href="/pricing" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}