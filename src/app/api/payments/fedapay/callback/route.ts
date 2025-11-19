// src/app/api/payments/fedapay/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fedapayService } from '../../../../../../lib/fedapay';
import { prisma } from '../../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-feda-signature');
    
    if (!signature) {
      console.error('Signature manquante dans le callback FedaPay');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
    }

    // Vérifier la signature
    const isValidSignature = fedapayService.verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Signature invalide dans le callback FedaPay');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    // Parser le JSON
    const body = JSON.parse(rawBody);
    const { event, data } = body;

    console.log('📞 Callback FedaPay reçu:', { event, transactionId: data.id });

    // Vérifier que c'est un événement de transaction
    if (event !== 'transaction.approved' && event !== 'transaction.declined' && event !== 'transaction.canceled') {
      console.log('Événement FedaPay ignoré:', event);
      return NextResponse.json({ success: true, message: 'Événement ignoré' });
    }

    const transactionId = data.id;

    // Vérifier la transaction avec l'API FedaPay
    const paymentDetails = await fedapayService.verifyPayment(transactionId);

    // Trouver la transaction dans notre base
    const transaction = await prisma.transaction.findFirst({
      where: { 
        externalId: transactionId,
        paymentProvider: 'FEDAPAY' // CORRECTION: Cette valeur doit correspondre à votre enum
      },
      include: {
        user: true
      }
    });

    if (!transaction) {
      console.error('Transaction FedaPay non trouvée:', transactionId);
      return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 });
    }

    // Déterminer le nouveau statut
    let newStatus: 'COMPLETED' | 'FAILED' | 'PENDING';
    switch (paymentDetails.status) {
      case 'approved':
        newStatus = 'COMPLETED';
        break;
      case 'declined':
      case 'canceled':
        newStatus = 'FAILED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Préparer les métadonnées mises à jour
    const currentMetadata = transaction.metadata as Record<string, any> || {};
    const updatedMetadata: Record<string, any> = {
      ...currentMetadata,
      fedapayCallback: body,
      fedapayVerification: paymentDetails,
      callbackReceivedAt: new Date().toISOString()
    };

    // Mettre à jour la transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        status: newStatus,
        metadata: updatedMetadata
      }
    });

    // Si paiement réussi, donner accès au contenu
    if (newStatus === 'COMPLETED') {
      if (transaction.productType === 'CONTENT') {
        try {
          const purchaseData: any = {
            userId: transaction.userId,
            contentId: transaction.productId,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'COMPLETED',
            transactionId: transaction.id,
            paymentMethod: 'MOBILE_MONEY'
          };

          await prisma.purchase.create({ data: purchaseData });
          console.log('✅ Accès au contenu accordé pour FedaPay:', transactionId);
        } catch (error) {
          console.error('Erreur création achat FedaPay:', error);
        }
      }
    }

    console.log('✅ Transaction FedaPay mise à jour:', {
      transactionId,
      newStatus,
      internalId: transaction.id
    });

    return NextResponse.json({ 
      success: true,
      status: newStatus,
      transactionId: updatedTransaction.id
    });

  } catch (error: any) {
    console.error('❌ Erreur callback FedaPay:', error);
    return NextResponse.json(
      { error: 'Erreur traitement callback FedaPay' },
      { status: 500 }
    );
  }
}