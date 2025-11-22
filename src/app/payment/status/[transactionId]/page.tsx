// app/payment/status/[transactionId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '../../../../../lib/db';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ transactionId: string }>
}

export default async function PaymentStatusPage({ params }: PageProps) {
  const { transactionId } = await params;
  
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!transaction) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Paiement réussi !';
      case 'FAILED': return 'Paiement échoué';
      case 'PENDING': return 'Paiement en attente';
      default: return 'Statut inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getStatusColor(transaction.status)} mb-4`}>
            {transaction.status === 'COMPLETED' && '✅'}
            {transaction.status === 'FAILED' && '❌'}
            {transaction.status === 'PENDING' && '⏳'}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getStatusMessage(transaction.status)}
          </h1>
          
          <p className="text-gray-600 mb-4">
            Transaction: {transaction.id}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Montant:</span>
              <span className="font-semibold">
                {transaction.amount.toLocaleString('fr-FR')} {transaction.currency}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Méthode:</span>
              <span className="font-semibold">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {transaction.status === 'COMPLETED' && (
            <link
              href="/content"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Accéder au contenu
            </link>
          )}

          {transaction.status === 'FAILED' && (
            <button
              onClick={() => window.history.back()}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Réessayer le paiement
            </button>
          )}

          {transaction.status === 'PENDING' && (
            <div className="text-sm text-gray-500">
              <p>Votre paiement est en cours de traitement.</p>
              <p>Cette page se rafraîchira automatiquement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}