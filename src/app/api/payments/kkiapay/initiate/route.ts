// src/app/api/payments/kkiapay/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../lib/auth';
import { kkiapayService } from '../../../../../../lib/kkiapay';
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
        { error: 'Numéro de téléphone requis pour KkiaPay' },
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

    console.log('🎯 Initiation paiement KkiaPay:', {
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

    // Créer la transaction en base de données d'abord
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amount,
        currency: currency || 'XOF',
        status: 'PENDING',
        paymentMethod: 'KKIAPAY',
        paymentProvider: 'KKIAPAY',
        productType: productType,
        productId: productId,
        metadata: transactionMetadata
      }
    });

    console.log('✅ Transaction créée:', transaction.id);

    // Générer la configuration du widget KkiaPay
    const widgetConfig = kkiapayService.generateWidgetConfig({
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
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/kkiapay/callback`
    });

    // Préparer les métadonnées mises à jour
    const updatedMetadata: Record<string, any> = {
      ...transactionMetadata, // CORRECTION: Utiliser l'objet existant
      kkiapayTransactionId: widgetConfig.transactionId,
      widgetConfig: {
        amount: widgetConfig.amount,
        sandbox: widgetConfig.sandbox,
        country: widgetConfig.country
      }
    };

    // Mettre à jour la transaction avec l'ID externe KkiaPay
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        externalId: widgetConfig.transactionId,
        metadata: updatedMetadata
      }
    });

    console.log('✅ Paiement KkiaPay initié avec succès:', {
      transactionId: widgetConfig.transactionId,
      internalTransactionId: transaction.id,
      amount,
      phone: customer.phone,
      sandbox: widgetConfig.sandbox
    });

    // Retourner la configuration pour le frontend
    return NextResponse.json({
      success: true,
      data: {
        transactionId: widgetConfig.transactionId,
        internalTransactionId: transaction.id,
        widgetConfig: {
          amount: widgetConfig.amount,
          key: widgetConfig.key,
          sandbox: widgetConfig.sandbox,
          phone: widgetConfig.phone,
          name: widgetConfig.name,
          email: widgetConfig.email,
          data: widgetConfig.data,
          callback: widgetConfig.callback,
          theme: widgetConfig.theme,
          country: widgetConfig.country,
          description: widgetConfig.description
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur initiation paiement KkiaPay:', error);
    
    // Log détaillé pour le debug
    console.error('Détails de l\'erreur:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erreur lors de l\'initiation du paiement' 
      },
      { status: 500 }
    );
  }
}

// Optionnel: Route GET pour vérifier la configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Retourner la configuration KkiaPay (sans les clés sensibles)
    const config = kkiapayService.getConfig();

    return NextResponse.json({
      success: true,
      data: {
        config,
        message: 'Service KkiaPay configuré correctement'
      }
    });

  } catch (error: any) {
    console.error('Erreur vérification configuration KkiaPay:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur de configuration KkiaPay' 
      },
      { status: 500 }
    );
  }
}