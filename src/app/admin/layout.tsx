// app/admin/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import { AdminSidebar } from '../../../components/layout/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header admin optionnel */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Administration
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}