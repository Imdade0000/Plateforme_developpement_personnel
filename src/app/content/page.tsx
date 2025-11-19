// src/app/content/page.tsx
import { Suspense } from 'react';
import ContentGrid from '../../../components/content/contentGird';
import ContentFilters from '../../../components/content/contentFilters';
import { prisma, db, dbManager } from '../../../lib/db';
import Link from 'next/link';
import SortSelector from '../../../components/content/SortSelector';
import Footer from '../../../components/layout/Footer';

// Types basés sur les composants existants
interface ContentFiltersProps {
  currentFilters: {
    type: string;
    category?: string;
    search?: string;
    sortBy: string;
  };
  // Supprimer categories si le composant ne le supporte pas
}

// Utiliser le type Content de Prisma directement
import { Content } from '@prisma/client';

interface ContentGridProps {
  content: Content[]; // Utiliser le type Prisma directement
  columns: number;
  showPrice: boolean;
  showActions: boolean;
}

interface ContentPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    page?: string;
    difficulty?: string;
    price?: string;
  }>;
}

const allowedSorts = ["newest", "oldest", "price_asc", "price_desc", "popular", "rating"] as const;
type SortBy = typeof allowedSorts[number];

// Cache pour les catégories
const getCachedCategories = async () => {
  return db.category.findAll();
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  
  const sortByParam = params.sortBy || "newest";
  const sortBy: SortBy = allowedSorts.includes(sortByParam as SortBy) ? sortByParam as SortBy : "newest";

  const page = parseInt(params.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // Construction des filtres
  const where: any = {
    status: 'PUBLISHED',
  };

  if (params.type && params.type !== 'all') {
    where.format = params.type;
  }

  if (params.category) {
    where.categories = {
      some: {
        category: {
          slug: params.category,
        },
      },
    };
  }

  if (params.difficulty && params.difficulty !== 'all') {
    where.difficulty = params.difficulty;
  }

  if (params.price === 'free') {
    where.isFree = true;
  } else if (params.price === 'paid') {
    where.isFree = false;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { excerpt: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  // Construction du tri
  let orderBy: any = {};
  switch (sortBy) {
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
      orderBy = { views: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
  }

  try {
    // EXÉCUTION SÉQUENTIELLE
    // Utiliser include au lieu de select pour avoir le type Content complet
    const content = await dbManager.executeOperation(
      'content_query',
      () => prisma.content.findMany({
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
        orderBy,
        skip,
        take: limit,
      })
    );

    const totalCount = await db.content.countWithFilters(where);
    const categories = await getCachedCategories();

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const currentFilters = {
      type: params.type || 'all',
      category: params.category,
      search: params.search,
      sortBy,
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bibliothèque de Développement Personnel
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez nos ressources pour votre épanouissement personnel : 
                e-books, vidéos, articles audio et formations.
              </p>
            </div>

            {/* CORRECTION : Ne pas passer categories si le composant ne le supporte pas */}
            <ContentFilters 
              currentFilters={currentFilters}
              // Supprimer categories={categories} si ça cause une erreur
            />

            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {totalCount} contenu{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
              </p>
              
              <SortSelector currentSort={sortBy} />
            </div>

            <Suspense fallback={<ContentGridSkeleton />}>
              {content.length > 0 ? (
                <div>
                  {/* CORRECTION : Utiliser le type Content de Prisma */}
                  <ContentGrid 
                    content={content as any}
                    columns={3}
                    showPrice={true}
                    showActions={true}
                  />
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination 
                        currentPage={page}
                        totalPages={totalPages}
                        hasNext={hasNext}
                        hasPrev={hasPrev}
                        searchParams={params}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Aucun contenu trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Erreur lors du chargement du contenu:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bibliothèque de Développement Personnel
              </h1>
            </div>

            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-4">
                Impossible de charger le contenu. Veuillez réessayer.
              </p>
              <Link 
                href="/content" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
}

function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-48 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  searchParams: any;
}

function Pagination({ currentPage, totalPages, hasNext, hasPrev, searchParams }: PaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value as string);
      }
    });
    
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <nav className="flex items-center space-x-4">
      {hasPrev && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Précédent
        </Link>
      )}
      
      <div className="flex items-center space-x-2">
        {getPageNumbers().map((page, index) => (
          <div key={index} className="flex items-center">
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400">...</span>
            ) : (
              <Link
                href={createPageUrl(page as number)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {hasNext && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Suivant →
        </Link>
      )}
    </nav>
  );
}