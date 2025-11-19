// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn']
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions for common operations
export const db = {
  // User operations
  user: {
    findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
    findById: (id: string) => prisma.user.findUnique({ 
      where: { id },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gt: new Date() }
          }
        },
        transactions: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    }),
    create: (data: any) => prisma.user.create({ data }),
    update: (id: string, data: any) => prisma.user.update({ where: { id }, data }),
  },

  // Content operations - OPTIMISÉES
  content: {
    findFeatured: (limit: number = 10) => prisma.content.findMany({
      where: { 
        status: 'PUBLISHED',
        isFeatured: true 
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        price: true,
        isFree: true,
        format: true,
        publishedAt: true,
        author: {
          select: { name: true, image: true }
        },
        categories: {
          select: { 
            category: { select: { name: true, slug: true } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    }),
    
    findBySlug: (slug: string) => prisma.content.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, image: true, bio: true }
        },
        categories: {
          include: { category: true }
        },
        tags: {
          include: { tag: true }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      }
    }),

    findPremium: (limit: number = 10) => prisma.content.findMany({
      where: { 
        status: 'PUBLISHED',
        isFree: false,
        price: { gt: 0 }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        price: true,
        format: true,
        publishedAt: true,
        author: {
          select: { name: true, image: true }
        },
        categories: {
          select: { 
            category: { select: { name: true, slug: true } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    }),

    findFree: (limit: number = 10) => prisma.content.findMany({
      where: { 
        status: 'PUBLISHED',
        isFree: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        format: true,
        publishedAt: true,
        author: {
          select: { name: true, image: true }
        },
        categories: {
          select: { 
            category: { select: { name: true, slug: true } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    }),

    incrementViews: (id: string) => prisma.content.update({
      where: { id },
      data: { views: { increment: 1 } }
    }),

    // NOUVELLE VERSION OPTIMISÉE
    findWithFilters: (where: any, orderBy: any, skip: number = 0, take: number = 12) => 
      prisma.content.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          description: true,
          thumbnail: true,
          price: true,
          isFree: true,
          format: true,
          difficulty: true,
          durationMinutes: true,
          publishedAt: true,
          views: true,
          rating: true,
          author: {
            select: { name: true, image: true }
          },
          categories: {
            select: { 
              category: { select: { name: true, slug: true } } 
            }
          },
          tags: {
            select: { 
              tag: { select: { name: true, slug: true } } 
            }
          },
          _count: {
            select: {
              purchases: true,
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),

    countWithFilters: (where: any) => prisma.content.count({ where })
  },

  // Transaction operations
  transaction: {
    create: (data: any) => prisma.transaction.create({ data }),
    
    findByExternalId: (externalId: string) => prisma.transaction.findFirst({
      where: { externalId }
    }),

    findById: (id: string) => prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),

    updateStatus: (id: string, status: string, data: any = {}) => 
      prisma.transaction.update({
        where: { id },
        data: { 
          status,
          ...data,
          updatedAt: new Date()
        }
      }),

    findUserTransactions: (userId: string, limit: number = 20) => 
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

    findByUserAndProduct: (userId: string, productId: string, productType: string) => 
      prisma.transaction.findFirst({
        where: { 
          userId,
          productId,
          productType,
          status: 'COMPLETED'
        }
      }),

    userHasPurchasedViaTransaction: (userId: string, productId: string) => 
      prisma.transaction.findFirst({
        where: {
          userId,
          productId,
          productType: 'CONTENT',
          status: 'COMPLETED'
        }
      })
  },

  // Subscription operations
  subscription: {
    findActive: (userId: string) => prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() }
      }
    }),

    createOrUpdate: (userId: string, data: any) => {
      return prisma.subscription.findFirst({
        where: { userId }
      }).then(existingSubscription => {
        if (existingSubscription) {
          return prisma.subscription.update({
            where: { id: existingSubscription.id },
            data
          })
        } else {
          return prisma.subscription.create({
            data: { userId, ...data }
          })
        }
      })
    },

    cancel: (userId: string) => 
      prisma.subscription.findFirst({
        where: { userId }
      }).then(subscription => {
        if (!subscription) {
          throw new Error('Souscription non trouvée')
        }
        return prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: 'CANCELED',
            cancelledAt: new Date()
          }
        })
      }),

    findByUserId: (userId: string) => prisma.subscription.findFirst({
      where: { userId }
    })
  },

  // Purchase operations
  purchase: {
    create: (data: any) => prisma.purchase.create({ data }),
    
    userHasPurchased: (userId: string, contentId: string) => 
      prisma.purchase.findFirst({
        where: {
          userId,
          contentId
        }
      }),

    getUserPurchases: (userId: string) => prisma.purchase.findMany({
      where: { 
        userId
      },
      include: { 
        content: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            format: true,
            description: true,
            durationMinutes: true,
            difficulty: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    findById: (id: string) => prisma.purchase.findUnique({
      where: { id },
      include: {
        content: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),

    updateTransactionId: (id: string, transactionId: string) => 
      prisma.purchase.update({
        where: { id },
        data: { transactionId }
      }),

    findByTransactionId: (transactionId: string) => 
      prisma.purchase.findFirst({
        where: { transactionId },
        include: {
          content: true,
          user: true
        }
      })
  },

  // ContentView operations
  contentView: {
    create: (data: { userId: string; contentId: string; viewedAt?: Date }) => 
      prisma.contentView.create({ data }),

    hasViewedToday: (userId: string, contentId: string) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return prisma.contentView.findFirst({
        where: {
          userId,
          contentId,
          viewedAt: {
            gte: today
          }
        }
      })
    },

    getUserViewHistory: (userId: string, limit: number = 20) => 
      prisma.contentView.findMany({
        where: { userId },
        include: {
          content: {
            select: {
              title: true,
              slug: true,
              thumbnail: true,
              format: true
            }
          }
        },
        orderBy: { viewedAt: 'desc' },
        take: limit
      })
  },

  // Category operations - CORRIGÉ (version simplifiée)
  category: {
    findAll: () => prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    }),

    findBySlug: (slug: string) => prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    }),

    // CORRECTION : Version sans _count problématique
    findWithContentCount: async () => {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true
        }
      });

      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const contentCount = await prisma.contentCategory.count({
            where: {
              categoryId: category.id,
              content: {
                status: 'PUBLISHED'
              }
            }
          });

          return {
            ...category,
            contentCount
          };
        })
      );

      return categoriesWithCount;
    }
  },

  // Review operations
  review: {
    create: (data: any) => prisma.review.create({ data }),
    
    findByContent: (contentId: string, limit: number = 10) => 
      prisma.review.findMany({
        where: { 
          contentId,
          status: 'APPROVED'
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

    findByUserAndContent: (userId: string, contentId: string) => 
      prisma.review.findFirst({
        where: { userId, contentId }
      })
  },

  // Favorite operations
  favorite: {
    create: (data: any) => prisma.favorite.create({ data }),
    
    delete: (userId: string, contentId: string) => 
      prisma.favorite.deleteMany({
        where: { userId, contentId }
      }),

    getUserFavorites: (userId: string) => prisma.favorite.findMany({
      where: { userId },
      include: {
        content: {
          include: {
            author: {
              select: { name: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    isFavorited: (userId: string, contentId: string) => 
      prisma.favorite.findFirst({
        where: { userId, contentId }
      })
  }
}

export type DB = typeof db

// Gestionnaire de connexions optimisé
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connectionPool: Map<string, Promise<any>> = new Map();

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async executeOperation<T>(
    operationKey: string,
    operation: () => Promise<T>,
    timeout: number = 8000
  ): Promise<T> {
    if (this.connectionPool.has(operationKey)) {
      return this.connectionPool.get(operationKey) as Promise<T>;
    }

    const operationPromise = new Promise<T>(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Database operation timeout: ${operationKey}`));
      }, timeout);

      try {
        const result = await operation();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      } finally {
        setTimeout(() => {
          this.connectionPool.delete(operationKey);
        }, 100);
      }
    });

    this.connectionPool.set(operationKey, operationPromise);
    return operationPromise;
  }

  async executeContentQuery(where: any, orderBy: any, skip: number, take: number) {
    const operationKey = `content_query_${JSON.stringify({ where, orderBy, skip, take })}`;
    
    return this.executeOperation(operationKey, () => 
      db.content.findWithFilters(where, orderBy, skip, take)
    );
  }
}

// Fonction utilitaire pour vérifier l'accès au contenu
export class AccessUtils {
  static async userHasAccessToContent(userId: string, contentId: string): Promise<boolean> {
    try {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        select: { isFree: true, price: true }
      });

      if (!content) return false;
      if (content.isFree) return true;

      const purchase = await db.purchase.userHasPurchased(userId, contentId);
      if (purchase) return true;

      const transaction = await db.transaction.userHasPurchasedViaTransaction(userId, contentId);
      if (transaction) return true;

      return false;

    } catch (error) {
      console.error('Erreur vérification accès:', error);
      return false;
    }
  }
}

// Initialisation du gestionnaire de base de données
export const dbManager = DatabaseManager.getInstance();