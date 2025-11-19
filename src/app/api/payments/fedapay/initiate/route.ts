// src/app/api/payments/fedapay/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../lib/auth';
import { fedapayService } from '../../../../../../lib/fedapay';
import { prisma } from '../../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency, description, productId, productType, customer } = body;
    
    // Validation des données
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    if (!customer?.phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis pour FedaPay' },
        { status: 400 }
      );
    }

    if (!productId || !productType) {
      return NextResponse.json(
        { error: 'Produit et type de produit requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    console.log('🎯 Initiation paiement FedaPay:', {
      userId: user.id,
      amount,
      currency,
      productId,
      productType,
      customerPhone: customer.phone
    });

    // Préparer les métadonnées de la transaction
    const transactionMetadata: Record<string, any> = {
      customer: customer,
      description: description,
      initiatedAt: new Date().toISOString()
    };

    // CORRECTION: Utiliser les valeurs de l'enum Prisma
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amount,
        currency: currency || 'XOF',
        status: 'PENDING',
        paymentMethod: 'MOBILE_MONEY', // Utiliser une valeur existante de l'enum
        paymentProvider: 'FEDAPAY', // CORRECTION: Cette valeur doit exister dans votre enum PaymentProvider
        productType: productType,
        productId: productId,
        metadata: transactionMetadata
      }
    });

    console.log('✅ Transaction FedaPay créée:', transaction.id);

    // Initier le paiement FedaPay
    const paymentData = await fedapayService.initiatePayment({
      amount,
      currency: currency || 'XOF',
      description: description || `Paiement ${productType}`,
      customer: {
        name: customer.name || user.name || '',
        email: customer.email || user.email,
        phone: customer.phone
      },
      metadata: {
        transactionId: transaction.id,
        userId: user.id,
        productId,
        productType,
        userEmail: user.email
      },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/fedapay/callback`,
      redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`
    });

    // Préparer les métadonnées mises à jour
    const updatedMetadata: Record<string, any> = {
      ...transactionMetadata,
      fedapayTransactionId: paymentData.transactionId,
      paymentUrl: paymentData.paymentUrl
    };

    // Mettre à jour la transaction avec l'ID externe FedaPay
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        externalId: paymentData.transactionId,
        metadata: updatedMetadata
      }
    });

    console.log('✅ Paiement FedaPay initié avec succès:', {
      transactionId: paymentData.transactionId,
      internalTransactionId: transaction.id,
      amount,
      phone: customer.phone,
      mode: fedapayService.getConfig().mode
    });

    // Retourner les données de paiement
    return NextResponse.json({
      success: true,
      data: {
        transactionId: paymentData.transactionId,
        internalTransactionId: transaction.id,
        paymentUrl: paymentData.paymentUrl,
        status: paymentData.status,
        message: paymentData.message
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur initiation paiement FedaPay:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erreur lors de l\'initiation du paiement FedaPay' 
      },
      { status: 500 }
    );
  }
}