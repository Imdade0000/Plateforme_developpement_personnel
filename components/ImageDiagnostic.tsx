// components/ImageDiagnostic.tsx
"use client"

import { useState, useEffect } from 'react'

interface ImageDiagnosticProps {
  imageUrl: string
  alt: string
}

export function ImageDiagnostic({ imageUrl, alt }: ImageDiagnosticProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    const testImage = async () => {
      try {
        console.log('🔍 Test image:', imageUrl)
        
        const response = await fetch(imageUrl, { method: 'HEAD' })
        console.log('📊 Image response:', {
          url: imageUrl,
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        })

        if (response.ok) {
          setStatus('success')
          setDetails(`✅ Image accessible - ${response.headers.get('content-type')}`)
        } else {
          setStatus('error')
          setDetails(`❌ Erreur ${response.status} - ${response.statusText}`)
        }
      } catch (error) {
        setStatus('error')
        setDetails(`💥 Erreur réseau: ${error}`)
        console.error('Erreur test image:', error)
      }
    }

    if (imageUrl) {
      testImage()
    }
  }, [imageUrl])

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Diagnostic Image</h4>
      <p><strong>URL:</strong> {imageUrl}</p>
      <p><strong>Statut:</strong> 
        <span className={status === 'success' ? 'text-green-600' : 'text-red-600'}>
          {status}
        </span>
      </p>
      <p><strong>Détails:</strong> {details}</p>
    </div>
  )
}