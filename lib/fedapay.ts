// lib/fedapay.ts
import crypto from 'crypto';

export interface FedaPayConfig {
  publicKey: string;
  secretKey: string;
  token: string;
  mode: 'test' | 'live';
}

export interface FedaPayPaymentParams {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
  callbackUrl?: string;
  redirectUrl?: string;
}

export interface FedaPayPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  status: string;
  message?: string;
}

export interface FedaPayVerificationResponse {
  transactionId: string;
  status: 'approved' | 'declined' | 'pending' | 'canceled';
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const FEDAPAY_ENABLED = process.env.FEDAPAY_ENABLED === 'true';

export class FedaPayService {
  private config: FedaPayConfig;
  private baseURL: string;
  private disabled: boolean = false;

  constructor(config?: Partial<FedaPayConfig>) {
    if (!FEDAPAY_ENABLED) {
      // Service désactivé — on initialise avec des valeurs vides et on évite de valider
      this.disabled = true;
      this.config = {
        publicKey: '',
        secretKey: '',
        token: '',
        mode: 'test',
        ...config
      };
      this.baseURL = '';
      return;
    }

    this.config = {
      publicKey: process.env.FEDAPAY_PUBLIC_KEY!,
      secretKey: process.env.FEDAPAY_SECRET_KEY!,
      token: process.env.FEDAPAY_TOKEN!,
      mode: (process.env.FEDAPAY_MODE as 'test' | 'live') || 'test',
      ...config
    };

    // URLs FedaPay
    this.baseURL = this.config.mode === 'test'
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.disabled) return;

    const required = ['publicKey', 'secretKey', 'token'];
    for (const key of required) {
      if (!this.config[key as keyof FedaPayConfig]) {
        throw new Error(`Configuration FedaPay manquante: ${key}`);
      }
    }
  }

  /**
   * Formate le numéro de téléphone pour FedaPay
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone || phone.trim() === '') {
      throw new Error('Le numéro de téléphone est requis');
    }

    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Gestion des différents formats
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    // FedaPay attend le format international sans le +
    return cleaned;
  }

  /**
   * Initie un paiement FedaPay
   */
  async initiatePayment(params: FedaPayPaymentParams): Promise<FedaPayPaymentResponse> {
    if (this.disabled) {
      throw new Error('FedaPay est désactivé sur cette instance (FEDAPAY_ENABLED != true)');
    }

    try {
      const { amount, currency, description, customer, metadata, callbackUrl, redirectUrl } = params;

      // Validation des paramètres
      if (!amount || amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }

      if (!customer.phone) {
        throw new Error('Le numéro de téléphone du client est requis');
      }

      // Formater le numéro de téléphone
      const formattedPhone = this.formatPhoneNumber(customer.phone);

      // Créer un client FedaPay
      const customerResponse = await fetch(`${this.baseURL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          firstname: customer.name?.split(' ')[0] || 'Client',
          lastname: customer.name?.split(' ').slice(1).join(' ') || 'Anonyme',
          email: customer.email,
          phone: formattedPhone
        })
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json();
        throw new Error(`Erreur création client FedaPay: ${errorData.message || customerResponse.status}`);
      }

      const customerData = await customerResponse.json();
      const fedapayCustomerId = customerData.data.id;

      // Créer une transaction FedaPay
      const transactionResponse = await fetch(`${this.baseURL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency: currency.toUpperCase(),
          description: description.substring(0, 255),
          customer_id: fedapayCustomerId,
          callback_url: callbackUrl,
          metadata: metadata
        })
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        throw new Error(`Erreur création transaction FedaPay: ${errorData.message || transactionResponse.status}`);
      }

      const transactionData = await transactionResponse.json();
      const transactionId = transactionData.data.id;
      const transactionToken = transactionData.data.transaction_key;

      // Générer l'URL de paiement
      const paymentUrl = this.config.mode === 'test'
        ? `https://sandbox-checkout.fedapay.com/${transactionToken}`
        : `https://checkout.fedapay.com/${transactionToken}`;

      console.log('🚀 Paiement FedaPay initié:', {
        transactionId,
        amount,
        currency,
        customer: formattedPhone,
        mode: this.config.mode
      });

      return {
        transactionId,
        paymentUrl,
        status: 'pending',
        message: 'Transaction FedaPay créée avec succès'
      };

    } catch (error: any) {
      console.error('❌ Erreur initiation paiement FedaPay:', error.message);
      throw new Error(error.message || 'Erreur lors de l\'initiation du paiement FedaPay');
    }
  }

  /**
   * Vérifie le statut d'un paiement FedaPay
   */
  async verifyPayment(transactionId: string): Promise<FedaPayVerificationResponse> {
    if (this.disabled) {
      throw new Error('FedaPay est désactivé sur cette instance (FEDAPAY_ENABLED != true)');
    }

    try {
      if (!transactionId) {
        throw new Error('ID de transaction requis');
      }

      const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur vérification: ${response.status}`);
      }

      const data = await response.json();
      const transaction = data.data;

      // Mapper les statuts FedaPay vers nos statuts
      let status: 'approved' | 'declined' | 'pending' | 'canceled';
      switch (transaction.status) {
        case 'approved':
          status = 'approved';
          break;
        case 'declined':
          status = 'declined';
          break;
        case 'canceled':
          status = 'canceled';
          break;
        default:
          status = 'pending';
      }

      return {
        transactionId: transaction.id,
        status,
        amount: transaction.amount / 100, // FedaPay stocke en centimes
        currency: transaction.currency,
        customer: {
          name: `${transaction.customer?.firstname || ''} ${transaction.customer?.lastname || ''}`.trim(),
          email: transaction.customer?.email || '',
          phone: transaction.customer?.phone || ''
        },
        metadata: transaction.metadata,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      };

    } catch (error: any) {
      console.error('Erreur vérification paiement FedaPay:', {
        transactionId,
        message: error.message
      });

      throw new Error('Erreur lors de la vérification du paiement FedaPay');
    }
  }

  /**
   * Rembourse un paiement FedaPay
   */
  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    if (this.disabled) {
      throw new Error('FedaPay est désactivé sur cette instance (FEDAPAY_ENABLED != true)');
    }

    try {
      const payload: any = {
        transaction_id: transactionId
      };

      if (amount) {
        payload.amount = Math.round(amount);
      }

      const response = await fetch(`${this.baseURL}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur remboursement: ${response.status}`);
      }

      return await response.json();

    } catch (error: any) {
      console.error('Erreur remboursement FedaPay:', error.message);
      throw new Error('Erreur lors du remboursement FedaPay');
    }
  }

  /**
   * Vérifie la signature des webhooks FedaPay
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (this.disabled) {
        console.warn('Vérification webhook FedaPay ignorée — FedaPay désactivé');
        return false;
      }

      if (!signature) {
        console.error('Signature manquante dans la requête FedaPay');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );

    } catch (error) {
      console.error('Erreur vérification signature FedaPay:', error);
      return false;
    }
  }

  /**
   * Retourne la configuration actuelle (pour le debug)
   */
  getConfig() {
    if (this.disabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      mode: this.config.mode,
      baseURL: this.baseURL,
      publicKey: this.config.publicKey ? '***' + this.config.publicKey.slice(-4) : 'non définie'
    };
  }
}

// Instance singleton exportée
export const fedapayService = new FedaPayService();

// Export de la classe pour une utilisation personnalisée
export default FedaPayService;