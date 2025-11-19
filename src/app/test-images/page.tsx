// app/test-images/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function TestImagesPage() {
  const [contents, setContents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/debug/content')
      .then(r => r.json())
      .then(data => {
        console.log('Contenus chargés:', data.allContent)
        setContents(data.allContent || [])
      })
  }, [])

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">🧪 Test des Images</h1>

      {contents.map((content) => (
        <div key={content.id} className="mb-12 border-b pb-8">
          <h2 className="text-xl font-bold mb-4">{content.title}</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* URL brute */}
            <div>
              <p className="font-semibold mb-2">📋 URL du thumbnail:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {content.thumbnail || 'NULL'}
              </pre>
            </div>

            {/* Test 1: IMG directe */}
            <div>
              <p className="font-semibold mb-2">Test 1: IMG HTML directe</p>
              <div className="border-2 border-blue-500 p-4 bg-blue-50">
                {content.thumbnail ? (
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    style={{ width: '300px', height: '200px', objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                    onLoad={(e) => {
                      console.log('✅ IMG loaded:', content.thumbnail)
                      const target = e.target as HTMLImageElement
                      target.style.border = '3px solid green'
                    }}
                    onError={(e) => {
                      console.error('❌ IMG error:', content.thumbnail)
                      const target = e.target as HTMLImageElement
                      target.style.border = '3px solid red'
                      target.alt = 'ERREUR DE CHARGEMENT'
                    }}
                  />
                ) : (
                  <div className="w-[300px] h-[200px] bg-gray-200 flex items-center justify-center">
                    <p>Pas de thumbnail</p>
                  </div>
                )}
              </div>
            </div>

            {/* Test 2: Avec background */}
            <div>
              <p className="font-semibold mb-2">Test 2: Background image</p>
              <div 
                className="border-2 border-green-500 p-4"
                style={{
                  width: '300px',
                  height: '200px',
                  backgroundImage: content.thumbnail ? `url(${content.thumbnail})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#f0f0f0'
                }}
              >
                {!content.thumbnail && <p>Pas de thumbnail</p>}
              </div>
            </div>

            {/* Test 3: Ouverture directe */}
            <div>
              <p className="font-semibold mb-2">Test 3: Lien direct</p>
              {content.thumbnail && (
                <a 
                  href={content.thumbnail} 
                  target="_blank"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔗 Ouvrir l'image dans un nouvel onglet
                </a>
              )}
            </div>

            {/* Test 4: Fetch status */}
            <div>
              <p className="font-semibold mb-2">Test 4: Status HTTP</p>
              <button
                onClick={async () => {
                  if (!content.thumbnail) {
                    alert('Pas de thumbnail')
                    return
                  }
                  try {
                    const response = await fetch(content.thumbnail, { method: 'HEAD' })
                    alert(`Status: ${response.status}\nType: ${response.headers.get('content-type')}`)
                  } catch (error) {
                    alert(`Erreur: ${error}`)
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                🔍 Vérifier l'URL
              </button>
            </div>
          </div>
        </div>
      ))}

      {contents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun contenu à tester</p>
        </div>
      )}

      {/* Console log */}
      <div className="mt-8 bg-yellow-50 border border-yellow-300 p-4 rounded">
        <p className="font-bold text-yellow-900 mb-2">📝 Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
          <li>Ouvrez la console du navigateur (F12)</li>
          <li>Regardez si des erreurs s'affichent en rouge</li>
          <li>Vérifiez l'onglet "Network" pour voir les requêtes d'images</li>
          <li>Cliquez sur "Ouvrir l'image dans un nouvel onglet" pour voir si le fichier existe</li>
          <li>Cliquez sur "Vérifier l'URL" pour voir le status HTTP</li>
        </ol>
      </div>
    </div>
  )
}