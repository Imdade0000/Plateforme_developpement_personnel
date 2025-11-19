import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { redirect } from 'next/navigation'
import EditContentForm from '../../../../../components/admin/EditContentForm'

type Params = { params: { id: string } }

export default async function EditContentPage({ params }: Params) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const { id } = params

  const content = await prisma.content.findUnique({
    where: { id },
  })

  if (!content) {
    redirect('/admin/content')
  }

  // Pass content data as props to client form — keep them serializable
  const initialData = {
    id: content.id,
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt,
    description: content.description,
    content: content.content,
    fileUrl: content.fileUrl,
    thumbnail: content.thumbnail,
    previewUrl: content.previewUrl,
    format: content.format,
    contentType: content.contentType,
    isFree: content.isFree,
    price: content.price ?? 0,
    status: content.status,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Modifier le contenu</h1>
          <EditContentForm initialData={initialData} />
        </div>
      </div>
    </div>
  )
}
