// lib/content.ts
import { prisma } from './prisma';

export async function getContentBySlug(slug: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    return content;
  } catch (error) {
    console.error('Error fetching content by slug:', error);
    return null;
  }
}

export async function getFilteredContent(filters: {
  type?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  difficulty?: string;
  price?: string;
}) {
  try {
    const where: any = {
      status: 'PUBLISHED',
    };

    // Appliquer les filtres
    if (filters.type && filters.type !== 'all') {
      where.format = filters.type;
    }

    if (filters.category) {
      where.categories = {
        some: {
          category: {
            slug: filters.category,
          },
        },
      };
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      where.difficulty = filters.difficulty;
    }

    if (filters.price === 'free') {
      where.isFree = true;
    } else if (filters.price === 'paid') {
      where.isFree = false;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Déterminer le tri
    let orderBy: any = {};
    switch (filters.sortBy) {
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { purchases: { _count: 'desc' } };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { publishedAt: 'desc' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const [content, totalCount] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              purchases: true,
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    return {
      success: true,
      data: content,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching filtered content:', error);
    return {
      success: false,
      error: 'Erreur lors du chargement du contenu',
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}