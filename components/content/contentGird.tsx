// components/content/ContentGrid.tsx
 import { Content } from '@prisma/client'
import { ContentCard } from './contentCard'

interface ContentGridProps {
  content: (Content & {
    author?: { name: string | null; image: string | null }
    _count?: { purchases: number; reviews: number; favorites: number }
  })[]
  columns?: 1 | 2 | 3 | 4
  showPrice?: boolean
  showActions?: boolean
  emptyMessage?: string
}

export default function ContentGrid({ 
  content, 
  columns = 3, 
  showPrice = true, 
  showActions = true,
  emptyMessage = "Aucun contenu disponible pour le moment." 
}: ContentGridProps) {
  const gridClasses = {
    1: 'grid-cols-1 max-w-md mx-auto',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {content.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          showPrice={showPrice}
          showActions={showActions}
        />
      ))}
    </div>
  )
}