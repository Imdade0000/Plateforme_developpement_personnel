// app/api/payments/kkiapay/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kkiapayService } from '../../../../../../lib/kkiapay';
import { prisma } from '../../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    // Lire le corps de la requête comme texte pour la vérification de signature
    const rawBody = await request.text();
    const signature = request.headers.get('x-kkiapay-signature');
    
    if (!signature) {
      console.error('Signature manquante dans le callback KkiaPay');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
    }

    // Vérifier la signature
    const isValidSignature = kkiapayService.verifySignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Signature invalide dans le callback KkiaPay');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    // Parser le JSON après vérification de la signature
    const body = JSON.parse(rawBody);
    const { transactionId, status, amount, metadata } = body;

    console.log('Callback KkiaPay reçu:', { transactionId, status, amount });

    // Valider les données requises
    if (!kkiapayService.validateCallbackData(body)) {
      return NextResponse.json({ error: 'Données de callback invalides' }, { status: 400 });
    }

    // Trouver la transaction
    const transaction = await prisma.transaction.findFirst({
      where: { 
        OR: [
          { externalId: transactionId },
          { id: metadata?.transactionId }
        ]
      },
      include: {
        user: true
      }
    });

    if (!transaction) {
      console.error('Transaction non trouvée pour callback:', transactionId);
      return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 });
    }

    // Vérifier le statut avec l'API KkiaPay pour plus de sécurité
    const paymentDetails = await kkiapayService.verifyPayment(transactionId);

    // Déterminer le nouveau statut
    let newStatus: 'COMPLETED' | 'FAILED' | 'PENDING';
    switch (paymentDetails.status) {
      case 'SUCCESS':
        newStatus = 'COMPLETED';
        break;
      case 'FAILED':
        newStatus = 'FAILED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // CORRECTION DÉFINITIVE : Créer un nouvel objet metadata sécurisé
    const newMetadata: Record<string, any> = {};

    // Ajouter les anciennes données metadata si elles existent et sont un objet
    if (transaction.metadata && typeof transaction.metadata === 'object' && !Array.isArray(transaction.metadata)) {
      Object.assign(newMetadata, transaction.metadata);
    }

    // Ajouter les nouvelles données
    Object.assign(newMetadata, {
      kkiapayCallback: body,
      kkiapayVerification: paymentDetails,
      callbackReceivedAt: new Date().toISOString()
    });

    // Mettre à jour la transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        status: newStatus,
        externalId: transactionId,
        metadata: newMetadata
      }
    });

    // Si paiement réussi, donner accès au contenu
    if (newStatus === 'COMPLETED') {
      if (transaction.productType === 'CONTENT') {
        // Créer l'achat avec gestion flexible du schéma
        const purchaseData: any = {
          userId: transaction.userId,
          contentId: transaction.productId,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'COMPLETED',
          transactionId: transaction.id
        };

        // Essayer avec paymentMethod (si le champ existe dans le schéma)
        try {
          purchaseData.paymentMethod = 'KKIAPAY';
          await prisma.purchase.create({ data: purchaseData });
        } catch (error: any) {
          // Si erreur, utiliser metadata pour stocker paymentMethod
          if (error.message.includes('paymentMethod')) {
            delete purchaseData.paymentMethod;
            purchaseData.metadata = {
              paymentMethod: 'KKIAPAY',
              kkiapayTransactionId: transactionId
            };
            await prisma.purchase.create({ data: purchaseData });
          } else {
            throw error;
          }
        }

        console.log('Accès au contenu accordé pour la transaction:', transactionId);
      }
    }

    return NextResponse.json({ 
      success: true,
      status: newStatus,
      transactionId: updatedTransaction.id
    });

  } catch (error: any) {
    console.error('Erreur callback KkiaPay:', error);
    return NextResponse.json(
      { error: 'Erreur traitement callback' },
      { status: 500 }
    );
  }
}