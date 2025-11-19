// types/content.ts

export interface CourseCategory {
  id: string
  courseId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  course?: Course
  category?: Category
}


export interface Content {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  type: 'ARTICLE' | 'VIDEO' | 'PDF' | 'COURSE' | 'EBOOK' | 'AUDIO'
  thumbnail?: string | null
  fileUrl?: string | null
  duration?: number | null
  fileSize?: number | null
  isPremium: boolean
  isFree: boolean 
  price?: number | null
  currency: string
  tags: string[]
  views: number
  likes: number
  rating: number
  totalReviews: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  featured: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
  
  // Relations (optionnelles, selon le besoin)
  author?: User
  categories?: ContentCategory[]
  purchases?: Purchase[]
}

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: string
  phone: string | null
  country: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ContentCategory {
  id: string
  contentId: string
  categoryId: string
  content?: Content
  category?: Category
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  paymentMethod: 'PAYONEER' | 'KKIAPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD'
  description: string
  productType?: 'SUBSCRIPTION' | 'CONTENT' | 'DONATION' | 'COURSE' | null
  productId?: string | null
  metadata?: any | null
  paymentToken?: string | null
  externalId?: string | null
  customerEmail?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerCountry?: string | null
  refundAmount?: number | null
  refundReason?: string | null
  refundedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Subscription {
  id: string
  userId: string
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  cancelledAt?: Date | null
  paymentMethod: string
  price: number
  currency: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Purchase {
  id: string
  userId: string
  contentId: string
  amount: number
  currency: string
  transactionId?: string | null
  createdAt: Date
  user?: User
  content?: Content
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail?: string | null
  price: number
  currency: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: number
  lessons: number
  students: number
  rating: number
  totalReviews: number
  isPublished: boolean
  isFeatured: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
  author?: User
  modules?: Module[]
  enrollments?: Enrollment[]
  categories?: CourseCategory[]
}

export interface Module {
  id: string
  title: string
  description?: string | null
  order: number
  duration: number
  courseId: string
  course?: Course
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description?: string | null
  content: string
  videoUrl?: string | null
  duration: number
  order: number
  isFree: boolean
  moduleId: string
  module?: Module
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  completed: boolean
  completedAt?: Date | null
  transactionId?: string | null
  createdAt: Date
  updatedAt: Date
  user?: User
  course?: Course
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Types pour les filtres de contenu
export interface ContentFilters {
  type?: string
  category?: string
  isPremium?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  limit?: number
}

// Types pour les statistiques
export interface ContentStats {
  totalContent: number
  totalPremium: number
  totalFree: number
  totalViews: number
  totalLikes: number
  averageRating: number
}

export interface UserStats {
  totalUsers: number
  activeSubscriptions: number
  totalRevenue: number
  averageRevenuePerUser: number
}