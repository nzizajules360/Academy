'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';

const validRoles: UserRole[] = ['admin', 'secretary', 'patron', 'matron'];

export function useRole() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const roleParam = searchParams.get('role');

  const role: UserRole =
    roleParam && validRoles.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : 'admin'; // Default to 'admin' if role is invalid or not present

  const setRole = (newRole: UserRole) => {
    const params = new URLSearchParams(searchParams);
    params.set('role', newRole);
    router.push(`${pathname}?${params.toString()}`);
  };

  return { role, setRole };
}
