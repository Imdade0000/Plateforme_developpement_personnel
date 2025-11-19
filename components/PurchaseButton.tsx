// components/purchase-button.tsx
'use client';

import { useState } from 'react';

interface PurchaseButtonProps {
  content: {
    id: string;
    title: string;
    price: number | null;
    isFree: boolean;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  hasPurchased: boolean;
  canAccess: boolean;
}

export default function PurchaseButton({ content, user, hasPurchased, canAccess }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsLoading(true);
    
    try {
      // Ici vous intégrerez votre logique de paiement
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: content.id,
          contentTitle: content.title,
          price: content.price,
        }),
      });

      if (response.ok) {
        const { paymentUrl } = await response.json();
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          // Recharger la page si l'achat est immédiat
          window.location.reload();
        }
      } else {
        alert('Erreur lors de l\'achat');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'achat');
    } finally {
      setIsLoading(false);
    }
  };

  if (canAccess) {
    return (
      <span className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
        ✅ Accès autorisé
      </span>
    );
  }

  if (content.isFree) {
    return (
      <a
        href="/auth/signin"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Se connecter pour accéder
      </a>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Traitement...' : `Acheter pour ${content.price} XOF`}
    </button>
  );
}