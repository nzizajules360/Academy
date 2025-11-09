'use client';
import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useUser } from '@/firebase';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { UserRole } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const role = user?.role as UserRole | undefined;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (!loading && user && role) {
        const expectedPath = `/dashboard/${role}`;
        if (!pathname.startsWith(expectedPath) && pathname !== '/dashboard') {
          // If user is on a page not belonging to their role, redirect.
          // This is a simple check. More robust checks might be needed.
          router.push(expectedPath);
        } else if (pathname === '/dashboard') {
            router.push(expectedPath);
        }
    }

  }, [user, loading, router, role, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-background to-background/95">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-[50px] -z-10" />
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-background to-background/95">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-destructive/10 blur-[30px] -z-10" />
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">Please try refreshing the page or logging in again.</p>
        </div>
            <p className="text-destructive">Error loading user data. Please try again.</p>
        </div>
    );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <Suspense>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <DashboardSidebar />
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
