import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, COOKIE_NAME } from '@/lib/session';
import Sidebar from '@/components/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session || session.role !== 'ADMIN') redirect('/');

  return (
    <div className="app-layout">
      <Sidebar role="ADMIN" userId={session.userId} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
