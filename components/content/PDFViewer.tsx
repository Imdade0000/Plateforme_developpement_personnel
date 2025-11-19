// components/pdf-viewer.tsx
'use client';

import { useState, useEffect } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  contentId: string;
}

export function PDFViewer({ fileUrl, contentId }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Sauvegarder la progression
  useEffect(() => {
    const saveProgress = async () => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          currentPage,
          totalPages,
        }),
      });
    };

    if (currentPage > 0) {
      saveProgress();
    }
  }, [currentPage, totalPages, contentId]);

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-200 rounded">←</button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button className="p-2 hover:bg-gray-200 rounded">→</button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-200 rounded">Zoom +</button>
          <button className="p-2 hover:bg-gray-200 rounded">Zoom -</button>
          <a 
            href={fileUrl} 
            download
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Télécharger
          </a>
        </div>
      </div>
      
      <div className="h-96 flex items-center justify-center bg-gray-100">
        <iframe
          src={`${fileUrl}#view=fitH`}
          className="w-full h-full border-0"
          onLoad={(e) => {
            // Logique pour détecter le nombre de pages
            // (nécessite une intégration PDF.js pour une expérience complète)
          }}
        />
      </div>
    </div>
  );
}