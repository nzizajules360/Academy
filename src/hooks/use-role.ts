'use client';
import { useUser } from '@/firebase';
import type { UserRole } from '@/types';

export function useRole() {
  const { user } = useUser();
  const role = user?.role as UserRole | undefined ?? 'admin';
  
  // The setRole function is no longer needed as the role is fixed.
  // It is kept here to avoid breaking other components that might still use it.
  // In a real application, you would remove this and update all call sites.
  const setRole = (newRole: UserRole) => {
    console.warn("setRole is deprecated. User role is fixed after registration.");
  };

  return { role, setRole };
}
