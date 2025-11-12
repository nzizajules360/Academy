'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

// This page now acts as a redirector to the correct developer page.
export default function DeveloperRedirectPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && user.role === 'developer') {
        router.replace(`/developer/dashboard`);
      } else {
        router.replace('/developer/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
