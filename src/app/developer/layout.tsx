
'use client';
import React, { Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DeveloperSidebar } from '../dashboard/developer/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'developer')) {
      // Redirect non-developer users or unauthenticated users
      if (!pathname.startsWith('/developer/auth')) {
        router.push('/developer/auth/login');
      }
    } else if (!loading && user && user.role === 'developer') {
        if (pathname.startsWith('/developer/auth')) {
            router.push('/dashboard/developer/dashboard');
        }
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && !pathname.startsWith('/developer/auth'))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Render auth pages without the dashboard layout
  if (pathname.startsWith('/developer/auth')) {
    return <>{children}</>;
  }
  
  if (user?.role !== 'developer') {
      return null;
  }

  // This part will not be reached because the developer routes are under /dashboard/developer
  // However, keeping it as a fallback. A better structure would be to move all this logic
  // to the /dashboard/layout.tsx and have it render the correct sidebar.
  return (
    <Suspense>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <DeveloperSidebar />
          <div className="flex flex-1 flex-col sm:pl-14">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:px-6 sm:py-4">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Suspense>
  );
}
