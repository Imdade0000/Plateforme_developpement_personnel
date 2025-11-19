// components/HelloComponent.tsx
'use client'

import { useState } from 'react'

export default function HelloComponent() {
  const [message, setMessage] = useState('')

  const fetchData = async () => {
    const response = await fetch('/api/hello')
    const data = await response.json()
    setMessage(data.message)
  }

  return (
    <div className="p-4">
      <button 
        onClick={fetchData}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Appeler l'API
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}