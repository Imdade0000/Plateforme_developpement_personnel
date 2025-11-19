// components/content/contentFilters.tsx
'use client';

import { useState } from 'react';

interface ContentFiltersProps {
  currentFilters: {
    type: string;
    category?: string;
    search?: string;
    sortBy: string;
  };
}

export default function ContentFilters({ currentFilters }: ContentFiltersProps) {
  const [search, setSearch] = useState(currentFilters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (currentFilters.type !== 'all') params.set('type', currentFilters.type);
    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.sortBy !== 'newest') params.set('sortBy', currentFilters.sortBy);
    
    window.location.href = `/content${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const clearFilters = () => {
    window.location.href = '/content';
  };

  const hasActiveFilters = 
    currentFilters.type !== 'all' || 
    currentFilters.category || 
    currentFilters.search || 
    currentFilters.sortBy !== 'newest';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un contenu..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            🔍
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Effacer
            </button>
          )}
        </div>
      </form>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2">
        <FilterButton 
          type="type" 
          value="all" 
          label="Tous" 
          currentValue={currentFilters.type}
        />
        <FilterButton 
          type="type" 
          value="EBOOK" 
          label="E-books" 
          currentValue={currentFilters.type}
        />
        <FilterButton 
          type="type" 
          value="VIDEO" 
          label="Vidéos" 
          currentValue={currentFilters.type}
        />
        <FilterButton 
          type="type" 
          value="ARTICLE" 
          label="Articles" 
          currentValue={currentFilters.type}
        />
        <FilterButton 
          type="type" 
          value="AUDIO" 
          label="Audio" 
          currentValue={currentFilters.type}
        />
      </div>
    </div>
  );
}

function FilterButton({ type, value, label, currentValue }: {
  type: string;
  value: string;
  label: string;
  currentValue?: string;
}) {
  const isActive = currentValue === value;

  const handleClick = () => {
    const params = new URLSearchParams(window.location.search);
    
    if (value === 'all') {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    
    // Réinitialiser la page à 1 lors du changement de filtre
    params.set('page', '1');
    
    window.location.href = `/content?${params.toString()}`;
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}