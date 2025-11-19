// lib/transactionHelpers.ts
import { 
  TransactionStatus, 
  PaymentMethod, 
  PaymentProvider, 
  SubscriptionPlan, 
  SubscriptionStatus,
  NotificationType,
  ProgressStatus,
  ReviewStatus 
} from '@prisma/client'

// Réexportez les enums Prisma
export { 
  TransactionStatus, 
  PaymentMethod, 
  PaymentProvider, 
  SubscriptionPlan, 
  SubscriptionStatus,
  NotificationType,
  ProgressStatus,
  ReviewStatus 
}

// Constantes alignées avec votre schéma Prisma
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
} as const;

export const PAYMENT_METHODS = {
  KKIAPAY: 'KKIAPAY',
  FEDAPAY: 'FEDAPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  MOBILE_MONEY: 'MOBILE_MONEY'
} as const;

export const PAYMENT_PROVIDERS = {
  KKIAPAY: 'KKIAPAY',
  FEDAPAY: 'FEDAPAY',
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  MANUAL: 'MANUAL'
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
  EXPIRED: 'EXPIRED',
  TRIALING: 'TRIALING'
} as const;

export const NOTIFICATION_TYPES = {
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  NEW_CONTENT: 'NEW_CONTENT',
  CONTENT_APPROVED: 'CONTENT_APPROVED',
  CONTENT_REJECTED: 'CONTENT_REJECTED',
  NEW_COMMENT: 'NEW_COMMENT',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
} as const;

export const PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED'
} as const;

export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SPAM: 'SPAM'
} as const;

// Vos types ProductType ne sont pas dans Prisma, définissez-les ici
export const PRODUCT_TYPES = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  CONTENT: 'CONTENT',
  DONATION: 'DONATION',
  COURSE: 'COURSE'
} as const;

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES];

// Fonctions de validation
export function isPaymentMethod(method: string): method is PaymentMethod {
  return Object.values(PaymentMethod).includes(method as PaymentMethod);
}

export function isPaymentProvider(provider: string): provider is PaymentProvider {
  return Object.values(PaymentProvider).includes(provider as PaymentProvider);
}

export function isTransactionStatus(status: string): status is TransactionStatus {
  return Object.values(TransactionStatus).includes(status as TransactionStatus);
}

export function isSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(plan as SubscriptionPlan);
}

export function isSubscriptionStatus(status: string): status is SubscriptionStatus {
  return Object.values(SubscriptionStatus).includes(status as SubscriptionStatus);
}

export function isNotificationType(type: string): type is NotificationType {
  return Object.values(NotificationType).includes(type as NotificationType);
}

export function isProgressStatus(status: string): status is ProgressStatus {
  return Object.values(ProgressStatus).includes(status as ProgressStatus);
}

export function isReviewStatus(status: string): status is ReviewStatus {
  return Object.values(ReviewStatus).includes(status as ReviewStatus);
}

export function isProductType(type: string): type is ProductType {
  return Object.values(PRODUCT_TYPES).includes(type as ProductType);
}

// Helper pour formater les montants
export function formatAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat(currency === 'XOF' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'XOF' ? 0 : 2
  });
  
  return formatter.format(amount);
}

// Fonctions utilitaires
export const transactionHelpers = {
  getStatusColor(status: TransactionStatus): string {
    const colors: Record<TransactionStatus, string> = {
      [TransactionStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [TransactionStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
      [TransactionStatus.FAILED]: 'bg-red-100 text-red-800 border-red-200',
      [TransactionStatus.REFUNDED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [TransactionStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
      [TransactionStatus.EXPIRED]: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status];
  },

  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.KKIAPAY]: 'KkiaPay',
      [PaymentMethod.FEDAPAY]: 'FedaPay',
      [PaymentMethod.BANK_TRANSFER]: 'Virement Bancaire',
      [PaymentMethod.CREDIT_CARD]: 'Carte de Crédit',
      [PaymentMethod.MOBILE_MONEY]: 'Mobile Money'
    };
    return labels[method];
  },

  getPaymentProviderLabel(provider: PaymentProvider): string {
    const labels: Record<PaymentProvider, string> = {
      [PaymentProvider.KKIAPAY]: 'KkiaPay',
      [PaymentProvider.FEDAPAY]: 'FedaPay',
      [PaymentProvider.STRIPE]: 'Stripe',
      [PaymentProvider.PAYPAL]: 'PayPal',
      [PaymentProvider.MANUAL]: 'Manuel'
    };
    return labels[provider];
  },

  getSubscriptionPlanLabel(plan: SubscriptionPlan): string {
    const labels: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'Gratuit',
      [SubscriptionPlan.BASIC]: 'Basique',
      [SubscriptionPlan.PREMIUM]: 'Premium',
      [SubscriptionPlan.ENTERPRISE]: 'Entreprise'
    };
    return labels[plan];
  },

  getSubscriptionStatusColor(status: SubscriptionStatus): string {
    const colors: Record<SubscriptionStatus, string> = {
      [SubscriptionStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
      [SubscriptionStatus.CANCELED]: 'bg-red-100 text-red-800 border-red-200',
      [SubscriptionStatus.PAST_DUE]: 'bg-orange-100 text-orange-800 border-orange-200',
      [SubscriptionStatus.EXPIRED]: 'bg-gray-100 text-gray-800 border-gray-200',
      [SubscriptionStatus.TRIALING]: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status];
  },

  isSuccessStatus(status: TransactionStatus): boolean {
    return status === TransactionStatus.COMPLETED;
  },

  isPendingStatus(status: TransactionStatus): boolean {
    return status === TransactionStatus.PENDING;
  },

  isFailedStatus(status: TransactionStatus): boolean {
    const failedStatuses: TransactionStatus[] = [
      TransactionStatus.FAILED, 
      TransactionStatus.CANCELLED, 
      TransactionStatus.EXPIRED
    ];
    return failedStatuses.includes(status);
  },

  canRetryPayment(status: TransactionStatus): boolean {
    const retryableStatuses: TransactionStatus[] = [
      TransactionStatus.FAILED, 
      TransactionStatus.EXPIRED
    ];
    return retryableStatuses.includes(status);
  }
};

// Helper pour les statuts de notification
export const notificationHelpers = {
  getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      [NotificationType.PAYMENT_SUCCESS]: 'Paiement réussi',
      [NotificationType.PAYMENT_FAILED]: 'Échec de paiement',
      [NotificationType.NEW_CONTENT]: 'Nouveau contenu',
      [NotificationType.CONTENT_APPROVED]: 'Contenu approuvé',
      [NotificationType.CONTENT_REJECTED]: 'Contenu rejeté',
      [NotificationType.NEW_COMMENT]: 'Nouveau commentaire',
      [NotificationType.NEW_FOLLOWER]: 'Nouvel abonné',
      [NotificationType.SYSTEM_ANNOUNCEMENT]: 'Annonce système'
    };
    return labels[type];
  },

  getTypeColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.PAYMENT_SUCCESS]: 'bg-green-100 text-green-800',
      [NotificationType.PAYMENT_FAILED]: 'bg-red-100 text-red-800',
      [NotificationType.NEW_CONTENT]: 'bg-blue-100 text-blue-800',
      [NotificationType.CONTENT_APPROVED]: 'bg-green-100 text-green-800',
      [NotificationType.CONTENT_REJECTED]: 'bg-red-100 text-red-800',
      [NotificationType.NEW_COMMENT]: 'bg-purple-100 text-purple-800',
      [NotificationType.NEW_FOLLOWER]: 'bg-pink-100 text-pink-800',
      [NotificationType.SYSTEM_ANNOUNCEMENT]: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  }
};

// Helper pour les statuts de progression
export const progressHelpers = {
  getStatusLabel(status: ProgressStatus): string {
    const labels: Record<ProgressStatus, string> = {
      [ProgressStatus.NOT_STARTED]: 'Non commencé',
      [ProgressStatus.IN_PROGRESS]: 'En cours',
      [ProgressStatus.COMPLETED]: 'Terminé',
      [ProgressStatus.ABANDONED]: 'Abandonné'
    };
    return labels[status];
  },

  getStatusColor(status: ProgressStatus): string {
    const colors: Record<ProgressStatus, string> = {
      [ProgressStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
      [ProgressStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [ProgressStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [ProgressStatus.ABANDONED]: 'bg-red-100 text-red-800'
    };
    return colors[status];
  }
};

// Helper pour les statuts de review
export const reviewHelpers = {
  getStatusLabel(status: ReviewStatus): string {
    const labels: Record<ReviewStatus, string> = {
      [ReviewStatus.PENDING]: 'En attente',
      [ReviewStatus.APPROVED]: 'Approuvé',
      [ReviewStatus.REJECTED]: 'Rejeté',
      [ReviewStatus.SPAM]: 'Spam'
    };
    return labels[status];
  },

  getStatusColor(status: ReviewStatus): string {
    const colors: Record<ReviewStatus, string> = {
      [ReviewStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ReviewStatus.APPROVED]: 'bg-green-100 text-green-800',
      [ReviewStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ReviewStatus.SPAM]: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  }
};