// src/components/content/SortSelector.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectorProps {
  currentSort: string
}

export default function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <select 
      value={currentSort}
      className="border rounded-lg px-3 py-2 text-sm"
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="newest">Plus récent</option>
      <option value="oldest">Plus ancien</option>
      <option value="price_asc">Prix croissant</option>
      <option value="price_desc">Prix décroissant</option>
      <option value="popular">Plus populaires</option>
      <option value="rating">Mieux notés</option>
    </select>
  )
}