// types/index.ts
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: string;
  phone: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: string;
  thumbnail: string | null;
  fileUrl: string | null;
  duration: number | null;
  fileSize: number | null;
  isPremium: boolean;
  price: number | null;
  currency: string;
  tags: string[];
  views: number;
  likes: number;
  status: string;
  featured: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  description: string;
  productType: string | null;
  productId: string | null;
  metadata: any | null;
  paymentToken: string | null;
  externalId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerCountry: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  paymentMethod: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  contentId: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  currency: string;
  level: string;
  duration: number;
  lessons: number;
  students: number;
  rating: number;
  totalReviews: number;
  isPublished: boolean;
  isFeatured: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}