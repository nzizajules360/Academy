'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

// This page now acts as a redirector to the correct role-based dashboard.
export default function DashboardRedirectPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = user.role as UserRole | undefined ?? 'admin';
      router.replace(`/dashboard/${role}`);
    } else if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
