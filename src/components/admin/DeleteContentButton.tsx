"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
}

export default function DeleteContentButton({ id }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm('Voulez-vous vraiment supprimer ce contenu ? Cette action est irréversible.');
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression');
        return;
      }

      // Refresh the current route to update the listing
      router.refresh();
    } catch (err) {
      console.error('Delete error', err);
      alert('Erreur réseau lors de la suppression');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`text-red-600 hover:text-red-900 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}
