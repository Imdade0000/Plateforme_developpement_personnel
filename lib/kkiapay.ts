// lib/kkiapay.ts
import crypto from 'crypto';

export interface KkiaPayConfig {
  publicKey: string;
  privateKey: string;
  secret: string;
  mode: 'test' | 'live';
  sandbox?: boolean;
}

export interface KkiaPayPaymentParams {
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
  returnUrl?: string;
  cancelUrl?: string;
}

export interface KkiaPayPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  status: string;
  message?: string;
  widgetConfig?: any;
}

export interface KkiaPayVerificationResponse {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
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

// Liste complète des indicatifs pays africains et internationaux
const COUNTRY_CODES = {
  // Afrique de l'Ouest
  '229': 'Bénin',
  '225': 'Côte d\'Ivoire',
  '226': 'Burkina Faso',
  '227': 'Niger',
  '228': 'Togo',
  '233': 'Ghana',
  '234': 'Nigeria',
  '235': 'Tchad',
  '236': 'Centrafrique',
  '240': 'Guinée équatoriale',
  '241': 'Gabon',
  '242': 'Congo',
  '243': 'RDC',
  
  // Afrique de l'Est
  '250': 'Rwanda',
  '251': 'Éthiopie',
  '252': 'Somalie',
  '253': 'Djibouti',
  '254': 'Kenya',
  '255': 'Tanzanie',
  '256': 'Ouganda',
  '257': 'Burundi',
  '258': 'Mozambique',
  '260': 'Zambie',
  '261': 'Madagascar',
  '262': 'Réunion',
  '263': 'Zimbabwe',
  '264': 'Namibie',
  '265': 'Malawi',
  '266': 'Lesotho',
  '267': 'Botswana',
  '268': 'Swaziland',
  '269': 'Comores',
  
  // Afrique du Nord
  '212': 'Maroc',
  '213': 'Algérie',
  '216': 'Tunisie',
  '218': 'Libye',
  '220': 'Gambie',
  '221': 'Sénégal',
  '222': 'Mauritanie',
  '223': 'Mali',
  '224': 'Guinée',
  
  // Autres pays
  '33': 'France',
  '1': 'États-Unis/Canada',
  '44': 'Royaume-Uni',
  '49': 'Allemagne',
  '55': 'Brésil',
  '91': 'Inde',
  '86': 'Chine',
  '81': 'Japon',
  '82': 'Corée du Sud',
  '61': 'Australie',
  '64': 'Nouvelle-Zélande'
};

/**
 * Helper function for fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La requête a pris trop de temps');
    }
    throw error;
  }
}

export class KkiaPayService {
  private config: KkiaPayConfig;
  private baseURL: string;
  private webhookSecret: string;

  constructor(config?: Partial<KkiaPayConfig>) {
    this.config = {
      publicKey: process.env.KKIAPAY_PUBLIC_KEY!,
      privateKey: process.env.KKIAPAY_PRIVATE_KEY!,
      secret: process.env.KKIAPAY_SECRET!,
      mode: (process.env.KKIAPAY_MODE as 'test' | 'live') || 'test',
      sandbox: process.env.KKIAPAY_SANDBOX !== 'false', // true par défaut sauf si explicitement false
      ...config
    };

    this.webhookSecret = process.env.KKIAPAY_WEBHOOK_SECRET || this.config.secret;
    
    // URL toujours en sandbox pour les tests - KkiaPay utilise la même URL pour sandbox et production
    this.baseURL = 'https://api.kkiapay.me';

    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ['publicKey', 'privateKey', 'secret'];
    for (const key of required) {
      if (!this.config[key as keyof KkiaPayConfig]) {
        throw new Error(`Configuration KkiaPay manquante: ${key}`);
      }
    }
  }

  /**
   * Vérifie la signature des webhooks KkiaPay pour la sécurité
   */
  verifySignature(payload: any, signature: string): boolean {
    try {
      if (!signature) {
        console.error('Signature manquante dans la requête');
        return false;
      }

      // Créer la signature attendue
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');

      // Comparer les signatures (protection contre les attaques temporelles)
      const signatureBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      
      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
      
    } catch (error) {
      console.error('Erreur lors de la vérification de signature:', error);
      return false;
    }
  }

  /**
   * Formate et valide le numéro de téléphone pour KkiaPay
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone || phone.trim() === '') {
      throw new Error('Le numéro de téléphone est requis');
    }

    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    console.log('📞 Numéro original:', phone, 'Nettoyé:', cleaned);

    // Gestion des différents formats
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    // Détection de l'indicatif pays
    let countryCode = '';
    let localNumber = '';

    for (let i = 3; i >= 1; i--) {
      const potentialCode = cleaned.substring(0, i);
      if (COUNTRY_CODES[potentialCode as keyof typeof COUNTRY_CODES]) {
        countryCode = potentialCode;
        localNumber = cleaned.substring(i);
        break;
      }
    }

    // Si aucun indicatif pays trouvé, utiliser 225 par défaut (Côte d'Ivoire)
    if (!countryCode) {
      countryCode = '225';
      localNumber = cleaned;
      console.log('ℹ️ Aucun indicatif pays détecté, utilisation de 225 par défaut');
    }

    // Nettoyer le numéro local (supprimer les 0 initiaux)
    localNumber = localNumber.replace(/^0+/, '');

    // Validation de la longueur
    const fullNumber = countryCode + localNumber;
    
    if (fullNumber.length < 10 || fullNumber.length > 15) {
      throw new Error(`Numéro invalide: ${fullNumber}. Longueur: ${fullNumber.length} (attendu: 10-15 chiffres)`);
    }

    if (!/^\d+$/.test(fullNumber)) {
      throw new Error(`Numéro contient des caractères invalides: ${fullNumber}`);
    }

    const countryName = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES] || 'Inconnu';
    console.log(`✅ Numéro formaté: ${fullNumber} (${countryName})`);

    return fullNumber;
  }

  /**
   * Détecte le pays à partir du numéro de téléphone
   */
  detectCountryFromPhone(phone: string): { code: string; name: string } {
    const cleaned = phone.replace(/[^\d+]/g, '');
    let processed = cleaned;

    if (processed.startsWith('+')) processed = processed.substring(1);
    if (processed.startsWith('00')) processed = processed.substring(2);

    for (let i = 3; i >= 1; i--) {
      const potentialCode = processed.substring(0, i);
      const countryName = COUNTRY_CODES[potentialCode as keyof typeof COUNTRY_CODES];
      if (countryName) {
        return { code: potentialCode, name: countryName };
      }
    }

    return { code: '225', name: 'Côte d\'Ivoire (défaut)' };
  }

  /**
   * Génère la configuration pour le widget frontend KkiaPay
   */
  generateWidgetConfig(params: KkiaPayPaymentParams): any {
    const { amount, currency, description, customer, metadata } = params;
    
    // Validation des paramètres
    if (!amount || amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    if (!customer.phone) {
      throw new Error('Le numéro de téléphone du client est requis');
    }

    // Formater le numéro de téléphone
    const formattedPhone = this.formatPhoneNumber(customer.phone);
    const countryInfo = this.detectCountryFromPhone(customer.phone);

    // Générer un ID de transaction local
    const transactionId = this.generateTransactionId();

    // Configuration pour le widget frontend
    const widgetConfig = {
      amount: Math.round(amount),
      key: this.config.publicKey,
      sandbox: this.config.mode === 'test' || this.config.sandbox, // true pour les tests, false pour la production
      phone: formattedPhone,
      name: customer.name || '',
      email: customer.email || '',
      data: transactionId,
      callback: params.callbackUrl || process.env.KKIAPAY_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/payments/kkiapay/callback`,
      theme: '#0095ff',
      country: countryInfo.code,
      description: description.substring(0, 255)
    };

    console.log('🚀 Configuration widget KkiaPay générée:', {
      transactionId,
      amount: widgetConfig.amount,
      phone: formattedPhone,
      country: countryInfo.name,
      sandbox: widgetConfig.sandbox,
      mode: this.config.mode
    });

    return {
      ...widgetConfig,
      transactionId // Inclure l'ID de transaction dans la réponse
    };
  }

  /**
   * Prépare le paiement pour le widget frontend
   * Ne fait plus d'appel API direct pour initier le paiement
   */
  async initiatePayment(params: KkiaPayPaymentParams): Promise<KkiaPayPaymentResponse> {
    try {
      // Générer la configuration du widget
      const widgetConfig = this.generateWidgetConfig(params);

      // Construire l'URL du widget (fallback pour les anciennes implémentations)
      const paymentUrl = this.buildWidgetUrl(widgetConfig);

      return {
        transactionId: widgetConfig.transactionId,
        paymentUrl,
        status: 'PENDING',
        widgetConfig
      };

    } catch (error: any) {
      console.error('❌ Erreur préparation paiement KkiaPay:', error.message);
      throw new Error(error.message || 'Erreur lors de la préparation du paiement KkiaPay');
    }
  }

  /**
   * Construit l'URL du widget KkiaPay (fallback)
   */
  private buildWidgetUrl(config: any): string {
    const params = new URLSearchParams();
    
    Object.keys(config).forEach(key => {
      if (config[key] !== undefined && config[key] !== null && config[key] !== '' && key !== 'transactionId') {
        params.append(key, config[key].toString());
      }
    });

    return `https://widget.kkiapay.me?${params.toString()}`;
  }

  /**
   * Génère un ID de transaction unique
   */
  private generateTransactionId(): string {
    return `kkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Vérifie le statut d'un paiement (après callback)
   */
  async verifyPayment(transactionId: string): Promise<KkiaPayVerificationResponse> {
    try {
      if (!transactionId) {
        throw new Error('ID de transaction requis');
      }

      const response = await fetchWithTimeout(
        `${this.baseURL}/api/v1/transactions/status/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.secret}`,
            'Accept': 'application/json'
          }
        },
        15000 // 15 secondes timeout
      );

      if (!response.ok) {
        throw new Error(`Erreur vérification: ${response.status}`);
      }

      const data = await response.json();

      return {
        transactionId: data.transactionId || transactionId,
        status: data.status || 'PENDING',
        amount: data.amount,
        currency: data.currency,
        customer: data.customer,
        metadata: data.metadata,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

    } catch (error: any) {
      console.error('Erreur vérification paiement KkiaPay:', {
        transactionId,
        message: error.message
      });

      if (error.message.includes('Timeout')) {
        throw new Error('Délai dépassé lors de la vérification du paiement');
      } else {
        throw new Error('Erreur lors de la vérification du paiement KkiaPay');
      }
    }
  }

  /**
   * Rembourse un paiement
   */
  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    try {
      const payload: any = { transactionId };
      if (amount) {
        payload.amount = Math.round(amount);
      }

      const response = await fetchWithTimeout(
        `${this.baseURL}/api/v1/transactions/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.secret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        15000
      );

      if (!response.ok) {
        throw new Error(`Erreur remboursement: ${response.status}`);
      }

      return await response.json();

    } catch (error: any) {
      console.error('Erreur remboursement KkiaPay:', error.message);
      throw new Error('Erreur lors du remboursement');
    }
  }

  /**
   * Méthode utilitaire pour valider une réponse de callback
   */
  validateCallbackData(data: any): boolean {
    const required = ['transactionId', 'status', 'amount'];
    return required.every(field => data[field] !== undefined);
  }

  /**
   * Retourne la configuration actuelle (pour le debug)
   */
  getConfig() {
    return {
      mode: this.config.mode,
      sandbox: this.config.sandbox,
      baseURL: this.baseURL,
      publicKey: this.config.publicKey ? '***' + this.config.publicKey.slice(-4) : 'non définie'
    };
  }
}

// Instance singleton exportée
export const kkiapayService = new KkiaPayService();

// Export de la classe pour une utilisation personnalisée
export default KkiaPayService;