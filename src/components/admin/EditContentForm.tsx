"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialData: any
}

export default function EditContentForm({ initialData }: Props) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    excerpt: initialData.excerpt || '',
    description: initialData.description || '',
    isFree: initialData.isFree || false,
    price: initialData.price || 0,
    id: initialData.id,
    status: initialData.status || 'DRAFT'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function onChange(e: any) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Erreur lors de la mise à jour')
        return
      }
      router.push('/admin/content')
      router.refresh()
    } catch (err) {
      console.error('Update error', err)
      alert('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input name="title" value={form.title} onChange={onChange} className="mt-1 block w-full border rounded-md p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Extrait</label>
        <textarea name="excerpt" value={form.excerpt} onChange={onChange} className="mt-1 block w-full border rounded-md p-2" />
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isFree" checked={form.isFree} onChange={onChange} />
          <span>Gratuit</span>
        </label>
        {!form.isFree && (
          <div>
            <label className="block text-sm text-gray-700">Prix (XOF)</label>
            <input type="number" name="price" value={form.price} onChange={onChange} className="mt-1 block w-32 border rounded-md p-2" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select name="status" value={form.status} onChange={onChange} className="mt-1 block w-full border rounded-md p-2">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <a className="text-gray-600 px-4 py-2 rounded-md border" href="/admin/content">Annuler</a>
      </div>
    </form>
  )
}
