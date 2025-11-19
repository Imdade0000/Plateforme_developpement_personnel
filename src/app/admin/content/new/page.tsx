// app/admin/content/new/page.tsx 
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { redirect } from 'next/navigation'
import ClientNewContentPage from './client-page'

export default async function NewContentPage() {
  const session = await getServerSession(authOptions)
  
  // DOUBLE PROTECTION COTÉ SERVEUR
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Passez la session au composant client si nécessaire
  return <ClientNewContentPage />
}