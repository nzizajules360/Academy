'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { useUser } from '@/firebase';

export function DashboardHeader() {
  const { user } = useUser();
  const role = user?.role || 'user';
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex-1">
        <h1 className="font-semibold text-lg capitalize">{role} Dashboard</h1>
      </div>
      <UserNav />
    </header>
  );
}
