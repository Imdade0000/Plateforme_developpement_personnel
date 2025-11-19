// app/dashboard/layout.tsx
import { auth } from '../auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { Header } from '../../../components/layout/Header';
import { getSession } from '../../../lib/auth-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}